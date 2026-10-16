import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import App from '../../src/App';
import { ThemeProvider } from '../../src/components/ThemeProvider';
import { useUserStore } from '../../src/store/userStore';
import { mockApi } from '../helpers';

// Utilisateur qui vient de s'inscrire : onboarding pas encore fait
const newUser = () => {
  useUserStore.getState().setToken('token-test');
  useUserStore.getState().setUser({ id: 'u1', name: 'Camille', email: 'c@test.fr', familyId: null, avatar: null });
};

const renderApp = (url: string) =>
  render(<ThemeProvider><MemoryRouter initialEntries={[url]}><App /></MemoryRouter></ThemeProvider>);

describe('Onboarding', () => {
  it('refuse une date incomplète ou impossible', async () => {
    newUser();
    const calls = mockApi({});
    renderApp('/bienvenue/naissance');

    await userEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    expect(screen.getByText('Merci de remplir tous les champs.')).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText('JJ'), '32');
    await userEvent.type(screen.getByPlaceholderText('MM'), '01');
    await userEvent.type(screen.getByPlaceholderText('AAAA'), '2010');
    await userEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    expect(screen.getByText('Date invalide.')).toBeInTheDocument();
    expect(calls).toHaveLength(0);
  });

  it('garde la date, la couleur et l\'avatar, puis les envoie avec l\'accord aux CGU', async () => {
    newUser();
    const calls = mockApi({
      'PATCH users/u1/onboarding': {
        body: { birthdate: '2010-03-05T00:00:00.000Z', theme: 'orange', avatar: 3, acceptedTermsAt: '2026-10-16T10:00:00.000Z' },
      },
    });
    renderApp('/bienvenue/naissance');

    // 1 - Date de naissance
    await userEvent.type(screen.getByPlaceholderText('JJ'), '5');
    await userEvent.type(screen.getByPlaceholderText('MM'), '3');
    await userEvent.type(screen.getByPlaceholderText('AAAA'), '2010');
    await userEvent.click(screen.getByRole('button', { name: 'Suivant' }));

    // 2 - Couleur
    await userEvent.click(await screen.findByRole('button', { name: 'Thème orange' }));
    await waitFor(() => expect(useUserStore.getState().user?.theme).toBe('orange'));
    await userEvent.click(screen.getByRole('button', { name: 'Suivant' }));

    // 3 - Avatar
    await userEvent.click(await screen.findByRole('button', { name: 'Avatar 3' }));
    await userEvent.click(screen.getByRole('button', { name: 'Suivant' }));

    // Rien n'est encore envoyé au serveur
    expect(calls).toHaveLength(0);

    // 4 - Consentement : bouton actif seulement une fois la case cochée
    expect(await screen.findByRole('heading', { name: 'Ta vie privée, on y tient' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accepter et continuer' })).toBeDisabled();
    await userEvent.click(screen.getByRole('checkbox', { name: /J'accepte les conditions/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Accepter et continuer' }));

    // Un seul envoi : l'accord et les 3 choix
    await screen.findByText('Parfait ! On prépare ton profil…');
    expect(calls).toEqual([{
      method: 'PATCH',
      path: 'users/u1/onboarding',
      body: { acceptTerms: true, birthdate: '2010-03-05', theme: 'orange', avatar: 3 },
    }]);

    // 5 - Chargement (2 secondes), puis l'onboarding est terminé
    await waitFor(() => expect(useUserStore.getState().onboardingCompleted).toBe(true), { timeout: 3000 });
  });

  it('ouvre les CGU par-dessus l\'écran de consentement', async () => {
    newUser();
    mockApi({});
    renderApp('/bienvenue/consentement');

    await userEvent.click(screen.getByRole('button', { name: 'Conditions d’utilisation' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ta vie privée, on y tient' })).toBeInTheDocument();
  });

  it('pas de chargement sans accord aux CGU : retour au consentement', () => {
    newUser();
    mockApi({});
    renderApp('/bienvenue/chargement');
    expect(screen.getByRole('heading', { name: 'Ta vie privée, on y tient' })).toBeInTheDocument();
  });
});

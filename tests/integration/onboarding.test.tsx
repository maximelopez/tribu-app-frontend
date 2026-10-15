import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
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

  it('enregistre la date, la couleur et l\'avatar, puis ouvre l\'app', async () => {
    newUser();
    const calls = mockApi({
      'PATCH users/u1/birthdate': { body: { birthdate: '2010-03-05' } },
      'PATCH users/u1/theme': { body: {} },
      'PATCH users/u1/avatar': { body: {} },
    });
    renderApp('/bienvenue/naissance');

    // 1 - Date de naissance
    await userEvent.type(screen.getByPlaceholderText('JJ'), '5');
    await userEvent.type(screen.getByPlaceholderText('MM'), '3');
    await userEvent.type(screen.getByPlaceholderText('AAAA'), '2010');
    await userEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    expect(calls[0].body).toEqual({ birthdate: '2010-03-05' });

    // 2 - Couleur
    await userEvent.click(await screen.findByRole('button', { name: 'Thème orange' }));
    await waitFor(() => expect(useUserStore.getState().user?.theme).toBe('orange'));
    await userEvent.click(screen.getByRole('button', { name: 'Suivant' }));

    // 3 - Avatar
    await userEvent.click(await screen.findByRole('button', { name: 'Avatar 3' }));
    await waitFor(() => expect(useUserStore.getState().user?.avatar).toBe(3));

    // 4 - Chargement (2 secondes), puis l'onboarding est terminé
    vi.useFakeTimers();
    try {
      await act(async () => {
        screen.getByRole('button', { name: 'Suivant' }).click();
      });
      act(() => vi.advanceTimersByTime(2000));
      expect(useUserStore.getState().onboardingCompleted).toBe(true);
    } finally {
      vi.useRealTimers();
    }
    // Les 3 choix ont été enregistrés (ensuite, l'app charge ses données)
    expect(calls.filter(c => c.method === 'PATCH').map(c => c.path)).toEqual(['users/u1/birthdate', 'users/u1/theme', 'users/u1/avatar']);
  });
});

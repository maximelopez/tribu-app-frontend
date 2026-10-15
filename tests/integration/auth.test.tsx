import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Login from '../../src/screens/Login';
import Signup from '../../src/screens/Signup';
import App from '../../src/App';
import { useUserStore } from '../../src/store/userStore';
import { mockApi, renderScreen } from '../helpers';

const PASSWORD = 'Motdepasse1!';

describe('Connexion', () => {
  const fillLogin = async (email: string, password: string) => {
    await userEvent.type(screen.getByPlaceholderText('Ex : camille@email.fr'), email);
    await userEvent.type(screen.getByPlaceholderText('**********'), password);
    await userEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
  };

  it('demande de remplir les champs, sans appeler le serveur', async () => {
    const calls = mockApi({});
    renderScreen(<Login />);
    await userEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
    expect(screen.getByText('Veuillez remplir tous les champs.')).toBeInTheDocument();
    expect(calls).toHaveLength(0);
  });

  it('affiche une erreur si le mot de passe est faux', async () => {
    mockApi({ 'POST auth/login': { status: 401, body: { message: 'Identifiants invalides' } } });
    renderScreen(<Login />);
    await fillLogin('maxime@test.fr', 'mauvais');
    expect(await screen.findByText('Email ou mot de passe incorrect.')).toBeInTheDocument();
    expect(useUserStore.getState().token).toBeNull();
  });

  it('connecte l\'utilisateur et garde son token', async () => {
    const calls = mockApi({
      'POST auth/login': {
        body: { token: 'token-123', user: { id: 'u1', name: 'Maxime', email: 'maxime@test.fr', familyId: null, avatar: 2, theme: 'red', points: 0 } },
      },
    });
    renderScreen(<Login />);
    await fillLogin('maxime@test.fr', PASSWORD);

    await screen.findByRole('button', { name: 'Se connecter' });
    expect(calls[0]).toEqual({ method: 'POST', path: 'auth/login', body: { email: 'maxime@test.fr', password: PASSWORD } });
    const { token, user, onboardingCompleted } = useUserStore.getState();
    expect(token).toBe('token-123');
    expect(user?.theme).toBe('red');
    expect(onboardingCompleted).toBe(true); // thème et avatar déjà choisis
  });
});

describe('Inscription', () => {
  const fillSignup = async (password = PASSWORD) => {
    await userEvent.type(screen.getByPlaceholderText('Ex : Camille'), 'Camille');
    await userEvent.type(screen.getByPlaceholderText('Ex : camille@email.fr'), 'camille@test.fr');
    await userEvent.type(screen.getByPlaceholderText('**********'), password);
  };
  const acceptTerms = () => userEvent.click(screen.getByRole('checkbox', { name: /J'accepte les conditions/ }));
  const submit = () => userEvent.click(screen.getByRole('button', { name: "S'inscrire" }));

  it('refuse un mot de passe trop faible', async () => {
    const calls = mockApi({});
    renderScreen(<Signup />);
    await fillSignup('motdepasse');
    await acceptTerms();
    await submit();
    expect(screen.getByText(/au moins 10 caractères, une majuscule/)).toBeInTheDocument();
    expect(calls).toHaveLength(0);
  });

  it('refuse l\'inscription sans accepter les CGU', async () => {
    const calls = mockApi({});
    renderScreen(<Signup />);
    await fillSignup();
    await submit();
    expect(screen.getByText(/Acceptez les conditions d'utilisation/)).toBeInTheDocument();
    expect(calls).toHaveLength(0);
  });

  it('envoie l\'accord aux CGU au serveur', async () => {
    const calls = mockApi({
      'POST auth/register': { status: 201, body: { token: 'token-new', user: { id: 'u2', name: 'Camille', email: 'camille@test.fr', familyId: null, avatar: null } } },
    });
    renderScreen(<Signup />);
    await fillSignup();
    await acceptTerms();
    await submit();

    await screen.findByRole('button', { name: "S'inscrire" });
    expect(calls[0].body).toEqual({ name: 'Camille', email: 'camille@test.fr', password: PASSWORD, acceptTerms: true });
    expect(useUserStore.getState().token).toBe('token-new');
    expect(useUserStore.getState().onboardingCompleted).toBe(false); // l'onboarding commence
  });

  it('prévient si l\'email est déjà utilisé', async () => {
    mockApi({ 'POST auth/register': { status: 409, body: {} } });
    renderScreen(<Signup />);
    await fillSignup();
    await acceptTerms();
    await submit();
    expect(await screen.findByText('Cet email est déjà utilisé.')).toBeInTheDocument();
  });
});

describe('Accès aux écrans', () => {
  const renderApp = (url: string) => render(<MemoryRouter initialEntries={[url]}><App /></MemoryRouter>);

  it('renvoie vers l\'inscription quand on n\'est pas connecté', () => {
    renderApp('/chat');
    expect(screen.getByRole('button', { name: "S'inscrire" })).toBeInTheDocument();
  });

  it('renvoie vers l\'onboarding tant qu\'il n\'est pas terminé', () => {
    useUserStore.getState().setToken('token-test');
    useUserStore.getState().setUser({ id: 'u1', name: 'Maxime', email: 'm@test.fr', familyId: null, avatar: null });
    renderApp('/chat');
    expect(screen.getByRole('button', { name: 'Suivant' })).toBeInTheDocument();
  });

  it('ouvre les pages légales sans être connecté', () => {
    renderApp('/cgu');
    expect(screen.getByText(/conditions/i, { selector: 'h1, h2' })).toBeInTheDocument();
  });
});

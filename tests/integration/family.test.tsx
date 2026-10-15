import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchFamily from '../../src/screens/SearchFamily';
import FamilyDetails from '../../src/screens/FamilyDetails';
import CreateFamily from '../../src/screens/CreateFamily';
import { useUserStore } from '../../src/store/userStore';
import { useFamilyStore } from '../../src/store/familyStore';
import { loginAs, mockApi, renderScreen } from '../helpers';

const champions = { id: 'f1', name: 'Champions', city: 'Angers', levelInfo: { level: 4 }, membersCount: 3, membersPreview: [] };

describe('Rechercher une Tribu', () => {
  it('affiche l\'aide et le filtre par ville dès l\'arrivée', async () => {
    mockApi({ 'GET families/cities': { body: { cities: ['Angers', 'Nantes'] } } });
    renderScreen(<SearchFamily />);
    expect(screen.getByText('Trouve ta Tribu')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Nantes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toutes' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('cherche dès le premier caractère', async () => {
    const calls = mockApi({ 'GET families/cities': { body: { cities: [] } }, 'GET families?*': { body: { families: [champions] } } });
    renderScreen(<SearchFamily />);
    await userEvent.type(screen.getByRole('searchbox'), 'c');
    expect(await screen.findByText('Champions')).toBeInTheDocument();
    expect(calls.at(-1)?.path).toBe('families?search=c');
  });

  it('filtre par ville', async () => {
    const calls = mockApi({ 'GET families/cities': { body: { cities: ['Angers'] } }, 'GET families?*': { body: { families: [champions] } } });
    renderScreen(<SearchFamily />);
    await userEvent.click(await screen.findByRole('button', { name: 'Angers' }));
    expect(await screen.findByText('Champions')).toBeInTheDocument();
    expect(calls.at(-1)?.path).toBe('families?city=Angers');
  });

  it('prévient quand aucune Tribu ne correspond', async () => {
    mockApi({ 'GET families/cities': { body: { cities: [] } }, 'GET families?*': { body: { families: [] } } });
    renderScreen(<SearchFamily />);
    await userEvent.type(screen.getByRole('searchbox'), 'zzz');
    expect(await screen.findByText('Aucune Tribu trouvée :(')).toBeInTheDocument();
  });

  it('revient à l\'aide quand on efface la recherche', async () => {
    mockApi({ 'GET families/cities': { body: { cities: [] } }, 'GET families?*': { body: { families: [champions] } } });
    renderScreen(<SearchFamily />);
    await userEvent.type(screen.getByRole('searchbox'), 'c');
    await screen.findByText('Champions');
    await userEvent.clear(screen.getByRole('searchbox'));
    expect(screen.queryByText('Champions')).not.toBeInTheDocument();
    expect(screen.getByText('Trouve ta Tribu')).toBeInTheDocument();
  });
});

describe('Détails d\'une Tribu', () => {
  const family = {
    id: 'f1', name: 'Champions', city: 'Angers', points: 620,
    levelInfo: { level: 4, isMax: false, remaining: 380, progress: 0.62 },
    membersCount: 2, members: [{ id: 'u5', name: 'Thomas', avatar: 1 }, { id: 'u6', name: 'Marie', avatar: 3 }],
  };
  const routes = {
    'GET families/f1': { body: { family } },
    'GET families/f1/badges': { body: { badges: [], unlockedCount: 0, total: 24, lastUnlocked: null } },
  };
  const renderDetails = () => renderScreen(<FamilyDetails />, { path: '/tribu/:familyId', url: '/tribu/f1' });

  it('présente la Tribu : nom, ville, niveau et membres', async () => {
    loginAs();
    mockApi(routes);
    renderDetails();
    expect(await screen.findByText('Champions')).toBeInTheDocument();
    expect(screen.getByText('2 membres, Angers')).toBeInTheDocument();
    expect(screen.getByText('Niveau 4')).toBeInTheDocument();
    expect(screen.getByText('620 / 1000 pts')).toBeInTheDocument();
    expect(screen.getByText('Thomas')).toBeInTheDocument();
  });

  it('envoie la demande et reste sur l\'écran avec « Demande envoyée ! »', async () => {
    loginAs();
    const calls = mockApi({ ...routes, 'POST families/f1/join-requests': { status: 201 } });
    renderDetails();
    await userEvent.click(await screen.findByRole('button', { name: 'Envoyer une demande' }));

    expect(await screen.findByText('Demande envoyée !')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Envoyer une demande' })).not.toBeInTheDocument();
    expect(calls.some(c => c.method === 'POST' && c.path === 'families/f1/join-requests')).toBe(true);
    expect(useFamilyStore.getState().pendingRequest).toEqual({ familyId: 'f1', name: 'Champions', city: 'Angers' });
  });

  it('affiche le message du serveur si la demande est refusée', async () => {
    loginAs();
    mockApi({ ...routes, 'POST families/f1/join-requests': { status: 409, body: { message: 'Tu as déjà une demande en attente' } } });
    renderDetails();
    await userEvent.click(await screen.findByRole('button', { name: 'Envoyer une demande' }));
    expect(await screen.findByText('Tu as déjà une demande en attente')).toBeInTheDocument();
    expect(useFamilyStore.getState().pendingRequest).toBeNull();
  });

  it('prévient si la Tribu n\'existe pas', async () => {
    loginAs();
    mockApi({ 'GET families/f1': { status: 404 } });
    renderDetails();
    expect(await screen.findByText('Impossible de charger cette Tribu.')).toBeInTheDocument();
  });
});

describe('Créer une Tribu', () => {
  it('demande le nom et la ville', async () => {
    loginAs();
    const calls = mockApi({});
    renderScreen(<CreateFamily />);
    await userEvent.type(screen.getByPlaceholderText('Ex : DreamTeam'), 'Champions');
    await userEvent.click(screen.getByRole('button', { name: 'Créer ma Tribu' }));
    expect(screen.getByText('Veuillez remplir tous les champs.')).toBeInTheDocument();
    expect(calls).toHaveLength(0);
  });

  it('crée la Tribu avec la ville choisie dans la liste, puis va à l\'accueil', async () => {
    loginAs();
    const calls = mockApi({ 'POST families': { status: 201, body: { family: { id: 'f9' } } } });
    renderScreen(<CreateFamily />, { path: '/tribu/creer' });

    await userEvent.type(screen.getByPlaceholderText('Ex : DreamTeam'), 'Champions');
    await userEvent.click(screen.getByRole('button', { name: /Ville/ }));
    await userEvent.click(screen.getByRole('option', { name: 'Nantes' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Créer ma Tribu' }));

    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent(/^\/$/));
    expect(calls[0]).toEqual({ method: 'POST', path: 'families', body: { name: 'Champions', city: 'Nantes' } });
    expect(useUserStore.getState().user?.familyId).toBe('f9');
  });
});

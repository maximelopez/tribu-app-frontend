import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../../src/screens/Home';
import { useFamilyStore } from '../../src/store/familyStore';
import { loginAs, mockApi, renderScreen } from '../helpers';
import { catalog, family, familyActivity, joinRequestNotification, picnic } from '../fixtures';

const catalogRoute = { 'GET activities': { body: catalog } };

describe('Accueil sans Tribu', () => {
  it('propose de rejoindre ou de créer une Tribu', async () => {
    loginAs();
    mockApi(catalogRoute);
    renderScreen(<Home />);
    expect(screen.getByText('Bonjour,')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Rejoindre une Tribu/ }));
    expect(screen.getByTestId('path')).toHaveTextContent('/tribu/rechercher');
  });

  it('affiche la demande en attente et permet de l\'annuler', async () => {
    loginAs();
    useFamilyStore.getState().setPendingRequest({ familyId: 'f1', name: 'Champions', city: 'Angers' });
    const calls = mockApi({ ...catalogRoute, 'DELETE families/f1/join-requests': { body: {} } });
    renderScreen(<Home />);

    expect(screen.getByText('Ta demande est en cours de validation.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Annuler la demande' }));
    const dialog = screen.getByRole('dialog', { name: 'Annuler ta demande ?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Oui, annuler' }));

    await waitFor(() => expect(useFamilyStore.getState().pendingRequest).toBeNull());
    expect(calls.some(c => c.method === 'DELETE' && c.path === 'families/f1/join-requests')).toBe(true);
  });
});

describe('Accueil avec une Tribu', () => {
  it('affiche la carte de la Tribu, ses membres et les idées dans sa ville', async () => {
    loginAs({ familyId: 'f1' });
    useFamilyStore.getState().setFamily(family);
    mockApi(catalogRoute);
    renderScreen(<Home />);

    expect(screen.getByText('Champions')).toBeInTheDocument();
    expect(screen.getByText('2 membres · Angers')).toBeInTheDocument();
    expect(screen.getByText('620 / 1000 pts')).toBeInTheDocument();
    expect(screen.getByText('380 pts avant le niveau 5')).toBeInTheDocument();
    expect(screen.getByText('Thomas')).toBeInTheDocument();
    expect(screen.getByText('Moi')).toBeInTheDocument();
    expect(screen.getByText('0 / 4 activités')).toBeInTheDocument();
    expect(await screen.findByText('Où sortir avec ta Tribu ?')).toBeInTheDocument();
    expect(screen.getAllByText('Pique-nique').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Jeux de société').length).toBeGreaterThan(0); // sans ville : partout
    expect(screen.queryByText('Bowling')).not.toBeInTheDocument(); // à Nantes
  });

  it('montre l\'activité en cours en haut et ne la propose plus', async () => {
    loginAs({ familyId: 'f1' });
    useFamilyStore.getState().setFamily(family);
    useFamilyStore.getState().setCurrentActivity(familyActivity(picnic));
    mockApi(catalogRoute);
    renderScreen(<Home />);

    expect(screen.getByText('En cours')).toBeInTheDocument();
    expect(screen.getAllByText('Pique-nique')).toHaveLength(1); // seulement dans la carte « En cours »
    await screen.findByText('Où sortir avec ta Tribu ?');
    expect(screen.getAllByText('Pique-nique')).toHaveLength(1); // pas dans les idées : déjà en cours
  });

  it('« Terminer l\'activité » ouvre le détail de l\'activité', async () => {
    loginAs({ familyId: 'f1' });
    useFamilyStore.getState().setFamily(family);
    useFamilyStore.getState().setCurrentActivity(familyActivity(picnic));
    mockApi(catalogRoute);
    renderScreen(<Home />);

    await userEvent.click(screen.getByRole('button', { name: "Terminer l'activité" }));
    expect(screen.getByTestId('path')).toHaveTextContent('/activites/a1');
  });

  it('les autres membres peuvent seulement voir l\'activité en cours', async () => {
    loginAs({ familyId: 'f1' });
    useFamilyStore.getState().setFamily(family);
    useFamilyStore.getState().setCurrentActivity(familyActivity(picnic, { startedBy: 'u5' }));
    mockApi(catalogRoute);
    renderScreen(<Home />);

    expect(screen.queryByRole('button', { name: "Terminer l'activité" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: "Voir l'activité" }));
    expect(screen.getByTestId('path')).toHaveTextContent('/activites/a1');
  });

  it('ne propose plus une activité déjà faite', async () => {
    loginAs({ familyId: 'f1' });
    useFamilyStore.getState().setFamily(family);
    useFamilyStore.getState().setCompletedActivities([familyActivity(picnic, { status: 'completed' })]);
    mockApi(catalogRoute);
    renderScreen(<Home />);

    await screen.findByText('Où sortir avec ta Tribu ?');
    expect(screen.getAllByText('Jeux de société').length).toBeGreaterThan(0);
    expect(screen.queryByText('Pique-nique')).not.toBeInTheDocument();
  });

  it('ouvre les notifications, les marque comme lues et accepte une demande', async () => {
    loginAs({ familyId: 'f1' });
    useFamilyStore.getState().setFamily(family);
    useFamilyStore.getState().setNotifications([joinRequestNotification]);
    useFamilyStore.getState().setUnreadNotifications(1);
    const calls = mockApi({
      ...catalogRoute,
      'PATCH notifications/read': { body: {} },
      'PATCH families/f1/join-requests/u7': { body: { family: { joinRequests: [] } } },
    });
    renderScreen(<Home />);

    await userEvent.click(screen.getByRole('button', { name: 'Notifications, 1 non lue' }));
    const panel = screen.getByRole('dialog', { name: 'Notifications' });
    expect(within(panel).getByText('Lucas souhaite rejoindre votre Tribu.')).toBeInTheDocument();
    expect(useFamilyStore.getState().unreadNotifications).toBe(0);

    await userEvent.click(within(panel).getByRole('button', { name: 'Accepter' }));
    expect(await within(panel).findByText('Demande acceptée')).toBeInTheDocument();
    expect(calls.find(c => c.path === 'families/f1/join-requests/u7')?.body).toEqual({ accept: true });
    expect(calls.some(c => c.path === 'notifications/read')).toBe(true);
  });
});

describe('Objectif de la semaine', () => {
  it('compte les activités terminées depuis lundi', async () => {
    loginAs({ familyId: 'f1' });
    useFamilyStore.getState().setFamily(family);
    const now = new Date();
    useFamilyStore.getState().setCompletedActivities([
      familyActivity(picnic, { id: 'fa1', status: 'completed', completedAt: now.toISOString() }),
      familyActivity(picnic, { id: 'fa2', status: 'completed', completedAt: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString() }),
    ]);
    mockApi(catalogRoute);
    renderScreen(<Home />);
    expect(screen.getByText('1 / 4 activités')).toBeInTheDocument();
    expect(screen.getByText('Encore 3 activités pour boucler la semaine !')).toBeInTheDocument();
  });
});

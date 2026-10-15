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
  it('affiche la Tribu, son classement et les idées dans sa ville', async () => {
    loginAs({ familyId: 'f1' });
    useFamilyStore.getState().setFamily(family);
    mockApi(catalogRoute);
    renderScreen(<Home />);

    expect(screen.getByText('Champions')).toBeInTheDocument();
    expect(screen.getByText('Thomas')).toBeInTheDocument();
    expect(screen.getByText('Rien de prévu cette semaine')).toBeInTheDocument();
    expect(await screen.findByText('Où sortir avec ta Tribu ?')).toBeInTheDocument();
    expect(screen.getAllByText('Pique-nique').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Jeux de société').length).toBeGreaterThan(0); // sans ville : partout
    expect(screen.queryByText('Bowling')).not.toBeInTheDocument(); // à Nantes
  });

  it('montre l\'activité en cours à valider et ne la propose plus', async () => {
    loginAs({ familyId: 'f1' });
    useFamilyStore.getState().setFamily(family);
    useFamilyStore.getState().setCurrentActivity(familyActivity(picnic));
    mockApi(catalogRoute);
    renderScreen(<Home />);

    expect(screen.getByText('Pique-nique à valider')).toBeInTheDocument();
    await screen.findByText('Où sortir avec ta Tribu ?');
    expect(screen.queryByText('Pique-nique')).not.toBeInTheDocument(); // déjà en cours
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }));
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

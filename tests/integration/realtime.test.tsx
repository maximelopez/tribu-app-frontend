import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import useFamilyData from '../../src/hooks/useFamilyData';
import useRealtime from '../../src/hooks/useRealtime';
import { useUserStore } from '../../src/store/userStore';
import { useFamilyStore } from '../../src/store/familyStore';
import { loginAs, mockApi } from '../helpers';
import { family, familyActivity, joinRequestNotification, picnic } from '../fixtures';

// Faux socket : garde les événements écoutés et ceux envoyés
const fakeSocket = vi.hoisted(() => {
  const handlers: Record<string, ((data?: unknown) => void)[]> = {};
  return {
    handlers,
    on: (event: string, handler: (data?: unknown) => void) => { (handlers[event] ??= []).push(handler); },
    off: (event: string, handler: (data?: unknown) => void) => {
      handlers[event] = (handlers[event] ?? []).filter(h => h !== handler);
    },
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    // Le serveur envoie un événement
    receive: (event: string, data?: unknown) => (handlers[event] ?? []).forEach(h => h(data)),
  };
});
vi.mock('../../src/socket', () => ({ socket: fakeSocket }));

// Comme AuthenticatedLayout dans App.tsx : données de la Tribu + temps réel
function ConnectedApp() {
  useFamilyData();
  useRealtime();
  return null;
}
const renderConnectedApp = (url = '/') =>
  render(<MemoryRouter initialEntries={[url]}><ConnectedApp /></MemoryRouter>);

// Réponses du backend pour un membre de la Tribu « Champions »
const familyRoutes = {
  'GET families/f1': { body: { family } },
  'GET users?familyId=f1': { body: { users: family.members } },
  'GET families/f1/activities/current': { body: { familyActivity: null } },
  'GET families/f1/activities': { body: { familyActivities: [] } },
  'GET families/f1/chat/unread': { body: { count: 2 } },
  'GET notifications': { body: { notifications: [joinRequestNotification], unreadCount: 1 } },
  'GET users/u1': { body: { familyId: 'f1' } },
};

describe('Connexion et chargement', () => {
  beforeEach(() => {
    fakeSocket.emit.mockClear();
    fakeSocket.connect.mockClear();
  });

  it('se connecte au socket, rejoint la Tribu et charge ses données', async () => {
    loginAs({ familyId: 'f1' });
    mockApi(familyRoutes);
    renderConnectedApp();

    expect(fakeSocket.connect).toHaveBeenCalled();
    expect(fakeSocket.emit).toHaveBeenCalledWith('joinFamilyRoom', 'f1');
    await waitFor(() => expect(useFamilyStore.getState().family?.name).toBe('Champions'));
    expect(useFamilyStore.getState().family?.members).toHaveLength(2);
    await waitFor(() => expect(useFamilyStore.getState().unreadCount).toBe(2));
    expect(useFamilyStore.getState().unreadNotifications).toBe(1);
  });

  it('sans Tribu : récupère la demande en attente', async () => {
    loginAs();
    mockApi({
      'GET notifications': { body: { notifications: [], unreadCount: 0 } },
      'GET families/join-requests/me': { body: { joinRequest: { familyId: 'f1', name: 'Champions', city: 'Angers' } } },
    });
    renderConnectedApp();
    await waitFor(() => expect(useFamilyStore.getState().pendingRequest?.name).toBe('Champions'));
  });
});

describe('Événements en temps réel', () => {
  const setup = async (url = '/') => {
    loginAs({ familyId: 'f1' });
    const calls = mockApi(familyRoutes);
    renderConnectedApp(url);
    await waitFor(() => expect(useFamilyStore.getState().family?.name).toBe('Champions'));
    await waitFor(() => expect(useFamilyStore.getState().unreadCount).toBe(2));
    return calls;
  };

  it('compte un message non lu d\'un autre membre, mais pas les siens', async () => {
    await setup();
    act(() => fakeSocket.receive('newMessage', { sender: { _id: 'u5' } }));
    act(() => fakeSocket.receive('newMessage', { sender: { _id: 'u1' } }));
    expect(useFamilyStore.getState().unreadCount).toBe(3);
  });

  it('ne compte pas les messages quand le chat est affiché', async () => {
    loginAs({ familyId: 'f1' });
    mockApi(familyRoutes);
    renderConnectedApp('/chat');
    await waitFor(() => expect(useFamilyStore.getState().family?.name).toBe('Champions'));
    act(() => fakeSocket.receive('newMessage', { sender: { _id: 'u5' } }));
    expect(useFamilyStore.getState().unreadCount).toBe(0);
  });

  it('ajoute une nouvelle notification en tête', async () => {
    await setup();
    const notification = { ...joinRequestNotification, id: 'n2', type: 'member_joined' as const };
    act(() => fakeSocket.receive('notification', notification));
    expect(useFamilyStore.getState().notifications[0].id).toBe('n2');
    expect(useFamilyStore.getState().unreadNotifications).toBe(2);
  });

  it('met à jour la Tribu quand le créateur la renomme', async () => {
    await setup();
    act(() => fakeSocket.receive('familyUpdated', { name: 'Les Champions' }));
    expect(useFamilyStore.getState().family?.name).toBe('Les Champions');
  });

  it('suit l\'activité lancée puis terminée par un membre', async () => {
    await setup();
    const ongoing = familyActivity(picnic, { startedBy: 'u5' });
    act(() => fakeSocket.receive('familyActivityUpdated', ongoing));
    expect(useFamilyStore.getState().currentActivity?.id).toBe('fa-a1');

    await act(async () => fakeSocket.receive('familyActivityUpdated', { ...ongoing, status: 'completed' }));
    expect(useFamilyStore.getState().currentActivity).toBeNull();
    expect(useFamilyStore.getState().completedActivities[0].id).toBe('fa-a1');
  });

  it('recharge les membres quand quelqu\'un rejoint la Tribu', async () => {
    const calls = await setup();
    const before = calls.filter(c => c.path === 'users?familyId=f1').length;
    await act(async () => fakeSocket.receive('memberJoined'));
    expect(calls.filter(c => c.path === 'users?familyId=f1').length).toBe(before + 1);
  });

  it('déconnecte si le serveur refuse le token', async () => {
    await setup();
    const replace = vi.fn();
    vi.stubGlobal('location', { ...window.location, replace });
    act(() => fakeSocket.receive('connect_error', new Error('Non autorisé')));
    expect(useUserStore.getState().token).toBeNull();
    expect(replace).toHaveBeenCalledWith('/connexion');
  });
});

describe('Demande pour rejoindre une Tribu', () => {
  it('passe dans la Tribu quand la demande est acceptée', async () => {
    loginAs();
    useFamilyStore.getState().setPendingRequest({ familyId: 'f1', name: 'Champions', city: 'Angers' });
    mockApi({ 'GET notifications': { body: { notifications: [], unreadCount: 0 } }, 'GET families/join-requests/me': { body: { joinRequest: null } } });
    renderConnectedApp();

    act(() => fakeSocket.receive('familyAccepted', { familyId: 'f1' }));
    expect(useUserStore.getState().user?.familyId).toBe('f1');
    expect(useFamilyStore.getState().pendingRequest).toBeNull();
  });

  it('revient à « Rejoindre ou créer » quand la demande est refusée', async () => {
    loginAs();
    useFamilyStore.getState().setPendingRequest({ familyId: 'f1', name: 'Champions', city: 'Angers' });
    mockApi({ 'GET notifications': { body: { notifications: [], unreadCount: 0 } }, 'GET families/join-requests/me': { status: 500 } });
    renderConnectedApp();

    act(() => fakeSocket.receive('familyRejected'));
    expect(useFamilyStore.getState().pendingRequest).toBeNull();
  });
});

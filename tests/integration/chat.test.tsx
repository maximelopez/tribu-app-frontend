import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Chat from '../../src/screens/Chat';
import { useFamilyStore } from '../../src/store/familyStore';
import { loginAs, mockApi, renderScreen } from '../helpers';
import { family } from '../fixtures';

// Faux socket : garde les événements écoutés par l'écran et ceux qu'il envoie
const fakeSocket = vi.hoisted(() => {
  const handlers: Record<string, ((data: unknown) => void)[]> = {};
  return {
    handlers,
    on: (event: string, handler: (data: unknown) => void) => { (handlers[event] ??= []).push(handler); },
    off: (event: string, handler: (data: unknown) => void) => {
      handlers[event] = (handlers[event] ?? []).filter(h => h !== handler);
    },
    emit: vi.fn(),
    // Le serveur envoie un événement
    receive: (event: string, data: unknown) => (handlers[event] ?? []).forEach(h => h(data)),
  };
});
vi.mock('../../src/socket', () => ({ socket: fakeSocket }));

const message = (id: string, senderId: string, name: string, content: string) => ({
  _id: id, familyId: 'f1', sender: { _id: senderId, name, avatar: 1 }, content, createdAt: '2026-10-14T18:00:00.000Z',
});

describe('Chat', () => {
  beforeEach(() => fakeSocket.emit.mockClear());

  it('invite à rejoindre une Tribu quand on n\'en a pas', () => {
    loginAs();
    renderScreen(<Chat />);
    expect(screen.getByText('Rejoins ou crée ta Tribu pour échanger avec ta famille !')).toBeInTheDocument();
  });

  it('charge l\'historique et marque les messages comme lus', () => {
    loginAs({ familyId: 'f1' });
    useFamilyStore.getState().setFamily(family);
    useFamilyStore.getState().setUnreadCount(3);
    mockApi({});
    renderScreen(<Chat />);

    expect(screen.getByText('Famille Champions')).toBeInTheDocument();
    expect(screen.getByText('2 membres')).toBeInTheDocument();
    expect(fakeSocket.emit).toHaveBeenCalledWith('getHistory');

    act(() => fakeSocket.receive('chatHistory', [message('m1', 'u5', 'Thomas', 'On fait quoi samedi ?')]));
    expect(screen.getByText('On fait quoi samedi ?')).toBeInTheDocument();
    expect(useFamilyStore.getState().unreadCount).toBe(0);
    expect(fakeSocket.emit).toHaveBeenCalledWith('markChatRead');
  });

  it('envoie un message et affiche ceux qui arrivent en direct', async () => {
    loginAs({ familyId: 'f1' });
    useFamilyStore.getState().setFamily(family);
    mockApi({});
    renderScreen(<Chat />);

    await userEvent.type(screen.getByPlaceholderText('Écris un message...'), '  Un pique-nique ?  ');
    await userEvent.click(screen.getByRole('button', { name: 'Envoyer' }));
    expect(fakeSocket.emit).toHaveBeenCalledWith('sendMessage', { content: 'Un pique-nique ?' });
    expect(screen.getByPlaceholderText('Écris un message...')).toHaveValue('');

    act(() => fakeSocket.receive('newMessage', message('m2', 'u1', 'Maxime', 'Un pique-nique ?')));
    expect(screen.getByText('Un pique-nique ?')).toBeInTheDocument();
  });

  it('n\'envoie pas un message vide', async () => {
    loginAs({ familyId: 'f1' });
    useFamilyStore.getState().setFamily(family);
    mockApi({});
    renderScreen(<Chat />);
    await userEvent.type(screen.getByPlaceholderText('Écris un message...'), '   ');
    await userEvent.click(screen.getByRole('button', { name: 'Envoyer' }));
    expect(fakeSocket.emit).not.toHaveBeenCalledWith('sendMessage', expect.anything());
  });
});

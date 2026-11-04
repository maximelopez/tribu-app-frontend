import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Profile from '../../src/screens/Profile';
import { useUserStore } from '../../src/store/userStore';
import { loginAs, mockApi, renderScreen } from '../helpers';

describe('Profil : abonnement et compte', () => {
  it('passe Premium avec le bouton du plan gratuit', async () => {
    loginAs();
    const calls = mockApi({ 'POST users/u1/premium': { body: { id: 'u1', isPremium: true } } });
    renderScreen(<Profile />, { path: '/profil' });

    expect(screen.getByText('Plan gratuit')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Passer Premium' }));

    expect(await screen.findByText('Membre Premium')).toBeInTheDocument();
    expect(screen.getByText('Sans engagement')).toBeInTheDocument();
    expect(useUserStore.getState().user?.isPremium).toBe(true);
    expect(calls).toContainEqual(expect.objectContaining({ method: 'POST', path: 'users/u1/premium' }));
  });

  it('arrête Premium après confirmation', async () => {
    loginAs({ isPremium: true });
    const calls = mockApi({ 'DELETE users/u1/premium': { body: { id: 'u1', isPremium: false } } });
    renderScreen(<Profile />, { path: '/profil' });

    await userEvent.click(screen.getByRole('button', { name: 'Gérer mon abonnement' }));
    await userEvent.click(screen.getByRole('button', { name: 'Arrêter Premium' }));

    expect(await screen.findByText('Plan gratuit')).toBeInTheDocument();
    expect(useUserStore.getState().user?.isPremium).toBe(false);
    expect(calls).toContainEqual(expect.objectContaining({ method: 'DELETE', path: 'users/u1/premium' }));
  });

  it('affiche une erreur si le changement d\'abonnement échoue', async () => {
    loginAs();
    mockApi({ 'POST users/u1/premium': { status: 500 } });
    renderScreen(<Profile />, { path: '/profil' });

    await userEvent.click(screen.getByRole('button', { name: 'Passer Premium' }));
    expect(await screen.findByRole('alert')).toHaveTextContent("Impossible de changer l'abonnement");
    expect(useUserStore.getState().user?.isPremium).toBeFalsy();
  });

  it('supprime le compte après confirmation, puis déconnecte', async () => {
    loginAs();
    const calls = mockApi({ 'DELETE users/u1': { body: { message: 'Compte supprimé' } } });
    renderScreen(<Profile />, { path: '/profil' });

    // Le bouton du bas ouvre la popup, celui de la popup confirme
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer mon compte' }));
    expect(screen.getByRole('dialog', { name: 'Supprimer ton compte ?' })).toBeInTheDocument();
    const buttons = screen.getAllByRole('button', { name: 'Supprimer mon compte' });
    await userEvent.click(buttons[buttons.length - 1]);

    expect(await screen.findByTestId('path')).toHaveTextContent('/connexion');
    expect(useUserStore.getState().user).toBeNull();
    expect(useUserStore.getState().token).toBeNull();
    expect(calls).toContainEqual(expect.objectContaining({ method: 'DELETE', path: 'users/u1' }));
  });

  it('ne supprime rien si on annule', async () => {
    loginAs();
    const calls = mockApi({});
    renderScreen(<Profile />, { path: '/profil' });

    await userEvent.click(screen.getByRole('button', { name: 'Supprimer mon compte' }));
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useUserStore.getState().user).not.toBeNull();
    expect(calls.some(call => call.method === 'DELETE')).toBe(false);
  });
});

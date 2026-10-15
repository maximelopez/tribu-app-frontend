import { describe, expect, it } from 'vitest';
import { useUserStore } from '../../src/store/userStore';
import type { User } from '../../src/store/userStore';
import { useFamilyStore } from '../../src/store/familyStore';
import type { FamilyActivity } from '../../src/store/familyStore';

const user: User = { id: 'u1', name: 'Maxime', email: 'm@test.fr', familyId: null, avatar: 2 };

describe('Store utilisateur', () => {
  it('met à jour l\'utilisateur à partir de sa valeur précédente', () => {
    useUserStore.getState().setUser(user);
    useUserStore.getState().setUser(prev => (prev ? { ...prev, points: 50 } : prev));
    expect(useUserStore.getState().user).toEqual({ ...user, points: 50 });
  });

  it('garde la session dans le localStorage', () => {
    useUserStore.getState().setUser(user);
    useUserStore.getState().setToken('token-123');
    const saved = JSON.parse(localStorage.getItem('tribu:auth:user')!);
    expect(saved.state.user.id).toBe('u1');
    expect(saved.state.token).toBe('token-123');
  });

  it('vide tout à la déconnexion', () => {
    useUserStore.getState().setUser(user);
    useUserStore.getState().setToken('token-123');
    useUserStore.getState().setOnboardingCompleted(true);
    useUserStore.getState().logout();
    const { user: u, token, onboardingCompleted } = useUserStore.getState();
    expect({ u, token, onboardingCompleted }).toEqual({ u: null, token: null, onboardingCompleted: false });
  });
});

describe('Store de la Tribu', () => {
  const done = (id: string) => ({ id, activity: { id: `act-${id}` } }) as unknown as FamilyActivity;
  const deleted = (id: string) => ({ id, activity: null }) as unknown as FamilyActivity;

  it('ignore une activité en cours supprimée du catalogue', () => {
    useFamilyStore.getState().setCurrentActivity(deleted('x'));
    expect(useFamilyStore.getState().currentActivity).toBeNull();
    useFamilyStore.getState().setCurrentActivity(done('y'));
    expect(useFamilyStore.getState().currentActivity?.id).toBe('y');
  });

  it('retire de l\'historique les activités supprimées du catalogue', () => {
    useFamilyStore.getState().setCompletedActivities([done('a'), deleted('b'), done('c')]);
    expect(useFamilyStore.getState().completedActivities.map(fa => fa.id)).toEqual(['a', 'c']);
  });

  it('compte les messages non lus', () => {
    useFamilyStore.getState().setUnreadCount(2);
    useFamilyStore.getState().setUnreadCount(n => n + 1);
    expect(useFamilyStore.getState().unreadCount).toBe(3);
  });

  it('vide toutes les données de la Tribu', () => {
    const store = useFamilyStore.getState();
    store.setUnreadCount(4);
    store.setUnreadNotifications(2);
    store.setPendingRequest({ familyId: 'f1', name: 'Champions', city: 'Angers' });
    store.setCompletedActivities([done('a')]);
    store.clearFamily();
    const s = useFamilyStore.getState();
    expect([s.family, s.pendingRequest, s.unreadCount, s.unreadNotifications, s.completedActivities.length])
      .toEqual([null, null, 0, 0, 0]);
  });
});

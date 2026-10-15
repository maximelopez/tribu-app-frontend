import { afterEach, vi } from 'vitest';
import { useUserStore } from '../src/store/userStore';
import { useFamilyStore } from '../src/store/familyStore';

// Après chaque test : on repart d'une app vide (déconnecté, sans Tribu, sans faux fetch)
afterEach(() => {
  useUserStore.getState().logout();
  useFamilyStore.getState().clearFamily();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { useUserStore } from '../src/store/userStore';
import { useFamilyStore } from '../src/store/familyStore';

// Le faux navigateur (jsdom) n'a pas scrollIntoView : on en met un qui ne fait rien
Element.prototype.scrollIntoView = () => {};

// Après chaque test : on repart d'une app vide (écran retiré, déconnecté, sans Tribu, sans faux fetch)
afterEach(() => {
  cleanup();
  useUserStore.getState().logout();
  useFamilyStore.getState().clearFamily();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

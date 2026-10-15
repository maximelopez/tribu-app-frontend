import type { ReactElement } from 'react';
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { useUserStore } from '../src/store/userStore';
import type { User } from '../src/store/userStore';

type FakeResponse = { status?: number; body?: unknown };

export type ApiCall = { method: string; path: string; body?: unknown };

// Faux backend : chaque route ("GET families/cities") renvoie la réponse donnée.
// Une route qui finit par * accepte la suite de l'adresse (ex : "GET families?*").
// Renvoie la liste des appels faits par l'écran.
export const mockApi = (routes: Record<string, FakeResponse>) => {
  const calls: ApiCall[] = [];

  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit = {}) => {
    const path = url.replace('http://api.test/api/', '');
    const method = init.method ?? 'GET';
    calls.push({ method, path, body: init.body ? JSON.parse(init.body as string) : undefined });

    const key = Object.keys(routes).find(route => {
      const [m, p] = route.split(' ');
      return m === method && (p.endsWith('*') ? path.startsWith(p.slice(0, -1)) : path === p);
    });
    const { status = 200, body = {} } = key ? routes[key] : { status: 404 };
    return new Response(JSON.stringify(body), { status });
  }));

  return calls;
};

// Affiche l'adresse actuelle (pour vérifier une navigation)
function CurrentPath() {
  return <p data-testid="path">{useLocation().pathname}</p>;
}

// Affiche un écran à une adresse, comme dans l'app
export const renderScreen = (screen: ReactElement, { path = '/', url }: { path?: string; url?: string } = {}) =>
  render(
    <MemoryRouter initialEntries={[url ?? path]}>
      <Routes>
        <Route path={path} element={screen} />
        <Route path="*" element={<CurrentPath />} />
      </Routes>
    </MemoryRouter>
  );

// Utilisateur connecté, onboarding terminé
export const loginAs = (user: Partial<User> = {}) => {
  useUserStore.getState().setToken('token-test');
  useUserStore.getState().setUser({ id: 'u1', name: 'Maxime', email: 'm@test.fr', familyId: null, avatar: 2, theme: 'green', ...user });
  useUserStore.getState().setOnboardingCompleted(true);
};

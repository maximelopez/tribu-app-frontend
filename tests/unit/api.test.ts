import { describe, expect, it, vi } from 'vitest';
import { api } from '../../src/api';
import { useUserStore } from '../../src/store/userStore';
import { useFamilyStore } from '../../src/store/familyStore';

// Faux fetch : renvoie toujours la même réponse et garde les appels
const mockFetch = (status = 200, body: unknown = {}) => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

// Faux window.location.replace (redirection vers la connexion)
const mockRedirect = () => {
  const replace = vi.fn();
  vi.stubGlobal('location', { ...window.location, replace });
  return replace;
};

describe('api()', () => {
  it('appelle le backend à la bonne adresse', async () => {
    const fetchMock = mockFetch();
    await api('families/cities');
    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/api/families/cities');
  });

  it('envoie le token quand on est connecté', async () => {
    useUserStore.getState().setToken('token-123');
    const fetchMock = mockFetch();
    await api('users/me');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer token-123');
  });

  it('n\'envoie pas de token quand on n\'est pas connecté', async () => {
    const fetchMock = mockFetch();
    await api('activities');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it('envoie le corps en JSON', async () => {
    const fetchMock = mockFetch();
    await api('families', { method: 'POST', body: { name: 'Champions', city: 'Angers' } });
    const options = fetchMock.mock.calls[0][1];
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({ name: 'Champions', city: 'Angers' });
  });

  it('déconnecte et renvoie vers la connexion si la session a expiré (401)', async () => {
    useUserStore.getState().setToken('token-expire');
    useUserStore.getState().setUser({ id: 'u1', name: 'Maxime', email: 'm@test.fr', familyId: 'f1', avatar: 1 });
    useFamilyStore.getState().setUnreadCount(3);
    mockFetch(401);
    const replace = mockRedirect();

    const response = await api('users/u1');

    expect(response.status).toBe(401);
    expect(useUserStore.getState().token).toBeNull();
    expect(useUserStore.getState().user).toBeNull();
    expect(useFamilyStore.getState().unreadCount).toBe(0);
    expect(replace).toHaveBeenCalledWith('/connexion');
  });

  it('ne redirige pas sur un 401 sans être connecté (ex : mauvais mot de passe)', async () => {
    mockFetch(401, { message: 'Email ou mot de passe incorrect' });
    const replace = mockRedirect();
    const response = await api('auth/login', { method: 'POST', body: { email: 'a@b.fr', password: 'x' } });
    expect(response.status).toBe(401);
    expect(replace).not.toHaveBeenCalled();
  });
});

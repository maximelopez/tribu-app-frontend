import { API_URL } from './config';
import { useUserStore } from './store/userStore';
import { useFamilyStore } from './store/familyStore';

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown; // objet envoyé en JSON
};

// Déconnexion complète : utilisateur, token et données de la Tribu
export const logoutSession = () => {
  useUserStore.getState().logout();
  useFamilyStore.getState().clearFamily();
};

// Session expirée ou invalide : déconnexion puis écran de connexion
export const expireSession = () => {
  logoutSession();
  window.location.replace('/connexion');
};

// Appel au backend : ajoute l'adresse du serveur, le JSON et le token.
// Si le serveur répond 401 (session expirée ou invalide), on déconnecte
// et on renvoie vers la connexion.
export async function api(path: string, options: ApiOptions = {}) {
  const { body, headers, ...rest } = options;
  const token = useUserStore.getState().token;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && token) expireSession();

  return response;
}

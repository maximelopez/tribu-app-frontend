// Adresse du backend : obligatoire, définie dans le fichier .env (VITE_API_URL)
const envUrl = import.meta.env.VITE_API_URL as string | undefined;

if (!envUrl) {
  console.error('VITE_API_URL manquante : ajoute-la dans le fichier .env (voir README.md).');
}

export const SERVER_URL = (envUrl ?? '').replace(/\/+$/, '');
export const API_URL = `${SERVER_URL}/api/`;

// Adresse de contact pour les demandes sur les données personnelles (RGPD)
export const CONTACT_EMAIL = 'contact.tribufamily@gmail.com';

// Villes proposées à la création d'une Tribu
export const CITIES = ['Angers', 'Nantes', 'Paris'];

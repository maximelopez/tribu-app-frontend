# Tribu - PWA (React + Vite)

Même application que `mobile` (React Native), en Progressive Web App.
Elle utilise le même backend, sans aucune modification.

## Lancer en local

```bash
cd frontend
npm install
npm run dev
```

Puis ouvrir l'adresse affichée (ex : http://localhost:5173).
`npm run dev` est lancé avec `--host` : l'adresse « Network » permet aussi d'ouvrir l'app
depuis ton téléphone sur le même Wi-Fi (sans l'installation PWA, qui demande HTTPS).

## Construire / tester la version PWA

```bash
npm run build     # crée le dossier dist/
npm run preview   # sert dist/ en local, service worker actif
```

L'installation sur l'écran d'accueil (« Ajouter à l'écran d'accueil ») demande un site en HTTPS :
il faut donc héberger `dist/` (Netlify, Vercel, Render…) pour la tester sur téléphone.
Penser à rediriger toutes les routes vers `index.html` (voir `public/_redirects` pour Netlify).

## Configuration (obligatoire)

Créer un fichier `.env` à la racine de `frontend` (il n'est pas envoyé sur git) :

```
VITE_API_URL=https://tribu-app.onrender.com
```

- Adresse du backend **sans** `/api` à la fin (l'app l'ajoute elle-même).
- Pour un backend local : `VITE_API_URL=http://<IP-de-ton-PC>:<port>`.
- Relancer `npm run dev` après chaque modification du `.env`.
- Sur Netlify : ajouter la même variable `VITE_API_URL` dans *Site configuration → Environment variables*.

Sans cette variable, l'app affiche une erreur dans la console et ne peut pas joindre le backend.

## Correspondance avec mobile

| mobile (React Native)            | frontend (PWA)                          |
|----------------------------------|-----------------------------------------|
| `navigation/MainNavigator.tsx`   | `src/App.tsx` (React Router)            |
| `AsyncStorage`                   | `localStorage` (même store zustand)     |
| NativeWind                       | Tailwind CSS (mêmes classes `font-*`)   |
| `lucide-react-native`            | `lucide-react`                          |
| `expo-linear-gradient`           | `linear-gradient` CSS                   |
| Home charge la Tribu             | `hooks/useFamilyData.ts` (pour toute l'app connectée) |
| `navigation.popTo('Tabs')`       | `navigate('/', { replace: true })`      |

Adresses des écrans : `/inscription`, `/connexion`, `/bienvenue/...` (onboarding), `/` (accueil),
`/recompenses`, `/activites`, `/activites/:id`, `/recompense`, `/historique`, `/chat`, `/profil`,
`/tribu/rechercher`, `/tribu/creer`, `/tribu/:id`.

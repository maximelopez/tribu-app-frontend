# Tribu - PWA (React + Vite)

Application Tribu en Progressive Web App : installable sur téléphone (Android et iPhone),
avec un mode hors ligne basique.

- **Stack** : React 19 · TypeScript · Vite · Tailwind CSS · React Router · zustand · Socket.IO
- **En ligne** : https://app-tribu.netlify.app (hébergé sur Netlify)
- **Backend** : https://tribu-app-backend.onrender.com (dépôt `tribu-app-backend`)

## Lancer en local

```bash
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

L'installation sur l'écran d'accueil demande un site en HTTPS : il faut donc héberger `dist/`
(Netlify) pour la tester sur téléphone. Toutes les routes sont redirigées vers `index.html`
(voir `public/_redirects`).

## Configuration (obligatoire)

Créer un fichier `.env` à la racine de `frontend` (il n'est pas envoyé sur git) :

```
VITE_API_URL=https://tribu-app-backend.onrender.com
```

- Adresse du backend **sans** `/api` à la fin (l'app l'ajoute elle-même).
- Pour un backend local : `VITE_API_URL=http://<IP-de-ton-PC>:<port>`.
- Relancer `npm run dev` après chaque modification du `.env`.
- Sur Netlify : la même variable `VITE_API_URL` dans *Site configuration > Environment variables*,
  puis relancer un déploiement (*Deploys > Trigger deploy*).

Sans cette variable, l'app affiche une erreur dans la console et ne peut pas joindre le backend.

## Structure

```
src/
├── main.tsx           Point d'entrée (thème + routeur)
├── App.tsx            Routes et layouts (connexion, onboarding, app connectée)
├── config.ts          Adresses du backend (lues depuis VITE_API_URL)
├── api.ts             Appels au backend avec le token (déconnexion automatique si 401)
├── socket.ts          Connexion Socket.IO avec le token
├── screens/           Un fichier par écran
├── components/        Composants réutilisables (Button, Input, ScreenHeader, TabBar...)
├── hooks/             useFamilyData (données de la Tribu), useRealtime (temps réel), useFamilyChat
├── store/             userStore (utilisateur + token), familyStore (Tribu, activités)
├── context/           Thème (vert, orange, rouge)
└── assets/            Polices, avatars, illustrations, icônes
```

## Écrans

| Adresse | Écran |
|---|---|
| `/inscription`, `/connexion` | Inscription, connexion |
| `/bienvenue/naissance`, `/couleur`, `/avatar`, `/chargement` | Onboarding |
| `/` | Accueil |
| `/recompenses` | Récompenses |
| `/activites` | Catalogue d'activités |
| `/activites/:id` | Détail d'une activité |
| `/recompense` | Récompense après une activité terminée |
| `/historique?mode=family\|me` | Historique des activités |
| `/chat` | Chat de la Tribu |
| `/profil` | Profil |
| `/tribu/rechercher` | Rejoindre une Tribu (recherche) |
| `/tribu/:id` | Détails d'une Tribu avant de la rejoindre |
| `/tribu/creer` | Créer une Tribu |

## À faire

- **Mise à jour automatique de la PWA** : vérifier s'il existe une nouvelle version quand l'app revient
  au premier plan et recharger automatiquement (`main.tsx`, enregistrement du service worker de
  `vite-plugin-pwa`). Utile surtout sur iPhone, qui garde longtemps l'ancienne version en cache.
- **Badges** (gamification) : onglet Récompenses, section « Derniers badges gagnés » des détails d'une
  Tribu, carte badge sur l'écran de récompense.
- **Demandes pour rejoindre une Tribu** : système à revoir (demande en attente sur l'accueil, annulation).
- **Illustrations des catégories** d'activités (icônes provisoires pour l'instant).
- **Popup de confirmation** (`ConfirmModal`) : à adapter quand la maquette sera prête.
- **Écran de démarrage iPhone** (splash screen).
- **Mot de passe oublié** (nécessite l'envoi d'emails côté backend).
- **Notifications push** (Android ; iPhone seulement si l'app est installée).

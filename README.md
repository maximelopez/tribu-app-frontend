# Tribu - PWA (React + Vite)

Application Tribu en Progressive Web App : installable sur téléphone (Android et iPhone),
avec un mode hors ligne basique. Elle parle au backend Tribu (API REST + Socket.IO).

- **Stack** : React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router 7 · zustand · Socket.IO · lucide-react
- **En ligne** : https://app-tribu.netlify.app (hébergé sur Netlify)
- **Backend** : https://tribu-app-backend.onrender.com (dépôt `tribu-app-backend`, voir son README)
- **Maquette** : Figma (section `main-part`), référence pour tous les écrans

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvrir l'adresse affichée (ex : http://localhost:5173).
`npm run dev` est lancé avec `--host` : l'adresse « Network » permet aussi d'ouvrir l'app
depuis ton téléphone sur le même Wi-Fi (sans l'installation PWA, qui demande HTTPS).

| Script | Rôle |
|---|---|
| `npm run dev` | Développement avec rechargement automatique |
| `npm run build` | Vérifie les types (`tsc -b`) puis crée la version finale dans `dist/` |
| `npm run preview` | Sert `dist/` en local, service worker actif (pour tester la PWA) |

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
├── App.tsx            Routes et layouts (connexion, onboarding, app connectée, barre du bas)
├── config.ts          Adresses du backend (lues depuis VITE_API_URL)
├── api.ts             Appels au backend avec le token (déconnexion automatique si 401)
├── socket.ts          Connexion Socket.IO avec le token
├── screens/           Un fichier par écran
├── components/        Composants réutilisables
├── hooks/             Chargement des données et temps réel
├── store/             État global (zustand)
├── context/           Thème (vert, orange, rouge)
└── assets/            Polices, avatars, mascottes, illustrations, icônes (index.ts)
```

**Composants principaux**

| Composant | Rôle |
|---|---|
| `Button`, `Input` | Bouton principal (48px) et champ de formulaire |
| `ScreenHeader` | En-tête des écrans enfants (titre + bouton retour rond) |
| `TabBar` | Barre du bas (point rouge sur Chat s'il y a des messages non lus) |
| `ActivityCard` | Carte d'activité avec sa photo (ou l'illustration de sa catégorie), option `points` |
| `BadgeCard` | Carte d'un badge (grisée avec la progression s'il n'est pas obtenu) |
| `NoFamilyState` | État vide « pas encore de Tribu » (Chat, Récompenses) |
| `FamilyLeaderboard`, `LeaderboardRow` | Classement des membres de la Tribu |
| `NotificationBell`, `NotificationPanel` | Cloche de l'Accueil (compteur de non lues) et panneau des notifications |
| `MessageBubble` | Message du chat |
| `ThemeSwitcher` | Choix du thème dans le Profil |
| `ConfirmModal` | Popup de confirmation (bouton rouge pour une action destructive + bouton gris pour revenir) |

**Hooks**

| Hook | Rôle |
|---|---|
| `useFamilyData` | Charge la Tribu, ses membres, l'activité en cours et l'historique (une fois pour toute l'app) |
| `useRealtime` | Socket.IO : connexion, événements de la Tribu, messages non lus, resynchronisation |
| `useFamilyChat` | Messages du chat, envoi, marquer comme lu |
| `useFamilyBadges` | Badges de sa Tribu (rechargés quand une activité est terminée) ou d'une autre Tribu |

**Stores**

| Store | Contenu |
|---|---|
| `userStore` | Utilisateur connecté, token, onboarding terminé. Sauvegardé dans le `localStorage` |
| `familyStore` | Tribu, activité en cours, activités terminées, messages non lus, demande en attente, notifications. En mémoire seulement |

## Navigation

- **Écrans principaux** (Accueil, Récompenses, Activités, Chat, Profil) : barre du bas, pas de bouton retour.
- **Écrans enfants** (détails, recherche, historique…) : bouton retour rond en haut à gauche, pas de barre du bas.
- Le bouton retour revient à la page précédente, ou à l'accueil si l'écran a été ouvert directement.

| Adresse | Écran |
|---|---|
| `/inscription`, `/connexion` | Inscription, connexion |
| `/bienvenue/naissance`, `/couleur`, `/avatar`, `/chargement` | Onboarding |
| `/` | Accueil |
| `/recompenses` | Récompenses (collection de badges) |
| `/recompenses/badges` | Tous les badges |
| `/recompenses/badges/:id` | Détail d'un badge |
| `/activites` | Catalogue d'activités (filtres par catégorie) |
| `/activites/:id` | Détail d'une activité (lancer, terminer, annuler) |
| `/recompense` | Récompense après une activité terminée |
| `/historique?mode=family\|me` | Historique des activités (de la Tribu ou les siennes) |
| `/chat` | Chat de la Tribu |
| `/profil` | Profil |
| `/tribu/rechercher` | Rejoindre une Tribu (recherche) |
| `/tribu/:id` | Détails d'une Tribu avant de la rejoindre |
| `/tribu/creer` | Créer une Tribu |

## Connexion et session

- Le token (valable 30 jours) est renvoyé par le backend à la connexion ou à l'inscription, puis
  gardé dans `userStore`.
- Tous les appels passent par `api(path, { method, body })` (`api.ts`), qui ajoute le token.
- Si le serveur répond `401` (token expiré ou invalide), l'app déconnecte et renvoie vers `/connexion`.
- Le socket envoie aussi le token à chaque connexion. S'il est refusé, même déconnexion.

## Temps réel

`useRealtime` ouvre le socket quand l'utilisateur est connecté, rejoint la room de sa Tribu et écoute :

| Événement | Effet dans l'app |
|---|---|
| `newMessage` | Message ajouté au chat, ou un non lu de plus si le chat n'est pas affiché |
| `notification` | Nouvelle notification : en tête du panneau, compteur de la cloche + 1 |
| `newJoinRequest`, `joinRequestRemoved` | Demandes pour rejoindre mises à jour (créateur) |
| `familyAccepted` | Demande acceptée : la Tribu est chargée |
| `familyRejected` | Demande refusée : l'Accueil revient à « Rejoindre ou créer une Tribu » |
| `memberJoined` | Liste des membres rechargée |
| `familyUpdated` | Nom ou ville de la Tribu mis à jour |
| `familyActivityUpdated` | Activité en cours, historique et points mis à jour |

Au retour sur l'app (PWA de nouveau au premier plan) ou après une reconnexion, l'app relit le profil
et le nombre de messages non lus, pour rattraper ce qui s'est passé pendant la coupure.

## Notifications

- Cloche en haut de l'Accueil (avec ou sans Tribu), avec le nombre de notifications non lues.
- Le panneau affiche les 30 dernières (`GET /notifications`). L'ouvrir marque tout comme lu
  (`PATCH /notifications/read`), mais le point vert reste visible tant que le panneau est ouvert.
- Les notifications déjà lues ont un fond grisé. Elles sont supprimées après 14 jours (une demande en
  attente est gardée jusqu'à sa réponse).
- **Demande pour rejoindre** : le créateur l'accepte ou la refuse directement depuis la notification
  (il n'y a plus de bloc de demandes sur l'Accueil). Une fois traitée, la notification affiche
  « Demande acceptée », « Demande refusée » ou « Demande annulée ».
- Les notifications sont informatives : les toucher n'ouvre pas d'écran (seuls Accepter / Refuser agissent).
- Liste relue au démarrage, au retour sur l'app et après une reconnexion.

## Rejoindre une Tribu

- Une seule demande en attente à la fois : pour en envoyer une autre, il faut annuler la première.
- Après l'envoi, l'Accueil affiche « Demande envoyée » avec le bouton « Annuler la demande »
  (confirmation avec `ConfirmModal`).
- La demande en attente est relue au démarrage et au retour sur l'app (`GET /families/join-requests/me`).
- Acceptée : la Tribu est chargée. Refusée ou annulée : retour à « Rejoindre ou créer une Tribu ».

## Badges

Un badge par catégorie d'activité (Nature, Culture, Sport, Maison), obtenu quand la Tribu a terminé
3 activités de la catégorie. Les règles et les textes sont dans le backend (`config/badges.ts`) :
l'app les lit avec `GET /families/:id/badges`.

- **Onglet Récompenses** : collection, dernier badge gagné, badges par thématique.
- **Détail d'un badge** : texte long, progression, activités de la catégorie déjà faites.
- **Écran Récompense** : carte du badge quand l'activité vient de le débloquer (`newBadge`).
- **Profil** : dernier badge obtenu par la Tribu.
- **Détails d'une Tribu** : ses 3 derniers badges gagnés (visible avant de la rejoindre).

## Thème et design

- **3 thèmes** au choix de l'utilisateur (vert, orange, rouge) : `context/ThemeContext.tsx`.
  Utiliser `theme.primary`, `theme.gradient` et `theme.transparent` plutôt que des couleurs fixes.
- **Polices** : Outfit (`font-outfit`, `font-outfit-bold`) et Montserrat pour la barre du bas.
- **Fond** des écrans : `#F3F3F8`. Cartes blanches arrondies avec une ombre légère.
- **Images des activités** : la photo de l'activité (`imageUrl`, hébergée sur Cloudinary et ajoutée
  depuis l'app admin). Sans photo, l'illustration de sa catégorie. Fonction `getActivityImage` dans
  `assets/index.ts`.
- **Offres partenaires** : l'étiquette affiche l'offre de l'activité (`offer`, ex : « 1 partie offerte »),
  ou « Partenariat » si elle n'en a pas.
- **Illustrations des catégories** (`getActivityIllustration`) : utilisées pour les badges, et pour les
  activités qui n'ont pas encore de photo.

## PWA

- Configuration dans `vite.config.ts` (`vite-plugin-pwa`) : nom, icônes (`public/`), couleurs.
- **Hors ligne** : l'app (écrans, polices, images) est en cache. Les appels au backend restent en ligne.
- **Écran de démarrage iPhone** : fond vert avec le logo, une image par taille d'écran dans `public/splash/`
  (déclarées dans `index.html`). Pour un nouvel iPhone, ajouter son image et sa ligne `apple-touch-startup-image`.
  Il ne s'affiche que sur l'app installée sur l'écran d'accueil.
- **Écran de démarrage Android** : généré par Chrome à partir du manifest (`vite.config.ts`) : fond
  `background_color` (gris clair, comme le fond de l'app), icône `pwa-512x512.png` et nom de l'app.
- **Installation** : Android depuis Chrome (« Installer l'application »), iPhone depuis Safari
  (Partager > « Sur l'écran d'accueil »). Il faut un site en HTTPS.
- **Mise à jour** : l'app vérifie s'il existe une nouvelle version à chaque lancement. Pour récupérer
  une nouvelle version, fermer complètement l'app puis la relancer (une app seulement remise au premier
  plan garde l'ancienne version jusqu'au prochain lancement).

## Déploiement (Netlify)

| Réglage | Valeur |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Variable | `VITE_API_URL` |

Chaque push sur la branche principale redéploie automatiquement. Toutes les adresses sont redirigées
vers `index.html` (`public/_redirects`), pour qu'un lien direct vers un écran fonctionne.

## À faire

- **Profil** :
  - bouton « Supprimer mon compte » (règles à définir côté backend : créateur de la Tribu, Tribu vide,
    demandes en attente) ;
  - carte « Ma visibilité dans la Tribu » (masquer ses points dans le classement).
- **Badges** : textes longs de Sport, Culture et Maison à valider avec le designer ; date d'obtention
  (en attente de la maquette finale) ; nouveaux badges quand le système sera validé.
- **Mot de passe oublié** (nécessite l'envoi d'emails côté backend).
- **Notifications push** (Android ; iPhone seulement si l'app est installée).
- **Accueil** :
  - lien « Comment ça fonctionne ? » (contenu à définir) ;
  - chargement : carré blanc avec roue par-dessus l'écran grisé (comme la maquette).
- **Recherche de Tribu** : état affiché avant de taper (en attente du designer).
- **Écran Récompense** : mascotte « flottante » de la maquette (avec son ombre) à exporter.

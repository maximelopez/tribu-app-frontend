# Tribu - PWA (React + Vite)

[![CI](https://github.com/maximelopez/tribu-app-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/maximelopez/tribu-app-frontend/actions/workflows/ci.yml)

Application Tribu en Progressive Web App : installable sur téléphone (Android et iPhone),
avec un mode hors ligne basique. Elle parle au backend Tribu (API REST + Socket.IO).

- **Stack** : React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router 7 · zustand · Socket.IO · lucide-react
- **En ligne** : https://app-tribu.netlify.app (hébergé sur Netlify)
- **Backend** : https://tribu-app-backend.onrender.com (dépôt `tribu-app-backend`, voir son README)
- **Maquette** : Figma (section `main-part`), référence pour tous les écrans

## Documentation

| Document | Contenu |
|---|---|
| [docs/stack.md](docs/stack.md) | Choix techniques (PWA, React, Vite, Zustand, Tailwind, Netlify), veille et performances attendues |
| [docs/architecture.md](docs/architecture.md) | Organisation du code, navigation, circulation des données, temps réel, PWA, évolutivité |
| [docs/tests.md](docs/tests.md) | Stratégie de tests : outils, scénarios, couverture, actions correctives |
| [docs/infrastructure.md](docs/infrastructure.md) | Hébergement Netlify, performance (poids mesuré), sécurité, éco-conception |
| [docs/qualite.md](docs/qualite.md) | Qualité du code, vérifications automatiques, usage de l'IA, accessibilité |
| [docs/rgpd.md](docs/rgpd.md) | Données personnelles côté application : consentement, données gardées sur le téléphone, cookies |

Les spécifications, la recette et la partie backend sont dans le dossier `docs/` du backend.

## Sommaire

- [Lancer en local](#lancer-en-local)
- [Configuration](#configuration-obligatoire)
- [Structure](#structure)
- [Navigation](#navigation)
- [Ajouter un écran](#ajouter-un-écran)
- [Connexion et session](#connexion-et-session)
- [Temps réel](#temps-réel)
- [Fonctionnalités](#fonctionnalités)
- [Thème et design](#thème-et-design)
- [Animations](#animations)
- [PWA](#pwa)
- [Qualité du code](#qualité-du-code)
- [Tests système](#tests-système)
- [CI/CD](#cicd)
- [À faire](#à-faire)

## Lancer en local

Prérequis : Node.js 22.

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
| `npm run lint` | Vérifie la qualité du code (ESLint) |
| `npm run typecheck` | Vérifie les types (TypeScript) |
| `npm test` | Lance les tests (Vitest) |
| `npm run test:coverage` | Lance les tests avec le rapport de couverture (`coverage/index.html`), minimum 75 % des lignes |
| `npm run test:e2e` | Lance les tests système (Playwright) : l'app et le vrai backend, dans un vrai navigateur (voir [Tests système](#tests-système)) |

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
├── config.ts          Adresses du backend (lues depuis VITE_API_URL), adresse de contact RGPD
├── legal.ts           Textes de la politique de confidentialité et des CGU
├── categories.ts      Libellés des catégories d'activités
├── badges.ts          Couleurs des badges, date d'obtention (« Obtenu le 12 oct. »)
├── api.ts             Appels au backend avec le token (déconnexion automatique si 401)
├── socket.ts          Connexion Socket.IO avec le token
├── screens/           Un fichier par écran
├── components/        Composants réutilisables
├── hooks/             Chargement des données et temps réel
├── store/             État global (zustand)
├── context/           Thème (vert, orange, rouge)
└── assets/            Polices, avatars, mascottes, illustrations, images des badges, icônes (index.ts)

tests/
├── setup.ts           Remet l'app à zéro après chaque test (déconnecté, sans Tribu)
├── helpers.tsx        Faux backend, affichage d'un écran, connexion d'un utilisateur
├── fixtures.ts        Données de test (une Tribu, son catalogue, ses activités, ses badges)
├── unit/              Tests unitaires : thème, badges, activités, images, stores, appels au backend
└── integration/       Tests d'intégration : composants, connexion, inscription, onboarding, accueil, Tribu,
                       activités, récompenses, chat, temps réel

e2e/                   Tests système (Playwright) : parcours complets avec le vrai backend
```

**Composants principaux**

| Composant | Rôle |
|---|---|
| `Button`, `Input` | Bouton principal (48px) et champ de formulaire |
| `ScreenHeader` | En-tête des écrans enfants (titre + bouton retour rond) |
| `OnboardingLayout` | Fond à motifs et logo des écrans d'onboarding (date, couleur, avatar) |
| `TabBar` | Barre du bas (point rouge sur Chat s'il y a des messages non lus) |
| `ActivityCard` | Carte d'activité avec sa photo (ou l'illustration de sa catégorie), option `points` |
| `BadgeCard` | Carte d'un badge (grisée avec la progression s'il n'est pas obtenu) |
| `NoFamilyState` | État vide « pas encore de Tribu » (Chat, Récompenses) |
| `FloatingMascot` | Mascotte qui flotte dans son rond avec son ombre, en boucle (états vides, écran Récompense). Taille `grande` ou `petite` |
| `FamilyLeaderboard`, `LeaderboardRow` | Classement des membres de la Tribu |
| `NotificationBell`, `NotificationPanel` | Cloche de l'Accueil (compteur de non lues) et panneau des notifications |
| `MessageBubble` | Message du chat |
| `ThemeSwitcher` | Choix du thème dans le Profil |
| `ThemeProvider` | Fournit le thème à toute l'app (celui de l'utilisateur, ou vert par défaut) |
| `ConfirmModal` | Popup de confirmation (bouton rouge pour une action destructive + bouton gris pour revenir) |
| `Spinner` | Roue de chargement (boutons, listes) |
| `Confetti` | Pluie de confettis aux couleurs du thème (écran Récompense) |
| `ErrorBoundary` | Entoure toute l'app : si un écran plante, affiche un message avec « Recharger » |
| `LegalDocument` | Affiche un texte légal (politique de confidentialité ou CGU) |

**Hooks**

| Hook | Rôle |
|---|---|
| `useFamilyData` | Charge la Tribu, ses membres, l'activité en cours et l'historique (une fois pour toute l'app) |
| `useRealtime` | Socket.IO : connexion, événements de la Tribu, messages non lus, resynchronisation |
| `useFamilyChat` | Messages du chat, envoi, marquer comme lu |
| `useCountUp` | Nombre qui défile de 0 à sa valeur (points gagnés sur l'écran Récompense) |
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
| `/confidentialite`, `/cgu` | Politique de confidentialité et CGU (accessibles connecté ou non) |

## Ajouter un écran

1. Créer le fichier dans `src/screens/` (un composant par écran).
2. Déclarer sa route dans `App.tsx` :
   - écran principal : dans `TabsLayout` (barre du bas, pas de bouton retour) ;
   - écran enfant : dans `AuthenticatedLayout`, avec `ScreenHeader` en haut (bouton retour, pas de barre du bas).
3. Utiliser les couleurs du thème (`useTheme()`) et les composants existants (`Button`, `Input`,
   `ConfirmModal`…).
4. Appeler le backend avec `api()` et lire les données partagées dans les stores.
5. Ajouter l'adresse dans le tableau [Navigation](#navigation) de ce README.

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

## Fonctionnalités

### Points et niveaux

- Chaque participant d'une activité terminée gagne ses points, et la Tribu gagne les points de tous
  les participants.
- Le niveau de la Tribu (1 à 10) et sa progression sont calculés par le backend (`levelInfo`).
- `FamilyLeaderboard` affiche le niveau, la barre de progression, « Encore X pts avant le niveau N »
  et le classement des membres par points.

### Notifications

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

### Rejoindre une Tribu

- Une seule demande en attente à la fois : pour en envoyer une autre, il faut annuler la première.
- Après l'envoi, l'écran de la Tribu reste affiché avec « Demande envoyée ! ». L'Accueil affiche la carte
  « Demande envoyée » avec le bouton « Annuler la demande » (confirmation avec `ConfirmModal`).
- La demande en attente est relue au démarrage et au retour sur l'app (`GET /families/join-requests/me`).
- Acceptée : la Tribu est chargée. Refusée ou annulée : retour à « Rejoindre ou créer une Tribu ».

### Badges

24 badges sur 4 niveaux (`tier`) : bronze, argent, or et platine. Les règles et les textes sont dans le
backend (`config/badges.ts`) : l'app les lit avec `GET /families/:id/badges`. Chaque badge a une
progression (`progress / goal`) et, une fois obtenu, sa date (`unlockedAt`).

- **Onglet Récompenses** : collection (x / 24), les 3 derniers badges obtenus, le prochain objectif (le badge
  pas encore obtenu le plus avancé) et le bouton « Voir tous les badges ».
- **Tous les badges** : rangés par niveau (Bronze, Argent, Or, Platine).
- **Détail d'un badge** (une seule carte) :
  - obtenu : texte long, palier suivant (`nextBadge`) et date d'obtention (« Obtenu le 12 oct. ») ;
  - pas encore obtenu : texte long, progression et ce qu'il reste à faire (`remainingText`).
- **Écran Récompense** : les badges que l'activité vient de débloquer (`newBadges`).
- **Profil** : dernier badge obtenu par la Tribu.
- **Détails d'une Tribu** : ses 3 derniers badges gagnés (visible avant de la rejoindre).
- **Images** : un SVG par badge dans `src/assets/badges/`, nommé avec l'id du badge (ex :
  `premier-pas.svg`, `nature-2.svg`). L'app les charge automatiquement (`getBadgeImage` dans
  `assets/index.ts`) et les affiche en gris tant que le badge n'est pas obtenu. Pour changer l'image d'un
  badge, il suffit de remplacer son fichier en gardant le même nom (taille conseillée : 96 × 96).

### Données personnelles (RGPD)

- **Inscription** : case obligatoire « J'accepte les conditions d'utilisation et la politique de
  confidentialité. J'ai 15 ans ou plus, ou l'accord de mes parents. » Les deux textes s'ouvrent par-dessus
  le formulaire, sans perdre ce qui a été saisi. L'app envoie `acceptTerms: true` au backend.
- **Profil** : section « Mes données » avec les liens vers les deux textes et l'adresse de contact pour
  recevoir ou supprimer ses données (`CONTACT_EMAIL` dans `config.ts`).
- **Textes** : dans `src/legal.ts`, écrits simplement pour être compris aussi par les enfants.

Le détail (registre des traitements, durées, mineurs, IA Act) est dans la documentation du backend :
`backend/docs/rgpd.md`.

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

## Animations

Toutes définies dans `index.css`, et coupées si le téléphone est réglé sur « Réduire les animations ».

- **Barres de progression** (classe `progress-fill`) : se remplissent à l'affichage (niveau de la Tribu,
  collection de badges, détail d'un badge, écran Récompense). Délai réglable avec `--progress-delay`.
- **Écran Récompense** : confettis (`Confetti`), points qui défilent (`useCountUp`), carte des points et
  badges débloqués qui apparaissent avec un petit rebond (classe `pop-in`, délai `--pop-delay`).
- **Mascotte flottante** (`FloatingMascot`).

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

## Qualité du code

| Outil | Commande | Rôle |
|---|---|---|
| **ESLint** | `npm run lint` | Erreurs fréquentes, code inutile, règles de React (ordre et dépendances des hooks, state recopié dans un effet, rendu qui doit rester pur) |
| **TypeScript** | `npm run typecheck` | Erreurs de type (mode strict) |
| **Vitest + Testing Library** | `npm test` | Tests automatiques des fonctions, composants et écrans, dans un faux navigateur (jsdom), sans appeler le vrai backend |

La configuration d'ESLint est dans `eslint.config.js` (règles recommandées de JavaScript, TypeScript et React).

## Tests système

Les tests système vérifient l'application entière, comme un utilisateur : un navigateur au format téléphone
clique dans l'app, qui parle au vrai backend. Rien n'est simulé.

**Avant le premier lancement :**

- le backend doit être dans le dossier voisin (`tribu-app/backend`), avec ses dépendances installées (`npm install`) ;
- installer le navigateur de Playwright : `npx playwright install chromium`.

**Lancement :** `npm run test:e2e`. Playwright démarre tout seul le backend (`npm run start:e2e`, base MongoDB en mémoire,
vide à chaque lancement) et l'app, puis lance les parcours. La vraie base n'est jamais touchée.

| Fichier | Parcours |
|---|---|
| `parcours-activite.spec.ts` | Inscription, onboarding, création d'une Tribu, choix d'une activité, fin de l'activité, écran Récompense (points et badge « Premier pas »), points à jour sur l'accueil |
| `parcours-rejoindre.spec.ts` | Deux téléphones en même temps : demande pour rejoindre une Tribu, notification et acceptation en direct, arrivée dans la Tribu sans recharger, message de chat reçu en direct |
| `limites.spec.ts` | Écran protégé sans être connecté, email déjà utilisé, mauvais mot de passe, lien direct vers une activité, session expirée, Tribu introuvable |

Rapport détaillé : `npx playwright show-report` (avec captures et traces en cas d'échec).
La stratégie de tests complète (outils, scénarios, couverture, actions correctives) est détaillée dans [docs/tests.md](docs/tests.md).
Ces tests se lancent en local (ils ont besoin du backend) ; la CI lance les tests unitaires et d'intégration.

## CI/CD

**CI (GitHub Actions)** : à chaque push ou pull request sur `master`, le workflow `.github/workflows/ci.yml`
installe les dépendances (`npm ci`), lance le lint, vérifie les types, lance les tests avec la couverture
puis construit l'app. Le rapport de couverture est gardé 14 jours (artefact `rapport-couverture`).
Le résultat est visible dans l'onglet *Actions* du dépôt et sur le badge en haut de ce README.

**Déploiement continu (Netlify)** : chaque push sur `master` redéploie l'app. Les réglages sont dans `netlify.toml` :

| Réglage | Valeur |
|---|---|
| Build command | `npm run lint && npm test && npm run build` |
| Publish directory | `dist` |
| Node.js | 22 |
| Variable (dans Netlify) | `VITE_API_URL` |

Si le lint, un test ou TypeScript échoue, Netlify ne déploie pas et l'ancienne version reste en ligne.
Toutes les adresses sont redirigées vers `index.html` (`public/_redirects`), pour qu'un lien direct vers un écran fonctionne.

## À faire

- **Mot de passe oublié** (nécessite l'envoi d'emails côté backend).
- **Notifications push** (Android ; iPhone seulement si l'app est installée).
- **Supprimer mon compte** (Profil) : règles à définir côté backend (créateur de la Tribu, Tribu vide,
  demandes en attente).

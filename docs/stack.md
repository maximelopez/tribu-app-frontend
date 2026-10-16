# Choix de la stack - Frontend

Ce document explique les choix techniques de l'application Tribu (frontend) : pour chaque choix, les alternatives envisagées, les raisons du choix et les limites acceptées.

Les choix du backend (Node.js, Express, Socket.IO, MongoDB, Render) sont expliqués dans le `docs/stack.md` du backend.

## Résumé

| Besoin | Choix |
|---|---|
| Type d'application | PWA (application web installable) |
| Bibliothèque d'interface | React, en TypeScript |
| Outil de développement et de build | Vite |
| Navigation | React Router |
| Données partagées entre écrans | Zustand |
| Styles | Tailwind CSS |
| Temps réel | Socket.IO (client) |
| Icônes | lucide-react |
| Hébergement | Netlify |
| Tests et CI | Vitest, Testing Library, Playwright, GitHub Actions (voir [tests.md](tests.md)) |

## Veille technologique

Les choix ont été faits après une veille sur les solutions du marché, et sont suivis pendant le projet :

| Source | Utilisation |
|---|---|
| **Documentation officielle** (React, Vite, React Router, Tailwind, MDN) | Bonnes pratiques, nouveautés, versions maintenues |
| **Notes de version** (changelogs sur GitHub et npm) | Suivi des nouvelles versions et des changements importants avant une mise à jour |
| **Enquêtes développeurs** (State of JS, Stack Overflow Developer Survey) | Popularité, satisfaction et pérennité des bibliothèques |
| **web.dev et Can I use** | Support des fonctions PWA selon les navigateurs (installation, service worker, iPhone) |
| **Référentiels** (RGAA, WCAG, RGESN) | Accessibilité et éco-conception |
| **`npm outdated` et `npm audit`** | Dépendances à mettre à jour et failles connues |

**Versions choisies** : des versions récentes et maintenues.

| Technologie | Version | Pourquoi cette version |
|---|---|---|
| React | 19 | Version actuelle, maintenue par Meta. Règles des hooks vérifiées par ESLint |
| TypeScript | 5.9 | Même version que le backend |
| Vite | 7 | Version actuelle : démarrage instantané en développement, build rapide |
| React Router | 7 | Version actuelle, navigation et écrans protégés |
| Tailwind CSS | 4 | Version actuelle, intégrée à Vite par un plugin, sans fichier de configuration |
| Zustand | 5 | Version actuelle, compatible React 19 |
| vite-plugin-pwa | 1 | Génère le service worker et le manifeste de la PWA |
| Socket.IO client | 4 | Même version majeure que le serveur |

## Performances attendues

| Besoin | Objectif | Choix qui y répond |
|---|---|---|
| Premier chargement | Application utilisable en moins de 3 secondes sur un réseau mobile (4G) | Vite (code minifié), application légère (environ 130 Ko de JavaScript compressé) |
| Ouvertures suivantes | Quasi instantanées, même avec un réseau faible | PWA : fichiers gardés en cache par le service worker |
| Navigation entre écrans | Sans rechargement de page | Application à page unique (React Router) |
| Mises à jour de la Tribu | En direct, sans recharger | Socket.IO |
| Affichage | Fluide sur des téléphones d'entrée de gamme | Pas de bibliothèque lourde, animations en CSS |

## 1. PWA plutôt qu'une application native

Une PWA (Progressive Web App) est un site web qui s'installe sur l'écran d'accueil du téléphone et s'ouvre en plein écran, comme une application.

| | PWA (React) | Application native (Swift, Kotlin) | Multiplateforme (React Native, Flutter) |
|---|---|---|---|
| Un seul code pour Android, iPhone et ordinateur | **Oui** | Non : un code par système | Oui pour les téléphones, l'ordinateur est moins simple |
| Publication | **Aucune** : une adresse web suffit | App Store et Play Store (validation, comptes payants) | App Store et Play Store |
| Mise à jour | **Immédiate** à chaque déploiement | Nouvelle version à faire valider, puis à installer | Nouvelle version à faire valider |
| Compétences | **Web (React, TypeScript)**, comme le reste du projet | Deux langages en plus | Un framework en plus |
| Notifications push | Limitées sur iPhone (seulement si l'app est installée) | Complètes | Complètes |
| Accès au téléphone | Suffisant pour Tribu (pas de capteur ni de fonction avancée) | Complet | Complet |

**Pourquoi ce choix** : Tribu n'a pas besoin des fonctions avancées du téléphone. Une PWA permet de sortir une seule application pour tous les appareils, sans passer par les magasins d'applications, et de corriger un problème en quelques minutes. Les familles peuvent aussi l'essayer sans rien installer.

**Limites acceptées** : les notifications push sur iPhone ne fonctionnent que si l'application est installée sur l'écran d'accueil. Elles ne sont pas encore développées (voir la partie « À faire » du README). Si elles deviennent indispensables, l'application React pourrait être emballée dans une application native (Capacitor) sans réécrire les écrans.

## 2. React plutôt que Vue ou Angular

| | React | Vue | Angular |
|---|---|---|---|
| Popularité et communauté | **La plus grande** : beaucoup de bibliothèques, d'exemples et de réponses | Grande | Grande, surtout en entreprise |
| Apprentissage | Simple : des composants et du JavaScript | Simple | Plus long (framework complet, beaucoup de concepts) |
| Poids | Léger | Léger | Plus lourd |
| Passage vers une app mobile | **React Native** reprend les mêmes notions | Moins direct | Moins direct |
| Liberté d'organisation | Grande (à organiser soi-même) | Moyenne | Faible (organisation imposée) |

**Pourquoi ce choix** : React est la bibliothèque la plus utilisée, avec beaucoup de ressources et de bibliothèques. Le découpage en composants correspond bien aux maquettes Figma (cartes, boutons, en-têtes réutilisés sur plusieurs écrans).

**Limites acceptées** : React ne fixe pas d'organisation. Elle a été définie dans le projet (dossiers `screens`, `components`, `hooks`, `store`, voir [architecture.md](architecture.md)), et les règles des hooks sont vérifiées par ESLint.

## 3. Vite plutôt que Next.js

| | Vite | Next.js |
|---|---|---|
| Type d'application | **Application dans le navigateur**, servie comme fichiers statiques | Rendu sur le serveur, utile pour le référencement (SEO) |
| Hébergement | **Fichiers statiques** sur n'importe quel CDN | Demande un serveur Node.js (ou un hébergeur adapté) |
| Démarrage en développement | **Instantané** | Plus lent |
| Configuration | **Minimale** | Plus de concepts (rendu serveur, routes côté serveur) |
| Référencement Google | Peu utile ici | Point fort |

**Pourquoi ce choix** : Tribu est une application réservée aux utilisateurs connectés. Le référencement n'est pas un besoin, donc le rendu serveur de Next.js n'apporterait que de la complexité et un serveur en plus. Vite produit des fichiers statiques légers, faciles à héberger et à mettre en cache.

**Limites acceptées** : la page est construite dans le navigateur, donc le premier affichage attend le téléchargement du JavaScript. L'écran de chargement et le cache de la PWA limitent ce délai.

## 4. Zustand plutôt que Redux ou le Context de React

Certaines données sont utilisées par plusieurs écrans : l'utilisateur connecté, sa Tribu, l'activité en cours, les messages non lus.

| | Zustand | Redux Toolkit | Context de React |
|---|---|---|---|
| Quantité de code | **Très faible** : un store est une simple fonction | Plus importante (slices, actions, configuration) | Faible |
| Mises à jour | **Seuls les écrans concernés se réaffichent** | Seuls les écrans concernés | Tous les composants du Context se réaffichent |
| Sauvegarde dans le navigateur | **Intégrée** (`persist`) | Bibliothèque en plus | À écrire |
| Utilisation hors des composants | **Oui** (ex : depuis les événements temps réel) | Oui | Non |

**Pourquoi ce choix** : Zustand fait ce qu'il faut avec très peu de code. Il garde la session dans le navigateur (l'utilisateur reste connecté) et peut être mis à jour par les événements temps réel, en dehors des écrans. Le Context de React est quand même utilisé pour le thème (une seule valeur, qui change rarement).

**Limites acceptées** : moins d'outils de débogage que Redux. Les stores restent petits (deux stores : utilisateur et Tribu), donc ce n'est pas gênant.

## 5. Tailwind CSS plutôt que du CSS classique

| | Tailwind CSS | CSS classique (ou CSS Modules) | Bibliothèque de composants (MUI, Chakra) |
|---|---|---|---|
| Rapidité pour suivre une maquette | **Rapide** : les styles s'écrivent directement sur les éléments | Plus lent : un fichier CSS à côté | Rapide, mais avec le style de la bibliothèque |
| Respect de la maquette Figma | **Total** | Total | Il faut défaire le style imposé |
| Poids du CSS final | **Faible** : seules les classes utilisées sont gardées (environ 4 Ko compressé) | Selon le projet | Plus lourd |
| Cohérence | Valeurs communes (espacements, tailles) | À organiser | Assurée par la bibliothèque |

**Pourquoi ce choix** : l'application suit une maquette Figma précise. Tailwind permet de la reproduire vite, sans le style imposé d'une bibliothèque de composants, et le CSS final reste très léger. Les couleurs du thème (vert, orange, rouge), qui changent selon le choix de l'utilisateur, sont appliquées avec des styles en ligne.

**Limites acceptées** : les éléments ont de longues listes de classes. Les éléments répétés sont donc regroupés dans des composants réutilisables (`Button`, `Input`, `ScreenHeader`...).

## 6. Netlify plutôt que Vercel ou Render

| | Netlify | Vercel | Render (site statique) |
|---|---|---|---|
| Déploiement automatique depuis GitHub | **Oui** | Oui | Oui |
| CDN (fichiers servis près de l'utilisateur) | **Oui** | Oui | Oui |
| HTTPS | **Inclus** | Inclus | Inclus |
| Réglages dans un fichier du projet | **`netlify.toml`** (commande de build, version de Node, redirections, en-têtes) | `vercel.json` | Interface |
| Offre gratuite | **Oui**, sans mise en veille | Oui, mais réservée à un usage non commercial | Oui |

**Pourquoi ce choix** : un site statique servi par un CDN, déployé automatiquement à chaque push, seulement si le lint, les tests et le build passent (voir le README, partie CI/CD). Les réglages sont écrits dans `netlify.toml`, donc versionnés avec le code.

**Limites acceptées** : l'offre gratuite limite la bande passante et le nombre de minutes de build par mois, ce qui est largement suffisant pour Tribu à ce stade.

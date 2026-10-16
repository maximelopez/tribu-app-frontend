# Infrastructure - performance, sécurité et consommation énergétique (frontend)

Ce document présente les choix d'infrastructure de l'application Tribu au regard de trois critères : la performance, la sécurité et la consommation énergétique.

L'organisation du code est dans [architecture.md](architecture.md), et la justification de chaque technologie dans [stack.md](stack.md). L'infrastructure du backend (Render, MongoDB Atlas) est décrite dans le `docs/infrastructure.md` du backend.

## 1. Infrastructure en place

| Élément | Service | Détail |
|---|---|---|
| Hébergement de l'application | Netlify, offre gratuite | Fichiers statiques servis par un CDN (serveurs répartis dans le monde, dont l'Europe) |
| Adresse | https://app-tribu.netlify.app | HTTPS inclus |
| Déploiement | Netlify, à chaque push sur `master` | Seulement si le lint, les tests et le build passent : Netlify relance ces vérifications lui-même avant de publier (`netlify.toml`), en même temps que la CI |
| Intégration continue | GitHub Actions | Lint, types, tests avec couverture, build (`.github/workflows/ci.yml`) |
| Réglages | `netlify.toml` (dans le projet) | Commande de build, version de Node.js, dossier publié, en-têtes de sécurité |

## 2. Performance

### Mesures

Mesures faites sur la version de production (`npm run build`) :

| Élément | Taille | Taille compressée (envoyée sur le réseau) |
|---|---|---|
| JavaScript de l'application | 438 Ko | **132 Ko** |
| CSS | 15 Ko | **4 Ko** |
| Polices (4 fichiers) | 485 Ko | - |
| Images (avatars, illustrations, mascottes, fonds) | environ 600 Ko | - |
| Total gardé en cache par la PWA | environ 2 Mo (72 fichiers) | - |

Le code (JavaScript et CSS) pèse moins de 140 Ko compressé : il se télécharge en moins d'une seconde en 4G. Les images et les polices sont téléchargées au fur et à mesure, puis gardées en cache.

### Choix qui améliorent la performance

| Choix | Effet |
|---|---|
| **CDN Netlify** | Les fichiers sont servis depuis un serveur proche de l'utilisateur |
| **Build Vite** | Code minifié, CSS réduit aux classes utilisées (Tailwind), noms de fichiers uniques pour un cache long |
| **Service worker (PWA)** | Après la première visite, l'app s'ouvre depuis le téléphone, sans retélécharger ses fichiers |
| **Application à page unique** | Changer d'écran ne recharge pas la page : seules les données nécessaires sont demandées à l'API |
| **Données chargées une fois** | La Tribu, ses membres et ses activités sont chargés au démarrage puis mis à jour par le temps réel, au lieu d'être rechargés sur chaque écran |
| **Temps réel** | Pas de requêtes répétées pour savoir s'il y a du nouveau |
| **Animations en CSS** | Confettis, apparitions et barres de progression animés par le navigateur, sans bibliothèque JavaScript |
| **Polices avec `font-display: swap`** | Le texte s'affiche tout de suite avec une police du système, puis avec la police de la maquette quand elle est chargée |

## 3. Sécurité

| Choix | Effet |
|---|---|
| **HTTPS** (Netlify) | Échanges chiffrés entre le téléphone et l'application, et entre l'application et l'API |
| **Aucun secret dans l'application** | Le code d'une application web est visible par tous : il ne contient que l'adresse publique de l'API (`VITE_API_URL`). La clé d'API de l'app admin n'est jamais dans ce projet |
| **Token envoyé à chaque requête** | L'identité de l'utilisateur est vérifiée par l'API sur chaque route. L'app n'a aucun droit particulier |
| **Session expirée** | Si l'API refuse le token (401), l'app déconnecte et efface les données de la session |
| **Écrans protégés** | Sans être connecté, seuls l'inscription, la connexion et les pages légales s'affichent. La vraie protection reste celle de l'API |
| **Pas de HTML injecté** | Les textes (messages du chat, noms) sont affichés par React, qui empêche l'exécution de code envoyé par un autre utilisateur (protection contre le XSS) |
| **En-têtes de sécurité HTTP** | Consignes envoyées au navigateur avec chaque fichier (voir ci-dessous) |
| **Dépendances surveillées** | `npm audit` et des versions récentes et maintenues (voir [stack.md](stack.md)) |
| **Déploiement seulement si les vérifications passent** | Le lint, les 104 tests et TypeScript bloquent une version cassée |

### En-têtes de sécurité HTTP

Netlify envoie avec chaque fichier des consignes de sécurité pour le navigateur. Elles sont écrites dans `netlify.toml`, donc versionnées avec le code. Ce sont des protections en plus : elles limitent les dégâts si une autre barrière cédait.

| En-tête | Consigne | Risque évité |
|---|---|---|
| `Content-Security-Policy` | L'app ne peut charger que ses propres fichiers, parler qu'à l'API Tribu (HTTPS et WebSocket) et afficher des photos venant de Cloudinary. Tout le reste est bloqué | Un code injecté (faille XSS) ne pourrait ni s'exécuter, ni envoyer le token vers un autre site |
| `X-Frame-Options: DENY` (et `frame-ancestors 'none'`) | L'app ne peut pas être affichée dans un autre site | Un faux site qui affiche Tribu en transparence pour faire cliquer l'utilisateur sans qu'il le sache (*clickjacking*) |
| `X-Content-Type-Options: nosniff` | Le navigateur ne devine pas le type d'un fichier | Un fichier pris par erreur pour un script |
| `Referrer-Policy` | Les autres sites ne voient pas l'adresse exacte de la page d'où l'on vient | Fuite d'adresses internes de l'app |
| `Permissions-Policy` | Caméra, micro et position bloqués | Utilisation de ces fonctions par un code non prévu |
| `Strict-Transport-Security` | Le navigateur utilise toujours HTTPS pendant 1 an | Connexion forcée en HTTP non chiffré |

**Vérification** : l'application a été construite puis servie en local avec ces en-têtes. Les 8 tests système passent, et aucun blocage n'apparaît dans la console du navigateur sur les écrans principaux (inscription, onboarding, accueil, activités, récompenses, chat, profil, pages légales). Le service worker de la PWA fonctionne. Après le déploiement, les en-têtes peuvent être contrôlés sur securityheaders.com.

**Limite acceptée** : `style-src` autorise les styles écrits directement sur les éléments (`'unsafe-inline'`), car les couleurs du thème sont appliquées de cette façon. Les scripts, eux, ne sont autorisés que depuis les fichiers de l'app.

### Stockage du token

Le token est gardé dans le `localStorage` du navigateur, pour que l'utilisateur reste connecté après avoir fermé l'app.

| | `localStorage` (choix actuel) | Cookie `HttpOnly` |
|---|---|---|
| Lecture par un script de la page | Possible : une faille XSS pourrait voler le token | Impossible |
| Mise en place | Simple, fonctionne avec l'API et Socket.IO | Demande des changements dans l'API (cookies, protection CSRF, domaines) |

**Pourquoi ce choix** : simple et compatible avec l'API et le temps réel. Le risque est limité parce que React protège contre le XSS, que la `Content-Security-Policy` bloque les scripts externes et l'envoi de données vers un autre site, et que le token a une durée de validité (30 jours).

## 4. Consommation énergétique (éco-conception)

Le numérique consomme de l'énergie sur les serveurs, sur le réseau et sur les téléphones. Pour une application mobile, une grande partie de l'impact vient du **renouvellement des téléphones** : une application légère, qui fonctionne bien sur un téléphone ancien, aide à le garder plus longtemps.

### Moins de données transférées

| Choix | Pourquoi c'est plus sobre |
|---|---|
| **Cache de la PWA** | Les fichiers de l'app ne sont téléchargés qu'une fois, puis à chaque nouvelle version |
| **Code léger** | 136 Ko compressé pour toute l'application |
| **Images des badges en SVG** | Fichiers légers (environ 10 Ko), nets sur tous les écrans |
| **Illustrations de catégorie** | Une activité sans photo utilise l'illustration de sa catégorie, déjà en cache, au lieu d'une image à télécharger |
| **Avatars proposés par l'app** | Pas de photos de profil à envoyer et à télécharger |
| **Temps réel au lieu de requêtes répétées** | Le téléphone ne reçoit des données que quand il se passe quelque chose |

### Moins de calcul sur le téléphone

| Choix | Pourquoi c'est plus sobre |
|---|---|
| **Pas de bibliothèque lourde** | Pas de bibliothèque d'animation, de graphiques ou de composants |
| **Animations courtes en CSS**, désactivées si « Réduire les animations » est activé sur le téléphone | Moins de calcul, et respect du choix de l'utilisateur |
| **Mises à jour ciblées** | Avec Zustand, seuls les écrans qui utilisent une donnée se réaffichent quand elle change |

### Ce qui n'est pas dans l'application

- **Aucune publicité, aucun outil de suivi ou de mesure d'audience** : pas de scripts externes, pas de requêtes vers d'autres sites ;
- **pas de vidéo** ni d'image chargée automatiquement en arrière-plan.

### Améliorations repérées

| Constat | Amélioration possible |
|---|---|
| ~~La police **Montserrat (334 Ko)** n'est utilisée que pour les libellés de la barre du bas~~ | ✅ Fait : la nouvelle barre du bas de la maquette utilise Outfit, déjà chargée. Montserrat n'est plus téléchargée (334 Ko en moins) |
| Les polices sont au format **TTF / OTF** | Les convertir en **WOFF2**, environ 2 fois plus léger |
| Les **images de démarrage iPhone** (environ 400 Ko) sont mises en cache sur tous les téléphones, Android compris | Les exclure du cache du service worker |
| Les avatars et les fonds sont en **PNG** | Les convertir en **WebP**, plus léger à qualité égale |

Ces améliorations seront traitées avec l'audit d'accessibilité et d'éco-conception.

## 5. Limites et évolutions

| Limite actuelle | Évolution possible |
|---|---|
| Token dans le `localStorage` | Cookie `HttpOnly` (demande des changements dans l'API) |
| Tout le code dans un seul fichier JavaScript | Chargement des écrans à la demande (*lazy loading*) si l'app grossit |
| Netlify n'attend pas la CI GitHub : il refait les mêmes vérifications, sauf le seuil de couverture | Déployer depuis la CI (`netlify deploy` dans `ci.yml`, builds automatiques de Netlify coupés) |
| Offre gratuite de Netlify | Offre payante si la bande passante ou les minutes de build ne suffisent plus |

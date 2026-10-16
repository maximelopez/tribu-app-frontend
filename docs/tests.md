# Stratégie de tests - Application Tribu (frontend)

Ce document présente comment l'application Tribu (PWA React) est testée : ce que l'on cherche à vérifier, les outils choisis, les scénarios couverts et les résultats obtenus. Les tests de l'API sont décrits dans le `docs/tests.md` du backend.

## 1. Objectifs

Les tests doivent garantir que :

- chaque **écran affiche les bonnes informations** et réagit correctement aux actions de l'utilisateur (boutons, formulaires, listes) ;
- les **règles de l'application** sont respectées côté interface : case CGU obligatoire, ville obligatoire, au moins un participant, seul celui qui a lancé une activité peut la terminer ;
- l'application **gère les erreurs** du serveur : mauvais mot de passe, email déjà utilisé, Tribu introuvable, session expirée ;
- le **temps réel** fonctionne : notifications, messages, activité lancée par un autre membre ;
- les **parcours complets** fonctionnent avec le vrai backend ;
- une modification du code **ne casse pas** ce qui fonctionnait déjà (non-régression).

## 2. Types de tests

| Type | Ce qui est testé | Exemple |
|---|---|---|
| **Unitaire** | Une fonction seule, sans écran | Le tri des activités par nouveauté |
| **Intégration** | Un composant ou un écran affiché dans un faux navigateur, avec un faux serveur | Envoyer une demande affiche « Demande envoyée ! » sur les détails de la Tribu |
| **Système (bout en bout)** | Un parcours complet dans un vrai navigateur, avec le vrai backend | Inscription, création d'une Tribu, activité terminée, écran Récompense |
| **Recette** | Les scénarios des user stories, déroulés à la main sur téléphone, en production | Voir le `docs/recette.md` du backend |

Les tests unitaires et d'intégration sont rapides (quelques secondes) et ne dépendent pas du backend : ils sont lancés à chaque push par la CI. Les tests système sont plus lents et ont besoin du backend : ils sont lancés en local, avant une mise en production.

## 3. Outils

| Outil | Rôle |
|---|---|
| **Vitest** | Lance les tests unitaires et d'intégration. Utilise la même configuration que Vite (TypeScript, JSX, images) |
| **jsdom** | Faux navigateur (page, `localStorage`, événements) pour afficher les écrans sans ouvrir de vrai navigateur |
| **Testing Library** | Affiche un écran et l'utilise comme un utilisateur : trouver un bouton par son texte, cliquer, taper au clavier |
| **@vitest/coverage-v8** | Mesure la part du code exécutée par les tests (couverture) |
| **Playwright** | Pilote un vrai navigateur (Chromium, au format téléphone) pour les tests système |

### Pourquoi ces choix

| Besoin | Choix | Alternatives écartées |
|---|---|---|
| Lanceur de tests | **Vitest** : même outil que le backend, reprend la configuration de Vite, aucune conversion à prévoir | **Jest** : configuration en plus pour TypeScript, les modules ES et les imports d'images |
| Tester les écrans | **Testing Library** : on teste ce que voit l'utilisateur (textes, boutons, rôles d'accessibilité), pas le code interne | **Enzyme** : n'est plus maintenu pour les versions récentes de React |
| Faux serveur | **Faux `fetch` écrit dans les tests** (`tests/helpers.tsx`) : quelques lignes, aucune dépendance | **MSW** : plus complet, mais une bibliothèque de plus pour un besoin simple |
| Tests système | **Playwright** : plusieurs navigateurs en même temps (utile pour le temps réel entre deux téléphones), format téléphone, attente automatique des éléments, rapport avec captures | **Cypress** : un seul onglet à la fois, ce qui complique le test de deux utilisateurs en même temps |

Une règle est suivie dans tous les tests : **on cherche les éléments comme un utilisateur** (par leur texte ou leur rôle : bouton, case à cocher, champ de recherche). Si un test ne trouve pas un bouton par son nom, c'est souvent qu'il manque un libellé, ce qui est aussi un problème d'accessibilité.

## 4. Organisation

```
tests/
├── setup.ts           Remet l'app à zéro après chaque test (déconnecté, sans Tribu, sans faux serveur)
├── helpers.tsx        Faux backend, affichage d'un écran à une adresse, utilisateur connecté
├── fixtures.ts        Données de test communes : une Tribu, son catalogue, ses activités, ses badges
├── unit/              Tests unitaires
└── integration/       Tests d'intégration (composants et écrans)

e2e/
├── helpers.ts         Inscription, onboarding, création d'une Tribu
└── *.spec.ts          Parcours complets (tests système)
```

Quelques principes :

- **chaque test part d'une app vide** : déconnectée, sans Tribu, sans données en mémoire. Les tests ne dépendent pas les uns des autres ;
- **le serveur est simulé** dans les tests d'intégration : chaque test indique les réponses attendues (ex : `'POST auth/login': { status: 401 }`) et vérifie les appels faits par l'écran ;
- **le temps réel est simulé** avec un faux socket : le test peut « envoyer » un événement du serveur (nouveau message, notification) et vérifier la réaction de l'app ;
- **les tests système utilisent une base vide** : le backend est lancé avec une base MongoDB en mémoire (`npm run start:e2e`), la vraie base n'est jamais touchée ;
- **les noms des tests sont écrits en français** et décrivent le comportement attendu.

## 5. Scénarios testés

**118 tests automatiques** au total : 30 tests unitaires, 80 tests d'intégration et 8 tests système.

### Tests unitaires (30)

| Thème | Scénarios | Résultat attendu |
|---|---|---|
| Thème | Couleurs valides, couleur inconnue ou vide, les 3 thèmes de la maquette | Seules les 3 couleurs sont acceptées, chacune avec ses 4 teintes |
| Badges | Date d'obtention, ombre selon le niveau, niveau inconnu | « 12 oct. », la bonne ombre, bronze par défaut |
| Activités | Tri par nouveauté (activités sans date à la fin), conversion d'une activité de la Tribu, libellés des catégories | Ordre correct, liste de départ non modifiée |
| Images | Photo de l'activité, illustration de la catégorie, catégorie inconnue, avatar par défaut | La bonne image, ou rien |
| Stores | Session gardée dans le `localStorage`, déconnexion, activités supprimées du catalogue ignorées, messages non lus, remise à zéro | Données à jour et cohérentes |
| Objectif de la semaine | Début de semaine (lundi), activités comptées depuis lundi, textes selon le nombre restant | « Encore N activités », « Plus qu'une activité », « Objectif atteint » |
| Appels au backend | Adresse, token, corps JSON, session expirée (401), mauvais mot de passe (401 sans être connecté) | Déconnexion et retour à la connexion seulement si la session a expiré |

### Tests d'intégration (80)

| Thème | Scénarios | Résultat attendu |
|---|---|---|
| Composants | Bouton (clic, désactivé, chargement), popup de confirmation (confirmer, retour, Échap), carte de badge (obtenu ou verrouillé) | Le bon affichage et les bonnes actions |
| Connexion | Champs vides, mauvais mot de passe, connexion réussie | Message d'erreur, ou token et utilisateur enregistrés |
| Inscription | Mot de passe faible, CGU non acceptées, inscription réussie, email déjà utilisé | Aucun appel au serveur tant que le formulaire n'est pas valide, accord aux CGU envoyé |
| Accès aux écrans | Écran protégé sans être connecté, onboarding pas terminé, pages légales | Inscription, onboarding, ou page légale accessible sans compte |
| Onboarding | Date incomplète ou impossible, parcours complet (date, couleur, avatar, chargement) | Les 3 choix enregistrés, puis l'app s'ouvre |
| Accueil | Sans Tribu, demande en attente (annulation), avec Tribu (carte Tribu : niveau, objectif de la semaine, membres ; idées dans la ville), activité en cours (le bouton ouvre son détail, « Voir l'activité » pour les autres membres), activité déjà faite, notifications | Les bonnes cartes, les idées sans les activités en cours ou déjà faites, demande acceptée depuis la cloche |
| Rechercher une Tribu | Filtre par ville dès l'arrivée, recherche dès 1 caractère, filtre par ville, aucun résultat, recherche effacée | Les bons résultats et les bons messages |
| Détails d'une Tribu | Informations de la Tribu, envoi d'une demande, demande refusée par le serveur, Tribu introuvable | « Demande envoyée ! » en restant sur l'écran, ou le message d'erreur |
| Créer une Tribu | Ville manquante, création avec la liste déroulante | Tribu créée avec la ville choisie, retour à l'accueil |
| Catalogue | Ville de la Tribu, autre ville, catégorie, recherche, aucun résultat, « Tout voir » | Les bonnes activités |
| Détail d'une activité | Infos, aucun participant, lancer, terminer, abandonner, lancée par un autre membre, déjà réalisée, sans Tribu, activité introuvable | Les bonnes actions selon l'état de l'activité, écran Récompense après « Terminer » |
| Récompenses | Sans Tribu, collection, 3 derniers badges, prochain objectif, tous les badges, détail d'un badge, écran Récompense, historique | Les bons badges dans le bon ordre, points et niveau affichés |
| Chat | Sans Tribu, historique, messages lus, envoi, message reçu, message vide | Messages affichés en direct, rien n'est envoyé si le message est vide |
| Temps réel | Connexion du socket, chargement de la Tribu, messages non lus (chat ouvert ou non), notifications, Tribu renommée, activité lancée puis terminée, nouveau membre, demande acceptée ou refusée, token refusé | L'app se met à jour sans recharger la page |

### Tests système (8)

| Parcours | Étapes | Résultat attendu |
|---|---|---|
| Première activité | Inscription, onboarding, création d'une Tribu à Angers, choix d'une activité, fin de l'activité | Écran Récompense (+50 points, badge « Premier pas »), puis points et niveau à jour sur l'accueil |
| Rejoindre une Tribu (deux téléphones) | B cherche la Tribu et envoie une demande, A reçoit la notification et accepte, A envoie un message | B arrive dans la Tribu sans recharger, point rouge sur Chat, message reçu en direct |
| Écran protégé | Ouvrir le chat sans être connecté | Retour à l'inscription |
| Email déjà utilisé | S'inscrire deux fois avec le même email | « Cet email est déjà utilisé. » |
| Mot de passe | Mauvais mot de passe, puis le bon | Message d'erreur, puis connexion |
| Lien direct | Ouvrir une activité puis recharger la page | L'activité s'affiche toujours |
| Session expirée | Token remplacé par un faux, page rechargée | Retour à la connexion |
| Tribu introuvable | Rechercher un nom qui n'existe pas | « Aucune Tribu trouvée :( » |

## 6. Couverture des spécifications

Chaque user story des spécifications (voir le `docs/specifications.md` du backend) est vérifiée côté application :

| User story | Tests automatiques | Recette |
|---|---|---|
| C1 Créer un compte | `integration/auth` (inscription), `e2e/parcours-activite`, `e2e/limites` (email déjà utilisé) | R1 |
| C2 Se connecter | `integration/auth` (connexion), `unit/api` (session expirée), `e2e/limites` (mot de passe, session expirée) | R2 |
| C3 / C4 Personnaliser son profil | `integration/onboarding` (date, couleur, avatar) | R3 |
| C5 Consulter les textes légaux | `integration/auth` (pages légales sans compte) | R1, R4 |
| T1 Créer une Tribu | `integration/family` (créer), `e2e/parcours-activite` | R5 |
| T2 Rechercher une Tribu | `integration/family` (rechercher, détails), `e2e/limites` (Tribu introuvable) | R6 |
| T3 Demander à rejoindre | `integration/family` (envoyer), `integration/home` (annuler), `e2e/parcours-rejoindre` | R6 |
| T4 Accepter ou refuser | `integration/home` (accepter depuis la cloche), `integration/realtime` (acceptée, refusée), `e2e/parcours-rejoindre` | R7 |
| T5 Modifier la Tribu | `integration/realtime` (Tribu renommée) | R8 |
| T6 Classement des membres | `integration/home` (membres de la carte Tribu) | R9 |
| A1 Parcourir le catalogue | `integration/activities` (catalogue) | R10 |
| A2 Lancer une activité | `integration/activities` (lancer, participants), `integration/realtime` (lancée par un autre membre) | R11 |
| A3 Terminer une activité | `integration/activities` (terminer), `e2e/parcours-activite` | R12 |
| A4 Annuler une activité | `integration/activities` (abandonner) | R13 |
| A5 Historique | `integration/rewards` (historique) | R14 |
| A6 Offres partenaires | `integration/activities` (offre affichée), `e2e/limites` (lien direct) | R10 |
| P1 / P2 Points et niveaux | `integration/rewards` (écran Récompense), `e2e/parcours-activite` | R12 |
| P3 / P4 Badges | `unit/badges`, `integration/rewards`, `integration/components` | R15 |
| P5 Écran de récompense | `integration/rewards`, `e2e/parcours-activite` | R12 |
| M1 / M2 Chat | `integration/chat`, `integration/realtime` (non lus), `e2e/parcours-rejoindre` | R16 |
| N1 / N2 Notifications | `integration/home` (cloche), `integration/realtime` (nouvelle notification) | R17 |

## 7. Résultats et actions correctives

### Résultats tracés

- **À chaque push** : GitHub Actions lance le lint, les types, les tests avec la couverture et le build. Le résultat de chaque exécution est gardé (onglet *Actions*), avec le rapport de couverture téléchargeable pendant 14 jours.
- **Déploiement** : Netlify ne met en ligne que si le lint, les tests et le build passent (`netlify.toml`). Une régression ne peut donc pas arriver en production : c'est la **non-régression**.
- **Tests système** : Playwright crée un rapport HTML (`npx playwright show-report`) avec, en cas d'échec, une capture d'écran et une trace de chaque étape.
- **Recette** : les résultats des scénarios manuels sont notés dans le `docs/recette.md` du backend.

### Actions correctives

Problèmes trouvés par les outils de qualité et les tests, et corrections appliquées :

| Problème détecté | Comment | Correction | Vérification |
|---|---|---|---|
| En ouvrant les détails d'une autre Tribu, les **badges de la Tribu affichée avant** apparaissaient un court instant | Règles React d'ESLint (state recopié dans un effet) | Les badges gardent la Tribu à laquelle ils appartiennent (`useFamilyBadges.ts`) | Tests des détails d'une Tribu et des récompenses |
| Les **confettis** étaient tirés au hasard pendant l'affichage : React pouvait les recalculer au milieu de l'animation | Règles React d'ESLint (affichage qui doit rester pur) | Tirage une seule fois, au premier affichage (`Confetti.tsx`) | Test de l'écran Récompense |
| Plusieurs écrans **recopiaient une valeur dans un effet** (thème, compteur de points, recherche), ce qui causait un affichage en trop | Règles React d'ESLint | Valeur calculée directement (`ThemeProvider.tsx`, `useCountUp.ts`, `SearchFamily.tsx`) | Tests de la recherche, de l'onboarding et de l'écran Récompense |
| Les tests échouaient sur un ordinateur plus lent : le faux navigateur n'a pas la fonction de **défilement automatique** utilisée par l'inscription | Exécution des tests sous Windows | Fonction ajoutée dans la configuration des tests (`tests/setup.ts`) | 104 tests sans erreur sur les deux machines |
| Un test système vérifiait l'écran **avant la fin de la navigation** (le texte cherché était aussi sur l'écran précédent) | Deuxième exécution des tests système | Le test attend la nouvelle adresse et le titre de l'écran | Tests système stables sur plusieurs exécutions |

## 8. Couverture du code

| Mesure | Résultat | Seuil minimum |
|---|---|---|
| Lignes | environ 82 % | 75 % |
| Instructions | environ 81 % | 75 % |
| Fonctions | environ 78 % | 70 % |
| Branches (if / else) | environ 73 % | 65 % |

Les seuils sont définis dans `vitest.config.ts` : si la couverture passe en dessous, la commande échoue, et la CI aussi. Ils sont un peu plus bas que ceux du backend, car une interface contient beaucoup de code d'affichage (animations, styles) moins utile à tester.

Fichiers exclus du calcul :

- `main.tsx` : démarrage de l'application dans le vrai navigateur ;
- `assets/` : images et polices.

Le principal écran non couvert est le **Profil**, en cours de modification au moment des tests : ses tests seront ajoutés une fois l'écran terminé.

## 9. Lancer les tests

Depuis le dossier `frontend` :

```bash
npm run lint             # vérifie la qualité du code (ESLint)
npm test                 # lance les tests unitaires et d'intégration (104 tests)
npm run test:coverage    # lance les tests et affiche la couverture
npm run test:e2e         # lance les tests système (8 tests)
```

Le rapport de couverture est généré dans `coverage/index.html`. Pour les tests système, le backend doit être dans le dossier voisin (`tribu-app/backend`) et le navigateur de Playwright installé une fois (`npx playwright install chromium`). Le rapport s'ouvre avec `npx playwright show-report`.

## 10. Limites et suite

Ce qui n'est pas encore couvert :

- **l'écran Profil** : tests à ajouter quand l'écran sera terminé (maquette en cours) ;
- **les tests système dans la CI** : ils sont lancés en local, car ils ont besoin du backend. La non-régression est assurée par les tests unitaires et d'intégration, lancés à chaque push ;
- **l'installation de la PWA et le mode hors ligne** : vérifiés à la main sur téléphone (recette R19).

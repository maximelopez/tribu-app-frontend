# Qualité du code et usage de l'IA - Frontend

Ce document explique comment la qualité du code de l'application Tribu est garantie, y compris pour le code écrit avec l'aide d'une IA.

## 1. Règles de code

| Règle | Application |
|---|---|
| **TypeScript strict** | Toutes les données sont typées (utilisateur, Tribu, activité, badge...). Aucune erreur de type n'est acceptée |
| **Organisation en couches** | Écrans, composants, hooks, stores, accès au backend : chaque fichier a un rôle précis (voir [architecture.md](architecture.md)) |
| **Composants réutilisables** | Les éléments de la maquette utilisés plusieurs fois sont des composants (`Button`, `Input`, `ScreenHeader`, `BadgeCard`, `ConfirmModal`...) |
| **Un seul accès au backend** | Tous les appels passent par `api()` : token, format et session expirée sont gérés au même endroit |
| **Fidélité à la maquette** | Couleurs, tailles et espacements repris de Figma. Les couleurs du thème viennent toujours de `useTheme()` |
| **Nommage clair** | Noms qui décrivent le rôle (`handleJoinFamily`, `useFamilyBadges`, `PendingRequestCard`) |
| **Commentaires simples** | Chaque écran, composant et bloc important est expliqué en une ligne, en français |
| **Textes en français simple** | Messages compréhensibles par les enfants (« Choisis au moins un participant. ») |

## 2. Vérifications automatiques

Ces vérifications sont lancées en local et **à chaque push** par la CI (GitHub Actions). Netlify relance le lint, les tests et le build avant chaque déploiement : si l'un d'eux échoue, la nouvelle version **n'est pas mise en ligne**.

| Vérification | Commande | Ce qu'elle détecte |
|---|---|---|
| **ESLint** | `npm run lint` | Erreurs fréquentes, code inutile, et règles de React : ordre et dépendances des hooks, state recopié dans un effet, affichage qui doit rester pur |
| **TypeScript** | `npm run typecheck` | Erreurs de type (mauvaise donnée passée à un composant, champ oublié, valeur possiblement vide) |
| **Tests** | `npm run test:coverage` | 104 tests unitaires et d'intégration. Couverture minimum de 75 % des lignes (voir [tests.md](tests.md)) |
| **Tests système** | `npm run test:e2e` | 8 parcours complets avec le vrai backend, lancés en local avant une mise en production |

Quand ESLint a été ajouté, il a trouvé 26 problèmes dans le code existant. Ils ont tous été corrigés, un groupe à la fois, avec une vérification après chaque groupe (voir les actions correctives dans [tests.md](tests.md)).

## 3. Usage de l'IA pendant le développement

### Ce pour quoi l'IA a été utilisée

Un assistant d'IA générative a été utilisé comme aide au développement :

- **intégration des maquettes** : lecture des écrans Figma et écriture des écrans correspondants ;
- **écriture de code** : nouvelles fonctionnalités, corrections, refactoring ;
- **revue de code** : bugs, cas oubliés, problèmes signalés par ESLint ;
- **tests** : tests unitaires, d'intégration et système ;
- **documentation** : README et documents de ce dossier.

L'application elle-même n'utilise pas d'IA.

### Comment la qualité du code généré est garantie

| Garantie | Comment |
|---|---|
| **Explication avant modification** | Chaque changement proposé par l'IA est d'abord expliqué (ce qui change, pourquoi), puis validé avant d'être appliqué |
| **Petites étapes** | Un écran ou un groupe de corrections à la fois, avec un commit par étape : chaque modification reste simple à relire et à annuler |
| **Comparaison avec la maquette** | Chaque écran intégré est comparé à la maquette Figma, et des captures d'écran servent à vérifier le rendu |
| **Vérification dans l'application** | Chaque étape est testée en local (`npm run dev`) avant d'être poussée |
| **Vérifications automatiques** | Le code généré passe par les mêmes contrôles que le reste : ESLint, TypeScript, tests, CI |
| **Esprit critique** | Les propositions sont discutées, simplifiées ou refusées (par exemple : rester sur l'écran de la Tribu après une demande, comme sur la maquette, au lieu de revenir à l'accueil) |
| **Informations inventées repérées** | Les éléments de la maquette que l'app ne peut pas connaître ne sont pas affichés (par exemple « membres actifs », retiré du chat) |
| **Pas de données personnelles** | Aucune donnée d'utilisateur réel n'est transmise à l'IA |
| **Décisions humaines** | Les fonctionnalités, le design et les choix techniques sont décidés par le développeur et la designer |

### Exemples de problèmes détectés grâce aux outils

- **Badges d'une autre Tribu** : ESLint a signalé une valeur recopiée dans un effet. En corrigeant, un vrai défaut est apparu : les badges de la Tribu affichée avant restaient visibles un court instant sur les détails d'une autre Tribu.
- **Tests sur un ordinateur plus lent** : les tests passaient dans un environnement mais pas sous Windows, à cause d'une fonction absente du faux navigateur. La configuration des tests a été corrigée pour qu'ils soient stables partout.

## 4. Accessibilité

Mesures déjà en place :

| Mesure | Exemple |
|---|---|
| **Libellés sur les boutons sans texte** | « Retour », « Envoyer », « Notifications, 1 non lue », « Messages non lus » |
| **Rôles des éléments** | Cases à cocher (`role="checkbox"`), listes déroulantes (`listbox`, `option`), popups (`dialog`), filtres sélectionnés (`aria-pressed`) |
| **Champs avec un libellé** | Chaque champ de formulaire a un texte qui le décrit (« Votre adresse mail : ») |
| **Images décoratives ignorées** | `alt=""` sur les illustrations, pour que les lecteurs d'écran ne les lisent pas |
| **Clavier** | Échap ferme les popups et le panneau des notifications |
| **Réduire les animations** | Les animations sont désactivées si l'utilisateur l'a demandé dans les réglages de son téléphone |

Les tests vérifient une partie de l'accessibilité : ils trouvent les boutons et les champs par leur nom et leur rôle, comme un lecteur d'écran. Un audit complet (contrastes, navigation au clavier, lecteur d'écran) est prévu, avec l'éco-conception.

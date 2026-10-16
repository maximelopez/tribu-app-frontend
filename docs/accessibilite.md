# Accessibilité

Ce document présente ce que fait l'application Tribu pour être utilisable par tous : personnes qui utilisent un lecteur d'écran, qui naviguent au clavier, ou qui sont gênées par les animations. Il présente aussi l'audit réalisé, les corrections et la limite connue.

## 1. Référentiel

L'application suit les règles **WCAG 2.1, niveau AA**, la norme internationale d'accessibilité du web. Le RGAA, le référentiel français, s'appuie sur ces mêmes règles.

## 2. Audit

| | Détail |
|---|---|
| **Outil** | **axe** (Deque), l'outil d'audit automatique le plus utilisé. Il est lancé dans un vrai navigateur, au format téléphone (393 × 852) |
| **Écrans audités** | 26 écrans : connexion, inscription, CGU, onboarding (date, couleur, avatar, consentement), accueil (sans Tribu, avec Tribu, activité en cours), rechercher et créer une Tribu, activités, détail d'une activité, popup d'abandon, écran Récompense, récompenses, tous les badges, détail d'un badge, historique, chat (sans Tribu et avec Tribu), profil, notifications |
| **Règles** | WCAG 2.1 A et AA, plus les bonnes pratiques d'axe |
| **Date** | 16 octobre 2026 |

### Résultats et corrections

| Problème trouvé | Écrans | Correction |
|---|---|---|
| **Pas de zone principale** (`<main>`) : un lecteur d'écran ne peut pas aller directement au contenu | Connexion, inscription, onboarding, écrans sans barre du bas | Chaque écran est dans une balise `<main>` (`App.tsx`) |
| **Zones qui défilent impossibles à atteindre au clavier** : on ne peut pas lire la suite avec les flèches | CGU, détail d'une activité, écran Récompense | Les zones qui défilent peuvent recevoir le focus (`tabIndex={0}`) |
| **Pas de titre principal** (`<h1>`) | Chat, écrans « pas encore de Tribu » | Le nom de la Tribu du chat est un `<h1>`. Les écrans vides ont un `<h1>` lu par les lecteurs d'écran mais invisible (la maquette n'en a pas) |
| **Contraste des couleurs du thème** | Tous | Non corrigé : voir la partie 4 |

**Après correction** : il ne reste plus que le contraste des couleurs du thème. Toutes les autres règles sont respectées sur les 26 écrans.

## 3. Mesures en place

| Mesure | Exemple |
|---|---|
| **Structure de la page** | Une zone principale (`<main>`) sur chaque écran, la barre du bas dans une balise `<nav>`, un titre `<h1>` par écran |
| **Libellés sur les boutons sans texte** | « Retour », « Envoyer », « Fermer », « Notifications, 1 non lue » |
| **Rôles des éléments** | Cases à cocher (`role="checkbox"`), listes déroulantes (`listbox`, `option`), popups (`dialog`), filtres sélectionnés (`aria-pressed`) |
| **Champs avec un libellé** | Chaque champ de formulaire a un texte qui le décrit (« Votre adresse mail : ») |
| **Images décoratives ignorées** | `alt=""` sur les illustrations, pour que les lecteurs d'écran ne les lisent pas |
| **Navigation au clavier** | Tous les boutons sont de vrais boutons (`<button>`), atteignables avec Tab. Un contour noir bien visible montre l'élément sélectionné (`:focus-visible`, seulement au clavier). Échap ferme les popups et le panneau des notifications |
| **Zoom** | Le zoom du téléphone n'est pas bloqué |
| **Langue** | La page est déclarée en français (`lang="fr"`) : le lecteur d'écran prend la bonne voix |
| **Réduire les animations** | Les animations (mascotte, confettis, compteur de points) sont désactivées si l'utilisateur l'a demandé dans les réglages de son téléphone |

## 4. Limite connue : le contraste des couleurs du thème

Les couleurs des 3 thèmes viennent de la charte graphique de la maquette et n'ont pas été changées. Le contraste est mesuré entre le texte blanc et la couleur (boutons), ou entre la couleur et le blanc (liens, pastilles, points). Le minimum est de 4,5 pour un texte normal et de 3 pour un gros texte (24 px, ou 18,7 px en gras).

| Thème | Contraste | Texte normal (4,5) | Gros texte (3) |
|---|---|---|---|
| Vert `#00A16D` | 3,3 | ❌ | ✅ |
| Rouge `#EA4A1F` | 3,8 | ❌ | ✅ |
| Orange `#FF9D00` | 2,1 | ❌ | ❌ |

- Le vert et le rouge sont proches du minimum. Une personne qui voit mal peut choisir l'un de ces deux thèmes, bien plus lisibles que l'orange, dans l'onboarding ou dans le profil.
- Quelques gris de la maquette (dates des badges, badges verrouillés, barre du bas) sont aussi sous le minimum (2,5 à 3).
- **Correction possible**, à valider avec la designer : une version plus foncée de chaque couleur, utilisée seulement pour les textes et les boutons (par exemple `#A85F00` pour l'orange, 4,9), et des gris un peu plus foncés (`#6B6B6B`, 5,3).

Les liens « Conditions d'utilisation » et « Politique de confidentialité » de l'écran de consentement sont plus petits que 24 px de haut. C'est accepté par les règles, car ce sont des liens dans une phrase.

## 5. Vérification automatique

Le test système `e2e/accessibilite.spec.ts` lance axe sur 11 écrans principaux à chaque exécution des tests système. Il échoue si une règle WCAG 2.1 AA n'est pas respectée, sauf le contraste (partie 4). Une régression, par exemple un bouton sans libellé ou une zone principale oubliée, est donc détectée tout de suite.

Les tests d'intégration vérifient aussi une partie de l'accessibilité : ils cherchent les boutons et les champs par leur nom et leur rôle, comme un lecteur d'écran.

## 6. Ce qui reste à vérifier à la main

Un outil automatique trouve environ un tiers des problèmes. Pour aller plus loin :

- parcourir l'app avec un lecteur d'écran : **TalkBack** (Android) ou **VoiceOver** (iPhone) ;
- parcourir l'app au clavier seulement (Tab, Entrée, Espace, Échap) ;
- vérifier l'app avec le texte agrandi dans les réglages du téléphone.

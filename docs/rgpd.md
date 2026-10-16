# Données personnelles (RGPD) - Application

Ce document présente ce que fait l'application Tribu pour respecter le RGPD. Le reste (registre des traitements, durées de conservation, mineurs, hébergement, droits, IA Act, liste de contrôle pour l'audit) est dans le `docs/rgpd.md` du backend, car c'est l'API qui enregistre et protège les données.

## 1. Consentement à la fin de l'onboarding

L'inscription crée seulement le compte (prénom, email, mot de passe). Le consentement est demandé sur le dernier écran de l'onboarding, « Ta vie privée, on y tient », après la date de naissance, la couleur et l'avatar.

| Mesure | Détail |
|---|---|
| **Information claire avant d'accepter** | L'écran explique en 4 points ce qu'on collecte, pourquoi, ce qu'on ne fera jamais (vendre les données, publicité) et comment garder le contrôle |
| **Case obligatoire** | « J'accepte les Conditions d'utilisation et la Politique de confidentialité ». Le bouton « Accepter et continuer » reste inactif sans la case |
| **Case non cochée par défaut** | L'utilisateur doit la cocher lui-même |
| **Textes lisibles avant d'accepter** | Les deux textes s'ouvrent par-dessus l'écran, sans quitter l'onboarding |
| **Mineurs** | Rappel sous la carte : avant 15 ans, il faut l'accord d'un parent |
| **Rien avant l'accord** | La date de naissance, la couleur et l'avatar restent dans l'app pendant l'onboarding. Ils sont envoyés en une fois avec l'accord. L'API refuse aussi toute modification du profil et l'accès aux Tribus tant que l'accord n'est pas donné |
| **Accord enregistré** | L'API enregistre la date d'accord (`acceptedTermsAt`). Un compte sans accord qui se reconnecte reprend l'onboarding |
| **Testé** | Test d'intégration de l'onboarding (rien n'est envoyé avant l'accord, puis un seul envoi), tests de l'API (refus sans accord) et tests système |

## 2. Information des utilisateurs

| Mesure | Détail |
|---|---|
| **Politique de confidentialité et CGU** | Pages `/confidentialite` et `/cgu`, accessibles connecté ou non. Textes dans `src/legal.ts` |
| **Langage simple** | Textes écrits pour être compris aussi par les enfants (l'app est familiale) |
| **« Mes données » dans le Profil** | Liens vers les deux textes et adresse de contact (`contact.tribufamily@gmail.com`) pour recevoir ou supprimer ses données |

## 3. Données demandées (minimisation)

L'application ne demande que ce qui est utile :

| Donnée | Pourquoi |
|---|---|
| Prénom | Affiché dans la Tribu et le chat |
| Email et mot de passe | Connexion |
| Date de naissance | Vérifier l'âge (15 ans, ou accord des parents) |
| Couleur et avatar | Personnalisation, choisis dans une liste |

L'application ne demande **ni nom de famille, ni photo, ni adresse, ni numéro de téléphone, ni position**. Les avatars sont proposés par l'app : aucune photo n'est envoyée.

Les autres membres de la Tribu ne voient que le **profil public** (prénom, avatar, points) : l'API ne leur envoie ni l'email ni la date de naissance.

## 4. Données gardées sur le téléphone

| Où | Quoi | Pourquoi | Quand c'est effacé |
|---|---|---|---|
| `localStorage` (`tribu:auth:user`) | Token de connexion, profil de l'utilisateur (prénom, email, thème, avatar, Tribu, points, date de naissance), onboarding terminé | Rester connecté après la fermeture de l'app | À la déconnexion, ou si la session expire |
| Mémoire de l'app | Tribu, activités, messages, notifications | Affichage | À la fermeture de l'app |
| Cache du service worker (PWA) | Fichiers de l'application (code, polices, images) | Ouvrir l'app rapidement, même sans réseau | À chaque nouvelle version, ou en désinstallant l'app |

**Aucune donnée de la Tribu ou du chat n'est gardée dans le cache** : les appels à l'API ne sont jamais mis en cache.

## 5. Cookies et traceurs

- **Aucun cookie** n'est utilisé par l'application.
- **Aucun outil de mesure d'audience, de publicité ou de suivi** (pas de Google Analytics, pas de pixel).
- **Aucun script externe** : tout le code et les polices sont servis par l'application elle-même.

Il n'y a donc **pas de bandeau de cookies** à afficher : le stockage du token sert uniquement au fonctionnement demandé par l'utilisateur (rester connecté), ce qui ne demande pas de consentement selon les recommandations de la CNIL.

## 6. Sécurité côté application

| Mesure | Détail |
|---|---|
| HTTPS | Toutes les pages et tous les échanges avec l'API sont chiffrés |
| Déconnexion complète | Utilisateur, token et données de la Tribu effacés de l’app |
| Session expirée | Déconnexion automatique si l'API refuse le token |
| Pas de secret dans le code | Seule l'adresse publique de l'API est dans l'application |

Le détail des choix de sécurité est dans [infrastructure.md](infrastructure.md).

## 7. Limites

| Limite | Évolution prévue |
|---|---|
| Pas de bouton « Supprimer mon compte » : la demande se fait par email | Bouton dans le Profil, avec la route correspondante dans l'API |
| Pas de bouton « Télécharger mes données » : la demande se fait par email | Export des données depuis le Profil |

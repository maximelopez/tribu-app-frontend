import { CONTACT_EMAIL } from './config';

// Textes de la politique de confidentialité et des CGU (affichés dans l'app)
// Écrits simplement, pour être compris aussi par les enfants

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalText {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
}

export const PRIVACY_POLICY: LegalText = {
  title: 'Politique de confidentialité',
  updatedAt: '15 octobre 2026',
  sections: [
    {
      title: 'En résumé',
      paragraphs: [
        "Tribu demande seulement les informations utiles pour jouer en famille. Vos données ne sont jamais vendues, et il n'y a ni publicité ni suivi.",
      ],
    },
    {
      title: 'Les informations que nous gardons',
      paragraphs: [
        'Votre prénom, votre email, votre mot de passe (chiffré : personne ne peut le lire), votre date de naissance, votre avatar et votre thème.',
        'Votre Tribu : son nom, sa ville, ses membres, les activités faites ensemble, les points, les badges et les messages du chat.',
      ],
    },
    {
      title: 'À quoi elles servent',
      paragraphs: [
        "À créer votre compte, à faire fonctionner votre Tribu (activités, points, badges, chat) et à vous envoyer des notifications dans l'app.",
        "Votre adresse IP est utilisée 15 minutes pour bloquer les personnes qui essaient de deviner un mot de passe.",
      ],
    },
    {
      title: 'Qui peut les voir',
      paragraphs: [
        "Les membres de votre Tribu voient seulement votre prénom, votre avatar et vos points. Votre email et votre date de naissance ne sont visibles que par vous.",
        "Les personnes qui cherchent une Tribu voient son nom, sa ville et le prénom et l'avatar de ses membres.",
      ],
    },
    {
      title: 'Où elles sont stockées',
      paragraphs: [
        "Vos données sont hébergées en Europe (Render pour le serveur, MongoDB Atlas pour la base de données). Elles sont protégées par des connexions chiffrées.",
      ],
    },
    {
      title: 'Combien de temps',
      paragraphs: [
        'Votre compte est gardé tant que vous l’utilisez. Il est supprimé si vous le demandez, ou après 3 ans sans connexion.',
        'Les notifications sont supprimées après 14 jours.',
      ],
    },
    {
      title: 'Les enfants',
      paragraphs: [
        "Avant 15 ans, il faut l'accord d'un parent pour utiliser Tribu. Une Tribu est toujours créée par un parent, qui accepte chaque membre.",
        "Un parent peut demander la suppression du compte de son enfant.",
      ],
    },
    {
      title: 'Vos droits',
      paragraphs: [
        "Vous pouvez demander à voir vos données, à les recevoir dans un fichier, à les corriger ou à les supprimer. Vous pouvez déjà modifier votre prénom, votre avatar, votre date de naissance et votre thème dans l'app.",
        `Pour le reste, écrivez à ${CONTACT_EMAIL} depuis l'adresse email de votre compte. Nous répondons en moins d'un mois.`,
        "Si vous pensez que vos droits ne sont pas respectés, vous pouvez contacter la CNIL (cnil.fr).",
      ],
    },
  ],
};

export const TERMS: LegalText = {
  title: "Conditions d'utilisation",
  updatedAt: '15 octobre 2026',
  sections: [
    {
      title: "L'application",
      paragraphs: [
        'Tribu est une application gratuite pour faire des activités en famille, gagner des points et débloquer des badges ensemble.',
      ],
    },
    {
      title: 'Votre compte',
      paragraphs: [
        "Pour utiliser Tribu, il faut créer un compte avec un vrai prénom et un email valide. Gardez votre mot de passe secret : vous êtes responsable de ce qui est fait avec votre compte.",
        "Avant 15 ans, il faut l'accord d'un parent.",
      ],
    },
    {
      title: 'Les Tribus',
      paragraphs: [
        "Une Tribu est créée par un parent. C'est lui qui accepte ou refuse les demandes pour la rejoindre et qui peut modifier son nom et sa ville.",
      ],
    },
    {
      title: 'Bien se comporter',
      paragraphs: [
        "Dans le chat et dans les noms de Tribu, restez respectueux : pas d'insultes, de moqueries, de contenus choquants ou de publicité. Un compte qui ne respecte pas ces règles peut être supprimé.",
      ],
    },
    {
      title: 'Les activités partenaires',
      paragraphs: [
        "Certaines activités sont proposées par des partenaires, avec parfois une offre. Elles se déroulent sous la responsabilité du partenaire et des parents. Tribu ne fait que les présenter.",
      ],
    },
    {
      title: 'Vos données',
      paragraphs: [
        "L'utilisation de vos données est expliquée dans la politique de confidentialité.",
      ],
    },
    {
      title: 'Changements',
      paragraphs: [
        "Ces conditions peuvent évoluer. En cas de changement important, vous serez prévenu dans l'app.",
        `Une question ? Écrivez à ${CONTACT_EMAIL}.`,
      ],
    },
  ],
};

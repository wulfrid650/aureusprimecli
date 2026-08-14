"use client";

import Link from "next/link";
import { PublicShell } from "@/components/marketing/public-pages";
import { useI18n } from "@/lib/i18n";

type LegalPageId = "usage" | "terms" | "privacy" | "refund";

type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "ordered"; items: string[] }
  | { type: "note"; text: string };

type LegalSection = {
  title: string;
  blocks: LegalBlock[];
};

type LegalDocument = {
  title: string;
  subtitle: string;
  effectiveDate: string;
  intro: string[];
  sections: LegalSection[];
  closing: string;
};

const legalDocs: Record<LegalPageId, LegalDocument> = {
  usage: {
    title: "Conditions Générales d'Utilisation (CGU)",
    subtitle: "aureusprime.com - Règles d'utilisation de la plateforme",
    effectiveDate: "14 août 2026",
    intro: [
      "Les présentes Conditions Générales d'Utilisation définissent les règles d'accès et d'utilisation du site, du dashboard, du wallet Auri et des applications Aureus Prime.",
      "Toute création de compte, connexion ou utilisation de la plateforme vaut acceptation pleine et entière des présentes CGU, des CGV et de la Politique de Confidentialité en vigueur.",
    ],
    sections: [
      {
        title: "1. Accès à la plateforme",
        blocks: [
          {
            type: "paragraph",
            text: "Aureus Prime permet à ses utilisateurs de consulter un catalogue de services numériques, de gérer un wallet interne en Auri et de suivre leurs commandes et abonnements.",
          },
          {
            type: "list",
            items: [
              "l'utilisateur doit fournir des informations exactes lors de l'inscription ;",
              "l'utilisateur est responsable de la confidentialité de ses identifiants ;",
              "Aureus Prime peut suspendre un accès en cas d'usage frauduleux, abusif ou contraire aux règles de la plateforme.",
            ],
          },
        ],
      },
      {
        title: "2. Compte utilisateur",
        blocks: [
          {
            type: "paragraph",
            text: "Le compte utilisateur centralise les informations de profil, le wallet Auri, les commandes, les abonnements, les demandes KYC et les accès livrés.",
          },
          {
            type: "list",
            items: [
              "un compte est personnel et ne doit pas être partagé sans autorisation ;",
              "l'utilisateur doit maintenir son adresse e-mail et son numéro de téléphone à jour ;",
              "l'utilisateur doit signaler rapidement toute connexion ou activité suspecte.",
            ],
          },
        ],
      },
      {
        title: "3. Wallet Auri",
        blocks: [
          {
            type: "paragraph",
            text: "Le wallet Auri est une unité de compte interne à Aureus Prime. 1 Auri = 1 XAF. Les Auri servent uniquement aux achats et opérations internes à la plateforme.",
          },
          {
            type: "note",
            text: "Les Auri ne sont pas une cryptomonnaie, ne constituent pas un compte bancaire et ne peuvent pas être échangés en dehors d'Aureus Prime.",
          },
        ],
      },
      {
        title: "4. Utilisation loyale",
        blocks: [
          {
            type: "paragraph",
            text: "L'utilisateur s'engage à ne pas perturber le fonctionnement de la plateforme, contourner les systèmes de paiement, revendre les accès livrés ou utiliser les services à des fins illicites.",
          },
          {
            type: "list",
            items: [
              "ne pas publier ou revendre des identifiants fournis ;",
              "ne pas modifier les accès partagés lorsqu'une règle l'interdit ;",
              "ne pas tenter d'accéder aux comptes ou données d'autres utilisateurs.",
            ],
          },
        ],
      },
      {
        title: "5. Acceptation automatique",
        blocks: [
          {
            type: "paragraph",
            text: "L'acceptation des CGU, CGV et de la Politique de Confidentialité est enregistrée automatiquement lors de la création du compte et lors de la connexion, pour les versions légales en vigueur.",
          },
          {
            type: "paragraph",
            text: "Aureus Prime conserve la version acceptée, la date, l'adresse IP, le user-agent, la source de l'acceptation et la langue transmise par le navigateur.",
          },
        ],
      },
      {
        title: "6. Contact",
        blocks: [
          { type: "paragraph", text: "Pour toute question relative aux présentes CGU :" },
          { type: "list", items: ["support@aureusprime.com", "+237 676 025 127", "aureusprime.com"] },
        ],
      },
    ],
    closing: "Aureus Prime reste simple à utiliser, mais l'usage doit rester clair, loyal et sécurisé.",
  },
  terms: {
    title: "Conditions Générales de Vente (CGV)",
    subtitle: "aureusprime.com - Plateforme d'abonnements digitaux",
    effectiveDate: "14 août 2026",
    intro: [
      "Les présentes Conditions Générales de Vente régissent les relations contractuelles entre Aureus Prime, ci-après « Aureus Prime » ou « Nous », et toute personne physique ou morale utilisant les services proposés via le site et les applications associées.",
      "L'accès et l'utilisation des services impliquent l'acceptation pleine et entière des présentes CGV. Si vous n'acceptez pas ces CGV, vous ne devez pas utiliser les services d'Aureus Prime.",
    ],
    sections: [
      {
        title: "1. Objet",
        blocks: [
          {
            type: "paragraph",
            text: "Les présentes CGV définissent les conditions dans lesquelles Aureus Prime propose à l'utilisateur des services de facilitation de gestion et de paiement d'abonnements à des services numériques tiers.",
          },
          {
            type: "paragraph",
            text: "Aureus Prime agit exclusivement en tant qu'intermédiaire et facilitateur de paiement et n'est pas le fournisseur des services numériques tiers.",
          },
          {
            type: "paragraph",
            text: "1.2. Nature de la relation - Contrat de mandat : en utilisant la Plateforme pour configurer, faciliter ou payer un abonnement à un Service Numérique Tiers, l'Utilisateur confie expressément à Aureus Prime un mandat de gestion technique et logistique. Aureus Prime n'agit pas en tant que vendeur ou distributeur des contenus tiers, mais exclusivement comme mandataire informatique et facilitateur de paiement exécutant les instructions de l'Utilisateur. L'exécution complète du mandat technique libère Aureus Prime de son obligation de facilitation, les risques liés aux modifications unilatérales de conditions d'accès, géoblocages ou suspensions décidées par les éditeurs tiers incombant à l'Utilisateur.",
          },
        ],
      },
      {
        title: "2. Définitions",
        blocks: [
          {
            type: "list",
            items: [
              "Aureus Prime : plateforme exploitant le site et fournissant les services.",
              "Site : site internet aureusprime.com, ses sous-domaines et applications associées.",
              "Utilisateur : toute personne utilisant les services d'Aureus Prime.",
              "Services : prestations proposées par Aureus Prime, incluant la gestion, la facilitation de souscription et de paiement d'abonnements numériques.",
              "Services Numériques Tiers : services fournis par des éditeurs tiers tels que Netflix, Spotify, PhotoRoom Pro ou Microsoft 365.",
              "Mandat numérique : mission technique confiée par l'Utilisateur à Aureus Prime pour configurer, faciliter, payer ou mettre à disposition un accès à un Service Numérique Tiers selon les instructions de l'Utilisateur.",
              "Abonnement : contrat conclu directement entre l'utilisateur et le fournisseur du service numérique tiers.",
              "Wallet Aureus Prime : portefeuille électronique interne libellé en Auri, utilisé exclusivement pour le paiement des services.",
              "Auri : unité de compte interne et jeton utilitaire d'infrastructure d'Aureus Prime. 1 Auri = 1 Franc CFA (XAF). Les Auri ne sont pas une cryptomonnaie, ne constituent pas une monnaie électronique autonome et ne peuvent être échangés en dehors de la plateforme.",
              "Mobile Money / PayPal : moyens de paiement servant uniquement à recharger le wallet Aureus Prime.",
              "Compte Utilisateur : espace personnel permettant de gérer abonnements, wallet et informations personnelles.",
            ],
          },
        ],
      },
      {
        title: "3. Acceptation des CGV",
        blocks: [
          { type: "paragraph", text: "L'acceptation des présentes CGV est matérialisée par :" },
          { type: "list", items: ["la création d'un compte utilisateur ;", "la validation d'une commande ;", "ou l'utilisation des services."] },
          {
            type: "paragraph",
            text: "Les CGV applicables sont celles en vigueur à la date d'utilisation. Aureus Prime se réserve le droit de les modifier à tout moment. Les modifications prennent effet dès leur publication sur le site.",
          },
        ],
      },
      {
        title: "4. Description des Services",
        blocks: [
          { type: "paragraph", text: "Aureus Prime propose :" },
          {
            type: "list",
            items: [
              "un catalogue d'abonnements à des services numériques tiers ;",
              "la gestion du wallet Aureus Prime avec recharges en Auri, historique et paiements ;",
              "la facilitation de paiement des abonnements via le wallet ;",
              "la gestion de compte utilisateur ;",
              "des fonctionnalités de parrainage et récompenses associées ;",
              "un support client.",
            ],
          },
          {
            type: "note",
            text: "Aureus Prime n'est pas responsable du contenu, de la qualité ou de la disponibilité des services numériques tiers.",
          },
        ],
      },
      {
        title: "5. Types d'abonnements",
        blocks: [
          {
            type: "paragraph",
            text: "Les services numériques tiers accessibles via la plateforme Aureus Prime peuvent proposer différents types d'abonnements, notamment :",
          },
          {
            type: "list",
            items: [
              "des abonnements personnels, destinés à un usage individuel ;",
              "des abonnements partagés, permettant l'accès à plusieurs utilisateurs selon les conditions définies par le fournisseur du service numérique tiers.",
            ],
          },
          { type: "subheading", text: "Expérience utilisateur séparée" },
          {
            type: "paragraph",
            text: "Lorsque le service numérique tiers le permet, certains abonnements partagés offrent une expérience distincte pour chaque utilisateur, par exemple des profils séparés, historiques ou préférences propres.",
          },
          {
            type: "paragraph",
            text: "Aureus Prime peut assister techniquement l'utilisateur dans la mise en place ou la gestion de cette expérience séparée, sans en garantir la disponibilité ni la continuité, celles-ci dépendant exclusivement des règles et du fonctionnement du fournisseur tiers.",
          },
          { type: "paragraph", text: "L'utilisateur est seul responsable :" },
          {
            type: "list",
            items: [
              "du respect des conditions d'utilisation du fournisseur tiers ;",
              "de l'usage qui est fait d'un abonnement partagé ;",
              "de l'ajout ou de l'accès de tiers à un abonnement partagé.",
            ],
          },
          {
            type: "paragraph",
            text: "Toute suspension, restriction ou résiliation d'un abonnement résultant d'un non-respect des conditions du fournisseur tiers ne saurait engager la responsabilité d'Aureus Prime.",
          },
        ],
      },
      {
        title: "6. Processus de commande",
        blocks: [
          { type: "paragraph", text: "Pour souscrire à un abonnement :" },
          {
            type: "ordered",
            items: [
              "Créer un compte utilisateur.",
              "Recharger le wallet Aureus Prime via Mobile Money ou PayPal.",
              "Sélectionner le service numérique tiers.",
              "Valider la commande.",
              "Payer via le wallet en Auri.",
              "Activer l'abonnement avec livraison automatique des identifiants lorsque disponible.",
            ],
          },
          {
            type: "paragraph",
            text: "L'abonnement est considéré comme actif dès confirmation et livraison des identifiants d'accès.",
          },
        ],
      },
      {
        title: "7. Prix et paiement",
        blocks: [
          {
            type: "list",
            items: [
              "Les prix sont affichés en Auri, avec 1 Auri = 1 Franc CFA / XAF, toutes taxes comprises.",
              "Tous les paiements d'abonnements passent exclusivement par le wallet Aureus Prime.",
              "Mobile Money, notamment MTN MoMo, Orange Money, Airtel Money, Wave, et PayPal servent uniquement à la recharge du wallet.",
              "Aureus Prime ne conserve aucun code secret ou identifiant de paiement.",
            ],
          },
          { type: "subheading", text: "Frais de service" },
          {
            type: "paragraph",
            text: "Le prix total payé par l'utilisateur comprend le coût de l'abonnement et les frais de service d'Aureus Prime, correspondant à la rémunération de la plateforme pour ses services d'intermédiation, de gestion technique, de sécurisation des transactions et de support client.",
          },
          {
            type: "paragraph",
            text: "Ces frais sont inclus dans le prix affiché en Auri TTC. En validant sa commande, l'utilisateur accepte expressément que le montant total inclut cette rémunération de service, définitivement acquise à Aureus Prime dès validation de la transaction.",
          },
          { type: "subheading", text: "7.3. Modification des prix" },
          {
            type: "paragraph",
            text: "Les prix des Services Numériques Tiers peuvent varier à tout moment en fonction des décisions des fournisseurs tiers, des taux, taxes, restrictions géographiques, disponibilités, frais opérationnels ou conditions d'accès imposées par ces fournisseurs. Lorsque cette variation provient d'un fournisseur tiers ou d'une contrainte externe, Aureus Prime peut appliquer le nouveau prix immédiatement aux nouvelles commandes et aux renouvellements non encore payés.",
          },
          {
            type: "paragraph",
            text: "Lorsque la modification de prix résulte d'une décision propre d'Aureus Prime, notamment une évolution des frais de service ou de la politique commerciale interne, Aureus Prime s'engage à appliquer cette modification de manière prévisionnelle, avec information préalable raisonnable des utilisateurs lorsque le changement affecte un renouvellement automatique. Le nouveau prix ne s'applique jamais rétroactivement à une période déjà payée.",
          },
          {
            type: "paragraph",
            text: "Une commande déjà payée conserve le montant validé au moment de la transaction. En cas de renouvellement, le prix applicable est celui affiché au moment du renouvellement ou celui déjà gelé/réservé dans le wallet lorsque le système a préalablement bloqué les fonds pour cette opération.",
          },
          { type: "subheading", text: "7.4. Caractère définitif de la recharge du Wallet" },
          {
            type: "paragraph",
            text: "Les services de paiement tiers, notamment Mobile Money, MTN MoMo, Orange Money, Wave, Airtel Money et PayPal, sont exclusivement utilisés par l'Utilisateur pour acheter l'unité de compte interne nommée Auri. Le contrat de vente financière est réputé exécuté et livré en totalité à la seconde où le wallet Aureus Prime de l'Utilisateur est crédité du montant correspondant en Auri.",
          },
          {
            type: "paragraph",
            text: "L'Auri constitue un jeton utilitaire d'infrastructure interne, non remboursable en numéraire après livraison du crédit wallet et dépourvu de valeur monétaire en dehors de l'application. Aucun litige ultérieur concernant un Service Numérique Tiers ne peut justifier l'annulation automatique de la transaction financière d'achat d'Auri d'origine.",
          },
        ],
      },
      {
        title: "8. Obligations de l'Utilisateur",
        blocks: [
          { type: "paragraph", text: "L'utilisateur s'engage à :" },
          {
            type: "list",
            items: [
              "fournir des informations exactes lors de la création du compte ;",
              "utiliser les services conformément aux lois en vigueur au Cameroun et dans son pays de résidence ;",
              "respecter les conditions d'utilisation des fournisseurs tiers ;",
              "ne pas modifier les identifiants d'accès fournis dans le cadre d'un abonnement partagé ;",
              "sécuriser ses identifiants de connexion Aureus Prime ;",
              "disposer des fonds suffisants dans son wallet avant toute commande ;",
              "contacter directement les fournisseurs tiers pour tout problème lié au service lui-même.",
            ],
          },
        ],
      },
      {
        title: "9. Responsabilité d'Aureus Prime",
        blocks: [
          {
            type: "paragraph",
            text: "Aureus Prime agit en tant qu'intermédiaire. Sa responsabilité est strictement limitée à la facilitation de paiement et de gestion.",
          },
          { type: "paragraph", text: "Aureus Prime ne saurait être tenue responsable :" },
          {
            type: "list",
            items: [
              "des services numériques tiers ;",
              "des pannes ou interruptions des plateformes tierces ;",
              "des incidents liés aux opérateurs Mobile Money ou PayPal ;",
              "des dommages indirects ;",
              "des cas de force majeure.",
            ],
          },
          {
            type: "paragraph",
            text: "La responsabilité maximale d'Aureus Prime est limitée aux montants payés par l'utilisateur au cours des douze derniers mois.",
          },
        ],
      },
      {
        title: "10. Politique de remboursement",
        blocks: [
          {
            type: "paragraph",
            text: "Les conditions de remboursement, les délais et la procédure sont définis dans la Politique de Remboursement, document distinct disponible sur le site à l'adresse aureusprime.com/remboursement.",
          },
          {
            type: "note",
            text: "En cas de divergence entre les présentes CGV et la Politique de Remboursement, cette dernière prévaut pour tout ce qui concerne les compensations et les remboursements.",
          },
        ],
      },
      {
        title: "11. Propriété intellectuelle",
        blocks: [
          {
            type: "paragraph",
            text: "Tous les contenus du site, notamment textes, images, logos, interface et mascotte Auri, sont protégés par le droit de la propriété intellectuelle. Toute reproduction ou utilisation sans autorisation écrite préalable d'Aureus Prime est strictement interdite.",
          },
        ],
      },
      {
        title: "12. Données personnelles",
        blocks: [
          {
            type: "paragraph",
            text: "La collecte et le traitement des données personnelles sont régis par la Politique de Confidentialité d'Aureus Prime, disponible sur le site à l'adresse aureusprime.com/confidentialite.",
          },
        ],
      },
      {
        title: "13. Loi applicable et juridiction compétente",
        blocks: [
          {
            type: "paragraph",
            text: "Les présentes CGV sont régies par les lois de la République du Cameroun. Tout litige relève de la compétence exclusive des juridictions compétentes de Douala, Cameroun.",
          },
          {
            type: "paragraph",
            text: "En cas de litige, les parties s'engagent à rechercher une solution amiable avant toute action judiciaire.",
          },
        ],
      },
      {
        title: "14. Contact",
        blocks: [
          { type: "paragraph", text: "Pour toute question relative aux présentes CGV :" },
          { type: "list", items: ["support@aureusprime.com", "+237 676 025 127", "aureusprime.com"] },
        ],
      },
    ],
    closing: "Aureus Prime simplifie, sécurise et centralise. Le service est clair, les règles aussi.",
  },
  privacy: {
    title: "Politique de Confidentialité",
    subtitle: "aureusprime.com - Plateforme d'abonnements digitaux",
    effectiveDate: "14 août 2026",
    intro: [
      "Chez Aureus Prime, nous considérons la confidentialité comme un pilier fondamental de la confiance. Nous collectons uniquement les données nécessaires au bon fonctionnement de nos services, sans exploitation abusive, sans revente, et sans géolocalisation dissimulée.",
      "Cette Politique de Confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos données lorsque vous utilisez notre site web, nos sous-domaines et nos applications.",
    ],
    sections: [
      {
        title: "1. Qui sommes-nous ?",
        blocks: [
          {
            type: "paragraph",
            text: "Aureus Prime est une plateforme digitale camerounaise qui facilite la gestion, le paiement et le suivi d'abonnements numériques tiers.",
          },
          {
            type: "list",
            items: [
              "Aureus Prime n'est pas le fournisseur des services numériques proposés.",
              "Nous agissons uniquement comme intermédiaire et facilitateur de paiement et de gestion.",
              "Tous les paiements d'abonnements passent par le wallet Aureus Prime, libellé en Auri, avec 1 Auri = 1 XAF.",
            ],
          },
          {
            type: "paragraph",
            text: "Nos services sont conçus pour être accessibles, transparents et adaptés aux réalités locales, notamment via le Mobile Money.",
          },
        ],
      },
      {
        title: "2. Données que nous collectons",
        blocks: [
          { type: "paragraph", text: "Nous adoptons une logique de collecte minimale et utile." },
          { type: "subheading", text: "2.1 Données fournies directement par l'utilisateur" },
          {
            type: "paragraph",
            text: "Lors de la création et de l'utilisation d'un compte Aureus Prime, nous pouvons collecter un identifiant client interne, un pseudonyme facultatif, le nom, le prénom, l'adresse e-mail et le numéro de téléphone avec indicatif international.",
          },
          {
            type: "paragraph",
            text: "Le numéro de téléphone peut servir à la sécurisation du compte, à l'identification du pays via l'indicatif et à l'utilisation des services Mobile Money.",
          },
          {
            type: "note",
            text: "Aureus Prime n'utilise pas l'adresse IP pour déduire ou exploiter la localisation géographique de l'utilisateur.",
          },
          { type: "subheading", text: "2.2 Données liées aux paiements et au wallet" },
          {
            type: "paragraph",
            text: "Aureus Prime fonctionne avec un wallet interne en Auri, avec 1 Auri = 1 Franc CFA / XAF. Nous collectons l'historique des recharges, les montants, dates et statuts des transactions, ainsi que les abonnements payés via le wallet.",
          },
          { type: "paragraph", text: "Aureus Prime ne stocke jamais :" },
          {
            type: "list",
            items: ["les codes PIN Mobile Money ;", "les identifiants PayPal ;", "les informations bancaires sensibles."],
          },
          { type: "subheading", text: "2.3 Données liées aux abonnements" },
          {
            type: "list",
            items: [
              "les abonnements actifs ou expirés ;",
              "les historiques de paiement en Auri ;",
              "les données liées au parrainage et aux bonus de fidélité.",
            ],
          },
          { type: "subheading", text: "2.4 Données techniques limitées" },
          {
            type: "paragraph",
            text: "À des fins de sécurité et de performance, nous pouvons collecter le type d'appareil, le navigateur ou système d'exploitation, les journaux de connexion techniques et les données de cache ou de Service Worker stockées localement sur votre appareil.",
          },
          { type: "paragraph", text: "Nous ne faisons pas :" },
          {
            type: "list",
            items: [
              "de tracking publicitaire ;",
              "de fingerprinting ;",
              "de géolocalisation GPS ;",
              "de revente ou profilage commercial externe.",
            ],
          },
        ],
      },
      {
        title: "3. Utilisation de vos données",
        blocks: [
          { type: "paragraph", text: "Vos données sont utilisées uniquement pour :" },
          {
            type: "list",
            items: [
              "créer et gérer votre compte utilisateur ;",
              "gérer le wallet Aureus Prime en Auri ;",
              "faciliter le paiement et le suivi des abonnements ;",
              "gérer le parrainage et la fidélité ;",
              "assurer la sécurité et prévenir la fraude ;",
              "fournir un support client fiable ;",
              "respecter nos obligations légales.",
            ],
          },
          { type: "note", text: "Aucune exploitation commerciale cachée." },
        ],
      },
      {
        title: "4. Partage des données",
        blocks: [
          { type: "paragraph", text: "Aureus Prime ne vend ni ne loue vos données personnelles." },
          { type: "paragraph", text: "Les données peuvent être partagées uniquement :" },
          {
            type: "list",
            items: [
              "avec les prestataires de paiement pour le traitement des recharges ;",
              "avec les services numériques tiers, uniquement pour activer ou gérer un abonnement ;",
              "avec des prestataires techniques sous obligation de confidentialité ;",
              "si la loi le requiert ou dans le cadre d'une procédure légale camerounaise ;",
              "en cas de restructuration ou cession de l'entreprise.",
            ],
          },
        ],
      },
      {
        title: "5. Sécurité des données",
        blocks: [
          { type: "paragraph", text: "Nous mettons en oeuvre :" },
          {
            type: "list",
            items: [
              "le chiffrement des données sensibles via HTTPS/TLS ;",
              "des contrôles d'accès stricts ;",
              "la vérification HMAC des webhooks de paiement ;",
              "des transactions atomiques sur le wallet pour éviter toute perte ou duplication ;",
              "des mesures organisationnelles adaptées.",
            ],
          },
          {
            type: "paragraph",
            text: "Aucun système n'étant infaillible, nous ne pouvons garantir une sécurité absolue, mais nous appliquons des standards stricts et responsables.",
          },
        ],
      },
      {
        title: "6. Vos droits",
        blocks: [
          {
            type: "list",
            items: [
              "droit d'accès à vos données ;",
              "droit de rectification ;",
              "droit à l'effacement ;",
              "droit à la limitation du traitement ;",
              "droit à la portabilité ;",
              "droit d'opposition, notamment aux communications marketing.",
            ],
          },
          { type: "paragraph", text: "Toute demande peut être adressée à support@aureusprime.com." },
        ],
      },
      {
        title: "7. Conservation des données",
        blocks: [
          { type: "paragraph", text: "Les données sont conservées :" },
          {
            type: "list",
            items: [
              "tant que le compte est actif ;",
              "selon les obligations légales pour les données financières, minimum 5 ans ;",
              "pour la durée strictement nécessaire au support et à la sécurité.",
            ],
          },
          {
            type: "paragraph",
            text: "Une suppression peut être demandée à tout moment, sous réserve des contraintes légales.",
          },
        ],
      },
      {
        title: "8. Cookies et technologies similaires",
        blocks: [
          {
            type: "paragraph",
            text: "Nous utilisons des technologies de stockage local essentiellement fonctionnelles et techniques : cookies de session pour la connexion sécurisée, localStorage pour la persistance du token d'authentification et Service Worker pour le fonctionnement hors ligne de l'application.",
          },
          {
            type: "paragraph",
            text: "Vous pouvez configurer votre navigateur pour limiter ou refuser les cookies. Cela peut affecter le fonctionnement de l'application.",
          },
        ],
      },
      {
        title: "9. Modification de la politique",
        blocks: [
          {
            type: "paragraph",
            text: "Cette Politique de Confidentialité peut être modifiée à tout moment. Toute mise à jour sera publiée avec une nouvelle date d'entrée en vigueur sur aureusprime.com/confidentialite.",
          },
        ],
      },
      {
        title: "10. Contact",
        blocks: [
          { type: "paragraph", text: "Pour toute question relative à la confidentialité de vos données :" },
          { type: "list", items: ["support@aureusprime.com", "+237 676 025 127", "aureusprime.com"] },
        ],
      },
    ],
    closing: "Tes données ne sont pas une monnaie d'échange. Elles servent uniquement à faire fonctionner le service proprement.",
  },
  refund: {
    title: "Politique de Remboursement",
    subtitle: "aureusprime.com - Plateforme d'abonnements digitaux",
    effectiveDate: "14 août 2026",
    intro: [
      "Chez Aureus Prime, nous mettons tout en oeuvre pour garantir la satisfaction de nos utilisateurs. La présente Politique de Remboursement définit les conditions dans lesquelles un remboursement peut être accordé pour les abonnements souscrits via notre plateforme.",
      "Nous vous invitons à lire attentivement cette politique avant d'effectuer tout achat.",
    ],
    sections: [
      {
        title: "1. Nature des services d'Aureus Prime",
        blocks: [
          {
            type: "paragraph",
            text: "Aureus Prime agit exclusivement en tant que facilitateur de paiement pour des abonnements à des services numériques tiers.",
          },
          {
            type: "list",
            items: [
              "Aureus Prime n'est pas le fournisseur direct de ces services.",
              "Le contrat d'abonnement est conclu directement entre l'utilisateur et le fournisseur du service numérique tiers.",
            ],
          },
          { type: "paragraph", text: "Notre rôle consiste à :" },
          {
            type: "list",
            items: [
              "collecter le paiement de l'utilisateur via Mobile Money ou en débitant le wallet Auri ;",
              "livrer automatiquement les identifiants d'accès au service lorsque disponible ;",
              "assurer le support en cas de problème de livraison.",
            ],
          },
          {
            type: "paragraph",
            text: "Une fois l'abonnement activé et les identifiants livrés, l'accès et l'utilisation du service sont entièrement gérés par le fournisseur tiers.",
          },
          {
            type: "paragraph",
            text: "L'Utilisateur reconnaît l'existence d'un aléa technologique propre aux Services Numériques Tiers : modification de protocoles, géoblocage, politique de partage, suspension ou restriction décidée par l'éditeur tiers. Ces aléas ne constituent pas automatiquement une non-livraison imputable à Aureus Prime lorsque les identifiants ou le crédit Auri ont été correctement livrés.",
          },
        ],
      },
      {
        title: "2. Conditions générales de remboursement",
        blocks: [
          {
            type: "paragraph",
            text: "En raison de notre rôle d'intermédiaire, un remboursement peut être envisagé uniquement dans les conditions suivantes.",
          },
          { type: "subheading", text: "Remboursement possible - non-livraison du service" },
          { type: "paragraph", text: "Un remboursement peut être accordé si :" },
          {
            type: "list",
            items: [
              "le paiement a été effectué avec succès via Aureus Prime ;",
              "les identifiants d'accès n'ont pas été livrés dans les 24 heures suivant le paiement ;",
              "cette non-livraison est imputable à Aureus Prime ou à un problème technique de la plateforme.",
            ],
          },
          { type: "subheading", text: "Délai de demande" },
          {
            type: "paragraph",
            text: "Toute demande de remboursement doit être soumise dans un délai de 7 jours calendaires à compter de la date de la transaction, si le service n'a pas été livré.",
          },
          { type: "subheading", text: "Justificatifs requis" },
          {
            type: "list",
            items: [
              "captures d'écran de l'absence d'identifiants dans l'espace « Mes Abonnements » ;",
              "messages d'erreur éventuels ;",
              "confirmation de paiement sans livraison correspondante.",
            ],
          },
        ],
      },
      {
        title: "3. Cas où aucun remboursement ne sera accordé",
        blocks: [
          {
            type: "paragraph",
            text: "Aléa tiers et absence de remboursement monétaire : l'Utilisateur déclare être conscient que les éditeurs tiers peuvent modifier leurs protocoles, géoblocages ou règles de partage de compte à tout moment. En cas d'interruption technique d'un service tiers après livraison réussie des identifiants, aucun remboursement monétaire sur les comptes Mobile Money ne sera accordé. Aureus Prime proposera exclusivement une compensation interne via réassignation d'un nouvel accès fonctionnel ou recrédit du montant équivalent en Auri sur le wallet interne.",
          },
          { type: "paragraph", text: "Aucun remboursement ne sera effectué dans les situations suivantes :" },
          {
            type: "list",
            items: [
              "changement d'avis après la livraison réussie des identifiants d'accès ;",
              "problèmes liés au service numérique tiers, notamment qualité, contenu, disponibilité, bugs ou restrictions régionales ;",
              "violation des conditions d'utilisation du fournisseur tiers ;",
              "erreur de l'utilisateur, comme un mauvais abonnement sélectionné ou des informations incorrectes ;",
              "abonnement expiré ou période déjà consommée ;",
              "problèmes de connexion internet ou d'appareil de l'utilisateur ;",
              "suspension pour usage non conforme d'un abonnement partagé ;",
              "frais de service, sauf défaillance technique avérée de la plateforme Aureus Prime empêchant toute délivrance du service.",
            ],
          },
        ],
      },
      {
        title: "4. Procédure de demande de remboursement",
        blocks: [
          { type: "subheading", text: "Étape 1 - Contacter le support client Aureus Prime" },
          { type: "list", items: ["WhatsApp : +237 676 025 127", "E-mail : support@aureusprime.com"] },
          { type: "subheading", text: "Étape 2 - Fournir les informations suivantes" },
          {
            type: "list",
            items: [
              "nom et adresse e-mail associés au compte Aureus Prime ;",
              "numéro de transaction ou de commande ;",
              "service numérique tiers concerné ;",
              "date et heure de la transaction ;",
              "description claire du problème ;",
              "toute preuve utile, notamment captures d'écran ou messages d'erreur.",
            ],
          },
          { type: "subheading", text: "Étape 3 - Examen de la demande" },
          {
            type: "paragraph",
            text: "Notre équipe examinera la demande dans un délai maximum de 48 heures ouvrables. Des informations complémentaires pourront être demandées si nécessaire.",
          },
          { type: "subheading", text: "Étape 4 - Décision" },
          {
            type: "paragraph",
            text: "La décision sera communiquée par e-mail ou WhatsApp. En cas d'approbation, le remboursement sera initié selon les modalités ci-dessous.",
          },
        ],
      },
      {
        title: "5. Modalités de remboursement",
        blocks: [
          { type: "paragraph", text: "Si une compensation est approuvée, elle est appliquée prioritairement dans l'écosystème Aureus Prime :" },
          { type: "subheading", text: "Option A - Remboursement en Auri" },
          {
            type: "paragraph",
            text: "Le montant est recrédité immédiatement sur le wallet Auri de l'utilisateur. L'utilisateur peut immédiatement souscrire à un autre service disponible sur la plateforme.",
          },
          { type: "subheading", text: "Option B - Réassignation ou remplacement" },
          {
            type: "paragraph",
            text: "Lorsque le service livré devient indisponible pour une cause technique liée à un éditeur tiers, Aureus Prime peut proposer un nouvel accès fonctionnel, une réassignation de slot ou un service équivalent disponible.",
          },
          {
            type: "note",
            text: "Un remboursement monétaire externe ne constitue pas le mode normal de compensation après livraison des Auri ou des identifiants. Il ne peut intervenir qu'en cas d'obligation légale impérative ou de décision exceptionnelle documentée par Aureus Prime.",
          },
        ],
      },
      {
        title: "6. Garantie Aureus Prime",
        blocks: [
          { type: "paragraph", text: "Aureus Prime s'engage à :" },
          {
            type: "list",
            items: [
              "répondre à toute demande de support dans les 2 heures ouvrables via WhatsApp ;",
              "traiter toute demande de remboursement légitime dans les 48 heures ouvrables ;",
              "proposer une solution alternative, comme une réassignation de slot ou un service de remplacement, avant tout remboursement ;",
              "maintenir un taux de livraison automatique supérieur à 95%.",
            ],
          },
        ],
      },
      {
        title: "7. Modification de la politique",
        blocks: [
          {
            type: "paragraph",
            text: "Aureus Prime se réserve le droit de modifier la présente Politique de Remboursement à tout moment. Toute modification sera publiée sur le site avec une nouvelle date d'entrée en vigueur.",
          },
        ],
      },
      {
        title: "8. Contact",
        blocks: [
          { type: "paragraph", text: "Pour toute question relative à cette Politique de Remboursement :" },
          { type: "list", items: ["support@aureusprime.com", "WhatsApp : +237 676 025 127", "aureusprime.com"] },
        ],
      },
    ],
    closing: "On rembourse quand le service n'a pas été livré. On ne rembourse pas un service qui fonctionne mais qui ne plaît plus.",
  },
};

const englishLegalDocs: Record<LegalPageId, LegalDocument> = {
  usage: {
    title: "Terms of Use",
    subtitle: "aureusprime.com - Platform usage rules",
    effectiveDate: "August 14, 2026",
    intro: [
      "These Terms of Use define the rules for accessing and using the Aureus Prime website, dashboard, Auri wallet and related applications.",
      "Creating an account, signing in or using the platform means that you accept these Terms of Use, the Terms of Sale and the Privacy Policy in force.",
    ],
    sections: [
      {
        title: "1. Access to the platform",
        blocks: [
          {
            type: "paragraph",
            text: "Aureus Prime lets users browse a catalog of digital services, manage an internal Auri wallet and track orders and subscriptions.",
          },
          {
            type: "list",
            items: [
              "users must provide accurate information during registration;",
              "users are responsible for keeping their login details confidential;",
              "Aureus Prime may suspend access in case of fraudulent, abusive or non-compliant use.",
            ],
          },
        ],
      },
      {
        title: "2. User account",
        blocks: [
          {
            type: "paragraph",
            text: "The user account centralizes profile information, the Auri wallet, orders, subscriptions, KYC requests and delivered access details.",
          },
          {
            type: "list",
            items: [
              "an account is personal and must not be shared without authorization;",
              "users must keep their email address and phone number up to date;",
              "users must report any suspicious login or activity promptly.",
            ],
          },
        ],
      },
      {
        title: "3. Auri wallet",
        blocks: [
          {
            type: "paragraph",
            text: "The Auri wallet is an internal unit of account used by Aureus Prime. 1 Auri = 1 XAF. Auri can only be used for purchases and internal operations on the platform.",
          },
          {
            type: "note",
            text: "Auri is not cryptocurrency, is not a bank account and cannot be exchanged outside Aureus Prime.",
          },
        ],
      },
      {
        title: "4. Fair use",
        blocks: [
          {
            type: "paragraph",
            text: "Users agree not to disrupt the platform, bypass payment systems, resell delivered access or use the services for illegal purposes.",
          },
          {
            type: "list",
            items: [
              "do not publish or resell delivered credentials;",
              "do not modify shared access when this is prohibited;",
              "do not attempt to access other users' accounts or data.",
            ],
          },
        ],
      },
      {
        title: "5. Automatic acceptance",
        blocks: [
          {
            type: "paragraph",
            text: "Acceptance of the Terms of Use, Terms of Sale and Privacy Policy is recorded automatically when an account is created and when a user signs in.",
          },
          {
            type: "paragraph",
            text: "Aureus Prime may keep the accepted version, date, IP address, user agent, source of acceptance and browser language.",
          },
        ],
      },
      {
        title: "6. Contact",
        blocks: [
          { type: "paragraph", text: "For questions about these Terms of Use:" },
          { type: "list", items: ["support@aureusprime.com", "+237 676 025 127", "aureusprime.com"] },
        ],
      },
    ],
    closing: "Aureus Prime is designed to be simple to use, but usage must remain clear, fair and secure.",
  },
  terms: {
    title: "Terms of Sale",
    subtitle: "aureusprime.com - Digital subscription platform",
    effectiveDate: "August 14, 2026",
    intro: [
      "These Terms of Sale govern the contractual relationship between Aureus Prime and any person or entity using the services offered through the website and related applications.",
      "Accessing and using the services implies full acceptance of these Terms. If you do not accept them, you must not use Aureus Prime services.",
    ],
    sections: [
      {
        title: "1. Purpose",
        blocks: [
          {
            type: "paragraph",
            text: "These Terms define how Aureus Prime provides facilitation, management and payment services for subscriptions to third-party digital services.",
          },
          {
            type: "paragraph",
            text: "Aureus Prime acts only as an intermediary and payment facilitator and is not the provider of third-party digital services.",
          },
          {
            type: "paragraph",
            text: "1.2. Nature of the relationship - Digital mandate: by using the Platform to configure, facilitate or pay for access to a Third-party digital service, the User expressly gives Aureus Prime a technical and logistical management mandate. Aureus Prime does not act as seller or distributor of third-party content, but as a technical agent and payment facilitator executing the User's instructions. Once the technical mandate has been performed, risks linked to unilateral access rule changes, geoblocking or suspensions decided by third-party publishers remain with the User.",
          },
        ],
      },
      {
        title: "2. Definitions",
        blocks: [
          {
            type: "list",
            items: [
              "Aureus Prime: the platform operating the website and services.",
              "Site: aureusprime.com, its subdomains and related applications.",
              "User: any person using Aureus Prime services.",
              "Services: subscription facilitation, management and payment services offered by Aureus Prime.",
              "Third-party digital services: services provided by external publishers or platforms.",
              "Digital mandate: the technical task entrusted by the User to Aureus Prime to configure, facilitate, pay for or make available access to a Third-party digital service according to the User's instructions.",
              "Auri wallet: internal wallet denominated in Auri and used only for platform payments.",
              "Auri: internal unit of account and infrastructure utility token. 1 Auri = 1 XAF. Auri is not cryptocurrency, is not standalone electronic money and cannot be exchanged outside the platform.",
              "Mobile Money / PayPal: payment methods used only to top up the Aureus Prime wallet.",
            ],
          },
        ],
      },
      {
        title: "3. Acceptance of the Terms",
        blocks: [
          { type: "paragraph", text: "These Terms are accepted through account creation, order confirmation or use of the services." },
          {
            type: "paragraph",
            text: "The applicable Terms are those in force on the date of use. Aureus Prime may update them at any time, with changes taking effect once published on the site.",
          },
        ],
      },
      {
        title: "4. Description of services",
        blocks: [
          {
            type: "list",
            items: [
              "a catalog of third-party digital subscriptions;",
              "Auri wallet top-ups, history and payments;",
              "subscription payment facilitation through the wallet;",
              "user account management;",
              "referral and loyalty features;",
              "customer support.",
            ],
          },
          {
            type: "note",
            text: "Aureus Prime is not responsible for the content, quality or availability of third-party digital services.",
          },
        ],
      },
      {
        title: "5. Subscription types",
        blocks: [
          {
            type: "paragraph",
            text: "Services available through Aureus Prime may include personal subscriptions intended for individual use and shared subscriptions allowing access to several users under third-party provider rules.",
          },
          {
            type: "paragraph",
            text: "When available, shared subscriptions may provide separate user experiences such as profiles, history or preferences. This depends entirely on the third-party provider.",
          },
        ],
      },
      {
        title: "6. Order process",
        blocks: [
          {
            type: "ordered",
            items: [
              "Create a user account.",
              "Top up the Aureus Prime wallet through Mobile Money or PayPal.",
              "Select the third-party digital service.",
              "Confirm the order.",
              "Pay from the wallet in Auri.",
              "Activate the subscription and receive access details when available.",
            ],
          },
        ],
      },
      {
        title: "7. Prices and payment",
        blocks: [
          {
            type: "list",
            items: [
              "Prices are displayed in Auri, with 1 Auri = 1 XAF, taxes included where applicable.",
              "Subscription payments go through the Aureus Prime wallet.",
              "Mobile Money and PayPal are used only to top up the wallet.",
              "Aureus Prime does not store payment PINs or secret payment credentials.",
            ],
          },
          {
            type: "paragraph",
            text: "The total price may include the subscription cost and Aureus Prime service fees for intermediation, technical management, transaction security and support.",
          },
          { type: "subheading", text: "7.3. Price changes" },
          {
            type: "paragraph",
            text: "Prices for Third-party digital services may change at any time depending on decisions by third-party providers, rates, taxes, geographic restrictions, availability, operational costs or access conditions imposed by those providers. When the change comes from a third-party provider or external constraint, Aureus Prime may apply the new price immediately to new orders and renewals that have not yet been paid.",
          },
          {
            type: "paragraph",
            text: "When the price change results from Aureus Prime's own decision, including changes to service fees or internal commercial policy, Aureus Prime applies the change prospectively and provides reasonable prior information when the change affects an automatic renewal. The new price never applies retroactively to a period already paid.",
          },
          {
            type: "paragraph",
            text: "An already paid order keeps the amount confirmed at the time of the transaction. For renewals, the applicable price is the price displayed at the time of renewal or the amount already frozen/reserved in the wallet when the system has previously blocked funds for that operation.",
          },
          { type: "subheading", text: "7.4. Final delivery of wallet top-ups" },
          {
            type: "paragraph",
            text: "Third-party payment services, including Mobile Money, MTN MoMo, Orange Money, Wave, Airtel Money and PayPal, are used exclusively by the User to purchase the internal account unit called Auri. The financial sale is deemed fully performed and delivered at the precise moment the User's Aureus Prime wallet is credited with the corresponding Auri amount.",
          },
          {
            type: "paragraph",
            text: "Auri is an internal infrastructure utility token, non-refundable in cash after wallet credit delivery and without monetary value outside the application. A later dispute concerning a Third-party digital service does not automatically justify cancellation of the original Auri purchase transaction.",
          },
        ],
      },
      {
        title: "8. User obligations",
        blocks: [
          {
            type: "list",
            items: [
              "provide accurate account information;",
              "use the services in compliance with applicable law;",
              "respect the terms of third-party providers;",
              "keep Aureus Prime login credentials secure;",
              "ensure sufficient wallet balance before confirming an order;",
              "contact third-party providers directly for issues related to their own service.",
            ],
          },
        ],
      },
      {
        title: "9. Aureus Prime liability",
        blocks: [
          {
            type: "paragraph",
            text: "Aureus Prime acts as an intermediary. Its liability is limited to payment and management facilitation.",
          },
          {
            type: "list",
            items: [
              "Aureus Prime is not liable for third-party services;",
              "interruptions or failures of third-party platforms;",
              "Mobile Money or PayPal operator incidents;",
              "indirect damages;",
              "force majeure events.",
            ],
          },
        ],
      },
      {
        title: "10. Refund policy",
        blocks: [
          {
            type: "paragraph",
            text: "Refund conditions, deadlines and process are defined in the separate Refund Policy available at aureusprime.com/remboursement.",
          },
          {
            type: "note",
            text: "In case of discrepancy between these Terms and the Refund Policy, the Refund Policy prevails for anything related to compensation and refunds.",
          },
        ],
      },
      {
        title: "11. Intellectual property",
        blocks: [
          {
            type: "paragraph",
            text: "Website content, text, images, logos, interface elements and the Auri mascot are protected by intellectual property law. Unauthorized reproduction or use is prohibited.",
          },
        ],
      },
      {
        title: "12. Personal data",
        blocks: [
          {
            type: "paragraph",
            text: "Personal data collection and processing are governed by the Aureus Prime Privacy Policy.",
          },
        ],
      },
      {
        title: "13. Applicable law and jurisdiction",
        blocks: [
          {
            type: "paragraph",
            text: "These Terms are governed by the laws of the Republic of Cameroon. Disputes fall under the competent courts of Douala, Cameroon, after an attempt at amicable resolution.",
          },
        ],
      },
      {
        title: "14. Contact",
        blocks: [
          { type: "paragraph", text: "For questions about these Terms of Sale:" },
          { type: "list", items: ["support@aureusprime.com", "+237 676 025 127", "aureusprime.com"] },
        ],
      },
    ],
    closing: "Aureus Prime simplifies, secures and centralizes subscriptions. The service is clear, and so are the rules.",
  },
  privacy: {
    title: "Privacy Policy",
    subtitle: "aureusprime.com - Digital subscription platform",
    effectiveDate: "August 14, 2026",
    intro: [
      "At Aureus Prime, privacy is a core part of trust. We collect only the data needed to operate our services, without abusive use, resale or hidden geolocation.",
      "This Privacy Policy explains how we collect, use, share and protect data when you use our website, subdomains and applications.",
    ],
    sections: [
      {
        title: "1. Who we are",
        blocks: [
          {
            type: "paragraph",
            text: "Aureus Prime is a Cameroonian digital platform that facilitates management, payment and tracking of third-party digital subscriptions.",
          },
          {
            type: "paragraph",
            text: "Aureus Prime is not the provider of the listed digital services and acts as an intermediary and payment facilitator.",
          },
        ],
      },
      {
        title: "2. Data we collect",
        blocks: [
          { type: "paragraph", text: "We apply a minimal and useful collection approach." },
          { type: "subheading", text: "2.1 Data provided directly by users" },
          {
            type: "paragraph",
            text: "When creating and using an account, we may collect a customer identifier, optional username, first name, last name, email address and phone number with country code.",
          },
          { type: "subheading", text: "2.2 Payment and wallet data" },
          {
            type: "paragraph",
            text: "We collect top-up history, amounts, dates, transaction statuses and subscriptions paid through the wallet.",
          },
          {
            type: "list",
            items: ["we never store Mobile Money PINs;", "we never store PayPal credentials;", "we never store sensitive bank details."],
          },
          { type: "subheading", text: "2.3 Subscription data" },
          {
            type: "list",
            items: ["active or expired subscriptions;", "Auri payment history;", "referral and loyalty data."],
          },
          { type: "subheading", text: "2.4 Limited technical data" },
          {
            type: "paragraph",
            text: "For security and performance, we may collect device type, browser, operating system, technical login logs and locally stored cache or Service Worker data.",
          },
        ],
      },
      {
        title: "3. How we use your data",
        blocks: [
          {
            type: "list",
            items: [
              "create and manage the user account;",
              "manage the Auri wallet;",
              "facilitate subscription payment and tracking;",
              "manage referrals and loyalty;",
              "secure the platform and prevent fraud;",
              "provide customer support;",
              "comply with legal obligations.",
            ],
          },
          { type: "note", text: "No hidden commercial exploitation." },
        ],
      },
      {
        title: "4. Data sharing",
        blocks: [
          { type: "paragraph", text: "Aureus Prime does not sell or rent personal data." },
          {
            type: "list",
            items: [
              "data may be shared with payment providers for top-up processing;",
              "with third-party digital services only when needed to activate or manage a subscription;",
              "with technical providers under confidentiality obligations;",
              "when required by law or legal proceedings;",
              "in case of business restructuring or transfer.",
            ],
          },
        ],
      },
      {
        title: "5. Data security",
        blocks: [
          {
            type: "list",
            items: [
              "HTTPS/TLS encryption for sensitive exchanges;",
              "strict access controls;",
              "HMAC verification for payment webhooks;",
              "atomic wallet transactions to avoid loss or duplication;",
              "appropriate organizational safeguards.",
            ],
          },
          {
            type: "paragraph",
            text: "No system is infallible, but we apply strict and responsible standards.",
          },
        ],
      },
      {
        title: "6. Your rights",
        blocks: [
          {
            type: "list",
            items: [
              "right of access;",
              "right to rectification;",
              "right to deletion;",
              "right to restriction of processing;",
              "right to portability;",
              "right to object, especially to marketing communications.",
            ],
          },
          { type: "paragraph", text: "Requests can be sent to support@aureusprime.com." },
        ],
      },
      {
        title: "7. Data retention",
        blocks: [
          {
            type: "paragraph",
            text: "Data is kept while the account is active, according to legal requirements for financial records, and for the period strictly needed for support and security.",
          },
        ],
      },
      {
        title: "8. Cookies and similar technologies",
        blocks: [
          {
            type: "paragraph",
            text: "We use mainly functional and technical storage: secure session cookies, localStorage for authentication persistence and Service Worker storage for offline app behavior.",
          },
        ],
      },
      {
        title: "9. Policy updates",
        blocks: [
          {
            type: "paragraph",
            text: "This Privacy Policy may be updated at any time. Updates are published with a new effective date on the website.",
          },
        ],
      },
      {
        title: "10. Contact",
        blocks: [
          { type: "paragraph", text: "For questions about privacy:" },
          { type: "list", items: ["support@aureusprime.com", "+237 676 025 127", "aureusprime.com"] },
        ],
      },
    ],
    closing: "Your data is not a bargaining chip. It is used only to operate the service properly.",
  },
  refund: {
    title: "Refund Policy",
    subtitle: "aureusprime.com - Digital subscription platform",
    effectiveDate: "August 14, 2026",
    intro: [
      "Aureus Prime works to ensure user satisfaction. This Refund Policy defines when a refund may be granted for subscriptions purchased through the platform.",
      "Please read this policy carefully before making a purchase.",
    ],
    sections: [
      {
        title: "1. Nature of Aureus Prime services",
        blocks: [
          {
            type: "paragraph",
            text: "Aureus Prime acts only as a payment facilitator for subscriptions to third-party digital services.",
          },
          {
            type: "list",
            items: [
              "Aureus Prime is not the direct provider of these services.",
              "The subscription relationship is between the user and the third-party provider.",
            ],
          },
          {
            type: "paragraph",
            text: "Once a subscription is activated and access details are delivered, access and use are managed by the third-party provider.",
          },
          {
            type: "paragraph",
            text: "The User acknowledges the technological uncertainty attached to Third-party digital services, including protocol changes, geoblocking, account-sharing policies, restrictions or suspensions decided by third-party publishers. These events are not automatically treated as non-delivery by Aureus Prime once Auri credit or access details have been correctly delivered.",
          },
        ],
      },
      {
        title: "2. General refund conditions",
        blocks: [
          {
            type: "paragraph",
            text: "Because Aureus Prime acts as an intermediary, a refund may be considered only in limited cases.",
          },
          { type: "subheading", text: "Possible refund - non-delivery of service" },
          {
            type: "list",
            items: [
              "payment was successfully completed through Aureus Prime;",
              "access details were not delivered within 24 hours after payment;",
              "the non-delivery is attributable to Aureus Prime or a platform technical issue.",
            ],
          },
          { type: "subheading", text: "Request deadline" },
          {
            type: "paragraph",
            text: "A refund request must be submitted within 7 calendar days from the transaction date if the service was not delivered.",
          },
          { type: "subheading", text: "Required evidence" },
          {
            type: "list",
            items: [
              "screenshots showing no access details in the subscriptions area;",
              "any error messages;",
              "payment confirmation without corresponding delivery.",
            ],
          },
        ],
      },
      {
        title: "3. Cases where no refund is granted",
        blocks: [
          {
            type: "paragraph",
            text: "Third-party uncertainty and no cash refund: the User acknowledges that third-party publishers may change protocols, geoblocking or account-sharing rules at any time. If a third-party service is interrupted after successful delivery of access details, no cash refund to Mobile Money accounts will be granted. Aureus Prime will provide internal compensation only, through reassignment of functional access or equivalent Auri credit to the internal wallet.",
          },
          {
            type: "list",
            items: [
              "change of mind after successful delivery of access details;",
              "issues related to third-party services such as quality, content, availability, bugs or regional restrictions;",
              "violation of third-party provider terms;",
              "user error, such as selecting the wrong subscription or entering incorrect information;",
              "expired subscription or already consumed period;",
              "user internet connection or device issues;",
              "suspension due to improper use of a shared subscription;",
              "service fees, except in case of proven platform failure preventing service delivery.",
            ],
          },
        ],
      },
      {
        title: "4. Refund request process",
        blocks: [
          { type: "subheading", text: "Step 1 - Contact Aureus Prime support" },
          { type: "list", items: ["WhatsApp: +237 676 025 127", "Email: support@aureusprime.com"] },
          { type: "subheading", text: "Step 2 - Provide the following information" },
          {
            type: "list",
            items: [
              "name and email address linked to the Aureus Prime account;",
              "transaction or order number;",
              "third-party digital service concerned;",
              "transaction date and time;",
              "clear description of the issue;",
              "useful evidence such as screenshots or error messages.",
            ],
          },
          { type: "subheading", text: "Step 3 - Review" },
          {
            type: "paragraph",
            text: "Our team reviews requests within a maximum of 48 business hours. Additional information may be requested if necessary.",
          },
          { type: "subheading", text: "Step 4 - Decision" },
          {
            type: "paragraph",
            text: "The decision is communicated by email or WhatsApp. If approved, the refund is initiated according to the methods below.",
          },
        ],
      },
      {
        title: "5. Refund methods",
        blocks: [
          { type: "paragraph", text: "If compensation is approved, it is applied primarily within the Aureus Prime ecosystem:" },
          { type: "subheading", text: "Option A - Refund in Auri" },
          {
            type: "paragraph",
            text: "The amount is credited back immediately to the user's Auri wallet and can be used for another available service.",
          },
          { type: "subheading", text: "Option B - Reassignment or replacement" },
          {
            type: "paragraph",
            text: "When the delivered service becomes unavailable because of a third-party technical or policy issue, Aureus Prime may offer functional reassignment, a replacement slot or an equivalent available service.",
          },
          {
            type: "note",
            text: "External cash refund is not the normal compensation method after Auri or access details have been delivered. It may occur only where mandatory law requires it or by an exceptional documented decision of Aureus Prime.",
          },
        ],
      },
      {
        title: "6. Aureus Prime commitment",
        blocks: [
          {
            type: "list",
            items: [
              "respond to support requests within 2 business hours via WhatsApp;",
              "process legitimate refund requests within 48 business hours;",
              "offer an alternative solution, such as reassignment or replacement service, before refunding where appropriate;",
              "maintain an automatic delivery rate above 95%.",
            ],
          },
        ],
      },
      {
        title: "7. Policy updates",
        blocks: [
          {
            type: "paragraph",
            text: "Aureus Prime may update this Refund Policy at any time. Any change is published on the site with a new effective date.",
          },
        ],
      },
      {
        title: "8. Contact",
        blocks: [
          { type: "paragraph", text: "For questions about this Refund Policy:" },
          { type: "list", items: ["support@aureusprime.com", "WhatsApp: +237 676 025 127", "aureusprime.com"] },
        ],
      },
    ],
    closing: "We refund when the service was not delivered. We do not refund a delivered service simply because it is no longer wanted.",
  },
};

function renderBlock(block: LegalBlock) {
  if (block.type === "subheading") {
    return <h3 className="mt-7 text-lg font-black text-primary-500">{block.text}</h3>;
  }

  if (block.type === "list") {
    return (
      <ul className="mt-4 grid max-w-prose gap-3">
        {block.items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-[var(--premium-text-muted)] sm:text-base">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "ordered") {
    return (
      <ol className="mt-4 grid max-w-prose list-decimal gap-3 pl-5 text-sm leading-relaxed text-[var(--premium-text-muted)] sm:text-base">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    );
  }

  if (block.type === "note") {
    return (
      <p className="mt-5 max-w-prose rounded-2xl border border-primary-400/25 bg-primary-500/10 p-4 text-sm font-bold leading-relaxed text-[var(--premium-text)] sm:text-base">
        {block.text}
      </p>
    );
  }

  return <p className="mt-4 max-w-prose leading-relaxed text-[var(--premium-text-muted)]">{block.text}</p>;
}

export function PublicLegalDocumentPage({ page }: { page: LegalPageId }) {
  const { locale } = useI18n();
  const document = locale === "en" ? englishLegalDocs[page] : legalDocs[page];
  const effectiveDateLabel = locale === "en" ? "Effective date" : "Date d'entrée en vigueur";
  const legalEntityLocation = locale === "en" ? "Douala, Cameroon" : "Douala, Cameroun";
  const contactLabel = locale === "en" ? "Contact Aureus Prime" : "Contacter Aureus Prime";

  return (
    <PublicShell>
      <article className="py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <header className="premium-card-surface rounded-3xl border p-7 shadow-[var(--shadow-card)] sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-500">Aureus Prime</p>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--premium-text)] sm:text-5xl">
              {document.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--premium-text-muted)] sm:text-lg">
              {document.subtitle}
            </p>
            <div className="mt-6 inline-flex rounded-full border border-[var(--premium-card-border)] bg-[var(--premium-panel)] px-4 py-2 text-sm font-bold text-[var(--premium-text-muted)]">
              {effectiveDateLabel} : {document.effectiveDate}
            </div>
          </header>

          <section className="mt-8 rounded-3xl border border-[var(--premium-card-border)] bg-[var(--premium-panel)] p-6 sm:p-8">
            {document.intro.map((paragraph) => (
              <p key={paragraph} className="mb-4 last:mb-0 leading-relaxed text-[var(--premium-text-muted)]">
                {paragraph}
              </p>
            ))}
          </section>

          <div className="mt-8 grid gap-5">
            {document.sections.map((section) => (
              <section key={section.title} className="premium-card-surface rounded-3xl border p-6 shadow-[var(--shadow-card)] sm:p-8">
                <h2 className="text-2xl font-black tracking-tight text-[var(--premium-text)]">{section.title}</h2>
                {section.blocks.map((block, index) => (
                  <div key={`${section.title}-${index}`}>{renderBlock(block)}</div>
                ))}
              </section>
            ))}
          </div>

          <footer className="mt-8 rounded-3xl border border-primary-400/25 bg-primary-500/10 p-6 text-center sm:p-8">
            <p className="text-lg font-black leading-relaxed text-[var(--premium-text)]">{document.closing}</p>
            <p className="mt-5 text-sm text-[var(--premium-text-muted)]">© {new Date().getFullYear()} Aureus Prime - MBC SARL - {legalEntityLocation}</p>
            <Link href="/contact" className="premium-primary-cta mt-6 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-bold">
              {contactLabel}
            </Link>
          </footer>
        </div>
      </article>
    </PublicShell>
  );
}

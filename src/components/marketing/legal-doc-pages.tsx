"use client";

import Link from "next/link";
import { PublicShell } from "@/components/marketing/public-pages";

type LegalPageId = "terms" | "privacy" | "refund";

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
  terms: {
    title: "Conditions Générales de Vente (CGV)",
    subtitle: "aureusprime.com - Plateforme d'abonnements digitaux",
    effectiveDate: "Mai 2026",
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
              "Abonnement : contrat conclu directement entre l'utilisateur et le fournisseur du service numérique tiers.",
              "Wallet Aureus Prime : portefeuille électronique interne libellé en Auri, utilisé exclusivement pour le paiement des services.",
              "Auri : unité de compte interne d'Aureus Prime. 1 Auri = 1 Franc CFA (XAF). Les Auri ne sont pas une cryptomonnaie et ne peuvent être échangés en dehors de la plateforme.",
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
            text: "Les conditions de remboursement sont définies dans la Politique de Remboursement distincte disponible sur le site.",
          },
          {
            type: "list",
            items: [
              "Remboursement possible uniquement en cas de non-activation du service dans les 24h suivant le paiement, si la cause est imputable à Aureus Prime.",
              "Le remboursement peut être effectué en Auri sur le wallet ou en Mobile Money selon la préférence de l'utilisateur.",
              "Toute demande doit être soumise dans les 7 jours calendaires suivant la transaction.",
            ],
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
          { type: "list", items: ["contact@aureusprime.com", "+237 676 025 127", "aureusprime.com"] },
        ],
      },
    ],
    closing: "Aureus Prime simplifie, sécurise et centralise. Le service est clair, les règles aussi.",
  },
  privacy: {
    title: "Politique de Confidentialité",
    subtitle: "aureusprime.com - Plateforme d'abonnements digitaux",
    effectiveDate: "Mai 2026",
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
          { type: "paragraph", text: "Toute demande peut être adressée à contact@aureusprime.com." },
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
          { type: "list", items: ["contact@aureusprime.com", "+237 676 025 127", "aureusprime.com"] },
        ],
      },
    ],
    closing: "Tes données ne sont pas une monnaie d'échange. Elles servent uniquement à faire fonctionner le service proprement.",
  },
  refund: {
    title: "Politique de Remboursement",
    subtitle: "aureusprime.com - Plateforme d'abonnements digitaux",
    effectiveDate: "Mai 2026",
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
          { type: "list", items: ["WhatsApp : +237 676 025 127", "E-mail : contact@aureusprime.com"] },
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
          { type: "paragraph", text: "Si la demande est approuvée, l'utilisateur peut choisir entre :" },
          { type: "subheading", text: "Option A - Remboursement en Auri" },
          {
            type: "paragraph",
            text: "Le montant est recrédité immédiatement sur le wallet Auri de l'utilisateur. L'utilisateur peut immédiatement souscrire à un autre service disponible sur la plateforme.",
          },
          { type: "subheading", text: "Option B - Remboursement en Mobile Money" },
          {
            type: "paragraph",
            text: "Le montant est recrédité sur le compte Mobile Money utilisé lors du paiement initial. Le délai de réception dépend de l'opérateur Mobile Money, généralement 1 à 3 jours ouvrables après validation.",
          },
          {
            type: "note",
            text: "Les frais de transfert éventuels appliqués par l'opérateur Mobile Money sont à la charge de l'utilisateur pour l'option B.",
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
          { type: "list", items: ["contact@aureusprime.com", "WhatsApp : +237 676 025 127", "aureusprime.com"] },
        ],
      },
    ],
    closing: "On rembourse quand le service n'a pas été livré. On ne rembourse pas un service qui fonctionne mais qui ne plaît plus.",
  },
};

function renderBlock(block: LegalBlock) {
  if (block.type === "subheading") {
    return <h3 className="mt-7 text-lg font-black text-primary-500">{block.text}</h3>;
  }

  if (block.type === "list") {
    return (
      <ul className="mt-4 grid gap-3">
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
      <ol className="mt-4 grid list-decimal gap-3 pl-5 text-sm leading-relaxed text-[var(--premium-text-muted)] sm:text-base">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    );
  }

  if (block.type === "note") {
    return (
      <p className="mt-5 rounded-2xl border border-primary-400/25 bg-primary-500/10 p-4 text-sm font-bold leading-relaxed text-[var(--premium-text)] sm:text-base">
        {block.text}
      </p>
    );
  }

  return <p className="mt-4 leading-relaxed text-[var(--premium-text-muted)]">{block.text}</p>;
}

export function PublicLegalDocumentPage({ page }: { page: LegalPageId }) {
  const document = legalDocs[page];

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
              Date d&apos;entrée en vigueur : {document.effectiveDate}
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
            <p className="mt-5 text-sm text-[var(--premium-text-muted)]">© 2026 Aureus Prime - MBC SARL - Douala, Cameroun</p>
            <Link href="/contact" className="premium-primary-cta mt-6 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-bold">
              Contacter Aureus Prime
            </Link>
          </footer>
        </div>
      </article>
    </PublicShell>
  );
}

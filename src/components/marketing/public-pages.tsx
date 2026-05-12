"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ServiceIllustration } from "@/components/dashboard/service-illustration";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { fetchCatalogProducts, type CatalogProduct } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";

type PublicPageId = "about" | "help" | "terms" | "privacy" | "contact";

type StaticPageCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  highlights: Array<{ icon: string; label: string; value: string }>;
  sections: Array<{ title: string; body: string; points: string[] }>;
  ctaTitle: string;
  ctaText: string;
  ctaLabel: string;
};

const shellCopy = {
  fr: {
    navHome: "Accueil",
    navOffers: "Catalogue",
    navBenefits: "FAQ",
    login: "Se connecter",
    order: "Commander",
    footerText: "Aureus Prime centralise vos abonnements digitaux, votre wallet Auri et la livraison de vos accès.",
    footerNavigation: "Navigation",
    footerSupport: "Support",
    footerLegal: "Légal",
    footerContact: "Contact",
    supportHours: "Support 7j/7",
    delivery: "Livraison après validation",
    rechargeTitle: "Recharges acceptées",
    rechargeText: "Mobile Money africain, cartes et paiements partenaires.",
    rights: "Tous droits réservés.",
    home: "Accueil",
    blog: "Blog",
    about: "À propos",
    help: "Centre d'aide",
    terms: "Conditions générales",
    privacy: "Politique de confidentialité",
    contact: "Contact",
  },
  en: {
    navHome: "Home",
    navOffers: "Catalog",
    navBenefits: "FAQ",
    login: "Sign in",
    order: "Order",
    footerText: "Aureus Prime centralizes your digital subscriptions, Auri wallet and access delivery.",
    footerNavigation: "Navigation",
    footerSupport: "Support",
    footerLegal: "Legal",
    footerContact: "Contact",
    supportHours: "7-day support",
    delivery: "Delivery after validation",
    rechargeTitle: "Accepted top-ups",
    rechargeText: "African Mobile Money, cards and partner payments.",
    rights: "All rights reserved.",
    home: "Home",
    blog: "Blog",
    about: "About",
    help: "Help center",
    terms: "Terms",
    privacy: "Privacy policy",
    contact: "Contact",
  },
} as const;

const staticPages: Record<"fr" | "en", Record<PublicPageId, StaticPageCopy>> = {
  fr: {
    about: {
      eyebrow: "Plateforme",
      title: "À propos d'Aureus Prime",
      subtitle:
        "Aureus Prime rend les services premium plus accessibles en réunissant catalogue, wallet, abonnements et suivi des accès dans une seule expérience.",
      highlights: [
        { icon: "subscriptions", label: "Catalogue", value: "Streaming, musique, cloud, IA" },
        { icon: "account_balance_wallet", label: "Wallet", value: "Paiement rapide en Auri" },
        { icon: "verified_user", label: "Suivi", value: "Accès et souscriptions centralisés" },
      ],
      sections: [
        {
          title: "Ce que nous faisons",
          body: "Nous simplifions l'achat d'abonnements digitaux en proposant des formules claires, des prix accessibles et un suivi après achat.",
          points: ["Catalogue groupé par service", "Paiement par wallet Auri", "Historique des commandes et abonnements", "Support pour les accès livrés"],
        },
        {
          title: "Une expérience pensée pour le client",
          body: "Le client n'a pas à chercher ses informations partout : commandes, solde, parrainage, KYC étudiant et identifiants livrés restent dans son espace.",
          points: ["Dashboard mobile-first", "Notifications utiles", "Parrainage avec récompense Auri", "KYC étudiant pour les offres éligibles"],
        },
      ],
      ctaTitle: "Prêt à rejoindre Aureus Prime ?",
      ctaText: "Créez votre compte, rechargez votre wallet et choisissez votre premier service premium.",
      ctaLabel: "Créer mon compte",
    },
    help: {
      eyebrow: "Support",
      title: "Centre d'aide",
      subtitle:
        "Les réponses essentielles pour acheter, suivre une souscription, gérer votre wallet Auri et retrouver vos accès.",
      highlights: [
        { icon: "shopping_bag", label: "Commandes", value: "Suivi depuis le dashboard" },
        { icon: "key", label: "Accès", value: "Identifiants visibles après livraison" },
        { icon: "school", label: "KYC", value: "Validation étudiant si nécessaire" },
      ],
      sections: [
        {
          title: "Acheter un service",
          body: "Choisissez une offre dans le catalogue, confirmez votre formule puis payez depuis votre wallet Auri.",
          points: ["Rechargez le wallet si besoin", "Validez la commande", "Suivez l'état dans vos souscriptions"],
        },
        {
          title: "Retrouver ses accès",
          body: "Les credentials livrés sont centralisés dans la fiche de souscription. Certains services peuvent nécessiter une assignation manuelle.",
          points: ["Ouvrez Abonnements", "Sélectionnez le service", "Consultez les identifiants, code ou lien d'activation"],
        },
        {
          title: "Quand contacter le support",
          body: "Contactez-nous si un paiement est validé mais non livré, si un accès ne fonctionne plus ou si votre KYC étudiant reste bloqué.",
          points: ["Commande payée sans accès", "Réassignation nécessaire", "Justificatif étudiant à vérifier"],
        },
      ],
      ctaTitle: "Besoin d'aide sur une commande ?",
      ctaText: "Connectez-vous pour retrouver vos commandes et préparer les informations utiles au support.",
      ctaLabel: "Ouvrir mon espace",
    },
    terms: {
      eyebrow: "Cadre d'utilisation",
      title: "Conditions générales",
      subtitle:
        "Ces conditions résument les règles d'utilisation d'Aureus Prime pour les comptes, commandes, wallets, abonnements et services livrés.",
      highlights: [
        { icon: "gavel", label: "Règles", value: "Utilisation loyale du service" },
        { icon: "payments", label: "Paiement", value: "Solde Auri et commandes" },
        { icon: "lock", label: "Accès", value: "Identifiants personnels ou partagés" },
      ],
      sections: [
        {
          title: "Compte et sécurité",
          body: "Chaque utilisateur est responsable des informations fournies, de la confidentialité de son compte et du respect des services achetés.",
          points: ["Email valide recommandé", "Mot de passe sécurisé", "Interdiction de revendre ou publier les accès livrés"],
        },
        {
          title: "Commandes et wallet Auri",
          body: "Les achats peuvent être réglés via le solde Auri. Les remboursements, gestes commerciaux ou corrections peuvent être crédités sur le wallet.",
          points: ["Le solde Auri sert aux achats internes", "Une commande peut attendre une validation ou une assignation", "Les montants affichés peuvent dépendre de la formule choisie"],
        },
        {
          title: "Souscriptions et livraison",
          body: "Les accès sont livrés sous forme d'identifiants, de codes ou de liens selon le service. Une réassignation peut être faite si un slot devient indisponible.",
          points: ["Respecter les limites du service", "Ne pas modifier les mots de passe partagés", "Signaler tout accès défaillant rapidement"],
        },
      ],
      ctaTitle: "Une question avant achat ?",
      ctaText: "Consultez le centre d'aide ou contactez-nous avant de valider votre commande.",
      ctaLabel: "Contacter le support",
    },
    privacy: {
      eyebrow: "Données",
      title: "Politique de confidentialité",
      subtitle:
        "Aureus Prime collecte uniquement les données nécessaires au compte client, aux paiements, aux souscriptions, au support et à l'amélioration du service.",
      highlights: [
        { icon: "badge", label: "Compte", value: "Nom, email, téléphone si fourni" },
        { icon: "receipt_long", label: "Commandes", value: "Historique et wallet" },
        { icon: "analytics", label: "Analyse", value: "Mesure d'usage via Vercel" },
      ],
      sections: [
        {
          title: "Données utilisées",
          body: "Nous utilisons les informations utiles pour créer le compte, sécuriser l'accès, traiter les commandes et afficher le contenu dans la bonne langue.",
          points: ["Profil client", "Historique wallet et commandes", "Préférence de langue et thème", "Événements techniques et analytiques"],
        },
        {
          title: "KYC étudiant",
          body: "Lorsque vous demandez une offre étudiante, un justificatif peut être transmis pour vérification. Il doit servir uniquement à confirmer l'éligibilité.",
          points: ["Document consulté par l'administration", "Validation ou refus avec motif", "Renouvellement possible si expiré"],
        },
        {
          title: "Sécurité et cookies",
          body: "La langue, le thème et certaines informations de session sont mémorisés pour fluidifier l'expérience. Vous pouvez nettoyer ces données depuis votre navigateur.",
          points: ["Préférence de langue en cookie", "Thème en stockage local", "Token de session côté navigateur", "Analytics pour comprendre l'usage global"],
        },
      ],
      ctaTitle: "Gardez le contrôle",
      ctaText: "Depuis votre compte, vous pouvez mettre à jour vos informations et gérer votre sécurité.",
      ctaLabel: "Aller au compte",
    },
    contact: {
      eyebrow: "Assistance",
      title: "Contact",
      subtitle:
        "Pour une réponse rapide, préparez le service concerné, l'email du compte Aureus Prime et le numéro de commande si vous l'avez.",
      highlights: [
        { icon: "support_agent", label: "Support", value: "Commandes et accès" },
        { icon: "sync_alt", label: "Réassignation", value: "Slot ou credential défaillant" },
        { icon: "verified", label: "KYC", value: "Document étudiant" },
      ],
      sections: [
        {
          title: "Commandes et abonnements",
          body: "Contactez le support si votre commande est payée mais non livrée, si un accès ne fonctionne plus ou si une souscription doit être réassignée.",
          points: ["Email du compte", "Service acheté", "Capture ou détail du problème"],
        },
        {
          title: "Wallet et remboursement",
          body: "Pour une correction de solde ou un remboursement en Auri, indiquez la transaction ou commande concernée.",
          points: ["Montant", "Date approximative", "Mode de paiement ou recharge"],
        },
        {
          title: "Partenariats",
          body: "Pour proposer un service, une offre ou une collaboration, envoyez un résumé clair de votre besoin.",
          points: ["Nom de l'organisation", "Offre proposée", "Contact de suivi"],
        },
      ],
      ctaTitle: "Accéder à votre espace",
      ctaText: "Le dashboard contient les informations les plus utiles pour traiter votre demande rapidement.",
      ctaLabel: "Se connecter",
    },
  },
  en: {
    about: {
      eyebrow: "Platform",
      title: "About Aureus Prime",
      subtitle:
        "Aureus Prime makes premium services more accessible by bringing catalog, wallet, subscriptions and access tracking into one experience.",
      highlights: [
        { icon: "subscriptions", label: "Catalog", value: "Streaming, music, cloud, AI" },
        { icon: "account_balance_wallet", label: "Wallet", value: "Fast Auri payments" },
        { icon: "verified_user", label: "Tracking", value: "Centralized access and plans" },
      ],
      sections: [
        {
          title: "What we do",
          body: "We simplify digital subscription purchases with clear plans, accessible prices and post-purchase tracking.",
          points: ["Catalog grouped by service", "Auri wallet payment", "Order and subscription history", "Support for delivered access"],
        },
        {
          title: "Designed around the customer",
          body: "Customers can keep orders, balance, referrals, student KYC and delivered credentials in one space.",
          points: ["Mobile-first dashboard", "Useful notifications", "Auri referral reward", "Student KYC for eligible offers"],
        },
      ],
      ctaTitle: "Ready to join Aureus Prime?",
      ctaText: "Create your account, top up your wallet and choose your first premium service.",
      ctaLabel: "Create my account",
    },
    help: {
      eyebrow: "Support",
      title: "Help center",
      subtitle: "Essential answers for buying, tracking a subscription, managing your Auri wallet and finding your access.",
      highlights: [
        { icon: "shopping_bag", label: "Orders", value: "Tracked from the dashboard" },
        { icon: "key", label: "Access", value: "Credentials after delivery" },
        { icon: "school", label: "KYC", value: "Student validation if needed" },
      ],
      sections: [
        {
          title: "Buying a service",
          body: "Pick an offer from the catalog, confirm your plan and pay from your Auri wallet.",
          points: ["Top up the wallet if needed", "Confirm the order", "Track the status in your subscriptions"],
        },
        {
          title: "Finding your access",
          body: "Delivered credentials are centralized in the subscription detail. Some services may require manual assignment.",
          points: ["Open Subscriptions", "Select the service", "View credentials, code or activation link"],
        },
        {
          title: "When to contact support",
          body: "Contact us if a payment is validated but not delivered, if access stops working or if your student KYC is blocked.",
          points: ["Paid order without access", "Reassignment needed", "Student document to verify"],
        },
      ],
      ctaTitle: "Need help with an order?",
      ctaText: "Sign in to find your orders and prepare the useful support details.",
      ctaLabel: "Open my space",
    },
    terms: {
      eyebrow: "Usage rules",
      title: "Terms",
      subtitle: "These terms summarize the rules for Aureus Prime accounts, orders, wallets, subscriptions and delivered services.",
      highlights: [
        { icon: "gavel", label: "Rules", value: "Fair use of the service" },
        { icon: "payments", label: "Payment", value: "Auri balance and orders" },
        { icon: "lock", label: "Access", value: "Personal or shared credentials" },
      ],
      sections: [
        {
          title: "Account and security",
          body: "Each user is responsible for provided information, account confidentiality and respecting purchased services.",
          points: ["Valid email recommended", "Secure password", "No resale or public sharing of delivered access"],
        },
        {
          title: "Orders and Auri wallet",
          body: "Purchases can be paid from the Auri balance. Refunds, gestures or corrections may be credited to the wallet.",
          points: ["Auri balance is used for internal purchases", "An order can wait for validation or assignment", "Displayed amounts can depend on the selected plan"],
        },
        {
          title: "Subscriptions and delivery",
          body: "Access is delivered as credentials, codes or links depending on the service. Reassignment can happen when a slot becomes unavailable.",
          points: ["Respect service limits", "Do not change shared account passwords", "Report faulty access quickly"],
        },
      ],
      ctaTitle: "Question before buying?",
      ctaText: "Check the help center or contact us before validating your order.",
      ctaLabel: "Contact support",
    },
    privacy: {
      eyebrow: "Data",
      title: "Privacy policy",
      subtitle:
        "Aureus Prime only collects data needed for customer accounts, payments, subscriptions, support and service improvement.",
      highlights: [
        { icon: "badge", label: "Account", value: "Name, email, phone if provided" },
        { icon: "receipt_long", label: "Orders", value: "History and wallet" },
        { icon: "analytics", label: "Analytics", value: "Usage measurement via Vercel" },
      ],
      sections: [
        {
          title: "Data we use",
          body: "We use helpful information to create the account, secure access, process orders and display content in the right language.",
          points: ["Customer profile", "Wallet and order history", "Language and theme preference", "Technical and analytics events"],
        },
        {
          title: "Student KYC",
          body: "When you request a student offer, a document may be submitted for verification. It should only confirm eligibility.",
          points: ["Document reviewed by administration", "Approval or rejection with reason", "Renewal possible when expired"],
        },
        {
          title: "Security and cookies",
          body: "Language, theme and some session information are remembered to smooth the experience. You can clear them from your browser.",
          points: ["Language preference in cookie", "Theme in local storage", "Session token in browser storage", "Analytics to understand overall usage"],
        },
      ],
      ctaTitle: "Stay in control",
      ctaText: "From your account, you can update your details and manage security.",
      ctaLabel: "Go to account",
    },
    contact: {
      eyebrow: "Assistance",
      title: "Contact",
      subtitle: "For a faster answer, prepare the service, your Aureus Prime email and the order number if you have it.",
      highlights: [
        { icon: "support_agent", label: "Support", value: "Orders and access" },
        { icon: "sync_alt", label: "Reassignment", value: "Faulty slot or credential" },
        { icon: "verified", label: "KYC", value: "Student document" },
      ],
      sections: [
        {
          title: "Orders and subscriptions",
          body: "Contact support if your order is paid but not delivered, if access no longer works or if a subscription must be reassigned.",
          points: ["Account email", "Purchased service", "Screenshot or problem details"],
        },
        {
          title: "Wallet and refunds",
          body: "For a balance correction or Auri refund, provide the related transaction or order.",
          points: ["Amount", "Approximate date", "Payment or top-up method"],
        },
        {
          title: "Partnerships",
          body: "To suggest a service, offer or collaboration, send a clear summary of your need.",
          points: ["Organization name", "Proposed offer", "Follow-up contact"],
        },
      ],
      ctaTitle: "Access your space",
      ctaText: "The dashboard contains the most useful information to process your request quickly.",
      ctaLabel: "Sign in",
    },
  },
};

const blogCopy = {
  fr: {
    eyebrow: "Guides",
    title: "Blog Aureus Prime",
    subtitle: "Des guides courts pour mieux choisir vos offres, utiliser votre wallet et suivre vos accès.",
    read: "Lire le guide",
    articles: [
      {
        icon: "account_balance_wallet",
        title: "Bien utiliser votre wallet Auri",
        description: "Comprendre les recharges, les paiements de commandes et les remboursements en solde Auri.",
      },
      {
        icon: "subscriptions",
        title: "Choisir la bonne formule d'abonnement",
        description: "Comparer durée, prix, type d'accès et disponibilité avant de valider votre commande.",
      },
      {
        icon: "school",
        title: "Pourquoi le KYC étudiant peut être demandé",
        description: "Certaines offres étudiantes nécessitent un justificatif pour débloquer le tarif réduit.",
      },
      {
        icon: "key",
        title: "Que faire si un accès ne fonctionne plus",
        description: "Les bons réflexes pour demander une vérification, une réassignation ou un support rapide.",
      },
    ],
  },
  en: {
    eyebrow: "Guides",
    title: "Aureus Prime Blog",
    subtitle: "Short guides to choose offers, use your wallet and track your access.",
    read: "Read guide",
    articles: [
      {
        icon: "account_balance_wallet",
        title: "Using your Auri wallet well",
        description: "Understand top-ups, order payments and refunds credited to your Auri balance.",
      },
      {
        icon: "subscriptions",
        title: "Choosing the right subscription plan",
        description: "Compare duration, price, access type and availability before confirming your order.",
      },
      {
        icon: "school",
        title: "Why student KYC may be requested",
        description: "Some student offers require proof to unlock the reduced price.",
      },
      {
        icon: "key",
        title: "What to do when access stops working",
        description: "The right steps to request verification, reassignment or fast support.",
      },
    ],
  },
} as const;

const offersCopy = {
  fr: {
    eyebrow: "Catalogue complet",
    title: "Tous nos services",
    subtitle: "Explorez les abonnements streaming, musique, cloud, IA et outils disponibles avant de créer votre compte.",
    loading: "Chargement du catalogue...",
    unavailable: "Le catalogue est indisponible pour le moment.",
    retry: "Réessayer",
    empty: "Aucune offre visible pour le moment.",
    start: "Créer un compte",
    search: "Rechercher un service...",
    all: "Tous",
    count: "{count} service(s)",
    choose: "Choisir",
  },
  en: {
    eyebrow: "Full catalog",
    title: "All our services",
    subtitle: "Browse streaming, music, cloud, AI and tool subscriptions before creating your account.",
    loading: "Loading catalog...",
    unavailable: "The catalog is unavailable right now.",
    retry: "Retry",
    empty: "No visible offer right now.",
    start: "Create account",
    search: "Search for a service...",
    all: "All",
    count: "{count} service(s)",
    choose: "Choose",
  },
} as const;

const contactCopy = {
  fr: {
    eyebrow: "Support",
    title: "Contactez-nous",
    subtitle: "Disponibles pour répondre à vos questions et vous accompagner sur vos commandes, accès, wallet et KYC.",
    back: "Retour à l'accueil",
    whatsapp: "WhatsApp",
    whatsappText: "Réponse rapide pour les commandes et accès",
    email: "Email",
    emailText: "Pour les demandes détaillées et documents",
    phone: "Téléphone",
    phoneText: "Assistance directe par appel",
    sendMessage: "Envoyer un message",
    sendEmail: "Envoyer un email",
    callNow: "Appeler maintenant",
    hoursTitle: "Horaires d'assistance",
    serviceTitle: "Zone de service",
    serviceText: "Aureus Prime est un service digital accessible depuis votre espace client. Les services sont livrés après validation de la commande.",
    countries: "Pays principaux",
    faqTitle: "Besoin d'aide supplémentaire ?",
    faqText: "Consultez notre centre d'aide pour les réponses rapides aux questions fréquentes.",
    faqButton: "Accéder à la FAQ",
    guaranteed: "Réponse traitée en priorité pendant les heures d'ouverture",
    mondayFriday: "Lundi - Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
  },
  en: {
    eyebrow: "Support",
    title: "Contact us",
    subtitle: "Available to answer questions and help with orders, access, wallet and KYC.",
    back: "Back home",
    whatsapp: "WhatsApp",
    whatsappText: "Fast response for orders and access",
    email: "Email",
    emailText: "For detailed requests and documents",
    phone: "Phone",
    phoneText: "Direct assistance by call",
    sendMessage: "Send message",
    sendEmail: "Send email",
    callNow: "Call now",
    hoursTitle: "Support hours",
    serviceTitle: "Service area",
    serviceText: "Aureus Prime is a digital service available from your customer space. Services are delivered after order validation.",
    countries: "Main countries",
    faqTitle: "Need more help?",
    faqText: "Check our help center for quick answers to frequent questions.",
    faqButton: "Open FAQ",
    guaranteed: "Priority response during opening hours",
    mondayFriday: "Monday - Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  },
} as const;

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
      {name}
    </span>
  );
}

function getShell(locale: "fr" | "en") {
  return shellCopy[locale];
}

function PublicShell({ children }: { children: React.ReactNode }) {
  const { locale } = useI18n();
  const pathname = usePathname();
  const copy = getShell(locale);
  const navItems = [
    { href: "/accueil", label: copy.navHome },
    { href: "/catalogue", label: copy.navOffers },
    { href: "/aide", label: copy.navBenefits },
    { href: "/contact", label: copy.contact },
  ];

  return (
    <main className="premium-page min-h-screen overflow-x-hidden selection:bg-primary-300 selection:text-[var(--premium-contrast)]">
      <div className="relative flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3">
            <Link
              href="/accueil"
              className="inline-flex w-max items-center rounded-full border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] px-4 py-3 shadow-[var(--shadow-card)] backdrop-blur-md"
            >
              <Image src="/logo-aureusprime.svg" alt="Aureus Prime" width={200} height={24} className="logo-dark h-6 w-auto" />
              <Image src="/logo-aureusprime-light.svg" alt="Aureus Prime" width={200} height={24} className="logo-light h-6 w-auto" />
            </Link>

            <nav className="hidden rounded-full border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] p-1 shadow-[var(--shadow-card)] backdrop-blur-md md:flex">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === "/catalogue" && pathname === "/offres");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.16em] transition-colors ${
                      isActive
                        ? "bg-primary-500 text-[var(--premium-contrast)]"
                        : "text-[var(--premium-text-muted)] hover:text-primary-500"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center justify-end gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <Link href="/register" className="hidden h-11 items-center justify-center gap-2 rounded-full bg-primary-500 px-5 text-sm font-black text-[var(--premium-contrast)] shadow-[0_18px_45px_rgba(230,184,0,0.24)] transition-colors hover:bg-primary-400 sm:flex">
                <MaterialIcon name="chat_bubble" className="text-[18px]" />
                {copy.order}
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="relative overflow-hidden bg-[#040906] px-4 py-16 text-white sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-x-0 bottom-[-3.5rem] text-center text-[18vw] font-black uppercase leading-none tracking-[-0.08em] text-transparent opacity-25 [-webkit-text-stroke:1px_rgba(230,184,0,0.22)]">
            AureusPrime
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-primary-500/12 to-transparent" />

          <div className="relative z-10 mx-auto grid max-w-7xl gap-10 border-b border-white/10 pb-12 md:grid-cols-4">
            <div>
              <Image src="/logo-aureusprime-light.svg" alt="Aureus Prime" width={200} height={24} className="h-6 w-auto" />
              <p className="mt-5 max-w-sm text-sm leading-7 text-white/50">{copy.footerText}</p>
              <div className="mt-6">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">{copy.rechargeTitle}</h2>
                <p className="mt-2 text-xs leading-5 text-white/40">{copy.rechargeText}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["MTN MoMo", "Orange Money", "Wave", "Mobile Money", "Moneroo", "PayPal"].map((method) => (
                    <span key={method} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white/70">
                      <MaterialIcon name={method === "Wave" ? "waves" : method === "PayPal" ? "payments" : "phone_iphone"} className="text-[14px] text-primary-400" />
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h2 className="mb-5 text-sm font-black uppercase tracking-[0.2em] text-white">{copy.footerNavigation}</h2>
              <div className="grid gap-3 text-sm text-white/50">
                <Link href="/accueil" className="hover:text-primary-500">{copy.home}</Link>
                <Link href="/catalogue" className="hover:text-primary-500">{copy.navOffers}</Link>
                <Link href="/aide" className="hover:text-primary-500">{copy.navBenefits}</Link>
                <Link href="/contact" className="hover:text-primary-500">{copy.contact}</Link>
              </div>
            </div>
            <div>
              <h2 className="mb-5 text-sm font-black uppercase tracking-[0.2em] text-white">{copy.footerLegal}</h2>
              <div className="grid gap-3 text-sm text-white/50">
                <Link href="/conditions-generales" className="hover:text-primary-500">{copy.terms}</Link>
                <Link href="/confidentialite" className="hover:text-primary-500">{copy.privacy}</Link>
                <Link href="/a-propos" className="hover:text-primary-500">{copy.about}</Link>
                <Link href="/blog" className="hover:text-primary-500">{copy.blog}</Link>
              </div>
            </div>
            <div>
              <h2 className="mb-5 text-sm font-black uppercase tracking-[0.2em] text-white">{copy.footerContact}</h2>
              <div className="grid gap-4 text-sm text-white/50">
                <a href="https://wa.me/237695263203" className="inline-flex items-center gap-3 hover:text-primary-500">
                  <MaterialIcon name="chat_bubble" className="text-[18px] text-primary-400" />
                  +237 695 263 203
                </a>
                <a href="mailto:contact@aureusprime.com" className="inline-flex items-center gap-3 hover:text-primary-500">
                  <MaterialIcon name="alternate_email" className="text-[18px] text-primary-400" />
                  contact@aureusprime.com
                </a>
                <span className="inline-flex items-center gap-3">
                  <MaterialIcon name="schedule" className="text-[18px] text-primary-400" />
                  {copy.supportHours}
                </span>
                <span className="inline-flex items-center gap-3">
                  <MaterialIcon name="bolt" className="text-[18px] text-primary-400" />
                  {copy.delivery}
                </span>
              </div>
            </div>
          </div>
          <div className="relative z-10 mx-auto mt-8 max-w-7xl text-center text-xs text-white/35">
            © {new Date().getFullYear()} Aureus Prime. {copy.rights}
          </div>
        </footer>
      </div>
    </main>
  );
}

export function PublicContentPage({ page }: { page: PublicPageId }) {
  const { locale } = useI18n();
  const copy = staticPages[locale][page];
  const ctaHref = page === "contact" ? "/login" : page === "privacy" ? "/dashboard/compte" : page === "terms" ? "/contact" : "/register";

  return (
    <PublicShell>
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute left-1/2 top-[-10rem] -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary-500/12 blur-[100px]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-primary-500">{copy.eyebrow}</p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-[var(--premium-text)] sm:text-5xl">{copy.title}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--premium-text-muted)]">{copy.subtitle}</p>
            </div>
            <div className="grid gap-4">
              {copy.highlights.map((item) => (
                <div key={item.label} className="premium-card-surface flex items-center gap-4 rounded-2xl border p-5 shadow-[var(--shadow-card)]">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-500/12 text-primary-500">
                    <MaterialIcon name={item.icon} className="text-2xl" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--premium-text)]">{item.label}</p>
                    <p className="mt-1 text-sm text-[var(--premium-text-muted)]">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="premium-section-surface border-y border-[var(--premium-card-border)] py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          {copy.sections.map((section) => (
            <article key={section.title} className="premium-card-surface rounded-2xl border p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-xl font-bold text-[var(--premium-text)]">{section.title}</h2>
              <p className="mt-3 leading-relaxed text-[var(--premium-text-muted)]">{section.body}</p>
              <ul className="mt-5 grid gap-3">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm font-medium text-[var(--premium-text-muted)]">
                    <MaterialIcon name="check_circle" className="mt-0.5 text-[18px] text-primary-500" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-[var(--premium-text)]">{copy.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[var(--premium-text-muted)]">{copy.ctaText}</p>
          <Link href={ctaHref} className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-primary-500 px-7 text-sm font-bold text-[var(--premium-contrast)] shadow-[0_20px_60px_rgba(230,184,0,0.2)] transition-colors hover:bg-primary-400">
            {copy.ctaLabel}
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}

export function PublicOffersPage() {
  const { locale } = useI18n();
  const copy = offersCopy[locale];
  const [services, setServices] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    let isActive = true;

    fetchCatalogProducts(60)
      .then((catalogServices) => {
        if (!isActive) return;
        setServices(catalogServices);
      })
      .catch((err) => {
        console.error("Failed to load public offers:", err);
        if (isActive) setError(copy.unavailable);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [copy.unavailable]);

  const categories = useMemo(
    () => Array.from(new Set(services.map((service) => service.category))).filter(Boolean).sort(),
    [services],
  );

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return services.filter((service) => {
      const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
      const searchable = `${service.title} ${service.category} ${service.shortDescription}`.toLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [query, selectedCategory, services]);

  const groupedServices = useMemo(
    () =>
      filteredServices.reduce<Record<string, CatalogProduct[]>>((acc, service) => {
        if (!acc[service.category]) acc[service.category] = [];
        acc[service.category].push(service);
        return acc;
      }, {}),
    [filteredServices],
  );

  const countLabel = copy.count.replace("{count}", String(filteredServices.length));

  return (
    <PublicShell>
      <section className="px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.24em] text-primary-500">{copy.eyebrow}</p>
          <h1 className="text-5xl font-black tracking-tight text-[var(--premium-text)] sm:text-6xl">{copy.title}</h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[var(--premium-text-muted)] sm:text-lg">{copy.subtitle}</p>

          <div className="mx-auto mt-9 flex max-w-3xl flex-col gap-3 sm:flex-row">
            <label className="flex h-14 flex-1 items-center gap-3 rounded-2xl border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] px-4 text-left shadow-[var(--shadow-card)]">
              <MaterialIcon name="search" className="text-[22px] text-[var(--premium-text-soft)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.search}
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[var(--premium-text)] outline-none placeholder:text-[var(--premium-text-soft)]"
              />
            </label>
            <Link href="/register" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary-500 px-6 text-sm font-black text-[var(--premium-contrast)] shadow-[0_18px_45px_rgba(230,184,0,0.24)] transition-colors hover:bg-primary-400">
              <MaterialIcon name="chat_bubble" className="text-[18px]" />
              {copy.start}
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.12em] ${
                selectedCategory === "all"
                  ? "border-primary-500 bg-primary-500 text-[var(--premium-contrast)]"
                  : "border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] text-[var(--premium-text-muted)] hover:text-primary-500"
              }`}
            >
              {copy.all}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.12em] ${
                  selectedCategory === category
                    ? "border-primary-500 bg-primary-500 text-[var(--premium-contrast)]"
                    : "border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] text-[var(--premium-text-muted)] hover:text-primary-500"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          {!isLoading && !error ? <p className="mt-4 text-xs font-bold text-[var(--premium-text-soft)]">{countLabel}</p> : null}
        </div>
      </section>

      <section className="border-y border-[var(--premium-card-border)] bg-[var(--premium-section-bg)] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="premium-card-surface rounded-2xl border p-5">
                  <div className="aspect-video rounded-2xl bg-[var(--premium-progress-bg)]" />
                  <div className="mt-5 h-4 w-24 rounded bg-[var(--premium-progress-bg)]" />
                  <div className="mt-3 h-6 w-40 rounded bg-[var(--premium-progress-bg)]" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="premium-card-surface rounded-2xl border p-8 text-center">
              <MaterialIcon name="cloud_off" className="text-4xl text-primary-500" />
              <p className="mt-4 font-bold text-[var(--premium-text)]">{error}</p>
              <button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-full bg-primary-500 px-5 py-2 text-sm font-bold text-[var(--premium-contrast)]">
                {copy.retry}
              </button>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="premium-card-surface rounded-2xl border p-8 text-center text-[var(--premium-text-muted)]">{copy.empty}</div>
          ) : (
            <div className="grid gap-10">
              {Object.entries(groupedServices).map(([category, categoryServices]) => (
                <div key={category}>
                  <h2 className="mb-5 text-2xl font-black text-[var(--premium-text)]">{category}</h2>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryServices.map((service) => (
                      <article key={service.slug} className="group premium-card-surface overflow-hidden rounded-2xl border shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-primary-400/45">
                        <div className="relative aspect-video overflow-hidden bg-[var(--premium-panel)]">
                          <ServiceIllustration service={service} className="transition-transform duration-500 group-hover:scale-[1.03]" />
                          <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white ${service.badgeClassName}`}>
                            {service.badgeLabel}
                          </span>
                        </div>
                        <div className="p-5">
                          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--premium-text-soft)]">{service.category}</p>
                          <h3 className="mt-2 text-lg font-black text-[var(--premium-text)]">{service.title}</h3>
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--premium-text-muted)]">{service.shortDescription}</p>
                          <div className="mt-5 flex items-end justify-between gap-4">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--premium-text-soft)]">{service.priceHint}</p>
                              <p className="text-xl font-black text-primary-500">{service.currentPriceFormatted}</p>
                            </div>
                            <Link href="/register" className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary-500 px-4 text-xs font-black text-[var(--premium-contrast)]">
                              {copy.choose}
                              <MaterialIcon name="arrow_forward" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicShell>
  );
}

export function PublicContactPage() {
  const { locale } = useI18n();
  const copy = contactCopy[locale];
  const whatsappUrl =
    "https://wa.me/237695263203?text=Bonjour%20Aureus%20Prime%2C%20j%27ai%20besoin%20d%27aide%20sur%20une%20commande.";
  const countries = ["Cameroun", "Côte d'Ivoire", "Sénégal", "Gabon", "Congo", "Mali"];

  return (
    <PublicShell>
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link href="/accueil" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--premium-text-muted)] hover:text-primary-500">
            <MaterialIcon name="arrow_back" className="text-[18px]" />
            {copy.back}
          </Link>

          <div className="mt-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-500">{copy.eyebrow}</p>
            <h1 className="mt-4 text-5xl font-black tracking-tight text-[var(--premium-text)] sm:text-6xl">{copy.title}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--premium-text-muted)]">{copy.subtitle}</p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <article className="premium-card-surface rounded-3xl border border-primary-500/45 p-6 text-center shadow-[var(--shadow-card)]">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-400">
                <MaterialIcon name="chat_bubble" className="text-[28px]" />
              </div>
              <h2 className="mt-5 text-xl font-black text-[var(--premium-text)]">{copy.whatsapp}</h2>
              <p className="mt-2 min-h-10 text-xs leading-5 text-[var(--premium-text-muted)]">{copy.whatsappText}</p>
              <p className="mt-4 text-sm font-black text-[var(--premium-text)]">+237 695 263 203</p>
              <a href={whatsappUrl} className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 text-sm font-black text-[var(--premium-contrast)] hover:bg-primary-400">
                <MaterialIcon name="chat_bubble" className="text-[17px]" />
                {copy.sendMessage}
              </a>
            </article>

            <article className="premium-card-surface rounded-3xl border p-6 text-center shadow-[var(--shadow-card)]">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-500/12 text-blue-400">
                <MaterialIcon name="mail" className="text-[28px]" />
              </div>
              <h2 className="mt-5 text-xl font-black text-[var(--premium-text)]">{copy.email}</h2>
              <p className="mt-2 min-h-10 text-xs leading-5 text-[var(--premium-text-muted)]">{copy.emailText}</p>
              <p className="mt-4 text-sm font-black text-[var(--premium-text)]">contact@aureusprime.com</p>
              <a href="mailto:contact@aureusprime.com" className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--premium-panel)] text-sm font-black text-[var(--premium-text)] hover:text-primary-500">
                <MaterialIcon name="mail" className="text-[17px]" />
                {copy.sendEmail}
              </a>
            </article>

            <article className="premium-card-surface rounded-3xl border p-6 text-center shadow-[var(--shadow-card)]">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-violet-500/12 text-violet-400">
                <MaterialIcon name="call" className="text-[28px]" />
              </div>
              <h2 className="mt-5 text-xl font-black text-[var(--premium-text)]">{copy.phone}</h2>
              <p className="mt-2 min-h-10 text-xs leading-5 text-[var(--premium-text-muted)]">{copy.phoneText}</p>
              <p className="mt-4 text-sm font-black text-[var(--premium-text)]">+237 695 263 203</p>
              <a href="tel:+237695263203" className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--premium-panel)] text-sm font-black text-[var(--premium-text)] hover:text-primary-500">
                <MaterialIcon name="call" className="text-[17px]" />
                {copy.callNow}
              </a>
            </article>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <article className="premium-card-surface rounded-3xl border p-7 shadow-[var(--shadow-card)]">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-400">
                  <MaterialIcon name="schedule" className="text-[22px]" />
                </span>
                <h2 className="text-lg font-black text-[var(--premium-text)]">{copy.hoursTitle}</h2>
              </div>
              {[
                [copy.mondayFriday, "8h - 20h"],
                [copy.saturday, "9h - 18h"],
                [copy.sunday, "10h - 16h"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-[var(--premium-card-border)] py-4 last:border-b-0">
                  <span className="text-sm text-[var(--premium-text-muted)]">{label}</span>
                  <span className="text-sm font-black text-[var(--premium-text)]">{value}</span>
                </div>
              ))}
              <p className="mt-5 flex items-center gap-2 text-xs text-[var(--premium-text-soft)]">
                <MaterialIcon name="bolt" className="text-[16px] text-primary-500" />
                {copy.guaranteed}
              </p>
            </article>

            <article className="premium-card-surface rounded-3xl border p-7 shadow-[var(--shadow-card)]">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-400">
                  <MaterialIcon name="location_on" className="text-[22px]" />
                </span>
                <h2 className="text-lg font-black text-[var(--premium-text)]">{copy.serviceTitle}</h2>
              </div>
              <p className="text-sm leading-7 text-[var(--premium-text-muted)]">{copy.serviceText}</p>
              <div className="mt-6 rounded-2xl border border-[var(--premium-card-border)] bg-[var(--premium-panel)] p-5">
                <h3 className="text-xs font-black uppercase tracking-[0.18em] text-primary-500">{copy.countries}</h3>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {countries.map((country) => (
                    <span key={country} className="text-sm text-[var(--premium-text-muted)]">
                      <span className="text-primary-500">•</span> {country}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </div>

          <div className="premium-card-surface mt-12 rounded-3xl border p-8 text-center shadow-[var(--shadow-card)]">
            <h2 className="text-2xl font-black text-[var(--premium-text)]">{copy.faqTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--premium-text-muted)]">{copy.faqText}</p>
            <Link href="/aide" className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--premium-panel)] px-6 text-sm font-black text-[var(--premium-text)] hover:text-primary-500">
              {copy.faqButton}
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

export function PublicBlogPage() {
  const { locale } = useI18n();
  const copy = blogCopy[locale];

  return (
    <PublicShell>
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-primary-500">{copy.eyebrow}</p>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-[var(--premium-text)] sm:text-5xl">{copy.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--premium-text-muted)]">{copy.subtitle}</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {copy.articles.map((article) => (
              <article key={article.title} className="premium-card-surface rounded-2xl border p-6 shadow-[var(--shadow-card)]">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-500/12 text-primary-500">
                  <MaterialIcon name={article.icon} className="text-2xl" />
                </div>
                <h2 className="mt-5 text-xl font-black text-[var(--premium-text)]">{article.title}</h2>
                <p className="mt-3 leading-relaxed text-[var(--premium-text-muted)]">{article.description}</p>
                <Link href="/aide" className="mt-6 inline-flex items-center text-sm font-bold text-primary-500 hover:text-primary-400">
                  {copy.read}
                  <MaterialIcon name="arrow_forward" className="ml-1 text-sm" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

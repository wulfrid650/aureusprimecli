"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { isWaveIllustration, ServiceIllustration } from "@/components/dashboard/service-illustration";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { PaymentMethodLogos } from "@/components/ui/payment-method-logos";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { fetchCatalogProducts, type CatalogProduct } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";

const features = [
  {
    titleKey: "marketing.features.catalogTitle",
    descriptionKey: "marketing.features.catalogDescription",
    icon: "subscriptions",
    iconClassName: "bg-primary-500/12 text-primary-600",
    linkClassName: "text-primary-600 hover:text-primary-500",
    ctaKey: "marketing.features.catalogCta",
    href: "#abonnements",
  },
  {
    titleKey: "marketing.features.walletTitle",
    descriptionKey: "marketing.features.walletDescription",
    icon: "account_balance_wallet",
    iconClassName: "bg-primary-500/14 text-primary-500",
    linkClassName: "text-primary-500 hover:text-primary-400",
    ctaKey: "marketing.features.walletCta",
    href: "/register",
    featured: true,
  },
  {
    titleKey: "marketing.features.deliveryTitle",
    descriptionKey: "marketing.features.deliveryDescription",
    icon: "mark_email_read",
    iconClassName: "bg-primary-500/10 text-primary-600",
    linkClassName: "text-primary-600 hover:text-primary-500",
    ctaKey: "marketing.features.deliveryCta",
    href: "#fonctionnement",
  },
];

const featuredCatalogAliases = [
  ["netflix"],
  ["canva"],
  ["capcut pro", "capcut", "cap cut"],
  ["duolingo"],
  ["crunchyroll"],
  ["spotify"],
  ["prime video", "amazon prime", "primevideo"],
  ["icloud+", "icloud plus", "icloud"],
];

function normalizeCatalogMatch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[+]/g, " plus ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function selectFeaturedCatalogServices(products: CatalogProduct[], limit = 8): CatalogProduct[] {
  const selected: CatalogProduct[] = [];
  const selectedIds = new Set<string>();

  const matchesProduct = (product: CatalogProduct, aliases: string[]) => {
    const searchable = normalizeCatalogMatch(`${product.title} ${product.slug} ${product.category}`);

    return aliases.some((alias) => searchable.includes(normalizeCatalogMatch(alias)));
  };

  for (const aliases of featuredCatalogAliases) {
    const match = products.find((product) => !selectedIds.has(product.id) && matchesProduct(product, aliases));

    if (match) {
      selected.push(match);
      selectedIds.add(match.id);
    }
  }

  for (const product of products) {
    if (selected.length >= limit) break;
    if (selectedIds.has(product.id)) continue;

    selected.push(product);
    selectedIds.add(product.id);
  }

  return selected.slice(0, limit);
}

const processCopy = {
  fr: {
    eyebrow: "Simple comme bonjour",
    title: "Comment ça marche ?",
    cta: "Commencer maintenant",
    steps: [
      {
        icon: "account_balance_wallet",
        title: "Rechargez",
        description: "Utilisez votre Mobile Money, Wave ou PayPal pour créditer votre wallet Aureus Prime.",
      },
      {
        icon: "apps",
        title: "Choisissez",
        description: "Sélectionnez le service voulu dans le catalogue. Pas d'abonnement forcé.",
      },
      {
        icon: "bolt",
        title: "Profitez",
        description: "Recevez vos accès après validation. Vous ne dépensez jamais plus que votre solde.",
      },
    ],
    points: [
      {
        title: "Pas de carte bancaire. Pas de stress.",
        description: "Votre numéro de téléphone suffit pour recharger et payer depuis votre wallet.",
        tone: "soft",
      },
      {
        title: "Gérez votre budget au franc près.",
        description: "1 Auri = 1 XAF. Rechargez 1000F, dépensez 1000F, sans découvert.",
        tone: "cool",
      },
      {
        title: "Des services officiels.",
        description: "Aureus Prime travaille avec des accès suivis et une livraison contrôlée.",
        tone: "soft",
      },
      {
        title: "Assistance locale, réponse rapide.",
        description: "Notre équipe vous accompagne par WhatsApp et email en cas de blocage.",
        tone: "cool",
      },
    ],
  },
  en: {
    eyebrow: "As simple as it gets",
    title: "How does it work?",
    cta: "Start now",
    steps: [
      {
        icon: "account_balance_wallet",
        title: "Top up",
        description: "Use Mobile Money, Wave or PayPal to credit your Aureus Prime wallet.",
      },
      {
        icon: "apps",
        title: "Choose",
        description: "Pick the service you want from the catalog. No forced subscription.",
      },
      {
        icon: "bolt",
        title: "Enjoy",
        description: "Receive your access after validation. You never spend more than your balance.",
      },
    ],
    points: [
      {
        title: "No bank card. No stress.",
        description: "Your phone number is enough to top up and pay from your wallet.",
        tone: "soft",
      },
      {
        title: "Control your budget precisely.",
        description: "1 Auri = 1 XAF. Top up 1000F, spend 1000F, no overdraft.",
        tone: "cool",
      },
      {
        title: "Official services.",
        description: "Aureus Prime works with tracked access and controlled delivery.",
        tone: "soft",
      },
      {
        title: "Local assistance, fast replies.",
        description: "Our team supports you by WhatsApp and email when something is blocked.",
        tone: "cool",
      },
    ],
  },
} as const;

const referralCopy = {
  fr: {
    title: "Qui t'a dit que ton réseau ne valait rien ?",
    description: "Chaque 6 amis parrainés, c'est environ 2 000 Auri qui glissent directement dans ton wallet.",
    cta: "Découvrir le parrainage",
  },
  en: {
    title: "Who said your network was worth nothing?",
    description: "Every 6 referred friends can bring about 2,000 Auri directly into your wallet.",
    cta: "Explore referrals",
  },
} as const;

const faqCopy = {
  fr: {
    title: "Questions fréquentes",
    items: [
      {
        question: "Est-ce vraiment sans carte bancaire ?",
        answer: "Oui. Vous rechargez votre wallet avec Mobile Money, Wave ou PayPal, puis vous payez vos services avec votre solde Auri.",
      },
      {
        question: "Les abonnements sont-ils officiels ?",
        answer: "Aureus Prime livre des accès suivis, des codes ou des liens selon le service. Chaque commande reste visible depuis votre espace.",
      },
      {
        question: "Les abonnements partagés sont-ils autorisés ?",
        answer: "Certains services fonctionnent avec des slots partagés, d'autres avec des clés ou liens dédiés. Le type d'accès est géré côté plateforme.",
      },
      {
        question: "Puis-je annuler à tout moment ?",
        answer: "Vous gardez le contrôle de vos achats. Les annulations, réassignations ou remboursements en Auri dépendent du statut de la commande et du service livré.",
      },
    ],
  },
  en: {
    title: "Frequently asked questions",
    items: [
      {
        question: "Is it really bank-card free?",
        answer: "Yes. Top up your wallet with Mobile Money, Wave or PayPal, then pay for services with your Auri balance.",
      },
      {
        question: "Are the subscriptions official?",
        answer: "Aureus Prime delivers tracked access, codes or links depending on the service. Each order remains visible from your space.",
      },
      {
        question: "Are shared subscriptions allowed?",
        answer: "Some services use shared slots, others use dedicated keys or links. The access type is handled by the platform.",
      },
      {
        question: "Can I cancel anytime?",
        answer: "You stay in control of your purchases. Cancellations, reassignments or Auri refunds depend on order status and delivered service.",
      },
    ],
  },
} as const;

function MaterialIcon({
  name,
  className = "",
  filled = false,
}: {
  name: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

export function MarketingHomePage() {
  const { locale, t } = useI18n();
  const [services, setServices] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const process = processCopy[locale];
  const referral = referralCopy[locale];
  const faq = faqCopy[locale];
  const navItems = [
    { href: "#accueil", label: t("marketing.navHome"), active: true },
    { href: "#abonnements", label: t("marketing.navSubscriptions") },
    { href: "#avantages", label: t("marketing.navTraining") },
    { href: "/catalogue", label: locale === "fr" ? "Catalogue" : "Catalog" },
    { href: "/contact", label: t("marketing.navContact") },
  ];

  useEffect(() => {
    let isActive = true;

    fetchCatalogProducts(48)
      .then((catalogServices) => {
        if (!isActive) return;
        setServices(selectFeaturedCatalogServices(catalogServices));
      })
      .catch((error) => {
        console.error("Failed to load marketing catalog:", error);
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="premium-page min-h-screen overflow-x-hidden selection:bg-primary-300 selection:text-[var(--premium-contrast)]">
      <div className="relative flex min-h-screen w-full flex-col">
        <header className="premium-header-surface sticky top-0 z-50 w-full border-b backdrop-blur-md">
          <div className={`mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3 lg:px-8 ${isMobileMenuOpen ? "flex-wrap" : "flex-nowrap"} md:flex-wrap`}>
            <Link
              href="/"
              className="flex h-9 shrink-0 items-center rounded-full border border-[var(--premium-card-border)] bg-[var(--premium-panel)] px-2.5 shadow-[var(--shadow-card)] sm:h-10 sm:px-3.5"
            >
              <Image src="/logo-aureusprime.svg" alt="Aureusprime Logo" width={170} height={20} className="logo-dark h-4 w-auto max-w-[112px] sm:h-5 sm:max-w-none" />
              <Image src="/logo-aureusprime-light.svg" alt="Aureusprime Logo" width={170} height={20} className="logo-light h-4 w-auto max-w-[112px] sm:h-5 sm:max-w-none" />
            </Link>

            <nav className="hidden items-center gap-1 rounded-full border border-[var(--premium-card-border)] bg-[var(--premium-panel)] p-1 shadow-[var(--shadow-card)] md:flex">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-colors ${
                    item.active
                      ? "bg-[var(--premium-cta-bg)] text-[var(--premium-cta-text)]"
                      : "text-[var(--premium-text-muted)] hover:bg-primary-500/10 hover:text-[var(--premium-text)]"
                  }`}
                  href={item.href}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <LanguageToggle className="h-9 p-0.5 sm:h-11 sm:p-1 [&_button]:h-7 [&_button]:min-w-8 [&_button]:px-1.5 sm:[&_button]:h-8 sm:[&_button]:min-w-9 sm:[&_button]:px-2" />
              <ThemeToggle className="size-9 sm:size-11" />
              <Link href="/login" className="premium-primary-cta group flex size-9 shrink-0 items-center justify-center gap-2 rounded-full px-0 text-sm font-semibold transition-all sm:h-10 sm:w-auto sm:px-4">
                <span className="hidden sm:inline">{t("marketing.login")}</span>
                <MaterialIcon
                  name="login"
                  className="text-[17px] transition-transform sm:text-[18px] sm:group-hover:translate-x-0.5"
                />
              </Link>
              <button
                type="button"
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--premium-card-border)] bg-[var(--premium-panel)] text-[var(--premium-text)] shadow-[var(--shadow-card)] transition-colors hover:bg-primary-500/10 sm:size-10 md:hidden"
                aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="home-mobile-menu"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
              >
                <MaterialIcon name={isMobileMenuOpen ? "close" : "menu"} className="text-[21px] sm:text-[22px]" />
              </button>
            </div>

            {isMobileMenuOpen ? (
              <nav
                id="home-mobile-menu"
                className="order-3 grid w-full gap-1 rounded-2xl border border-[var(--premium-card-border)] bg-[var(--premium-panel)] p-2 shadow-[var(--shadow-card)] md:hidden"
              >
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    className={`flex min-h-11 items-center rounded-xl px-4 text-sm font-bold uppercase tracking-[0.08em] transition-colors ${
                      item.active
                        ? "bg-[var(--premium-cta-bg)] text-[var(--premium-cta-text)]"
                        : "text-[var(--premium-text-muted)] hover:bg-primary-500/10 hover:text-[var(--premium-text)]"
                    }`}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            ) : null}
          </div>
        </header>

        <main className="flex-1">
          <section className="relative overflow-hidden pb-20 pt-12 lg:pb-32 lg:pt-24" id="accueil">
            <div className="absolute left-1/2 top-[-6rem] -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary-500/5 blur-[100px]" />
            <div className="absolute right-0 top-1/2 -z-10 h-[300px] w-[300px] translate-x-1/3 rounded-full bg-primary-300/4 blur-[80px]" />

            <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary-400/35 bg-primary-500/10 px-3 py-1 backdrop-blur-sm">
                <span className="flex size-2 animate-pulse rounded-full bg-[var(--premium-success)]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-500">
                  {t("marketing.badge")}
                </span>
              </div>

              <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-extrabold tracking-tight text-[var(--premium-text)] sm:text-6xl lg:text-7xl">
                {t("marketing.heroTitleLine1")} <br className="hidden sm:block" />
                <span className="text-primary-500">
                  {t("marketing.heroTitleLine2")}
                </span>
              </h1>

              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[var(--premium-text-muted)]">
                {t("marketing.heroDescription")}
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/offres" className="premium-primary-cta flex h-12 w-full items-center justify-center gap-2 rounded-full px-8 text-base font-bold sm:w-auto">
                  {t("marketing.seeOffers")}
                  <MaterialIcon name="arrow_forward" className="text-[18px]" />
                </Link>
                <a href="#fonctionnement" className="premium-secondary-cta flex h-12 w-full items-center justify-center gap-2 rounded-full px-8 text-base font-bold sm:w-auto">
                  <MaterialIcon name="help" className="text-[18px]" />
                  {t("marketing.howItWorks")}
                </a>
              </div>

              <div className="mt-16 flex max-w-full flex-nowrap gap-8 overflow-x-auto px-1 pb-2 opacity-70 no-scrollbar transition-all duration-500">
                {[
                  "Netflix",
                  "Canva",
                  "CapCut Pro",
                  "Duolingo",
                  "Crunchyroll",
                  "Spotify",
                  "Prime Video",
                  "iCloud+",
                  "Apple Music",
                  "HBO MAX",
                  "Disney+",
                  "Microsoft 365",
                  "Telegram Premium",
                  t("marketing.moreBrands")
                ].map((brand) => (
                  <div
                    key={brand}
                    className="flex h-8 shrink-0 items-center gap-2 whitespace-nowrap text-xl font-bold text-[var(--premium-text-muted)]"
                  >
                    {brand}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="premium-section-surface border-y border-[var(--premium-card-border)] py-20" id="abonnements">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                  <h2 className="mb-4 text-3xl font-bold text-[var(--premium-text)] sm:text-4xl">
                    {t("marketing.popularTitle")}
                  </h2>
                  <p className="max-w-xl text-[var(--premium-text-muted)]">
                    {t("marketing.popularDescription")}
                  </p>
                </div>
                <a
                  className="hidden items-center gap-1 font-semibold text-primary-600 transition-colors hover:text-primary-500 md:flex"
                  href="/offres"
                >
                  {t("marketing.fullCatalog")} <MaterialIcon name="arrow_forward" className="text-sm" />
                </a>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading &&
                  [0, 1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="premium-card-surface relative flex flex-col overflow-hidden rounded-2xl border shadow-[var(--shadow-card)] p-5"
                    >
                      <div className="aspect-video w-full rounded-2xl bg-[var(--premium-card-deep)] animate-pulse" />
                      <div className="mt-5 h-4 w-20 rounded bg-[var(--premium-card-deep)] animate-pulse" />
                      <div className="mt-3 h-6 w-36 rounded bg-[var(--premium-card-deep)] animate-pulse" />
                      <div className="mt-3 h-4 w-full rounded bg-[var(--premium-card-deep)] animate-pulse" />
                      <div className="mt-2 h-4 w-5/6 rounded bg-[var(--premium-card-deep)] animate-pulse" />
                    </div>
                  ))}

                {!isLoading &&
                  services.map((service) => (
                    <Link
                      key={service.slug}
                      href="/register"
                      className="group premium-card-surface relative flex flex-col overflow-hidden rounded-2xl border shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-primary-400/35"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-[var(--premium-panel)]">
                        <div className="absolute inset-0 z-10 bg-black/10" />
                        <ServiceIllustration
                          service={service}
                          className={isWaveIllustration(service) ? "" : "transition-transform duration-500 group-hover:scale-[1.03]"}
                        />
                        <div
                          className={`absolute right-3 top-3 z-20 rounded-full px-2.5 py-1 text-xs font-bold text-[#F7F8F8] shadow-lg ${service.badgeClassName}`}
                        >
                          {service.badgeLabel}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--premium-text-soft)]">
                              {service.category}
                            </p>
                            <h3 className="text-lg font-bold text-[var(--premium-text)]">{service.title}</h3>
                          </div>
                          {service.optionCount > 1 && (
                            <span className="rounded-full bg-primary-500/10 px-2.5 py-1 text-[11px] font-bold text-primary-500">
                              {t("marketing.offersCount", { count: service.optionCount })}
                            </span>
                          )}
                        </div>

                        <p className="mb-6 line-clamp-2 text-sm text-[var(--premium-text-muted)]">{service.shortDescription}</p>

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-[0.2em] text-[var(--premium-text-soft)]">{service.priceHint}</span>
                            {service.originalPriceFormatted ? (
                              <span className="text-xs text-[var(--premium-text-soft)] line-through">{service.originalPriceFormatted}</span>
                            ) : (
                              <span className="text-xs text-[var(--premium-text-soft)]">{service.billingSummary}</span>
                            )}
                            <span className="text-xl font-bold text-[var(--premium-text)]">{service.currentPriceFormatted}</span>
                          </div>
                          <span className="flex size-10 items-center justify-center rounded-full bg-primary-500 text-[var(--premium-contrast)] transition-colors group-hover:bg-primary-400">
                            <MaterialIcon name="arrow_forward" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>

              <div className="mt-8 text-center md:hidden">
                <Link href="/offres" className="premium-secondary-cta inline-flex w-full justify-center rounded-full px-6 py-3 text-sm font-bold">
                  {t("marketing.fullCatalog")}
                </Link>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden py-24" id="avantages">
            <div className="absolute right-0 top-0 -z-10 h-[600px] w-[600px] translate-x-1/2 -translate-y-1/4 rounded-full bg-primary-500/4 blur-[120px]" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col items-center text-center">
                <h2 className="mb-4 text-3xl font-bold text-[var(--premium-text)] sm:text-4xl">{t("marketing.boostTitle")}</h2>
                <p className="max-w-2xl text-[var(--premium-text-muted)]">
                  {t("marketing.boostDescription")}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {features.map((feature) => (
                  <div
                    key={feature.titleKey}
                    className={`premium-glass-card group relative overflow-hidden rounded-2xl p-8 transition-colors hover:border-primary-400/35 hover:bg-primary-500/8 ${feature.featured ? "border border-primary-400/35" : ""}`}
                  >
                    {feature.featured ? (
                      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-500/5 blur-2xl transition-all group-hover:bg-primary-500/8" />
                    ) : null}
                    <div
                      className={`mb-6 inline-flex size-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${feature.iconClassName}`}
                    >
                      <MaterialIcon name={feature.icon} className="text-3xl" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-[var(--premium-text)]">{t(feature.titleKey)}</h3>
                    <p className="mb-6 text-[var(--premium-text-muted)]">{t(feature.descriptionKey)}</p>
                    <a
                      className={`inline-flex items-center text-sm font-bold transition-colors ${feature.linkClassName}`}
                      href={feature.href}
                    >
                      {t(feature.ctaKey)}
                      <MaterialIcon
                        name="arrow_forward"
                        className="ml-1 text-sm transition-transform group-hover:translate-x-1"
                      />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-[var(--premium-card-border)] py-20" id="fonctionnement">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 text-center">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-[var(--trust-green)]">
                  {process.eyebrow}
                </p>
                <h2 className="text-3xl font-black tracking-tight text-[var(--premium-text)] sm:text-5xl">
                  {process.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {process.steps.map((step, index) => (
                  <article
                    key={step.title}
                    className="premium-card-surface relative min-h-[260px] overflow-hidden rounded-3xl border p-8 shadow-[var(--shadow-card)]"
                  >
                    <span className="pointer-events-none absolute right-7 top-5 text-7xl font-black leading-none text-[var(--premium-text)] opacity-[0.06] sm:text-8xl">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="mb-8 flex size-14 items-center justify-center rounded-2xl border border-[var(--premium-card-border)] bg-[var(--premium-panel)] text-[var(--trust-green)]">
                      <MaterialIcon name={step.icon} className="text-[30px]" />
                    </div>
                    <h3 className="text-xl font-black text-[var(--premium-text)]">{step.title}</h3>
                    <p className="mt-4 max-w-[17rem] leading-relaxed text-[var(--premium-text-muted)]">{step.description}</p>
                  </article>
                ))}
              </div>

              <div className="mt-14 grid gap-5 md:grid-cols-2">
                {process.points.map((point) => (
                  <article
                    key={point.title}
                    className={`rounded-3xl border border-[var(--premium-card-border)] p-8 ${
                      point.tone === "cool"
                        ? "bg-[var(--premium-panel)]"
                        : "bg-[rgba(219,183,35,0.06)]"
                    }`}
                  >
                    <h3 className="text-xl font-black text-[var(--premium-text)]">{point.title}</h3>
                    <p className="mt-4 leading-relaxed text-[var(--premium-text-muted)]">{point.description}</p>
                  </article>
                ))}
              </div>

              <div className="mt-14 text-center">
                <Link href="/register" className="premium-primary-cta inline-flex h-12 items-center justify-center gap-2 rounded-full px-8 text-base font-bold">
                  {process.cta}
                  <MaterialIcon name="arrow_forward" className="text-[18px]" />
                </Link>
              </div>
            </div>
          </section>

          <section className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#111315] px-6 py-16 text-center text-[#F7F8F8] shadow-[var(--shadow-card)] sm:px-10 lg:py-20">
              <h2 className="mx-auto max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">
                {referral.title}
              </h2>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[#F7F8F8]/70">
                {referral.description}
              </p>
              <Link href="/register" className="premium-primary-cta mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-bold">
                {referral.cta}
                <MaterialIcon name="arrow_forward" className="text-[18px]" />
              </Link>
            </div>
          </section>

          <section className="premium-section-surface border-y border-[var(--premium-card-border)] py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <h2 className="mb-8 text-3xl font-black tracking-tight text-[var(--premium-text)] sm:text-4xl">
                {faq.title}
              </h2>
              <div className="grid gap-3">
                {faq.items.map((item) => (
                  <details key={item.question} className="group rounded-3xl border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] shadow-[var(--shadow-card)]">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-black text-[var(--premium-text)]">
                      {item.question}
                      <MaterialIcon name="add" className="text-[22px] text-[var(--premium-text-muted)] transition-transform group-open:rotate-45" />
                    </summary>
                    <p className="px-6 pb-6 leading-relaxed text-[var(--premium-text-muted)]">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer className="premium-section-surface border-t border-[var(--premium-card-border)] pb-8 pt-16" id="contact">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
              <div className="col-span-1 lg:col-span-1">
                <div className="mb-6 flex items-center">
                  <Image src="/logo-aureusprime.svg" alt="Aureusprime Logo" width={170} height={20} className="logo-dark h-5 w-auto" />
                  <Image src="/logo-aureusprime-light.svg" alt="Aureusprime Logo" width={170} height={20} className="logo-light h-5 w-auto" />
                </div>
                <p className="mb-6 text-sm leading-relaxed text-[var(--premium-text-muted)]">
                  {t("marketing.footerDescription")}
                </p>
                <div className="flex gap-4">
                  <Link className="text-[var(--premium-text-muted)] transition-colors hover:text-primary-500" href="/contact">
                    <MaterialIcon name="public" />
                  </Link>
                  <Link className="text-[var(--premium-text-muted)] transition-colors hover:text-primary-500" href="/contact">
                    <MaterialIcon name="alternate_email" />
                  </Link>
                </div>
                <div className="mt-7">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--premium-text-muted)]">
                    {t("marketing.paymentMethodsTitle")}
                  </p>
                  <PaymentMethodLogos moreLabel={t("marketing.paymentMethodsMore")} />
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--premium-text)]">{t("marketing.footerNavigation")}</h3>
                <ul className="space-y-3">
                  <li>
                    <Link className="text-sm text-[var(--premium-text-muted)] transition-colors hover:text-primary-500" href="/">
                      {t("marketing.navHome")}
                    </Link>
                  </li>
                  <li>
                    <Link className="text-sm text-[var(--premium-text-muted)] transition-colors hover:text-primary-500" href="/offres">
                      {t("marketing.footerOffers")}
                    </Link>
                  </li>
                  <li>
                    <Link className="text-sm text-[var(--premium-text-muted)] transition-colors hover:text-primary-500" href="/blog">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link className="text-sm text-[var(--premium-text-muted)] transition-colors hover:text-primary-500" href="/a-propos">
                      {t("marketing.footerAbout")}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--premium-text)]">{t("marketing.footerSupport")}</h3>
                <ul className="space-y-3">
                  <li>
                    <Link className="text-sm text-[var(--premium-text-muted)] transition-colors hover:text-primary-500" href="/aide">
                      {t("marketing.helpCenter")}
                    </Link>
                  </li>
                  <li>
                    <Link className="text-sm text-[var(--premium-text-muted)] transition-colors hover:text-primary-500" href="/conditions-utilisation">
                      {t("marketing.cgu")}
                    </Link>
                  </li>
                  <li>
                    <Link className="text-sm text-[var(--premium-text-muted)] transition-colors hover:text-primary-500" href="/conditions-generales">
                      {t("marketing.terms")}
                    </Link>
                  </li>
                  <li>
                    <Link className="text-sm text-[var(--premium-text-muted)] transition-colors hover:text-primary-500" href="/confidentialite">
                      {t("marketing.privacy")}
                    </Link>
                  </li>
                  <li>
                    <Link className="text-sm text-[var(--premium-text-muted)] transition-colors hover:text-primary-500" href="/remboursement">
                      {t("marketing.refund")}
                    </Link>
                  </li>
                  <li>
                    <Link className="text-sm text-[var(--premium-text-muted)] transition-colors hover:text-primary-500" href="/contact">
                      {t("marketing.navContact")}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--premium-card-border)] pt-8 md:flex-row">
              <p className="text-xs text-[var(--premium-text-soft)]">© {new Date().getFullYear()} Aureus Prime. {t("marketing.rights")}</p>
              <div className="flex gap-6 text-xs text-[var(--premium-text-soft)]">
                <span>{t("marketing.securedBy")}</span>
                <span>{t("marketing.ssl")}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

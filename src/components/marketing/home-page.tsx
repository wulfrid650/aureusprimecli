"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ServiceIllustration } from "@/components/dashboard/service-illustration";
import { LanguageToggle } from "@/components/ui/language-toggle";
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

const steps = [
  {
    icon: "touch_app",
    titleKey: "marketing.steps.chooseTitle",
    descriptionKey: "marketing.steps.chooseDescription",
  },
  {
    icon: "verified_user",
    titleKey: "marketing.steps.payTitle",
    descriptionKey: "marketing.steps.payDescription",
  },
  {
    icon: "mark_email_read",
    titleKey: "marketing.steps.accessTitle",
    descriptionKey: "marketing.steps.accessDescription",
  },
];

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
  const { t } = useI18n();
  const [services, setServices] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    fetchCatalogProducts(8)
      .then((catalogServices) => {
        if (!isActive) return;
        setServices(catalogServices);
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
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Image src="/logo-aureusprime.svg" alt="Aureusprime Logo" width={200} height={24} className="logo-dark h-6 w-auto" />
              <Image src="/logo-aureusprime-light.svg" alt="Aureusprime Logo" width={200} height={24} className="logo-light h-6 w-auto" />
            </div>

            <nav className="hidden items-center gap-8 md:flex">
              <a className="text-sm font-medium text-[var(--premium-text)] transition-colors hover:text-primary-500" href="#accueil">
                {t("marketing.navHome")}
              </a>
              <a
                className="text-sm font-medium text-[var(--premium-text-muted)] transition-colors hover:text-[var(--premium-text)]"
                href="#abonnements"
              >
                {t("marketing.navSubscriptions")}
              </a>
              <a
                className="text-sm font-medium text-[var(--premium-text-muted)] transition-colors hover:text-[var(--premium-text)]"
                href="#avantages"
              >
                {t("marketing.navTraining")}
              </a>
              <a
                className="text-sm font-medium text-[var(--premium-text-muted)] transition-colors hover:text-[var(--premium-text)]"
                href="#contact"
              >
                {t("marketing.navContact")}
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <button className="hidden items-center gap-2 text-sm font-medium text-[var(--premium-text-muted)] transition-colors hover:text-[var(--premium-text)] sm:flex">
                <MaterialIcon name="search" className="text-[20px]" />
              </button>
              <LanguageToggle />
              <ThemeToggle />
              <Link href="/login" className="group flex h-10 items-center justify-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-[var(--premium-contrast)] shadow-[0_18px_48px_rgba(230,184,0,0.24)] transition-all hover:bg-primary-400">
                <span className="hidden sm:inline">{t("marketing.login")}</span>
                <MaterialIcon
                  name="login"
                  className="text-[18px] transition-transform sm:group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <section className="relative overflow-hidden pb-20 pt-12 lg:pb-32 lg:pt-24" id="accueil">
            <div className="absolute left-1/2 top-[-6rem] -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary-500/16 blur-[100px]" />
            <div className="absolute right-0 top-1/2 -z-10 h-[300px] w-[300px] translate-x-1/3 rounded-full bg-primary-300/12 blur-[80px]" />

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
                <Link href="/offres" className="flex h-12 w-full items-center justify-center rounded-full bg-primary-500 px-8 text-base font-bold text-[var(--premium-contrast)] shadow-[0_20px_60px_rgba(230,184,0,0.22)] transition-all hover:scale-105 hover:bg-primary-400 active:scale-95 sm:w-auto">
                  {t("marketing.seeOffers")}
                </Link>
                <a href="#fonctionnement" className="flex h-12 w-full items-center justify-center rounded-full border border-[var(--premium-card-border)] bg-[var(--premium-panel)] px-8 text-base font-bold text-[var(--premium-text)] backdrop-blur-sm transition-all hover:border-primary-400/40 hover:bg-primary-500/10 sm:w-auto">
                  {t("marketing.howItWorks")}
                </a>
              </div>

              <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-70 transition-all duration-500">
                {[
                  "Netflix",
                  "Spotify",
                  "Canva",
                  "Prime Video",
                  "Crunchyroll",
                  "Capcut Pro",
                  t("marketing.moreBrands")
                ].map((brand) => (
                  <div
                    key={brand}
                    className="flex h-8 w-auto items-center gap-2 text-xl font-bold text-[var(--premium-text-muted)]"
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
                      className="group premium-card-surface relative flex flex-col overflow-hidden rounded-2xl border shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-primary-400/45 hover:shadow-[0_24px_80px_rgba(230,184,0,0.16)]"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-[var(--premium-panel)]">
                        <div className="absolute inset-0 z-10 bg-black/10" />
                        <ServiceIllustration service={service} className="transition-transform duration-500 group-hover:scale-[1.03]" />
                        <div
                          className={`absolute right-3 top-3 z-20 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-lg ${service.badgeClassName}`}
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
                <Link href="/offres" className="inline-flex w-full justify-center rounded-full border border-[var(--premium-card-border)] bg-[var(--premium-panel)] px-6 py-3 text-sm font-bold text-[var(--premium-text)]">
                  {t("marketing.fullCatalog")}
                </Link>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden py-24" id="avantages">
            <div className="absolute right-0 top-0 -z-10 h-[600px] w-[600px] translate-x-1/2 -translate-y-1/4 rounded-full bg-primary-500/10 blur-[120px]" />

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
                      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-500/14 blur-2xl transition-all group-hover:bg-primary-500/20" />
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
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="absolute left-0 top-1/2 z-0 hidden h-px w-full -translate-y-1/2 bg-primary-500/20 md:block" />

                {steps.map((step) => (
                  <div key={step.titleKey} className="group relative z-10 flex flex-col items-center text-center">
                    <div className="mb-6 flex size-16 items-center justify-center rounded-full border-2 border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] text-[var(--premium-text-muted)] shadow-[var(--shadow-card)] transition-all duration-300 group-hover:scale-110 group-hover:border-primary-400 group-hover:text-primary-500">
                      <MaterialIcon name={step.icon} className="text-3xl" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-[var(--premium-text)]">{t(step.titleKey)}</h3>
                    <p className="px-4 text-sm text-[var(--premium-text-muted)]">{t(step.descriptionKey)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-16 text-center">
                <button className="inline-flex h-12 items-center justify-center rounded-full bg-primary-500 px-8 text-base font-bold text-[var(--premium-contrast)] shadow-[0_24px_70px_rgba(230,184,0,0.2)] transition-all hover:scale-105 hover:bg-primary-400">
                  {t("marketing.startNow")}
                </button>
              </div>
            </div>
          </section>
        </main>

        <footer className="premium-section-surface border-t border-[var(--premium-card-border)] pb-8 pt-16" id="contact">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8">
              <div className="col-span-1 lg:col-span-1">
                <div className="mb-6 flex items-center">
                  <Image src="/logo-aureusprime.svg" alt="Aureusprime Logo" width={200} height={24} className="logo-dark h-6 w-auto" />
                  <Image src="/logo-aureusprime-light.svg" alt="Aureusprime Logo" width={200} height={24} className="logo-light h-6 w-auto" />
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
              </div>

              <div>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--premium-text)]">{t("marketing.footerNavigation")}</h3>
                <ul className="space-y-3">
                  <li>
                    <Link className="text-sm text-[var(--premium-text-muted)] transition-colors hover:text-primary-500" href="/accueil">
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
                    <Link className="text-sm text-[var(--premium-text-muted)] transition-colors hover:text-primary-500" href="/contact">
                      {t("marketing.navContact")}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--premium-text)]">{t("marketing.newsletter")}</h3>
                <p className="mb-4 text-sm text-[var(--premium-text-muted)]">{t("marketing.newsletterText")}</p>
                <form className="flex flex-col gap-2">
                  <input
                    className="h-10 w-full rounded-lg border border-[var(--premium-card-border)] bg-[var(--premium-panel)] px-3 text-sm text-[var(--premium-text)] placeholder:text-[var(--premium-text-soft)] focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                    placeholder={t("marketing.newsletterPlaceholder")}
                    type="email"
                  />
                  <button
                    className="h-10 w-full rounded-lg bg-primary-500 text-sm font-bold text-[var(--premium-contrast)] transition-colors hover:bg-primary-400"
                    type="submit"
                  >
                    {t("marketing.newsletterSubmit")}
                  </button>
                </form>
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

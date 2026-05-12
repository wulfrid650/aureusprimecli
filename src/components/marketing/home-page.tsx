"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ServiceIllustration } from "@/components/dashboard/service-illustration";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { fetchCatalogProducts, type CatalogProduct } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

export function MarketingHomePage() {
  const { t } = useI18n();
  const [services, setServices] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    fetchCatalogProducts(6)
      .then((items) => {
        if (isActive) setServices(items);
      })
      .catch((error) => {
        console.error("Failed to load marketing catalog:", error);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const steps = [
    {
      icon: "desktop_windows",
      title: t("marketing.steps.chooseTitle"),
      text: t("marketing.steps.chooseDescription"),
    },
    {
      icon: "payments",
      title: t("marketing.steps.payTitle"),
      text: t("marketing.steps.payDescription"),
    },
    {
      icon: "bolt",
      title: t("marketing.steps.accessTitle"),
      text: t("marketing.steps.accessDescription"),
    },
  ];

  const benefits = [
    {
      icon: "subscriptions",
      title: t("marketing.features.catalogTitle"),
      text: t("marketing.features.catalogDescription"),
    },
    {
      icon: "account_balance_wallet",
      title: t("marketing.features.walletTitle"),
      text: t("marketing.features.walletDescription"),
    },
    {
      icon: "mark_email_read",
      title: t("marketing.features.deliveryTitle"),
      text: t("marketing.features.deliveryDescription"),
    },
  ];

  return (
    <main className="premium-page min-h-screen selection:bg-primary-300 selection:text-[var(--premium-contrast)]">
      <header className="px-4 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Link
            href="/accueil"
            className="inline-flex w-max items-center rounded-full border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] px-4 py-3 shadow-[var(--shadow-card)]"
          >
            <Image src="/logo-aureusprime.svg" alt="Aureus Prime" width={170} height={22} className="logo-dark h-6 w-auto" priority />
            <Image src="/logo-aureusprime-light.svg" alt="Aureus Prime" width={170} height={22} className="logo-light h-6 w-auto" priority />
          </Link>

          <nav className="hidden rounded-full border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] p-1 shadow-[var(--shadow-card)] md:flex">
            <a className="rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--premium-text-muted)] hover:text-primary-500" href="#accueil">
              {t("marketing.navHome")}
            </a>
            <Link className="rounded-full bg-primary-500 px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--premium-contrast)]" href="/catalogue">
              {t("marketing.footerOffers")}
            </Link>
            <a className="rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--premium-text-muted)] hover:text-primary-500" href="#fonctionnement">
              {t("marketing.howItWorks")}
            </a>
            <a className="rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--premium-text-muted)] hover:text-primary-500" href="#contact">
              {t("marketing.navContact")}
            </a>
          </nav>

          <div className="flex items-center justify-end gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Link href="/login" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary-500 px-5 text-sm font-black text-[var(--premium-contrast)] shadow-[0_18px_45px_rgba(230,184,0,0.24)] hover:bg-primary-400">
              <Icon name="chat_bubble" className="text-[18px]" />
              {t("marketing.login")}
            </Link>
          </div>
        </div>
      </header>

      <section id="accueil" className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center lg:items-start">
          <p className="mb-5 text-sm font-black uppercase tracking-[0.28em] text-primary-500">{t("marketing.badge")}</p>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-[var(--premium-text)] sm:text-6xl lg:text-7xl">
            {t("marketing.heroTitleLine1")}{" "}
            <span className="text-primary-500">{t("marketing.heroTitleLine2")}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--premium-text-muted)] sm:text-lg">
            {t("marketing.heroDescription")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/catalogue" className="inline-flex h-12 items-center justify-center rounded-full bg-primary-500 px-7 text-sm font-black text-[var(--premium-contrast)] hover:bg-primary-400">
              {t("marketing.seeOffers")}
            </Link>
            <a href="#fonctionnement" className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--premium-card-border)] px-7 text-sm font-black text-[var(--premium-text)] hover:border-primary-500/50">
              {t("marketing.howItWorks")}
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 text-sm font-bold text-[var(--premium-text-soft)]">
            {["Netflix", "Spotify", "Canva", "Prime Video", "ChatGPT", "iCloud+"].map((brand) => (
              <span key={brand} className="rounded-full border border-[var(--premium-card-border)] px-4 py-2">
                {brand}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[34px] border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] p-5 shadow-[var(--shadow-card)]">
          <div className="rounded-[28px] bg-[#0a0d0b] p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-400">Aureus Prime</p>
                <p className="mt-2 text-2xl font-black">{t("marketing.popularTitle")}</p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-500 text-black">
                <Icon name="workspace_premium" />
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {["Netflix", "Spotify", "Canva Pro"].map((name, index) => (
                <div key={name} className="flex items-center justify-between rounded-2xl bg-white/7 px-4 py-3">
                  <div>
                    <p className="font-bold">{name}</p>
                    <p className="text-xs text-white/55">{index === 0 ? "Streaming" : index === 1 ? "Musique" : "Design"}</p>
                  </div>
                  <span className="rounded-full bg-primary-500/20 px-3 py-1 text-xs font-black text-primary-300">
                    Auri
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="fonctionnement" className="border-y border-[var(--premium-card-border)] bg-[var(--premium-section-bg)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-primary-500">Simple comme bonjour</p>
            <h2 className="mt-3 text-4xl font-black text-[var(--premium-text)] sm:text-5xl">{t("marketing.howItWorks")}</h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className="rounded-[28px] border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] p-8 shadow-[var(--shadow-card)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-14 items-center justify-center rounded-2xl border border-[var(--premium-card-border)] bg-[var(--premium-panel)] text-primary-500">
                    <Icon name={step.icon} className="text-[30px]" />
                  </div>
                  <span className="text-6xl font-black text-[var(--premium-text-soft)] opacity-15">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-8 text-xl font-black text-[var(--premium-text)]">{step.title.replace(/^\d+\.\s*/, "")}</h3>
                <p className="mt-4 leading-7 text-[var(--premium-text-muted)]">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="offres" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black text-[var(--premium-text)] sm:text-4xl">{t("marketing.popularTitle")}</h2>
            <p className="mt-3 max-w-2xl text-[var(--premium-text-muted)]">{t("marketing.popularDescription")}</p>
          </div>
          <Link href="/catalogue" className="font-black text-primary-500 hover:text-primary-400">
            {t("marketing.fullCatalog")}
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            [0, 1, 2].map((item) => (
              <div key={item} className="h-72 rounded-[28px] border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)]" />
            ))}

          {!isLoading &&
            services.slice(0, 6).map((service) => (
              <Link key={service.slug} href="/register" className="group overflow-hidden rounded-[28px] border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] shadow-[var(--shadow-card)]">
                <div className="relative aspect-video bg-[var(--premium-panel)]">
                  <ServiceIllustration service={service} className="transition-transform duration-300 group-hover:scale-[1.03]" />
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--premium-text-soft)]">{service.category}</p>
                  <h3 className="mt-2 text-xl font-black text-[var(--premium-text)]">{service.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--premium-text-muted)]">{service.shortDescription}</p>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-xs font-bold text-[var(--premium-text-soft)]">{service.priceHint}</p>
                      <p className="text-2xl font-black text-primary-500">{service.currentPriceFormatted}</p>
                    </div>
                    <span className="flex size-11 items-center justify-center rounded-full bg-primary-500 text-black">
                      <Icon name="arrow_forward" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </section>

      <section className="border-y border-[var(--premium-card-border)] bg-[var(--premium-section-bg)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {benefits.map((item) => (
            <article key={item.title} className="rounded-[26px] border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] p-7">
              <Icon name={item.icon} className="text-[34px] text-primary-500" />
              <h3 className="mt-5 text-xl font-black text-[var(--premium-text)]">{item.title}</h3>
              <p className="mt-3 leading-7 text-[var(--premium-text-muted)]">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer id="contact" className="relative overflow-hidden bg-[#040906] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 bottom-[-3.5rem] text-center text-[18vw] font-black uppercase leading-none tracking-[-0.08em] text-transparent opacity-25 [-webkit-text-stroke:1px_rgba(230,184,0,0.22)]">
          AureusPrime
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-primary-500/12 to-transparent" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 border-b border-white/10 pb-12 md:grid-cols-4">
          <div>
            <Image src="/logo-aureusprime-light.svg" alt="Aureus Prime" width={170} height={22} className="h-6 w-auto" />
            <p className="mt-5 text-sm leading-7 text-white/50">{t("marketing.footerDescription")}</p>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">{t("marketing.footerNavigation")}</h3>
            <div className="mt-5 grid gap-3 text-sm text-white/50">
              <Link href="/accueil">{t("marketing.navHome")}</Link>
              <Link href="/catalogue">{t("marketing.footerOffers")}</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/a-propos">{t("marketing.footerAbout")}</Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">{t("marketing.footerSupport")}</h3>
            <div className="mt-5 grid gap-3 text-sm text-white/50">
              <Link href="/aide">{t("marketing.helpCenter")}</Link>
              <Link href="/conditions-generales">{t("marketing.terms")}</Link>
              <Link href="/confidentialite">{t("marketing.privacy")}</Link>
              <Link href="/contact">{t("marketing.navContact")}</Link>
            </div>
          </div>
          <form className="grid content-start gap-3">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">{t("marketing.newsletter")}</h3>
            <p className="text-sm text-white/50">{t("marketing.newsletterText")}</p>
            <input className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-primary-500" placeholder={t("marketing.newsletterPlaceholder")} type="email" />
            <button className="h-11 rounded-xl bg-primary-500 text-sm font-black text-[var(--premium-contrast)] hover:bg-primary-400" type="submit">
              {t("marketing.newsletterSubmit")}
            </button>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white">{t("marketing.rechargeTitle")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["MTN MoMo", "Orange Money", "Wave", "Mobile Money"].map((method) => (
                  <span key={method} className="inline-flex items-center gap-1 rounded-full bg-black/20 px-3 py-1.5 text-[11px] font-bold text-white/70">
                    <Icon name={method === "Wave" ? "waves" : "phone_iphone"} className="text-[14px] text-primary-400" />
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </form>
        </div>
        <p className="relative z-10 mx-auto mt-6 max-w-7xl text-center text-xs text-white/35">
          © {new Date().getFullYear()} Aureus Prime. {t("marketing.rights")}
        </p>
      </footer>
    </main>
  );
}

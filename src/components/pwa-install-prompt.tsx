"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "ap_pwa_install_prompt_dismissed_at";
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function isInstalledPwa() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isMobileContext() {
  const userAgent = window.navigator.userAgent.toLowerCase();

  return (
    /android|iphone|ipad|ipod/.test(userAgent) ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 768px)").matches
  );
}

function isIosContext() {
  const userAgent = window.navigator.userAgent.toLowerCase();

  return (
    /iphone|ipad|ipod/.test(userAgent) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1)
  );
}

function wasRecentlyDismissed() {
  const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) || 0);

  return Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_TTL_MS;
}

function rememberDismissal() {
  window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
}

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
      {name}
    </span>
  );
}

export function PwaInstallPrompt() {
  const { locale } = useI18n();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canShow, setCanShow] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isIos, setIsIos] = useState(false);

  const copy = useMemo(
    () =>
      locale === "fr"
        ? {
            install: "Installer",
            title: "Installer Aureus Prime",
            body: "Accédez plus vite à votre compte, wallet et catalogue depuis l'écran d'accueil.",
            cta: "Installer l'app",
            later: "Plus tard",
            iosTitle: "Ajouter à l'écran d'accueil",
            iosBody: "Sur iPhone, utilisez le bouton Partager du navigateur, puis choisissez Ajouter à l'écran d'accueil.",
          }
        : {
            install: "Install",
            title: "Install Aureus Prime",
            body: "Open your account, wallet and catalog faster from your home screen.",
            cta: "Install app",
            later: "Later",
            iosTitle: "Add to Home Screen",
            iosBody: "On iPhone, use the browser Share button, then choose Add to Home Screen.",
          },
    [locale],
  );

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (!isMobileContext() || isInstalledPwa() || wasRecentlyDismissed()) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setIsIos(false);
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setCanShow(true);
    };

    const handleAppInstalled = () => {
      setCanShow(false);
      setIsOpen(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    let fallbackTimer: number | undefined;
    if (isIosContext()) {
      fallbackTimer = window.setTimeout(() => {
        setIsIos(true);
        setCanShow(true);
      }, 1800);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);

      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer);
      }
    };
  }, []);

  const close = () => {
    rememberDismissal();
    setIsOpen(false);
    setCanShow(false);
  };

  const install = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    if (choice.outcome === "accepted") {
      setCanShow(false);
      setIsOpen(false);
    } else {
      close();
    }
  };

  if (!canShow) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="fixed bottom-5 right-4 z-[70] inline-flex h-11 items-center gap-2 rounded-full border border-[var(--premium-card-border)] bg-[var(--premium-panel)] px-4 text-sm font-bold text-[var(--premium-text)] shadow-[var(--shadow-card)] transition-colors hover:bg-primary-500/10 sm:right-6"
        onClick={() => setIsOpen(true)}
      >
        <MaterialIcon name="install_mobile" className="text-[20px]" />
        {copy.install}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[80] flex items-end bg-black/45 p-4 backdrop-blur-sm sm:items-center sm:justify-center">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-title"
            className="premium-card-surface w-full rounded-3xl border border-[var(--premium-card-border)] bg-[var(--premium-panel)] p-5 shadow-[var(--shadow-card)] sm:max-w-sm"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500">
                <MaterialIcon name="install_mobile" className="text-[28px]" />
              </div>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-full bg-[var(--premium-card-deep)] text-[var(--premium-text-muted)] transition-colors hover:text-[var(--premium-text)]"
                aria-label={copy.later}
                onClick={close}
              >
                <MaterialIcon name="close" className="text-[20px]" />
              </button>
            </div>

            <h2 id="pwa-install-title" className="text-xl font-black text-[var(--premium-text)]">
              {isIos && !deferredPrompt ? copy.iosTitle : copy.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--premium-text-muted)]">
              {isIos && !deferredPrompt ? copy.iosBody : copy.body}
            </p>

            <div className="mt-6 grid gap-3">
              {deferredPrompt ? (
                <button
                  type="button"
                  className="premium-primary-cta flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold"
                  onClick={install}
                >
                  {copy.cta}
                  <MaterialIcon name="arrow_forward" className="text-[18px]" />
                </button>
              ) : null}
              <button
                type="button"
                className="premium-secondary-cta min-h-12 rounded-full px-5 text-sm font-bold"
                onClick={close}
              >
                {copy.later}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

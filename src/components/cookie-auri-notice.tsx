"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

const COOKIE_NOTICE_KEY = "ap_cookie_notice_seen_at";
const AURI_NOTICE_KEY = "ap_auri_notice_seen_at";
const DAY_MS = 24 * 60 * 60 * 1000;
const COOKIE_NOTICE_INTERVAL_MS = 90 * DAY_MS;
const AURI_NOTICE_INTERVAL_MS = 30 * DAY_MS;

type NoticeState = {
  cookies: boolean;
  auri: boolean;
};

function shouldShowNotice(key: string, interval: number, now: number) {
  const stored = window.localStorage.getItem(key);
  const lastSeenAt = stored ? Number.parseInt(stored, 10) : 0;

  return !Number.isFinite(lastSeenAt) || lastSeenAt <= 0 || now - lastSeenAt >= interval;
}

export function CookieAuriNotice() {
  const { locale } = useI18n();
  const [notice, setNotice] = useState<NoticeState>({ cookies: false, auri: false });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const now = Date.now();
        setNotice({
          cookies: shouldShowNotice(COOKIE_NOTICE_KEY, COOKIE_NOTICE_INTERVAL_MS, now),
          auri: shouldShowNotice(AURI_NOTICE_KEY, AURI_NOTICE_INTERVAL_MS, now),
        });
      } catch {
        setNotice({ cookies: true, auri: true });
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const isVisible = notice.cookies || notice.auri;

  if (!isVisible) {
    return null;
  }

  const copy =
    locale === "en"
      ? {
          eyebrow: "Information",
          title: notice.cookies && notice.auri ? "Cookies and Auri rate" : notice.cookies ? "Cookie notice" : "Auri rate",
          cookies:
            "We use essential cookies and local preferences to keep your session, language, theme and analytics experience reliable.",
          auri: "Reminder: 1 Auri = 1 XAF on Aureus Prime.",
          accept: "Got it",
          privacy: "Privacy policy",
        }
      : {
          eyebrow: "Information",
          title: notice.cookies && notice.auri ? "Cookies et valeur Auri" : notice.cookies ? "Information cookies" : "Valeur Auri",
          cookies:
            "Nous utilisons des cookies essentiels et préférences locales pour garder votre session, la langue, le thème et l'analyse fiables.",
          auri: "Rappel : 1 Auri = 1 XAF sur Aureus Prime.",
          accept: "J'ai compris",
          privacy: "Confidentialité",
        };

  const dismiss = () => {
    try {
      const now = String(Date.now());
      if (notice.cookies) window.localStorage.setItem(COOKIE_NOTICE_KEY, now);
      if (notice.auri) window.localStorage.setItem(AURI_NOTICE_KEY, now);
    } finally {
      setNotice({ cookies: false, auri: false });
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-4 z-[120] px-4 sm:bottom-6">
      <div className="mx-auto max-w-xl rounded-3xl border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-5">
        <div className="flex gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-500 text-[var(--premium-contrast)]">
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
              info
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-500">{copy.eyebrow}</p>
            <h2 className="mt-1 text-base font-black text-[var(--premium-text)]">{copy.title}</h2>
            <div className="mt-2 space-y-2 text-sm leading-6 text-[var(--premium-text-muted)]">
              {notice.cookies ? <p>{copy.cookies}</p> : null}
              {notice.auri ? <p className="font-bold text-[var(--premium-text)]">{copy.auri}</p> : null}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={dismiss}
                className="inline-flex h-10 items-center justify-center rounded-full bg-primary-500 px-5 text-sm font-black text-[var(--premium-contrast)] hover:bg-primary-400"
              >
                {copy.accept}
              </button>
              <a
                href="/confidentialite"
                className="inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-bold text-[var(--premium-text-muted)] hover:text-primary-500"
              >
                {copy.privacy}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

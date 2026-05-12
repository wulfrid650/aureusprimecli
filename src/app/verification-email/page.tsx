"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { type TranslateFn, useI18n } from "@/lib/i18n";

type VerificationStatus = "verified" | "already_verified" | "invalid";

function normalizeStatus(value: string | null): VerificationStatus {
  if (value === "already_verified") {
    return "already_verified";
  }

  if (value === "invalid") {
    return "invalid";
  }

  return "verified";
}

function getRedirectTarget(status: VerificationStatus): string {
  if (status === "invalid") {
    return "/login";
  }

  return "/dashboard";
}

function getStatusContent(status: VerificationStatus, t: TranslateFn) {
  switch (status) {
    case "already_verified":
      return {
        icon: "verified_user",
        iconWrapClassName: "bg-blue-100 text-blue-600",
        title: t("emailVerification.alreadyTitle"),
        message: t("emailVerification.alreadyMessage"),
        redirectLabel: t("emailVerification.redirectSpace"),
        ctaLabel: t("emailVerification.continue"),
      };
    case "invalid":
      return {
        icon: "link_off",
        iconWrapClassName: "bg-red-100 text-red-600",
        title: t("emailVerification.invalidTitle"),
        message: t("emailVerification.invalidMessage"),
        redirectLabel: t("emailVerification.redirectLogin"),
        ctaLabel: t("emailVerification.goLogin"),
      };
    default:
      return {
        icon: "check_circle",
        iconWrapClassName: "bg-green-100 text-green-600",
        title: t("emailVerification.successTitle"),
        message: t("emailVerification.successMessage"),
        redirectLabel: t("emailVerification.redirectCurrent"),
        ctaLabel: t("emailVerification.continue"),
      };
  }
}

function VerificationEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const status = useMemo(() => normalizeStatus(searchParams.get("status")), [searchParams]);
  const [countdown, setCountdown] = useState(4);
  const redirectTarget = useMemo(() => getRedirectTarget(status), [status]);
  const content = useMemo(() => getStatusContent(status, t), [status, t]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace(redirectTarget);
    }, 4000);

    const interval = window.setInterval(() => {
      setCountdown((current) => (current > 1 ? current - 1 : 1));
    }, 1000);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [redirectTarget, router]);

  return (
    <main className="premium-page flex min-h-screen items-center justify-center p-4 selection:bg-primary-300 selection:text-[var(--premium-contrast)]">
      <div className="w-full max-w-md">
        <div className="premium-card-surface rounded-[32px] border border-[var(--premium-card-border)] bg-[var(--premium-panel)] px-8 py-10 text-center shadow-[var(--shadow-card)]">
          <div className="mb-6 flex justify-end">
            <LanguageToggle className="h-9 text-[11px]" />
          </div>

          <div className={`mx-auto flex size-20 items-center justify-center rounded-full ${content.iconWrapClassName}`}>
            <span className="material-symbols-outlined text-[40px]">{content.icon}</span>
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight text-[var(--premium-text)]">{content.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--premium-text-muted)]">{content.message}</p>

          <div className="mt-6 rounded-2xl border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] px-4 py-3">
            <p className="text-sm font-bold text-[var(--premium-text)]">{content.redirectLabel}</p>
            <p className="mt-1 text-xs font-medium text-[var(--premium-text-soft)]">{t("emailVerification.autoRedirect", { count: countdown })}</p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={redirectTarget}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-primary-500 px-5 py-3.5 text-sm font-bold text-[var(--premium-contrast)] transition-colors hover:bg-primary-400"
            >
              {content.ctaLabel}
            </Link>

            <Link
              href="/accueil"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-[var(--premium-card-border)] bg-transparent px-5 py-3.5 text-sm font-bold text-[var(--premium-text)] transition-colors hover:bg-[var(--premium-card-deep)]"
            >
              {t("common.backHome")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function VerificationEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerificationEmailContent />
    </Suspense>
  );
}

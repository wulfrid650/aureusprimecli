"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuthToken } from "@/lib/auth-token";

function isStandalonePwa() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    // Safari iOS exposes this non-standard flag for installed web apps.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export default function AppEntryPage() {
  const router = useRouter();

  useEffect(() => {
    if (getStoredAuthToken()) {
      router.replace("/dashboard");
      return;
    }

    router.replace(isStandalonePwa() ? "/login" : "/accueil");
  }, [router]);

  return (
    <main className="premium-page flex min-h-screen items-center justify-center p-6 text-center">
      <div className="premium-card-surface w-full max-w-sm rounded-3xl border border-[var(--premium-card-border)] bg-[var(--premium-panel)] px-8 py-10 shadow-[var(--shadow-card)]">
        <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-4 border-primary-300 border-t-primary-500" aria-hidden="true" />
        <h1 className="text-xl font-bold text-[var(--premium-text)]">Ouverture de l&apos;application</h1>
        <p className="mt-2 text-sm text-[var(--premium-text-muted)]">
          Redirection en cours vers Aureus Prime...
        </p>
      </div>
    </main>
  );
}

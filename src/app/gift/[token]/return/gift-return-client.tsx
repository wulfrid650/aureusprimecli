"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { resolveApiUrl } from "@/lib/fetch";
import { readApiResponse } from "@/lib/api-response";
import { formatAuriAmount } from "@/lib/money";

type GiftPurchaseStatus = "pending" | "paid" | "failed" | "capped" | "expired";

type GiftStatusPayload = {
  status: GiftPurchaseStatus;
  amount: number | null;
};

const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 10;

type ViewState = "polling" | "paid" | "failed" | "capped" | "expired" | "timeout" | "error";

const viewCopy: Record<Exclude<ViewState, "polling">, { icon: string; tone: "success" | "warning" | "error"; title: string; body: (amount: number | null) => string }> = {
  paid: {
    icon: "check_circle",
    tone: "success",
    title: "Cadeau envoyé !",
    body: (amount) =>
      amount
        ? `${formatAuriAmount(amount)} ont bien été crédités au compte de votre proche. Merci pour votre générosité.`
        : "Le crédit a bien été appliqué au compte de votre proche. Merci pour votre générosité.",
  },
  failed: {
    icon: "error",
    tone: "error",
    title: "Le paiement n'a pas abouti",
    body: () => "Votre paiement Mobile Money n'a pas pu être confirmé. Vous pouvez retourner sur la page du cadeau pour réessayer.",
  },
  capped: {
    icon: "info",
    tone: "warning",
    title: "Paiement reçu, régularisation en cours",
    body: () =>
      "Votre paiement a bien été reçu, mais le plafond mensuel du compte a été atteint entre-temps. Notre équipe va régulariser le crédit sous peu.",
  },
  expired: {
    icon: "schedule",
    tone: "warning",
    title: "Délai de paiement expiré",
    body: () => "Le délai pour confirmer ce paiement a expiré. Retournez sur la page du cadeau pour réessayer.",
  },
  timeout: {
    icon: "hourglass_top",
    tone: "warning",
    title: "Confirmation en cours",
    body: () => "Nous n'avons pas encore reçu la confirmation de votre paiement. Cela peut prendre quelques minutes ; aucune action n'est requise de votre part.",
  },
  error: {
    icon: "error",
    tone: "error",
    title: "Impossible de vérifier ce paiement",
    body: () => "Le lien de retour semble incomplet. Si le paiement a bien été effectué, il sera tout de même pris en compte.",
  },
};

export function GiftReturnClient({ token }: { token: string }) {
  const [view, setView] = useState<ViewState>("polling");
  const [amount, setAmount] = useState<number | null>(null);
  const attemptsRef = useRef(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");

    if (!ref) {
      setView("error");
      return;
    }

    const poll = async () => {
      if (cancelledRef.current) return;

      attemptsRef.current += 1;

      try {
        const res = await fetch(
          resolveApiUrl(`/api/v1/gift/${encodeURIComponent(token)}/purchase/${encodeURIComponent(ref)}/status`),
          { headers: { Accept: "application/json" }, cache: "no-store" },
        );
        const payload = await readApiResponse<GiftStatusPayload>(res);
        const status = payload?.data?.status;

        if (status && status !== "pending") {
          setAmount(payload?.data?.amount ?? null);
          setView(status);
          return;
        }
      } catch {
        // network hiccup: keep polling until MAX_ATTEMPTS is reached
      }

      if (attemptsRef.current >= MAX_ATTEMPTS) {
        setView("timeout");
        return;
      }

      setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();

    return () => {
      cancelledRef.current = true;
    };
  }, [token]);

  const copy = view !== "polling" ? viewCopy[view] : null;
  const toneClasses =
    copy?.tone === "success"
      ? "bg-emerald-500/10 text-emerald-500"
      : copy?.tone === "error"
        ? "bg-red-500/10 text-red-500"
        : "bg-amber-500/10 text-amber-500";

  return (
    <main className="premium-page flex min-h-screen items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Image src="/logo-aureusprime.svg" alt="Aureus Prime" width={170} height={20} className="logo-dark h-6 w-auto" />
          <Image src="/logo-aureusprime-light.svg" alt="Aureus Prime" width={170} height={20} className="logo-light h-6 w-auto" />
        </div>

        <div className="premium-card-surface rounded-3xl border p-8 text-center shadow-[var(--shadow-card)]">
          {view === "polling" || !copy ? (
            <>
              <div className="mx-auto size-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
              <h1 className="mt-5 text-lg font-black text-[var(--premium-text)]">Vérification du paiement…</h1>
              <p className="mt-2 text-sm leading-relaxed text-[var(--premium-text-muted)]">
                Merci de patienter quelques instants, nous confirmons votre paiement Mobile Money.
              </p>
            </>
          ) : (
            <>
              <div className={`mx-auto flex size-14 items-center justify-center rounded-full ${toneClasses}`}>
                <span className="material-symbols-outlined text-[26px]">{copy.icon}</span>
              </div>
              <h1 className="mt-5 text-lg font-black text-[var(--premium-text)]">{copy.title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-[var(--premium-text-muted)]">{copy.body(amount)}</p>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-[var(--premium-text-soft)]">
          Aureus Prime est une plateforme d&apos;accès premium. Les Auri ne sont pas convertibles en espèces et ne
          peuvent être utilisés que sur Aureus Prime.
        </p>
      </div>
    </main>
  );
}

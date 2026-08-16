"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { resolveApiUrl } from "@/lib/fetch";
import { getApiFieldErrors, readApiResponse } from "@/lib/api-response";
import { formatAuriAmount } from "@/lib/money";

type GiftPublicInfo = {
  valid: boolean;
  pseudonym: string | null;
  expires_at: string;
  cap_reached: boolean;
  max_amount: number;
};

type GiftPurchaseResult = {
  checkout_url: string;
  purchase_ref: string;
};

type InvalidReason = "not_found" | "expired" | "invalidated" | "unknown";

const invalidReasonMessages: Record<InvalidReason, string> = {
  expired: "Ce QR a expiré. Demandez à votre proche de vous en partager un nouveau.",
  invalidated: "Ce QR a déjà été utilisé. Demandez à votre proche de vous en partager un nouveau.",
  not_found: "Ce lien n'est plus valide.",
  unknown: "Ce lien n'est plus valide.",
};

function readInvalidReason(payload: { errors?: unknown } | null): InvalidReason {
  const reason = (payload?.errors as { reason?: string } | undefined)?.reason;
  if (reason === "expired" || reason === "invalidated" || reason === "not_found") {
    return reason;
  }
  return "unknown";
}

export function GiftPurchaseClient({ token }: { token: string }) {
  const [loadState, setLoadState] = useState<"loading" | "invalid" | "ready">("loading");
  const [invalidMessage, setInvalidMessage] = useState<string>(invalidReasonMessages.unknown);
  const [info, setInfo] = useState<GiftPublicInfo | null>(null);

  const [amountInput, setAmountInput] = useState<string>("");
  const [payerMsisdn, setPayerMsisdn] = useState<string>("");
  const [acceptIrreversibility, setAcceptIrreversibility] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(resolveApiUrl(`/api/v1/gift/${encodeURIComponent(token)}`), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
      .then(async (res) => {
        const payload = await readApiResponse<GiftPublicInfo>(res);
        if (cancelled) return;

        if (!res.ok || !payload?.data?.valid) {
          setInvalidMessage(invalidReasonMessages[readInvalidReason(payload)]);
          setLoadState("invalid");
          return;
        }

        setInfo(payload.data);
        setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setInvalidMessage(invalidReasonMessages.unknown);
          setLoadState("invalid");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const parsedAmount = Number.parseInt(amountInput, 10);
  const hasValidAmount = Number.isFinite(parsedAmount) && parsedAmount >= 100;
  const ctaLabel = hasValidAmount ? `Offrir ${formatAuriAmount(parsedAmount)}` : "Offrir des Auri";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!info || info.cap_reached || isSubmitting) return;

    setFieldErrors({});
    setFormError(null);

    if (!hasValidAmount) {
      setFieldErrors({ amount: ["Indiquez un montant d'au moins 100 Auri."] });
      return;
    }

    if (info.max_amount > 0 && parsedAmount > info.max_amount) {
      setFieldErrors({ amount: [`Le montant maximum disponible est de ${formatAuriAmount(info.max_amount)}.`] });
      return;
    }

    if (!payerMsisdn.trim()) {
      setFieldErrors({ payer_msisdn: ["Indiquez votre numéro de téléphone."] });
      return;
    }

    if (!acceptIrreversibility) {
      setFormError("Merci de cocher la case pour confirmer que vous avez compris que cet achat est définitif.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(resolveApiUrl(`/api/v1/gift/${encodeURIComponent(token)}/purchase`), {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          payer_msisdn: payerMsisdn.trim(),
          accept_irreversibility: true,
        }),
      });

      const payload = await readApiResponse<GiftPurchaseResult>(res);

      if (res.status === 422) {
        setFieldErrors(getApiFieldErrors(payload));
        return;
      }

      if (res.status === 409) {
        setFormError("Le plafond mensuel de ce compte a été atteint pour cette période. Réessayez le mois prochain.");
        return;
      }

      if (res.status === 404) {
        setInvalidMessage(invalidReasonMessages.unknown);
        setLoadState("invalid");
        return;
      }

      if (res.status === 502 || !res.ok || !payload?.data?.checkout_url) {
        setFormError("Le paiement n'a pas pu être initié. Réessayez dans quelques instants.");
        return;
      }

      window.location.href = payload.data.checkout_url;
    } catch {
      setFormError("Le paiement n'a pas pu être initié. Réessayez dans quelques instants.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="premium-page flex min-h-screen items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Image src="/logo-aureusprime.svg" alt="Aureus Prime" width={170} height={20} className="logo-dark h-6 w-auto" />
          <Image src="/logo-aureusprime-light.svg" alt="Aureus Prime" width={170} height={20} className="logo-light h-6 w-auto" />
        </div>

        {loadState === "loading" ? (
          <div className="premium-card-surface rounded-3xl border p-8 text-center shadow-[var(--shadow-card)]">
            <div className="mx-auto size-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            <p className="mt-4 text-sm text-[var(--premium-text-muted)]">Chargement…</p>
          </div>
        ) : loadState === "invalid" ? (
          <div className="premium-card-surface rounded-3xl border p-8 text-center shadow-[var(--shadow-card)]">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <span className="material-symbols-outlined text-[26px]">qr_code_scanner</span>
            </div>
            <h1 className="mt-5 text-lg font-black text-[var(--premium-text)]">Lien non valide</h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--premium-text-muted)]">{invalidMessage}</p>
          </div>
        ) : info ? (
          <div className="premium-card-surface rounded-3xl border p-6 shadow-[var(--shadow-card)] sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-500">Cadeau Auri</p>
            <h1 className="mt-3 text-2xl font-black leading-tight text-[var(--premium-text)] sm:text-3xl">
              {info.pseudonym ? `${info.pseudonym} vous invite à lui offrir des Auri` : "Offrez un cadeau Auri à un proche"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--premium-text-muted)]">
              Les Auri sont le crédit utilisé sur Aureus Prime. Payez en quelques instants, le crédit est appliqué
              immédiatement — aucun compte requis de votre côté.
            </p>

            {info.cap_reached ? (
              <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm font-bold leading-relaxed text-[var(--premium-text)]">
                Le plafond mensuel de ce compte a été atteint pour cette période. Réessayez le mois prochain.
              </div>
            ) : (
              <>
                <ol className="mt-6 grid gap-3">
                  {["Choisissez un montant", "Payez en toute sécurité", "Le crédit est appliqué au compte de votre proche, immédiatement"].map(
                    (step, index) => (
                      <li key={step} className="flex items-start gap-3 text-sm text-[var(--premium-text-muted)]">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-xs font-black text-primary-500">
                          {index + 1}
                        </span>
                        <span className="pt-0.5">{step}</span>
                      </li>
                    ),
                  )}
                </ol>

                <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
                  <div className="grid gap-1.5">
                    <label htmlFor="amount" className="text-sm font-bold text-[var(--premium-text)]">
                      Montant (Auri)
                    </label>
                    <input
                      id="amount"
                      type="number"
                      inputMode="numeric"
                      min={100}
                      max={info.max_amount || undefined}
                      step={100}
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      placeholder="1000"
                      className={`w-full rounded-xl border bg-[var(--premium-card-deep)] px-4 py-3 text-sm text-[var(--premium-text)] outline-none transition-all focus:ring-1 focus:ring-primary-500/50 ${
                        fieldErrors.amount ? "border-red-400" : "border-[var(--premium-card-border)] focus:border-primary-500"
                      }`}
                    />
                    {fieldErrors.amount ? (
                      <p className="text-xs font-medium text-red-500">{fieldErrors.amount[0]}</p>
                    ) : (
                      <p className="text-xs text-[var(--premium-text-soft)]">
                        Maximum disponible : {formatAuriAmount(info.max_amount)}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-1.5">
                    <label htmlFor="payer_msisdn" className="text-sm font-bold text-[var(--premium-text)]">
                      Votre numéro de téléphone
                    </label>
                    <input
                      id="payer_msisdn"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={payerMsisdn}
                      onChange={(e) => setPayerMsisdn(e.target.value)}
                      placeholder="+237600000000"
                      className={`w-full rounded-xl border bg-[var(--premium-card-deep)] px-4 py-3 text-sm text-[var(--premium-text)] outline-none transition-all focus:ring-1 focus:ring-primary-500/50 ${
                        fieldErrors.payer_msisdn ? "border-red-400" : "border-[var(--premium-card-border)] focus:border-primary-500"
                      }`}
                    />
                    {fieldErrors.payer_msisdn ? (
                      <p className="text-xs font-medium text-red-500">{fieldErrors.payer_msisdn[0]}</p>
                    ) : null}
                  </div>

                  <label className="flex items-start gap-3 text-xs leading-relaxed text-[var(--premium-text-muted)]">
                    <input
                      type="checkbox"
                      checked={acceptIrreversibility}
                      onChange={(e) => setAcceptIrreversibility(e.target.checked)}
                      className="mt-0.5 size-4 shrink-0 rounded border-[var(--premium-card-border)]"
                    />
                    <span>
                      J&apos;ai compris que cet achat est définitif et non réversible une fois le crédit appliqué.
                    </span>
                  </label>

                  {formError ? (
                    <p className="rounded-xl bg-red-500/10 p-3 text-xs font-bold text-red-500">{formError}</p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="premium-primary-cta mt-1 flex h-12 items-center justify-center rounded-full text-sm font-bold disabled:opacity-60"
                  >
                    {isSubmitting ? "Traitement en cours…" : ctaLabel}
                  </button>

                  <div className="grid gap-2 pt-1">
                    {["Aucun compte Aureus nécessaire", "Paiement sécurisé", "Crédit appliqué immédiatement après paiement"].map(
                      (item) => (
                        <div key={item} className="flex items-center gap-2 text-xs text-[var(--premium-text-muted)]">
                          <span className="material-symbols-outlined text-[15px] text-primary-500">check_circle</span>
                          {item}
                        </div>
                      ),
                    )}
                  </div>
                </form>
              </>
            )}
          </div>
        ) : null}

        <p className="mt-6 text-center text-[11px] leading-relaxed text-[var(--premium-text-soft)]">
          Aureus Prime est une plateforme d&apos;accès premium. Les Auri ne sont pas convertibles en espèces et ne
          peuvent être utilisés que sur Aureus Prime.
        </p>
      </div>
    </main>
  );
}

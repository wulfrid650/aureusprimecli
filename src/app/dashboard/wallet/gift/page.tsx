"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardBottomNav } from "@/components/dashboard/bottom-nav";
import { DashboardHeaderControls } from "@/components/dashboard/header-controls";
import { QrCode } from "@/components/ui/qr-code";
import { apiFetch } from "@/lib/fetch";
import { getApiFieldErrors, getApiMessage, readApiResponse } from "@/lib/api-response";

type GiftToken = {
  token: string;
  url: string;
  pseudonym: string | null;
  expires_at: string;
  monthly_cap: number;
  monthly_consumed: number;
  monthly_remaining: number;
};

const MONTHLY_GIFT_CAP = 6500;

function formatAmount(amount: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(amount)).replace(/ /g, " ")} Auri`;
}

function formatExpiry(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function formatCountdown(iso: string, now: number): string {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return "";
  const diffMs = target - now;
  if (diffMs <= 0) return "QR expiré";

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `Expire dans ${days} j`;
  }

  if (hours > 0) {
    return `Expire dans ${hours} h ${minutes} min`;
  }

  return `Expire dans ${minutes} min`;
}

export default function GiftAuriPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [giftToken, setGiftToken] = useState<GiftToken | null>(null);
  const [pseudonym, setPseudonym] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInvalidating, setIsInvalidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    apiFetch("/api/v1/gift-auri/tokens/current")
      .then(async (res) => {
        if (cancelled) return;

        if (res.status === 404) {
          setGiftToken(null);
          return;
        }

        const payload = await readApiResponse<GiftToken>(res);
        if (res.ok && payload?.data) {
          setGiftToken(payload.data);
          setPseudonym(payload.data.pseudonym ?? "");
        }
      })
      .catch(() => {
        // silent: form still lets the user generate a fresh QR
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const generateToken = useCallback(async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await apiFetch("/api/v1/gift-auri/tokens", {
        method: "POST",
        body: JSON.stringify({ pseudonym: pseudonym.trim() || null }),
      });
      const payload = await readApiResponse<GiftToken>(res);

      if (!res.ok || !payload?.data) {
        const fieldErrors = getApiFieldErrors(payload);
        const pseudonymErrors = fieldErrors.pseudonym ?? [];
        setErrorMessage(pseudonymErrors[0] ?? getApiMessage(payload, "Impossible de générer le QR pour le moment."));
        return;
      }

      setGiftToken(payload.data);
      setPseudonym(payload.data.pseudonym ?? "");
    } catch {
      setErrorMessage("Impossible de générer le QR pour le moment.");
    } finally {
      setIsGenerating(false);
    }
  }, [pseudonym]);

  const invalidateToken = useCallback(async () => {
    if (!giftToken) return;

    setIsInvalidating(true);
    setErrorMessage(null);

    try {
      const res = await apiFetch(`/api/v1/gift-auri/tokens/${encodeURIComponent(giftToken.token)}/invalidate`, {
        method: "POST",
      });

      if (!res.ok) {
        const payload = await readApiResponse(res);
        setErrorMessage(getApiMessage(payload, "Impossible d'invalider ce QR pour le moment."));
        return;
      }

      setGiftToken(null);
    } catch {
      setErrorMessage("Impossible d'invalider ce QR pour le moment.");
    } finally {
      setIsInvalidating(false);
    }
  }, [giftToken]);

  const copyLink = useCallback(async () => {
    if (!giftToken) return;

    try {
      await navigator.clipboard.writeText(giftToken.url);
      setCopyFeedback("Lien copié !");
    } catch {
      setCopyFeedback(null);
    }

    setTimeout(() => setCopyFeedback(null), 2500);
  }, [giftToken]);

  const shareLink = useCallback(async () => {
    if (!giftToken) return;

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "Cadeau Auri", url: giftToken.url });
        return;
      } catch {
        // user cancelled or share unsupported at runtime: fall back to copy
      }
    }

    void copyLink();
  }, [giftToken, copyLink]);

  return (
    <div className="dashboard-mode bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
      <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-[#f6f6f8] sm:rounded-[40px] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col mx-auto h-[100dvh] sm:h-auto">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm px-5 py-4 flex items-center justify-between gap-3 border-b border-[#f2f0f4]">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/dashboard/wallet" className="flex items-center justify-center size-10 shrink-0 rounded-full bg-white border border-gray-100 text-[#131118] hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <h1 className="truncate text-lg font-bold tracking-tight">Cadeau Auri</h1>
          </div>
          <DashboardHeaderControls />
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth px-5 pb-28 pt-3">
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Partagez ce QR avec un proche pour qu&apos;il vous offre des Auri, sans avoir besoin
            d&apos;un compte Aureus. Le crédit est appliqué automatiquement à votre wallet dès le paiement confirmé.
          </p>

          {isLoading ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-[30px] border border-gray-100 bg-white p-8">
              <div className="size-8 animate-spin rounded-full border-2 border-[#dbb723] border-t-transparent" />
              <p className="text-sm text-gray-500">Chargement…</p>
            </div>
          ) : giftToken ? (
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col items-center gap-4 rounded-[30px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="rounded-2xl border border-gray-100 p-3">
                  <QrCode value={giftToken.url} size={200} moduleColor="#131118" backgroundColor="#ffffff" />
                </div>
                <p className="text-center text-sm font-bold text-[#131118]">
                  {giftToken.pseudonym || "Cadeau Auri"}
                </p>
                <p className="text-xs font-semibold text-gray-400">{formatCountdown(giftToken.expires_at, now)}</p>
                <p className="text-[11px] text-gray-400">Expire le {formatExpiry(giftToken.expires_at)}</p>

                <div className="flex w-full gap-2">
                  <button
                    type="button"
                    onClick={shareLink}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#131118] text-sm font-bold text-white transition-colors hover:bg-[#2a2733]"
                  >
                    <span className="material-symbols-outlined text-[18px]">ios_share</span>
                    Partager
                  </button>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 text-sm font-bold text-[#131118] transition-colors hover:bg-gray-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    {copyFeedback ?? "Copier le lien"}
                  </button>
                </div>
              </div>

              <div className="rounded-[30px] border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Plafond mensuel</p>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-black text-[#131118]">{formatAmount(giftToken.monthly_remaining)}</span>
                  <span className="text-xs font-medium text-gray-400">restants sur {formatAmount(giftToken.monthly_cap)}</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#dbb723]"
                    style={{
                      width: `${giftToken.monthly_cap > 0 ? Math.min(100, (giftToken.monthly_consumed / giftToken.monthly_cap) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-[30px] border border-gray-100 bg-white p-5 shadow-sm">
                <label htmlFor="pseudonym" className="text-sm font-bold text-[#131118]">
                  Nom affiché au payeur
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  C&apos;est le nom qui sera affiché à la personne qui vous offre les Auri. Laissez vide pour rester
                  anonyme.
                </p>
                <input
                  id="pseudonym"
                  type="text"
                  maxLength={60}
                  value={pseudonym}
                  onChange={(e) => setPseudonym(e.target.value)}
                  placeholder="Ex. Junior"
                  className="mt-3 w-full rounded-xl border border-gray-200 bg-[#f9f9fb] px-4 py-3 text-sm text-[#131118] outline-none transition-colors focus:border-[#dbb723]"
                />

                {errorMessage ? <p className="mt-3 text-xs font-semibold text-red-500">{errorMessage}</p> : null}

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={generateToken}
                    disabled={isGenerating}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#dbb723] text-sm font-bold text-[#131118] transition-colors hover:bg-[#b79218] disabled:opacity-60"
                  >
                    {isGenerating ? "Génération…" : "Régénérer un nouveau QR"}
                  </button>
                  <button
                    type="button"
                    onClick={invalidateToken}
                    disabled={isInvalidating}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-red-200 text-sm font-bold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-60"
                  >
                    {isInvalidating ? "Annulation…" : "Annuler ce QR"}
                  </button>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
                  Régénérer un QR invalide automatiquement l&apos;ancien : les liens déjà partagés cesseront de
                  fonctionner.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[30px] border border-gray-100 bg-white p-6 shadow-sm">
              <label htmlFor="pseudonym" className="text-sm font-bold text-[#131118]">
                Nom affiché au payeur (facultatif)
              </label>
              <p className="mt-1 text-xs text-gray-500">
                C&apos;est le nom qui sera affiché à la personne qui vous offre les Auri. Laissez vide pour rester
                anonyme.
              </p>
              <input
                id="pseudonym"
                type="text"
                maxLength={60}
                value={pseudonym}
                onChange={(e) => setPseudonym(e.target.value)}
                placeholder="Ex. Junior"
                className="mt-3 w-full rounded-xl border border-gray-200 bg-[#f9f9fb] px-4 py-3 text-sm text-[#131118] outline-none transition-colors focus:border-[#dbb723]"
              />

              <p className="mt-3 text-xs text-gray-400">
                Jusqu&apos;à {formatAmount(MONTHLY_GIFT_CAP)} peuvent être offerts sur votre compte chaque mois.
              </p>

              {errorMessage ? <p className="mt-3 text-xs font-semibold text-red-500">{errorMessage}</p> : null}

              <button
                type="button"
                onClick={generateToken}
                disabled={isGenerating}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#dbb723] text-sm font-bold text-[#131118] transition-colors hover:bg-[#b79218] disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                {isGenerating ? "Génération…" : "Générer mon QR cadeau"}
              </button>
            </div>
          )}
        </main>

        <DashboardBottomNav active="wallet" />
      </div>
    </div>
  );
}

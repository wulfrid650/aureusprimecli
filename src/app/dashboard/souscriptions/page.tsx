"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ServiceIllustration } from "@/components/dashboard/service-illustration";
import { getApiMessage, readApiResponse } from "@/lib/api-response";
import { apiFetch } from "@/lib/fetch";

type MaskedPayloadValue = string | number | boolean | null;

type SubscriptionProduct = {
  name?: string | null;
  slug?: string | null;
  category?: {
    name?: string | null;
  } | null;
};

type SubscriptionOption = {
  name?: string | null;
};

type SubscriptionAssignedAccount = {
  id: number;
  payload_type?: string | null;
  masked_payload?: Record<string, MaskedPayloadValue> | null;
  notes?: string | null;
};

type SubscriptionAssignment = {
  id: number;
};

type Subscription = {
  id: number;
  type?: string | null;
  status: string;
  started_at?: string | null;
  expires_at?: string | null;
  auto_renew?: boolean;
  pending_student_kyc?: boolean;
  product?: SubscriptionProduct | null;
  variant?: SubscriptionOption | null;
  productVariation?: SubscriptionOption | null;
  assignedAccount?: SubscriptionAssignedAccount | null;
  assignments?: SubscriptionAssignment[] | null;
};

type AccessSheetState = {
  title: string;
  subtitle: string;
  payloadTypeLabel: string;
  entries: Array<{ label: string; value: string }>;
};

const ongoingStatuses = new Set(["active", "pending", "waiting_manual", "pending_student_kyc"]);

function normalizeStatus(status?: string | null): string {
  return status?.trim().toLowerCase() ?? "unknown";
}

function isOngoingSubscription(status?: string | null): boolean {
  return ongoingStatuses.has(normalizeStatus(status));
}

function isActiveSubscription(status?: string | null): boolean {
  return normalizeStatus(status) === "active";
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) {
    return "Date non definie";
  }

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return "Date non definie";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getDaysUntil(dateStr?: string | null): number | null {
  if (!dateStr) {
    return null;
  }

  const target = new Date(dateStr);

  if (Number.isNaN(target.getTime())) {
    return null;
  }

  const now = new Date();
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  return Math.round((targetDay - currentDay) / 86_400_000);
}

function getStatusMeta(status?: string | null) {
  switch (normalizeStatus(status)) {
    case "active":
      return {
        label: "Actif",
        chipClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
        hint: "Votre service est disponible depuis votre espace Aureus.",
      };
    case "pending":
      return {
        label: "En attente",
        chipClassName: "border-amber-200 bg-amber-50 text-amber-700",
        hint: "Votre commande est en cours de validation.",
      };
    case "waiting_manual":
      return {
        label: "A affecter",
        chipClassName: "border-sky-200 bg-sky-50 text-sky-700",
        hint: "Une affectation manuelle est encore necessaire.",
      };
    case "pending_student_kyc":
      return {
        label: "KYC requis",
        chipClassName: "border-violet-200 bg-violet-50 text-violet-700",
        hint: "Une verification etudiante est necessaire pour finaliser l'acces.",
      };
    case "expired":
      return {
        label: "Expire",
        chipClassName: "border-rose-200 bg-rose-50 text-rose-700",
        hint: "La duree de validite est terminee.",
      };
    case "cancelled":
      return {
        label: "Annule",
        chipClassName: "border-zinc-200 bg-zinc-100 text-zinc-700",
        hint: "Cet abonnement a ete interrompu.",
      };
    default:
      return {
        label: status || "Inconnu",
        chipClassName: "border-gray-200 bg-gray-100 text-gray-700",
        hint: "Statut de suivi disponible dans votre historique.",
      };
  }
}

function getExpiryMeta(subscription: Subscription) {
  const daysUntilExpiry = getDaysUntil(subscription.expires_at);

  if (daysUntilExpiry === null) {
    return {
      label: "Echeance flexible",
      toneClassName: "text-gray-500",
    };
  }

  if (daysUntilExpiry < 0) {
    return {
      label: `Expire depuis ${Math.abs(daysUntilExpiry)} jour${Math.abs(daysUntilExpiry) > 1 ? "s" : ""}`,
      toneClassName: "text-rose-600",
    };
  }

  if (daysUntilExpiry === 0) {
    return {
      label: "Expire aujourd'hui",
      toneClassName: "text-amber-600",
    };
  }

  if (daysUntilExpiry <= 7) {
    return {
      label: `Expire dans ${daysUntilExpiry} jour${daysUntilExpiry > 1 ? "s" : ""}`,
      toneClassName: "text-amber-600",
    };
  }

  return {
    label: `Valide jusqu'au ${formatDate(subscription.expires_at)}`,
    toneClassName: "text-gray-500",
  };
}

function formatFieldLabel(field: string): string {
  const cleaned = field.replace(/[_-]+/g, " ").trim();

  if (!cleaned) {
    return "Information";
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function getPayloadTypeLabel(payloadType?: string | null): string {
  if (payloadType === "link") {
    return "Lien securise";
  }

  if (payloadType === "credentials") {
    return "Identifiants masques";
  }

  return "Acces protege";
}

export default function SouscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"actifs" | "historique">("actifs");
  const [accessSheet, setAccessSheet] = useState<AccessSheetState | null>(null);

  const loadSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await apiFetch("/api/v1/me/subscriptions");
      const payload = await readApiResponse<Subscription[]>(response);

      if (!response.ok) {
        setSubscriptions([]);
        setError(getApiMessage(payload, "Impossible de charger vos abonnements pour le moment."));
        return;
      }

      setSubscriptions(Array.isArray(payload?.data) ? payload.data : []);
    } catch (loadError) {
      console.error("Failed to fetch subscriptions:", loadError);
      setSubscriptions([]);
      setError("Impossible de charger vos abonnements pour le moment.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSubscriptions();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadSubscriptions]);

  const ongoingSubscriptions = useMemo(
    () => subscriptions.filter((subscription) => isOngoingSubscription(subscription.status)),
    [subscriptions],
  );

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((subscription) => isActiveSubscription(subscription.status)),
    [subscriptions],
  );

  const historySubscriptions = useMemo(
    () => subscriptions.filter((subscription) => !isOngoingSubscription(subscription.status)),
    [subscriptions],
  );

  const expiringSoonCount = useMemo(
    () =>
      activeSubscriptions.filter((subscription) => {
        const daysUntilExpiry = getDaysUntil(subscription.expires_at);
        return daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
      }).length,
    [activeSubscriptions],
  );

  const filteredSubscriptions = useMemo(
    () => (activeTab === "actifs" ? ongoingSubscriptions : historySubscriptions),
    [activeTab, historySubscriptions, ongoingSubscriptions],
  );

  const openAccessSheet = (subscription: Subscription) => {
    const maskedPayload = subscription.assignedAccount?.masked_payload ?? {};
    const entries = Object.entries(maskedPayload)
      .filter(([, value]) => value !== null && value !== "")
      .map(([key, value]) => ({
        label: formatFieldLabel(key),
        value: String(value),
      }));

    if (entries.length === 0) {
      return;
    }

    setAccessSheet({
      title: subscription.product?.name?.trim() || "Acces Aureus",
      subtitle:
        subscription.variant?.name?.trim() ||
        subscription.productVariation?.name?.trim() ||
        "Abonnement actif",
      payloadTypeLabel: getPayloadTypeLabel(subscription.assignedAccount?.payload_type),
      entries,
    });
  };

  return (
    <div className="bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
      <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-[#f6f6f8] sm:rounded-[40px] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col mx-auto h-[100dvh] sm:h-auto">
        <header className="sticky top-0 z-50 bg-[#f6f6f8]/95 backdrop-blur-md px-5 py-4 flex flex-col gap-4 border-b border-transparent">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center size-9 rounded-full bg-white border border-gray-100 text-[#131118] hover:bg-gray-50 transition-colors mr-1"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Dashboard</p>
              <h1 className="text-lg font-bold tracking-tight">Mes abonnements</h1>
            </div>
          </div>

          <section className="rounded-[30px] bg-[#131118] p-5 text-white shadow-xl shadow-black/15 overflow-hidden relative">
            <div className="absolute -top-8 -right-6 h-24 w-24 rounded-full bg-[#5b13ec]/40 blur-3xl" />
            <div className="absolute -bottom-8 -left-6 h-20 w-20 rounded-full bg-[#eab308]/20 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">Aureus Prime</p>
                  <h2 className="mt-2 text-2xl font-black leading-tight">Suivi de vos acces premium</h2>
                  <p className="mt-2 text-sm text-white/70">
                    Retrouvez vos services actifs, vos echeances et vos renouvellements depuis un seul ecran.
                  </p>
                </div>
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[24px] text-[#eab308]">subscriptions</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">En cours</p>
                  <p className="mt-2 text-2xl font-black">{ongoingSubscriptions.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">Actifs</p>
                  <p className="mt-2 text-2xl font-black">{activeSubscriptions.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">A renouveler</p>
                  <p className="mt-2 text-2xl font-black">{expiringSoonCount}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="flex bg-white/70 p-1 rounded-xl w-full border border-gray-100 shadow-sm">
            <button
              onClick={() => setActiveTab("actifs")}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "actifs" ? "bg-white shadow-sm text-[#131118]" : "text-gray-500 hover:text-[#131118]"
              }`}
            >
              En cours ({ongoingSubscriptions.length})
            </button>
            <button
              onClick={() => setActiveTab("historique")}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "historique" ? "bg-white shadow-sm text-[#131118]" : "text-gray-500 hover:text-[#131118]"
              }`}
            >
              Historique ({historySubscriptions.length})
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth px-5 pb-28 pt-3">
          {error && !isLoading && (
            <div className="mb-4 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined mt-0.5 text-[20px]">error</span>
                <div className="flex-1">
                  <p className="font-bold">Chargement impossible</p>
                  <p className="mt-1 text-red-600/90">{error}</p>
                  <button
                    onClick={() => void loadSubscriptions()}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    Reessayer
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="rounded-[30px] border border-gray-100 bg-white p-5 shadow-sm animate-pulse"
                >
                  <div className="flex gap-4">
                    <div className="size-[72px] rounded-[24px] bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-32 rounded bg-gray-100" />
                      <div className="h-3 w-20 rounded bg-gray-100" />
                      <div className="h-3 w-40 rounded bg-gray-100" />
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="h-16 rounded-2xl bg-gray-50" />
                    <div className="h-16 rounded-2xl bg-gray-50" />
                  </div>
                  <div className="mt-4 h-11 rounded-2xl bg-gray-100" />
                </div>
              ))}
            </div>
          ) : filteredSubscriptions.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredSubscriptions.map((subscription) => {
                const statusMeta = getStatusMeta(subscription.status);
                const expiryMeta = getExpiryMeta(subscription);
                const serviceHref = subscription.product?.slug
                  ? `/dashboard/services/${subscription.product.slug}`
                  : "/dashboard/services";
                const optionLabel =
                  subscription.variant?.name?.trim() ||
                  subscription.productVariation?.name?.trim() ||
                  "Formule standard";
                const maskedPayloadEntries = Object.entries(subscription.assignedAccount?.masked_payload ?? {}).filter(
                  ([, value]) => value !== null && value !== "",
                );
                const canOpenAccessSheet = isActiveSubscription(subscription.status) && maskedPayloadEntries.length > 0;
                const illustrationService = {
                  title: subscription.product?.name?.trim() || "Aureus Prime",
                  category: subscription.product?.category?.name?.trim() || "Abonnement",
                  currentPriceFormatted: statusMeta.label,
                  priceHint: "Etat",
                  billingSummary: optionLabel,
                  optionCount: 1,
                };
                const assignmentCount = subscription.assignments?.length ?? 0;
                const typeLabel = subscription.type === "personal" ? "Personnel" : subscription.type === "shared" ? "Partage" : "Service";

                return (
                  <article
                    key={subscription.id}
                    className="rounded-[30px] border border-gray-100 bg-white p-5 shadow-sm overflow-hidden"
                  >
                    <div className="flex items-start gap-4">
                      <div className="size-[72px] rounded-[24px] overflow-hidden shrink-0 border border-gray-100 bg-[#131118]">
                        <ServiceIllustration service={illustrationService} variant="thumb" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-lg font-extrabold leading-tight text-[#131118] truncate">
                              {subscription.product?.name?.trim() || "Service premium"}
                            </h3>
                            <p className="mt-1 text-sm font-medium text-gray-500">{optionLabel}</p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${statusMeta.chipClassName}`}
                          >
                            {statusMeta.label}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-[#f2f0f4] px-3 py-1 text-[11px] font-bold text-[#131118]">
                            {typeLabel}
                          </span>
                          {assignmentCount > 0 && (
                            <span className="rounded-full bg-[#f7f3ff] px-3 py-1 text-[11px] font-bold text-[#5b13ec]">
                              {assignmentCount} affectation{assignmentCount > 1 ? "s" : ""}
                            </span>
                          )}
                          {subscription.auto_renew && (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                              Renouvellement auto
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-[#f8f8fb] px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">Activation</p>
                        <p className="mt-2 text-sm font-bold text-[#131118]">{formatDate(subscription.started_at)}</p>
                      </div>
                      <div className="rounded-2xl bg-[#f8f8fb] px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">Echeance</p>
                        <p className={`mt-2 text-sm font-bold ${expiryMeta.toneClassName}`}>{expiryMeta.label}</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-gray-100 bg-[#fcfcfd] px-4 py-3">
                      <p className="text-sm font-semibold text-[#131118]">{statusMeta.hint}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {subscription.pending_student_kyc
                          ? "Votre verification etudiante doit etre completee avant l'activation finale."
                          : `Derniere echeance enregistree le ${formatDate(subscription.expires_at)}.`}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      {isActiveSubscription(subscription.status) ? (
                        <>
                          <button
                            onClick={() => openAccessSheet(subscription)}
                            disabled={!canOpenAccessSheet}
                            className={`flex-1 rounded-2xl py-3 text-sm font-bold transition-colors ${
                              canOpenAccessSheet
                                ? "bg-[#f2f0f4] text-[#131118] hover:bg-[#e8e6eb]"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {canOpenAccessSheet ? "Acces securise" : "Affectation en cours"}
                          </button>
                          <Link
                            href={serviceHref}
                            className="flex-1 rounded-2xl bg-[#131118] py-3 text-center text-sm font-bold text-white transition-colors hover:bg-black"
                          >
                            Renouveler
                          </Link>
                        </>
                      ) : (
                        <Link
                          href={serviceHref}
                          className="w-full rounded-2xl bg-[#5b13ec] py-3 text-center text-sm font-bold text-white shadow-lg shadow-[#5b13ec]/20 transition-colors hover:bg-[#4a0ebb]"
                        >
                          {isOngoingSubscription(subscription.status) ? "Voir le service" : "Se reabonner"}
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[30px] border border-gray-100 bg-white px-6 py-10 text-center shadow-sm">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#f7f3ff] text-[#5b13ec]">
                <span
                  className="material-symbols-outlined text-[36px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  subscriptions
                </span>
              </div>

              <h2 className="mt-5 text-xl font-black text-[#131118]">
                {activeTab === "actifs" ? "Aucun abonnement en cours" : "Historique vide"}
              </h2>
              <p className="mt-2 text-sm font-medium text-gray-500">
                {activeTab === "actifs"
                  ? "Vos prochains achats et renouvellements apparaitront ici avec leur statut et leur acces."
                  : "Vos abonnements termines ou annules s'afficheront ici pour un suivi complet."}
              </p>

              <Link
                href="/dashboard/services"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#131118] px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-black"
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
                Decouvrir nos offres
              </Link>
            </div>
          )}
        </main>

        <div className="sticky bottom-0 mt-auto w-full bg-white border-t border-[#f2f0f4] px-4 py-3 flex justify-between items-center z-50 sm:rounded-b-[40px] shadow-[0_-5px_20px_rgba(0,0,0,0.03)] pb-safe">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#131118]">
            <span className="material-symbols-outlined">home</span>
            <span className="text-[10px] font-medium">Accueil</span>
          </Link>
          <Link href="/dashboard/services" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#131118]">
            <span className="material-symbols-outlined">grid_view</span>
            <span className="text-[10px] font-medium">Services</span>
          </Link>
          <Link href="/dashboard/souscriptions" className="flex flex-col items-center gap-1 text-[#eab308]">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              subscriptions
            </span>
            <span className="text-[10px] font-bold">Abonnements</span>
          </Link>
          <Link href="/dashboard/wallet" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#131118]">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span className="text-[10px] font-medium">Wallet</span>
          </Link>
          <Link href="/dashboard/compte" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#131118]">
            <span className="material-symbols-outlined">person</span>
            <span className="text-[10px] font-medium">Compte</span>
          </Link>
        </div>
      </div>

      {accessSheet && (
        <div className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-[2px] px-4 py-6 sm:px-0" onClick={() => setAccessSheet(null)}>
          <div className="mx-auto flex h-full w-full max-w-[420px] items-end sm:items-center">
            <div
              className="w-full rounded-[32px] bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Acces securise</p>
                  <h3 className="mt-2 text-2xl font-black text-[#131118]">{accessSheet.title}</h3>
                  <p className="mt-1 text-sm font-medium text-gray-500">{accessSheet.subtitle}</p>
                </div>
                <button
                  onClick={() => setAccessSheet(null)}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f2f0f4] text-[#131118] transition-colors hover:bg-[#e8e6eb]"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="mt-4 inline-flex rounded-full bg-[#f7f3ff] px-3 py-1 text-xs font-bold text-[#5b13ec]">
                {accessSheet.payloadTypeLabel}
              </div>

              <div className="mt-5 space-y-3">
                {accessSheet.entries.map((entry) => (
                  <div key={entry.label} className="rounded-2xl border border-gray-100 bg-[#fcfcfd] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">{entry.label}</p>
                    <p className="mt-2 break-all text-sm font-bold text-[#131118]">{entry.value}</p>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-xs font-medium leading-relaxed text-gray-500">
                Cet apercu reste masque dans l&apos;application pour proteger les informations sensibles liees a votre abonnement.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

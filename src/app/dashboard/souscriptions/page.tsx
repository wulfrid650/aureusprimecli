"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardBottomNav } from "@/components/dashboard/bottom-nav";
import { DashboardHeaderControls } from "@/components/dashboard/header-controls";
import { ServiceIllustration } from "@/components/dashboard/service-illustration";
import { getApiMessage, readApiResponse } from "@/lib/api-response";
import { apiFetch } from "@/lib/fetch";
import { getPlural, type Locale, type TranslateFn, useI18n } from "@/lib/i18n";
import { getActiveAssignmentsCount, getSubscriptionDetailsHref, getVisibleAssignmentAccesses } from "@/lib/subscriptions";

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
  payload?: Record<string, MaskedPayloadValue> | null;
  masked_payload?: Record<string, MaskedPayloadValue> | null;
  notes?: string | null;
};

type SubscriptionAssignment = {
  id: number;
  slot_count?: number;
  revoked_at?: string | null;
  revoked?: boolean;
  account?: SubscriptionAssignedAccount | null;
  service?: {
    name?: string | null;
  } | null;
};

type Subscription = {
  id: number;
  type?: string | null;
  access_ownership_label?: string | null;
  status: string;
  computed_status?: string | null;
  started_at?: string | null;
  expires_at?: string | null;
  days_until_expiry?: number | null;
  credentials_available?: boolean;
  access_state?: {
    status?: string | null;
    label?: string | null;
    message?: string | null;
    requires_admin?: boolean;
    requires_kyc?: boolean;
    can_show_credentials?: boolean;
  } | null;
  auto_renew?: boolean;
  pending_student_kyc?: boolean;
  product?: SubscriptionProduct | null;
  variant?: SubscriptionOption | null;
  productVariation?: SubscriptionOption | null;
  assignedAccount?: SubscriptionAssignedAccount | null;
  assigned_account?: SubscriptionAssignedAccount | null;
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

function formatDate(dateStr: string | null | undefined, dateLocale: string, t: TranslateFn): string {
  if (!dateStr) {
    return t("subscriptions.undefinedDate");
  }

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return t("subscriptions.undefinedDate");
  }

  return new Intl.DateTimeFormat(dateLocale, {
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

function getStatusMeta(status: string | null | undefined, t: TranslateFn) {
  switch (normalizeStatus(status)) {
    case "active":
      return {
        label: t("subscriptions.statusActive"),
        chipClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
        hint: t("subscriptions.hintActive"),
      };
    case "pending":
      return {
        label: t("subscriptions.statusPending"),
        chipClassName: "border-amber-200 bg-amber-50 text-amber-700",
        hint: t("subscriptions.hintPending"),
      };
    case "waiting_manual":
      return {
        label: t("subscriptions.statusWaitingManual"),
        chipClassName: "border-sky-200 bg-sky-50 text-sky-700",
        hint: t("subscriptions.hintWaitingManual"),
      };
    case "pending_student_kyc":
      return {
        label: t("subscriptions.statusKycRequired"),
        chipClassName: "border-violet-200 bg-violet-50 text-violet-700",
        hint: t("subscriptions.hintKycRequired"),
      };
    case "expired":
      return {
        label: t("subscriptions.statusExpired"),
        chipClassName: "border-rose-200 bg-rose-50 text-rose-700",
        hint: t("subscriptions.hintExpired"),
      };
    case "cancelled":
      return {
        label: t("subscriptions.statusCancelled"),
        chipClassName: "border-zinc-200 bg-zinc-100 text-zinc-700",
        hint: t("subscriptions.hintCancelled"),
      };
    default:
      return {
        label: status || t("subscriptions.statusUnknown"),
        chipClassName: "border-gray-200 bg-gray-100 text-gray-700",
        hint: t("subscriptions.hintUnknown"),
      };
  }
}

function getExpiryMeta(subscription: Subscription, dateLocale: string, locale: Locale, t: TranslateFn) {
  const daysUntilExpiry = getDaysUntil(subscription.expires_at);

  if (daysUntilExpiry === null) {
    return {
      label: t("subscriptions.flexibleExpiry"),
      toneClassName: "text-gray-500",
    };
  }

  if (daysUntilExpiry < 0) {
    const count = Math.abs(daysUntilExpiry);
    return {
      label: t("subscriptions.expiredSince", { count, plural: getPlural(locale, count) }),
      toneClassName: "text-rose-600",
    };
  }

  if (daysUntilExpiry === 0) {
    return {
      label: t("subscriptions.expiresToday"),
      toneClassName: "text-amber-600",
    };
  }

  if (daysUntilExpiry <= 7) {
    return {
      label: t("subscriptions.expiresIn", { count: daysUntilExpiry, plural: getPlural(locale, daysUntilExpiry) }),
      toneClassName: "text-amber-600",
    };
  }

  return {
    label: t("subscriptions.validUntil", { date: formatDate(subscription.expires_at, dateLocale, t) }),
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

function getPayloadTypeLabel(payloadType: string | null | undefined, t: TranslateFn): string {
  if (payloadType === "link") {
    return t("subscriptions.payloadLink");
  }

  if (payloadType === "credentials") {
    return t("subscriptions.payloadCredentials");
  }

  return t("subscriptions.payloadProtected");
}

export default function SouscriptionsPage() {
  const router = useRouter();
  const { dateLocale, locale, t } = useI18n();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"actifs" | "historique">("actifs");
  const [accessSheet, setAccessSheet] = useState<AccessSheetState | null>(null);

  const loadSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await apiFetch("/api/v1/me/subscriptions", { cache: "no-store" });
      const payload = await readApiResponse<Subscription[]>(response);

      if (!response.ok) {
        setSubscriptions([]);
        setError(getApiMessage(payload, t("subscriptions.loadError")));
        return;
      }

      setSubscriptions(Array.isArray(payload?.data) ? payload.data : []);
    } catch (loadError) {
      console.error("Failed to fetch subscriptions:", loadError);
      setSubscriptions([]);
      setError(t("subscriptions.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSubscriptions();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadSubscriptions]);

  const ongoingSubscriptions = useMemo(
    () => subscriptions.filter((subscription) => isOngoingSubscription(subscription.computed_status ?? subscription.status)),
    [subscriptions],
  );

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((subscription) => isActiveSubscription(subscription.computed_status ?? subscription.status)),
    [subscriptions],
  );

  const historySubscriptions = useMemo(
    () => subscriptions.filter((subscription) => !isOngoingSubscription(subscription.computed_status ?? subscription.status)),
    [subscriptions],
  );

  // L'historique regroupe par service (Netflix, Spotify...) plutôt que
  // d'empiler une carte pleine par abonnement passé : évite la fatigue
  // visuelle d'un long historique de tests/renouvellements.
  const historyGroups = useMemo(() => {
    const groups = new Map<string, { key: string; product: SubscriptionProduct | null | undefined; items: Subscription[] }>();

    for (const subscription of historySubscriptions) {
      const key = subscription.product?.slug || subscription.product?.name || `service-${subscription.id}`;
      const existing = groups.get(key);

      if (existing) {
        existing.items.push(subscription);
      } else {
        groups.set(key, { key, product: subscription.product, items: [subscription] });
      }
    }

    return Array.from(groups.values());
  }, [historySubscriptions]);

  const [expandedHistoryGroups, setExpandedHistoryGroups] = useState<Set<string>>(new Set());

  const toggleHistoryGroup = useCallback((key: string) => {
    setExpandedHistoryGroups((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

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
    if (!subscription.credentials_available && !subscription.access_state?.can_show_credentials) {
      return;
    }

    const accessGroups = getVisibleAssignmentAccesses(subscription);
    const entries = accessGroups.flatMap((access) =>
      Object.entries(access.payload)
        .filter(([, value]) => value !== null && value !== "")
        .map(([key, value]) => ({
          label:
            accessGroups.length > 1
              ? `${access.serviceName} - ${formatFieldLabel(key)}`
              : formatFieldLabel(key),
          value: String(value),
        })),
    );

    if (entries.length === 0) {
      return;
    }

    setAccessSheet({
      title: subscription.product?.name?.trim() || t("subscriptions.accessAureus"),
      subtitle:
        subscription.variant?.name?.trim() ||
        subscription.productVariation?.name?.trim() ||
        t("subscriptions.activeSubscription"),
      payloadTypeLabel:
        accessGroups.length > 1
          ? getPayloadTypeLabel("credentials", t)
          : getPayloadTypeLabel(accessGroups[0]?.payloadType, t),
      entries,
    });
  };

  return (
    <div className="dashboard-mode bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
      <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-[#f6f6f8] sm:rounded-[40px] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col mx-auto h-[100dvh] sm:h-auto">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm px-5 py-4 flex items-center justify-between gap-3 border-b border-[#f2f0f4]">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center size-10 shrink-0 rounded-full bg-white border border-gray-100 text-[#131118] hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight">{t("subscriptions.title")}</h1>
              <p className="truncate text-xs text-gray-500">{t("subscriptions.headerSubtitle")}</p>
            </div>
          </div>
          <DashboardHeaderControls />
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth px-5 pb-28 pt-3">
          <section className="mb-4 rounded-[30px] bg-[#131118] p-5 text-white shadow-xl shadow-black/15 overflow-hidden relative">
            <div className="absolute inset-0 border border-white/10" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">Aureus Prime</p>
                  <h2 className="mt-2 text-2xl font-black leading-tight">{t("subscriptions.heroTitle")}</h2>
                  <p className="mt-2 text-sm text-white/70">{t("subscriptions.heroSubtitle")}</p>
                </div>
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[24px] text-[#dbb723]">subscriptions</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/50">{t("subscriptions.ongoing")}</p>
                  <p className="mt-2 text-2xl font-black">{ongoingSubscriptions.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/50">{t("subscriptions.active")}</p>
                  <p className="mt-2 text-2xl font-black">{activeSubscriptions.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/50">{t("subscriptions.renewSoon")}</p>
                  <p className="mt-2 text-2xl font-black">{expiringSoonCount}</p>
                </div>
              </div>
            </div>
          </section>

          <Link
            href="/dashboard/cartes-cadeaux"
            className="mb-4 flex items-center gap-3 rounded-[24px] border border-gray-100 bg-white px-4 py-3.5 shadow-sm transition-colors hover:bg-[#f8f8fb]"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#f7f3ff] text-[#5b13ec]">
              <span className="material-symbols-outlined text-[20px]">card_giftcard</span>
            </div>
            <span className="flex-1 text-sm font-bold text-[#131118]">{t("giftCards.title")}</span>
            <span className="material-symbols-outlined text-[18px] text-gray-300">chevron_right</span>
          </Link>

          <div className="mb-4 flex bg-white/70 p-1 rounded-xl w-full border border-gray-100 shadow-sm">
            <button
              onClick={() => setActiveTab("actifs")}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "actifs" ? "bg-white shadow-sm text-[#131118]" : "text-gray-500 hover:text-[#131118]"
              }`}
            >
              {t("subscriptions.ongoing")} ({ongoingSubscriptions.length})
            </button>
            <button
              onClick={() => setActiveTab("historique")}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === "historique" ? "bg-white shadow-sm text-[#131118]" : "text-gray-500 hover:text-[#131118]"
              }`}
            >
              {t("subscriptions.history")} ({historySubscriptions.length})
            </button>
          </div>

          {error && !isLoading && (
            <div className="mb-4 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined mt-0.5 text-[20px]">error</span>
                <div className="flex-1">
                  <p className="font-bold">{t("subscriptions.loadingImpossible")}</p>
                  <p className="mt-1 text-red-600/90">{error}</p>
                  <button
                    onClick={() => void loadSubscriptions()}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    {t("common.retry")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          ) : activeTab === "historique" && historyGroups.length > 0 ? (
            <div className="flex flex-col gap-3">
              {historyGroups.map((group) => {
                const isExpanded = expandedHistoryGroups.has(group.key);
                const illustrationService = {
                  title: group.product?.name?.trim() || "Aureus Prime",
                  category: group.product?.category?.name?.trim() || t("subscriptions.subscriptionCategory"),
                  currentPriceFormatted: "",
                  priceHint: "",
                  billingSummary: "",
                  optionCount: 1,
                };

                return (
                  <div key={group.key} className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleHistoryGroup(group.key)}
                      className="flex w-full items-center gap-4 p-4 text-left"
                    >
                      <div className="size-12 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-[#131118]">
                        <ServiceIllustration service={illustrationService} variant="thumb" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-extrabold text-[#131118]">
                          {group.product?.name?.trim() || t("subscriptions.premiumService")}
                        </p>
                        <p className="text-xs font-medium text-gray-400">
                          {t("subscriptions.historyCount", {
                            count: group.items.length,
                            plural: getPlural(locale, group.items.length),
                          })}
                        </p>
                      </div>
                      <span
                        className="material-symbols-outlined shrink-0 text-gray-400 transition-transform"
                        style={{ transform: isExpanded ? "rotate(180deg)" : undefined }}
                      >
                        expand_more
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-100">
                        {group.items.map((subscription) => {
                          const displayStatus = subscription.computed_status ?? subscription.status;
                          const statusMeta = getStatusMeta(displayStatus, t);
                          const optionLabel =
                            subscription.variant?.name?.trim() ||
                            subscription.productVariation?.name?.trim() ||
                            t("subscriptions.standardPlan");

                          return (
                            <Link
                              key={subscription.id}
                              href={getSubscriptionDetailsHref(subscription.id)}
                              className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 transition-colors last:border-b-0 hover:bg-[#f8f8fb]"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-[#131118]">{optionLabel}</p>
                                <p className="text-xs text-gray-400">
                                  {formatDate(subscription.started_at, dateLocale, t)} – {formatDate(subscription.expires_at, dateLocale, t)}
                                </p>
                              </div>
                              <span
                                className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] ${statusMeta.chipClassName}`}
                              >
                                {statusMeta.label}
                              </span>
                              <span className="material-symbols-outlined shrink-0 text-[16px] text-gray-300">chevron_right</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : activeTab === "actifs" && filteredSubscriptions.length > 0 ? (
            <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
              {filteredSubscriptions.map((subscription) => {
                const displayStatus = subscription.computed_status ?? subscription.status;
                const statusMeta = getStatusMeta(displayStatus, t);
                const expiryMeta = getExpiryMeta(subscription, dateLocale, locale, t);
                const serviceHref = subscription.product?.slug
                  ? `/dashboard/services/${subscription.product.slug}`
                  : "/dashboard/services";
                const optionLabel =
                  subscription.variant?.name?.trim() ||
                  subscription.productVariation?.name?.trim() ||
                  t("subscriptions.standardPlan");
                const visibleAccessGroups = getVisibleAssignmentAccesses(subscription);
                const canOpenAccessSheet =
                  (subscription.credentials_available || subscription.access_state?.can_show_credentials === true) &&
                  isActiveSubscription(displayStatus) &&
                  visibleAccessGroups.length > 0;
                const illustrationService = {
                  title: subscription.product?.name?.trim() || "Aureus Prime",
                  category: subscription.product?.category?.name?.trim() || t("subscriptions.subscriptionCategory"),
                  currentPriceFormatted: statusMeta.label,
                  priceHint: t("subscriptions.state"),
                  billingSummary: optionLabel,
                  optionCount: 1,
                };
                const assignmentCount = getActiveAssignmentsCount(subscription);
                // Générique : dérivé du delivery_type de la formule (Commun/
                // Partagé/Personnel), valable pour n'importe quel produit,
                // pas seulement Netflix/Prime Video. Repli sur l'ancien type
                // si le delivery_type n'est pas encore configuré.
                const typeLabel =
                  subscription.access_ownership_label ??
                  (subscription.type === "personal"
                    ? t("subscriptions.accessPersonal")
                    : subscription.type === "shared"
                      ? t("subscriptions.accessShared")
                      : t("common.service"));

                return (
                  <article
                    key={subscription.id}
                    className="flex h-full flex-col rounded-[30px] border border-gray-100 bg-white p-5 shadow-sm overflow-hidden"
                  >
                    <div className="flex items-start gap-4">
                      <div className="size-[72px] rounded-[24px] overflow-hidden shrink-0 border border-gray-100 bg-[#131118]">
                        <ServiceIllustration service={illustrationService} variant="thumb" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-lg font-extrabold leading-tight text-[#131118] truncate">
                              {subscription.product?.name?.trim() || t("subscriptions.premiumService")}
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
                              {t("subscriptions.assignments", {
                                count: assignmentCount,
                                plural: getPlural(locale, assignmentCount),
                              })}
                            </span>
                          )}
                          {subscription.auto_renew && (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                              {t("subscriptions.autoRenewal")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-[#f8f8fb] px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">{t("subscriptions.activation")}</p>
                        <p className="mt-2 text-sm font-bold text-[#131118]">{formatDate(subscription.started_at, dateLocale, t)}</p>
                      </div>
                      <div className="rounded-2xl bg-[#f8f8fb] px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">{t("subscriptions.expiry")}</p>
                        <p className={`mt-2 text-sm font-bold ${expiryMeta.toneClassName}`}>{expiryMeta.label}</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-gray-100 bg-[#fcfcfd] px-4 py-3">
                      <p className="text-sm font-semibold text-[#131118]">{statusMeta.hint}</p>
                      <p className="mt-1 text-xs text-gray-500">
                          {subscription.access_state?.message ||
                          (subscription.pending_student_kyc
                          ? t("subscriptions.studentKycPending")
                          : t("subscriptions.lastExpiry", { date: formatDate(subscription.expires_at, dateLocale, t) }))}
                      </p>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                      <Link
                        href={getSubscriptionDetailsHref(subscription.id)}
                        className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-3 text-center text-sm font-bold text-[#131118] transition-colors hover:bg-[#f8f8fb]"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                        {t("common.seeDetails")}
                      </Link>

                      {isActiveSubscription(displayStatus) ? (
                        <>
                          <Link
                            href={serviceHref}
                            className="flex min-h-12 items-center justify-center rounded-2xl bg-[#131118] px-3 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-black"
                          >
                            {t("subscriptions.renew")}
                          </Link>
                          <button
                            onClick={() => openAccessSheet(subscription)}
                            disabled={!canOpenAccessSheet}
                            className={`min-h-12 rounded-2xl px-3 py-3 text-sm font-bold transition-colors ${
                              canOpenAccessSheet
                                ? "bg-[#f2f0f4] text-[#131118] hover:bg-[#e8e6eb]"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {canOpenAccessSheet ? t("common.secureAccess") : t("subscriptions.assignmentPending")}
                          </button>
                        </>
                      ) : (
                        <Link
                          href={serviceHref}
                          className="col-span-2 flex min-h-12 items-center justify-center rounded-2xl bg-[#131118] px-3 py-3 text-center text-sm font-bold text-white shadow-lg shadow-black/10 transition-colors hover:bg-black"
                        >
                          {isOngoingSubscription(displayStatus) ? t("common.seeService") : t("subscriptions.resubscribe")}
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
                {activeTab === "actifs" ? t("subscriptions.emptyActiveTitle") : t("subscriptions.emptyHistoryTitle")}
              </h2>
              <p className="mt-2 text-sm font-medium text-gray-500">
                {activeTab === "actifs"
                  ? t("subscriptions.emptyActiveText")
                  : t("subscriptions.emptyHistoryText")}
              </p>

              <Link
                href="/dashboard/services"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#131118] px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-black"
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
                {t("subscriptions.discoverOffers")}
              </Link>
            </div>
          )}
        </main>

        <DashboardBottomNav active="subscriptions" />
      </div>

      {accessSheet && (
        <div className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-[2px] px-4 py-6 sm:px-0" onClick={() => setAccessSheet(null)}>
          <div className="mx-auto flex h-full w-full max-w-[420px] items-end sm:items-center">
            <div
              className="w-full rounded-[32px] border border-gray-100 bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">{t("common.secureAccess")}</p>
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
                {t("subscriptions.accessPrivacyNote")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

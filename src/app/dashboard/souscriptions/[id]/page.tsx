"use client";

import { use, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardBottomNav } from "@/components/dashboard/bottom-nav";
import { ServiceIllustration } from "@/components/dashboard/service-illustration";
import { DashboardHeaderControls } from "@/components/dashboard/header-controls";
import { getPlural, useI18n, type TranslateFn } from "@/lib/i18n";
import {
  fetchUserSubscription,
  getDaysUntil,
  getSubscriptionOption,
  getVisibleAssignmentAccesses,
  isActiveSubscription,
  isOngoingSubscription,
  normalizeStatus,
  parseSubscriptionRouteId,
  type Subscription,
} from "@/lib/subscriptions";

function formatDate(dateStr?: string | null, dateLocale = "fr-FR", t?: TranslateFn): string {
  if (!dateStr) {
    return t?.("subscriptions.undefinedDate") ?? "Undefined date";
  }

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return t?.("subscriptions.undefinedDate") ?? "Undefined date";
  }

  return new Intl.DateTimeFormat(dateLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
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

function getExpiryMeta(subscription: Subscription, dateLocale: string, t: TranslateFn, locale: "fr" | "en") {
  const daysUntilExpiry = getDaysUntil(subscription.expires_at);

  if (daysUntilExpiry === null) {
    return {
      label: t("subscriptions.flexibleExpiry"),
      toneClassName: "text-gray-500",
    };
  }

  if (daysUntilExpiry < 0) {
    return {
      label: t("subscriptions.expiredSince", {
        count: Math.abs(daysUntilExpiry),
        plural: getPlural(locale, Math.abs(daysUntilExpiry)),
      }),
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
      label: t("subscriptions.expiresIn", {
        count: daysUntilExpiry,
        plural: getPlural(locale, daysUntilExpiry),
      }),
      toneClassName: "text-amber-600",
    };
  }

  return {
    label: t("subscriptions.validUntil", { date: formatDate(subscription.expires_at, dateLocale, t) }),
    toneClassName: "text-gray-500",
  };
}

function getPayloadTypeLabel(payloadType: string | null | undefined, t: TranslateFn, locale: "fr" | "en"): string {
  if (payloadType === "link") {
    return t("subscriptions.payloadLink");
  }

  if (payloadType === "credentials") {
    return locale === "en" ? "Credentials" : "Identifiants";
  }

  return t("subscriptions.payloadProtected");
}

function getAccessModeLabel(accessMode: string | null | undefined, t: TranslateFn): string {
  switch (accessMode?.trim().toLowerCase()) {
    case "common":
    case "commun":
      return t("subscriptions.accessCommon");
    case "shared":
    case "partage":
      return t("subscriptions.accessShared");
    case "personal":
    case "personnel":
      return t("subscriptions.accessPersonal");
    default:
      return t("common.service");
  }
}

function isUrlValue(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

async function copyTextToClipboard(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

function renderLinkedText(text: string) {
  const matches = Array.from(text.matchAll(/https?:\/\/[^\s]+/gi));

  if (matches.length === 0) {
    return text;
  }

  const parts: ReactNode[] = [];
  let cursor = 0;

  matches.forEach((match, index) => {
    const url = match[0];
    const start = match.index ?? 0;

    if (start > cursor) {
      parts.push(text.slice(cursor, start));
    }

    parts.push(
      <a
        key={`${url}-${index}`}
        href={url}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-[#131118] underline decoration-[#131118]/30 underline-offset-4"
      >
        {url}
      </a>,
    );

    cursor = start + url.length;
  });

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts;
}

function formatFieldLabel(field: string, t: TranslateFn): string {
  const normalized = field.trim().toLowerCase();

  if (["email", "mail", "username", "login"].includes(normalized)) {
    return t("common.emailAddress");
  }

  if (["password", "pass", "mot_de_passe"].includes(normalized)) {
    return t("common.password");
  }

  if (["code", "key", "cle", "clé", "license", "licence", "license_key", "licence_key", "api_key", "pin"].includes(normalized)) {
    return t("common.code");
  }

  if (["url", "link", "lien"].includes(normalized)) {
    return t("subscriptions.payloadLink");
  }

  const cleaned = field.replace(/[_-]+/g, " ").trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : t("subscriptions.accessAureus");
}

export default function SubscriptionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { dateLocale, locale, t } = useI18n();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedEntryKey, setCopiedEntryKey] = useState("");

  const subscriptionId = parseSubscriptionRouteId(resolvedParams.id);
  const isValidSubscriptionId = subscriptionId !== null;

  useEffect(() => {
    let isActive = true;

    async function loadSubscription() {
      setIsLoading(true);
      setError("");

      if (subscriptionId === null) {
        setSubscription(null);
        setError(t("subscriptions.loadError"));
        setIsLoading(false);
        return;
      }

      try {
        const nextSubscription = await fetchUserSubscription(subscriptionId);

        if (isActive) {
          setSubscription(nextSubscription);
        }
      } catch (loadError) {
        console.error("Failed to fetch subscription:", loadError);

        if (isActive) {
          setSubscription(null);
          setError(loadError instanceof Error ? loadError.message : t("subscriptions.loadError"));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadSubscription();

    return () => {
      isActive = false;
    };
  }, [isValidSubscriptionId, subscriptionId, t]);

  const visibleAccessGroups = useMemo(
    () =>
      subscription
        ? getVisibleAssignmentAccesses(subscription).map((access) => ({
          ...access,
          entries: Object.entries(access.payload)
            .filter(([, value]) => value !== null && value !== "")
            .map(([key, value]) => ({
              field: key,
              label: formatFieldLabel(key, t),
              value: String(value),
            })),
        })).filter((access) => access.entries.length > 0)
        : [],
    [subscription, t],
  );
  const visiblePayloadEntries = visibleAccessGroups.flatMap((access) => access.entries);
  const primaryPayloadType = visibleAccessGroups[0]?.payloadType;
  const deliverySteps = subscription?.assigned_account?.delivery_steps ?? subscription?.assignedAccount?.delivery_steps ?? [];
  const displayStatus = subscription ? subscription.computed_status ?? subscription.status : null;
  const statusMeta = subscription ? getStatusMeta(displayStatus, t) : null;
  const expiryMeta = subscription ? getExpiryMeta(subscription, dateLocale, t, locale) : null;
  const optionLabel = subscription
    ? getSubscriptionOption(subscription)?.name?.trim() || t("subscriptions.standardPlan")
    : t("subscriptions.standardPlan");
  const productName = subscription?.product?.name?.trim() || t("subscriptions.premiumService");
  const serviceHref = subscription?.product?.slug ? `/dashboard/services/${subscription.product.slug}` : "/dashboard/services";
  const typeLabel = subscription ? getAccessModeLabel(subscription.access_mode ?? subscription.type, t) : t("common.service");
  const isActive = subscription ? isActiveSubscription(displayStatus) : false;

  async function handleCopyAccessValue(value: string, entryKey: string) {
    try {
      await copyTextToClipboard(value);
      setCopiedEntryKey(entryKey);
      window.setTimeout(() => {
        setCopiedEntryKey((current) => (current === entryKey ? "" : current));
      }, 1800);
    } catch (copyError) {
      console.error("Failed to copy subscription access value:", copyError);
    }
  }

  return (
    <div className="dashboard-mode bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
      <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-[#f6f6f8] sm:rounded-[40px] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col mx-auto h-[100dvh] sm:h-auto">
        <header className="sticky top-0 z-50 bg-[#f6f6f8]/95 backdrop-blur-md px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center size-9 shrink-0 rounded-full bg-white border border-gray-100 text-[#131118] hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">{t("common.dashboard")}</p>
              <h1 className="truncate text-lg font-bold tracking-tight">{t("common.seeDetails")}</h1>
            </div>
          </div>
          <DashboardHeaderControls />
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth px-5 pb-28 pt-2">
          {isLoading ? (
            <div className="flex flex-col gap-4">
              <div className="h-52 rounded-[32px] bg-white p-5 shadow-sm animate-pulse">
                <div className="h-20 w-20 rounded-[26px] bg-gray-100" />
                <div className="mt-5 h-8 w-2/3 rounded bg-gray-100" />
                <div className="mt-3 h-4 w-1/2 rounded bg-gray-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 rounded-3xl bg-white animate-pulse" />
                <div className="h-24 rounded-3xl bg-white animate-pulse" />
              </div>
            </div>
          ) : error || !subscription || !statusMeta || !expiryMeta ? (
            <div className="rounded-[30px] border border-red-100 bg-white px-6 py-10 text-center shadow-sm">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-red-50 text-red-600">
                <span className="material-symbols-outlined text-[36px]">error</span>
              </div>
              <h2 className="mt-5 text-xl font-black text-[#131118]">{t("subscriptions.loadingImpossible")}</h2>
              <p className="mt-2 text-sm font-medium text-gray-500">{error || t("subscriptions.loadError")}</p>
              <Link
                href="/dashboard/souscriptions"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#131118] px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-black"
              >
                <span className="material-symbols-outlined text-[18px]">subscriptions</span>
                {t("subscriptions.title")}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <section className="rounded-[32px] bg-[#131118] p-5 text-white shadow-xl shadow-black/15 overflow-hidden relative">
                <div className="absolute inset-0 border border-white/10" />
                <div className="relative z-10 flex items-start gap-4">
                  <div className="size-[78px] shrink-0 overflow-hidden rounded-[26px] border border-white/10 bg-white/5">
                    <ServiceIllustration
                      service={{
                        title: productName,
                        category: subscription.product?.category?.name?.trim() || t("subscriptions.subscriptionCategory"),
                        currentPriceFormatted: statusMeta.label,
                        priceHint: t("subscriptions.state"),
                        billingSummary: optionLabel,
                        optionCount: 1,
                      }}
                      variant="thumb"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                      {t("subscriptions.activeSubscription")}
                    </p>
                    <h2 className="mt-2 text-2xl font-black leading-tight">{productName}</h2>
                    <p className="mt-2 text-sm font-medium text-white/70">{optionLabel}</p>
                    <span className={`mt-4 inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${statusMeta.chipClassName}`}>
                      {statusMeta.label}
                    </span>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-2 gap-3">
                <div className="rounded-3xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">{t("subscriptions.activation")}</p>
                  <p className="mt-2 text-sm font-bold text-[#131118]">{formatDate(subscription.started_at, dateLocale, t)}</p>
                </div>
                <div className="rounded-3xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">{t("subscriptions.expiry")}</p>
                  <p className={`mt-2 text-sm font-bold ${expiryMeta.toneClassName}`}>{expiryMeta.label}</p>
                </div>
              </section>

              <section className="rounded-[30px] border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">{t("subscriptions.state")}</p>
                    <h3 className="mt-2 text-xl font-black text-[#131118]">{statusMeta.label}</h3>
                    <p className="mt-1 text-sm font-medium text-gray-500">{subscription.access_state?.message || statusMeta.hint}</p>
                  </div>
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#f7f3ff] text-[#5b13ec]">
                    <span className="material-symbols-outlined text-[24px]">monitoring</span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3">
                  <div className="rounded-2xl bg-[#f8f8fb] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">{t("common.service")}</p>
                    <p className="mt-2 text-sm font-bold text-[#131118]">{typeLabel}</p>
                  </div>
                  {subscription.renewal_amount_formatted && (
                    <div className="rounded-2xl bg-[#f8f8fb] px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">{t("subscriptions.renew")}</p>
                      <p className="mt-2 text-sm font-bold text-[#131118]">{subscription.renewal_amount_formatted}</p>
                    </div>
                  )}
                  {subscription.assignments && subscription.assignments.length > 0 && (
                    <div className="rounded-2xl bg-[#f8f8fb] px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">{t("subscriptions.assignments", {
                        count: subscription.assignments.length,
                        plural: getPlural(locale, subscription.assignments.length),
                      })}</p>
                      <p className="mt-2 text-sm font-bold text-[#131118]">
                        {subscription.assignments.length}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[30px] border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
                      {t("common.secureAccess")}
                    </p>
                    <h3 className="mt-2 text-xl font-black text-[#131118]">
                      {visiblePayloadEntries.length > 0 ? getPayloadTypeLabel(primaryPayloadType, t, locale) : t("subscriptions.assignmentPending")}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                      {visiblePayloadEntries.length > 0
                        ? t("subscriptions.accessFootnote")
                        : subscription.access_state?.message ||
                        (isActive
                          ? t("subscriptions.hintWaitingManual")
                          : statusMeta.hint)}
                    </p>
                  </div>
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <span className="material-symbols-outlined text-[24px]">lock</span>
                  </div>
                </div>

                {visibleAccessGroups.length > 0 && (
                  <div className="mt-5 space-y-3">
                    {visibleAccessGroups.map((access) => (
                      <div key={`${access.serviceName}-${access.assignmentId ?? "fallback"}`} className="rounded-2xl border border-gray-100 bg-[#fcfcfd] px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">{access.serviceName}</p>
                        <div className="mt-3 space-y-3">
                          {access.entries.map((entry) => (
                            <div key={`${access.assignmentId ?? access.serviceName}-${entry.field}`} className="rounded-xl bg-white px-3 py-3 ring-1 ring-gray-100">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">{entry.label}</p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopyAccessValue(
                                      entry.value,
                                      `${access.assignmentId ?? access.serviceName}-${entry.field}`,
                                    )
                                  }
                                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#f2f0f4] px-3 py-1.5 text-[11px] font-bold text-[#131118] transition-colors hover:bg-[#e8e6eb]"
                                  aria-label={`${t("common.copy")} ${entry.label}`}
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    {copiedEntryKey === `${access.assignmentId ?? access.serviceName}-${entry.field}` ? "check" : "content_copy"}
                                  </span>
                                  {copiedEntryKey === `${access.assignmentId ?? access.serviceName}-${entry.field}` ? t("common.copied") : t("common.copy")}
                                </button>
                              </div>
                              {isUrlValue(entry.value) ? (
                                <a
                                  href={entry.value}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 block break-all text-sm font-bold text-[#131118] underline decoration-[#131118]/30 underline-offset-4"
                                >
                                  {entry.value}
                                </a>
                              ) : (
                                <p className="mt-2 break-all text-sm font-bold text-[#131118]">{entry.value}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {deliverySteps.length > 0 && (
                  <div className="mt-5 rounded-2xl border border-gray-100 bg-[#fcfcfd] px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                      {t("subscriptions.deliverySteps")}
                    </p>
                    <ol className="mt-3 space-y-3">
                      {deliverySteps.map((step, index) => (
                        <li key={`${index}-${step}`} className="flex items-start gap-3">
                          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#131118] text-[11px] font-bold text-white">
                            {index + 1}
                          </span>
                          <p className="flex-1 text-sm font-medium leading-6 text-[#131118]">
                            {renderLinkedText(step)}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </section>

              <div className="flex items-center gap-2">
                <Link
                  href={serviceHref}
                  className="flex-1 rounded-2xl bg-[#131118] py-3.5 text-center text-sm font-bold text-white transition-colors hover:bg-black"
                >
                  {isOngoingSubscription(displayStatus) ? t("common.seeService") : t("subscriptions.resubscribe")}
                </Link>
                <Link
                  href="/dashboard/souscriptions"
                  className="flex-1 rounded-2xl bg-[#f2f0f4] py-3.5 text-center text-sm font-bold text-[#131118] transition-colors hover:bg-[#e8e6eb]"
                >
                  {t("subscriptions.title")}
                </Link>
              </div>
            </div>
          )}
        </main>

        <DashboardBottomNav active="subscriptions" />
      </div>
    </div>
  );
}

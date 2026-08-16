"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardBottomNav } from "@/components/dashboard/bottom-nav";
import { DashboardHeaderControls } from "@/components/dashboard/header-controls";
import { ServiceIllustration } from "@/components/dashboard/service-illustration";
import { safeFetch } from "@/lib/fetch";
import { getPlural, useI18n } from "@/lib/i18n";

type GiftStatus = "delivered" | "waiting_stock" | "pending" | "failed" | "refunded";

type GiftOrder = {
  id: number;
  order_number?: string | null;
  display_label?: string | null;
  total_amount_formatted?: string | null;
  gift_status?: GiftStatus | null;
  gift_code?: string | null;
  created_at?: string | null;
  product?: {
    name?: string | null;
  } | null;
};

async function copyTextToClipboard(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export default function GiftCardsPage() {
  const { dateLocale, locale, t } = useI18n();
  const [orders, setOrders] = useState<GiftOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isActive = true;

    safeFetch<{ data?: GiftOrder[] }>("/api/v1/me/orders?per_page=100")
      .then((payload) => {
        if (!isActive) return;
        const giftOrders = (payload?.data ?? []).filter((order) => order.gift_status != null);
        setOrders(giftOrders);
      })
      .catch((err) => console.error("Failed to fetch gift card orders:", err))
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  // Même logique que l'historique des abonnements : regrouper par service
  // plutôt qu'empiler une carte par commande, surtout utile dès qu'on a
  // acheté plusieurs cartes du même service (ex: plusieurs Robux).
  const groups = useMemo(() => {
    const map = new Map<string, { key: string; label: string; items: GiftOrder[] }>();

    for (const order of orders) {
      const label = order.product?.name?.trim() || order.display_label?.trim() || t("subscriptions.premiumService");
      const key = label.toLowerCase();
      const existing = map.get(key);

      if (existing) {
        existing.items.push(order);
      } else {
        map.set(key, { key, label, items: [order] });
      }
    }

    return Array.from(map.values());
  }, [orders, t]);

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const formatDate = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" });
  };

  const handleCopy = async (order: GiftOrder) => {
    if (!order.gift_code) return;
    await copyTextToClipboard(order.gift_code);
    setCopiedId(order.id);
    window.setTimeout(() => setCopiedId((current) => (current === order.id ? null : current)), 2000);
  };

  const statusMeta = (status: GiftOrder["gift_status"]) => {
    switch (status) {
      case "delivered":
        return { label: t("giftCards.delivered"), className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
      case "waiting_stock":
        return { label: t("giftCards.waitingStock"), className: "border-amber-200 bg-amber-50 text-amber-700" };
      case "failed":
        return { label: t("giftCards.failed"), className: "border-red-200 bg-red-50 text-red-700" };
      case "refunded":
        return { label: t("giftCards.refunded"), className: "border-gray-200 bg-gray-100 text-gray-500" };
      default:
        return { label: t("giftCards.pending"), className: "border-gray-200 bg-gray-100 text-gray-600" };
    }
  };

  const statusMessage = (status: GiftOrder["gift_status"]) => {
    switch (status) {
      case "delivered":
        return t("giftCards.delivedHint");
      case "waiting_stock":
        return t("giftCards.waitingStockHint");
      case "failed":
        return t("giftCards.failedHint");
      case "refunded":
        return t("giftCards.refundedHint");
      default:
        return t("giftCards.pendingHint");
    }
  };

  return (
    <div className="dashboard-mode bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
      <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-[#f6f6f8] sm:rounded-[40px] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col mx-auto h-[100dvh] sm:h-auto">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm px-5 py-4 flex items-center justify-between gap-3 border-b border-[#f2f0f4]">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-center size-10 shrink-0 rounded-full bg-white border border-gray-100 text-[#131118] hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <h1 className="truncate text-lg font-bold tracking-tight">{t("giftCards.title")}</h1>
          </div>
          <DashboardHeaderControls />
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth px-5 pb-28 pt-4">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[0, 1].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-[24px] bg-white" />
              ))}
            </div>
          ) : groups.length > 0 ? (
            <div className="flex flex-col gap-3">
              {groups.map((group) => {
                const isExpanded = expandedGroups.has(group.key);
                const illustrationService = {
                  title: group.label,
                  category: t("giftCards.title"),
                  currentPriceFormatted: "",
                  priceHint: "",
                  billingSummary: "",
                  optionCount: 1,
                };

                return (
                  <div key={group.key} className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.key)}
                      className="flex w-full items-center gap-4 p-4 text-left"
                    >
                      <div className="size-12 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-[#131118]">
                        <ServiceIllustration service={illustrationService} variant="thumb" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-extrabold text-[#131118]">{group.label}</p>
                        <p className="text-xs font-medium text-gray-400">
                          {t("giftCards.groupCount", {
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
                      <div className="flex flex-col gap-3 border-t border-gray-100 p-4 pt-3">
                        {group.items.map((order) => {
                          const meta = statusMeta(order.gift_status);

                          return (
                            <div key={order.id} className="rounded-2xl bg-[#f8f8fb] p-3">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-xs text-gray-400">
                                  {formatDate(order.created_at)} · {order.total_amount_formatted}
                                </p>
                                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] ${meta.className}`}>
                                  {meta.label}
                                </span>
                              </div>

                              {order.gift_status === "delivered" && order.gift_code ? (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(order)}
                                  className="mt-2 flex w-full items-center justify-between gap-2 rounded-xl bg-white px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                                >
                                  <span className="truncate font-mono text-sm font-bold text-[#131118]">{order.gift_code}</span>
                                  <span className="material-symbols-outlined shrink-0 text-[16px] text-gray-400">
                                    {copiedId === order.id ? "check" : "content_copy"}
                                  </span>
                                </button>
                              ) : (
                                <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{statusMessage(order.gift_status)}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[30px] border border-gray-100 bg-white px-6 py-10 text-center shadow-sm">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#f7f3ff] text-[#5b13ec]">
                <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  card_giftcard
                </span>
              </div>
              <h2 className="mt-4 text-lg font-black text-[#131118]">{t("giftCards.emptyTitle")}</h2>
              <p className="mt-1 text-sm text-gray-500">{t("giftCards.emptyText")}</p>
            </div>
          )}
        </main>

        <DashboardBottomNav />
      </div>
    </div>
  );
}

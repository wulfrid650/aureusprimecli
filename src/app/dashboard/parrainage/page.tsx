"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardBottomNav } from "@/components/dashboard/bottom-nav";
import { DashboardHeaderControls } from "@/components/dashboard/header-controls";
import { safeFetch } from "@/lib/fetch";
import { type TranslateFn, useI18n } from "@/lib/i18n";

const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");

type ReferralCodeResponse = {
  data?: {
    referral_code?: string;
  };
};

type ReferralStatsResponse = {
  data?: {
    total_referrals?: number;
    total_commission?: number;
    pending_commission?: number;
    completed_referrals?: number;
  };
};

type ReferralItem = {
  id: number;
  status?: string;
  confirmed?: boolean;
  created_at?: string;
  referred_user_masked_id?: string;
  referred_user_masked_name?: string;
  commission_amount?: number;
  order_amount?: number;
};

type ReferralsResponse = {
  data?: ReferralItem[];
};

function formatMoney(value: number | undefined, dateLocale: string) {
  return `${new Intl.NumberFormat(dateLocale).format(Math.round(value ?? 0)).replace(/\u202f/g, " ")} Auri`;
}

function formatReferralDate(value: string | undefined, dateLocale: string, t: TranslateFn) {
  if (!value) return t("referral.unavailableDate");

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return t("referral.unavailableDate");
  }

  return new Intl.DateTimeFormat(dateLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStatusLabel(status: string | undefined, confirmed: boolean | undefined, t: TranslateFn) {
  if (status === "completed") {
    return {
      label: t("referral.statusValid"),
      className: "bg-emerald-100 text-emerald-700",
    };
  }

  if (confirmed) {
    return {
      label: t("referral.statusConfirmed"),
      className: "bg-blue-100 text-blue-700",
    };
  }

  return {
    label: t("referral.statusPending"),
    className: "bg-amber-100 text-amber-700",
  };
}

export default function ReferralPage() {
  const { dateLocale, t } = useI18n();
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalCommission: 0,
    pendingCommission: 0,
    completedReferrals: 0,
  });
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadReferralData() {
      setIsLoading(true);
      setError("");

      try {
        const [codePayload, statsPayload, referralsPayload] = await Promise.all([
          safeFetch<ReferralCodeResponse>("/api/v1/me/referral-code"),
          safeFetch<ReferralStatsResponse>("/api/v1/me/referrals/stats"),
          safeFetch<ReferralsResponse>("/api/v1/me/referrals"),
        ]);

        if (!isActive) return;

        setReferralCode(codePayload?.data?.referral_code ?? "");
        setStats({
          totalReferrals: statsPayload?.data?.total_referrals ?? 0,
          totalCommission: statsPayload?.data?.total_commission ?? 0,
          pendingCommission: statsPayload?.data?.pending_commission ?? 0,
          completedReferrals: statsPayload?.data?.completed_referrals ?? 0,
        });
        setReferrals(referralsPayload?.data ?? []);

        if (!codePayload && !statsPayload && !referralsPayload) {
          setError(t("referral.loadError"));
        }
      } catch (loadError) {
        console.error("Failed to load referrals:", loadError);

        if (isActive) {
          setError(t("referral.loadError"));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadReferralData();

    return () => {
      isActive = false;
    };
  }, [t]);

  const shareLink = useMemo(() => {
    if (!referralCode) return "";
    const baseUrl = publicAppUrl || (typeof window !== "undefined" ? window.location.origin : "");

    if (!baseUrl) {
      return `/register?referral_code=${referralCode}`;
    }

    return `${baseUrl}/register?referral_code=${referralCode}`;
  }, [referralCode]);

  async function copyValue(value: string, successMessage: string) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopyFeedback(successMessage);
      window.setTimeout(() => setCopyFeedback(""), 2500);
    } catch (copyError) {
      console.error("Failed to copy referral value:", copyError);
      setCopyFeedback(t("referral.copyError"));
      window.setTimeout(() => setCopyFeedback(""), 2500);
    }
  }

  async function shareReferralLink() {
    if (!shareLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: t("referral.shareTitle"),
          text: t("referral.shareText"),
          url: shareLink,
        });
        return;
      } catch (shareError) {
        console.error("Native share cancelled or failed:", shareError);
      }
    }

    await copyValue(shareLink, t("referral.linkCopied"));
  }

  return (
    <div className="dashboard-mode bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
      <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-[#f6f6f8] sm:rounded-[40px] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col mx-auto h-[100dvh] sm:h-auto">
        <header className="sticky top-0 z-50 bg-[#f6f6f8]/95 backdrop-blur-md px-5 py-4 flex items-center justify-between gap-3 border-b border-transparent">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/dashboard" className="flex items-center justify-center size-9 shrink-0 rounded-full bg-white border border-gray-100 text-[#131118] hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight">{t("referral.title")}</h1>
              <p className="truncate text-xs text-gray-500">{t("referral.subtitle")}</p>
            </div>
          </div>
          <DashboardHeaderControls />
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth px-5 pb-28 pt-3">
          <section className="mb-4 overflow-hidden rounded-[30px] bg-[#131118] p-5 text-white shadow-xl shadow-black/15">
            <div className="relative z-10">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/55">{t("referral.program")}</p>
                  <h2 className="text-2xl font-black leading-tight">
                    {t("referral.heroTitleLine1")}
                    <br />
                    <span className="text-[#dbb723]">{t("referral.heroTitleLine2")}</span>
                  </h2>
                  <p className="mt-3 text-sm text-white/70">{t("referral.heroText")}</p>
                </div>
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                  <span className="material-symbols-outlined text-[#dbb723]">emoji_events</span>
                </div>
              </div>

              <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.08] p-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">{t("referral.yourCode")}</p>
                {isLoading ? (
                  <div className="h-8 w-36 rounded-xl bg-white/10 animate-pulse" />
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 break-all text-2xl font-black tracking-[0.16em]">{referralCode || "--------"}</span>
                    <button
                      type="button"
                      onClick={() => copyValue(referralCode, t("referral.codeCopied"))}
                      className="shrink-0 rounded-full bg-white text-[#131118] px-4 py-2 text-xs font-bold hover:bg-gray-100 transition-colors"
                      disabled={!referralCode}
                    >
                      {t("referral.copy")}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => copyValue(shareLink, t("referral.linkCopied"))}
                  className="min-h-12 rounded-2xl bg-white px-3 py-3 text-sm font-bold text-[#131118] transition-colors hover:bg-gray-100 disabled:opacity-50"
                  disabled={!shareLink}
                >
                  {t("referral.copyLink")}
                </button>
                <button
                  type="button"
                  onClick={shareReferralLink}
                  className="min-h-12 rounded-2xl bg-[#5b13ec] px-3 py-3 text-sm font-bold transition-colors hover:bg-[#4a0ebb] disabled:opacity-50"
                  disabled={!shareLink}
                >
                  {t("referral.share")}
                </button>
              </div>

              {copyFeedback && <p className="mt-3 text-xs text-white/70">{copyFeedback}</p>}
            </div>
          </section>

          <section className="mb-4 grid grid-cols-2 gap-3">
            {[
              { label: t("referral.referrals"), value: stats.totalReferrals, icon: "groups", accent: "bg-[#f7f3ff] text-[#5b13ec]" },
              { label: t("referral.valid"), value: stats.completedReferrals, icon: "verified", accent: "bg-emerald-50 text-emerald-700" },
              { label: t("referral.confirmedEarnings"), value: formatMoney(stats.totalCommission, dateLocale), icon: "payments", accent: "bg-amber-50 text-amber-700" },
              { label: t("referral.pending"), value: formatMoney(stats.pendingCommission, dateLocale), icon: "hourglass_top", accent: "bg-sky-50 text-sky-700" },
            ].map((item) => (
              <div key={item.label} className="flex min-h-[122px] flex-col justify-between rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">{item.label}</p>
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-2xl ${item.accent}`}>
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </span>
                </div>
                <p className="mt-4 break-words text-2xl font-black leading-tight text-[#131118]">{item.value}</p>
              </div>
            ))}
          </section>

          <section className="mb-4 rounded-[30px] border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#131118]">{t("referral.howTitle")}</h3>
                <p className="mt-1 text-sm text-gray-500">{t("referral.howText")}</p>
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#f7f3ff] text-[#5b13ec]">
                <span className="material-symbols-outlined text-[24px]">send</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {[
                {
                  step: "1",
                  title: t("referral.step1Title"),
                  body: t("referral.step1Body"),
                },
                {
                  step: "2",
                  title: t("referral.step2Title"),
                  body: t("referral.step2Body"),
                },
                {
                  step: "3",
                  title: t("referral.step3Title"),
                  body: t("referral.step3Body"),
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-[#fcfcfd] p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#5b13ec]/10 font-bold text-[#5b13ec]">
                    {item.step}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-[#131118]">{item.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[30px] border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#131118]">{t("referral.history")}</h3>
                <p className="mt-1 text-sm text-gray-500">{t("referral.historyText")}</p>
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#f2f0f4] text-[#131118]">
                <span className="material-symbols-outlined text-[24px]">history</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="rounded-2xl border border-gray-100 p-4 animate-pulse">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
                    <div className="h-3 w-48 bg-gray-100 rounded mb-2" />
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : referrals.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-gray-200 bg-[#fcfcfd] px-6 py-8">
                <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                  <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#5b13ec]/10 text-[#5b13ec]">
                    <span className="material-symbols-outlined text-[26px]">group_add</span>
                  </div>
                  <h4 className="mb-2 text-base font-black text-[#131118]">{t("referral.emptyTitle")}</h4>
                  <p className="mb-5 max-w-[30ch] text-sm leading-6 text-gray-500">{t("referral.emptyText")}</p>
                  <button
                    type="button"
                    onClick={() => copyValue(shareLink, t("referral.linkCopied"))}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#131118] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#221d2c] disabled:opacity-50"
                    disabled={!shareLink}
                  >
                    {t("referral.copyMyLink")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {referrals.map((referral) => {
                  const status = getStatusLabel(referral.status, referral.confirmed, t);

                  return (
                    <div key={referral.id} className="rounded-2xl border border-gray-100 bg-[#fcfcfd] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-bold text-[#131118]">{referral.referred_user_masked_name || t("referral.maskedReferral")}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            ID {referral.referred_user_masked_id || "N/A"} • {formatReferralDate(referral.created_at, dateLocale, t)}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${status.className}`}>{status.label}</span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white px-3 py-3">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">{t("referral.commission")}</p>
                          <p className="mt-1 font-bold text-[#131118]">{formatMoney(referral.commission_amount, dateLocale)}</p>
                        </div>
                        <div className="rounded-2xl bg-white px-3 py-3">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">{t("referral.order")}</p>
                          <p className="mt-1 font-bold text-[#131118]">{formatMoney(referral.order_amount, dateLocale)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <DashboardBottomNav />
      </div>
    </div>
  );
}

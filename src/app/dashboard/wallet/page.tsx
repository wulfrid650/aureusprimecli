"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardBottomNav } from "@/components/dashboard/bottom-nav";
import { DashboardHeaderControls } from "@/components/dashboard/header-controls";
import { safeFetch } from "@/lib/fetch";
import { getPlural, useI18n } from "@/lib/i18n";

interface Transaction {
  id: number;
  amount: number;
  amount_formatted: string;
  is_credit: boolean;
  type: string;
  status: string;
  description: string;
  processed_at: string;
  meta?: {
    order_type?: string;
    product_name?: string;
    source?: string;
    admin_action?: boolean;
  };
  related_entity?: {
    type: string;
    id: number;
    summary?: string | null;
  };
}

type TransactionFilter = "all" | "credits" | "debits" | "pending";

export default function WalletPage() {
  const { dateLocale, locale, t } = useI18n();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>("all");

  useEffect(() => {
    safeFetch<{ data?: { wallet?: { available_balance?: number }; transactions?: { data?: Transaction[] } } }>("/api/v1/me/wallet?per_page=100")
      .then((data) => {
        const walletData = data?.data?.wallet;
        const txData = data?.data?.transactions?.data || [];
        if (walletData && walletData.available_balance !== undefined) {
          setBalance(parseInt(String(walletData.available_balance)));
        }
        setTransactions(txData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch wallet contents:", err);
        setIsLoading(false);
      });
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return t("wallet.unknownDate");
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return t("wallet.unknownDate");
    return d.toLocaleDateString(dateLocale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const getTransactionLabel = (tx: Transaction) => {
    const apiLabel = String(tx.description || "").trim();
    if (/^(Recharge|Mission Prime|Ajustement\s+[+-]|CMD\s|RNV\s|Carte\s|Crédit|Débit)/i.test(apiLabel)) {
      return apiLabel;
    }

    const source = String(tx.meta?.source || "").toLowerCase();
    const isAdminAdjustment = tx.meta?.admin_action === true || source === "admin_manual_adjustment";

    if (isAdminAdjustment) {
      return t("wallet.adminAdjustment", { sign: tx.is_credit ? "+" : "-" });
    }

    if (tx.is_credit && (tx.type === "topup" || tx.type === "deposit" || source.includes("topup"))) {
      return t("wallet.topupReason");
    }

    if (tx.is_credit && source === "mission_prime") {
      return t("wallet.missionPrimeReward");
    }

    if (!tx.is_credit) {
      const rawProductName = tx.meta?.product_name || tx.related_entity?.summary || tx.description || "";
      const isRenewal = tx.meta?.order_type === "renewal" || /^Renouvellement/i.test(rawProductName);
      const productName = rawProductName
        .replace(/^Renouvellement\s*[-(:]?\s*/i, "")
        .replace(/^CMD\s+pour\s+/i, "")
        .replace(/^(?:CMD|RNV|ORD|RNL)\s+/i, "")
        .replace(/^Paiement commande\s+[A-Z0-9-]+\s*/i, "")
        .replace(/[)]$/, "")
        .trim();
      const isCard = /robux|carte|gift|cadeau/i.test(productName);

      if (productName) {
        const cardProductName = productName.replace(/^Carte\s+/i, "").trim();
        return t(isCard ? "wallet.cardDebit" : isRenewal ? "wallet.renewalDebit" : "wallet.orderDebit", {
          product: isCard ? cardProductName : productName,
        });
      }
    }

    return tx.is_credit
      ? t("wallet.creditFallback")
      : t("wallet.debitFallback");
  };

  const filteredTransactions = useMemo(() => {
    switch (activeFilter) {
      case "credits":
        return transactions.filter((transaction) => transaction.is_credit);
      case "debits":
        return transactions.filter((transaction) => !transaction.is_credit);
      case "pending":
        return transactions.filter((transaction) => transaction.status === "pending");
      default:
        return transactions;
    }
  }, [activeFilter, transactions]);

  const filterOptions: Array<{ id: TransactionFilter; label: string }> = [
    { id: "all", label: t("wallet.filtersAll") },
    { id: "credits", label: t("wallet.filtersCredits") },
    { id: "debits", label: t("wallet.filtersDebits") },
    { id: "pending", label: t("wallet.filtersPending") },
  ];

  return (
    <div className="dashboard-mode bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
      <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-[#f6f6f8] sm:rounded-[40px] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col mx-auto h-[100dvh] sm:h-auto">

        <header className="sticky top-0 z-50 bg-[#f6f6f8]/95 backdrop-blur-md px-5 py-4 flex items-center justify-between gap-3 border-b border-transparent">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/dashboard" className="flex items-center justify-center size-9 shrink-0 rounded-full bg-white border border-gray-100 text-[#131118] hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <h1 className="truncate text-lg font-bold tracking-tight">{t("wallet.title")}</h1>
          </div>
          <DashboardHeaderControls />
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth px-5 pb-28 pt-3">

          <section className="bg-[#131118] rounded-[32px] p-6 text-white shadow-xl shadow-black/20 relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 size-32 rounded-full bg-white/5 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 size-24 rounded-full bg-[#dbb723]/10 blur-xl"></div>

            <div className="relative z-10 flex flex-col gap-1 mb-6">
              <span className="text-gray-400 font-medium text-sm">{t("wallet.mainBalance")}</span>
              <div className="flex items-baseline gap-2">
                {isLoading ? (
                  <div className="h-10 w-32 animate-pulse rounded bg-white/10 mt-1" />
                ) : (
                  <>
                    <span className="text-4xl font-extrabold tracking-tight">
                      {balance.toLocaleString(dateLocale).replace(/\s/g, " ")}
                    </span>
                    <span className="text-lg font-bold text-[#dbb723]">AURI</span>
                  </>
                )}
              </div>
            </div>

            <div className="relative z-10 flex flex-col">
              <Link
                href="/dashboard/recharge"
                className="w-full bg-[#dbb723] hover:bg-[#b79218] text-[#131118] font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-xl shadow-[#dbb723]/20"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                {t("wallet.recharge")}
              </Link>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#131118]">{t("wallet.history")}</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                {t("wallet.elements", {
                  count: filteredTransactions.length,
                  plural: getPlural(locale, filteredTransactions.length),
                })}
              </span>
            </div>

            <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveFilter(option.id)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${activeFilter === option.id
                    ? "bg-[#131118] text-white"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-[#131118]"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-gray-100 animate-pulse shrink-0" />
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="h-4 w-24 bg-gray-100 animate-pulse rounded" />
                      <div className="h-3 w-16 bg-gray-100 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {filteredTransactions.map((tx) => (
                  <div key={tx.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                    <div className={`flex items-center justify-center size-12 rounded-xl shrink-0 ${tx.is_credit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      <span className="material-symbols-outlined">
                        {tx.type === 'topup' ? 'account_balance_wallet' : (tx.is_credit ? 'south_west' : 'north_east')}
                      </span>
                    </div>
                    <div className="flex flex-col items-start flex-1 overflow-hidden">
                      <span className="font-bold text-[#131118] truncate w-full">
                        {getTransactionLabel(tx)}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">{formatDate(tx.processed_at)}</span>
                    </div>
                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <span className={`font-bold ${tx.is_credit ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.is_credit ? '+' : '-'}{Math.abs(tx.amount).toLocaleString(dateLocale).replace(/\s/g, ' ')} Auri
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 ${tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-3">
                <div className="size-16 rounded-full bg-[#f2f0f4] flex items-center justify-center text-gray-400 mb-2">
                  <span className="material-symbols-outlined text-[32px]">receipt_long</span>
                </div>
                <span className="font-bold text-[#131118]">
                  {transactions.length === 0 ? t("wallet.noTransaction") : t("common.noResult")}
                </span>
                <p className="text-sm text-gray-500">
                  {transactions.length === 0
                    ? t("wallet.emptyHistory")
                    : t("wallet.noFilterResult")}
                </p>
              </div>
            )}
          </section>
        </main>

        <DashboardBottomNav active="wallet" />

      </div>
    </div>
  );
}

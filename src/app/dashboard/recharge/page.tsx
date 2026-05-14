"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardHeaderControls } from "@/components/dashboard/header-controls";
import { apiFetch } from "@/lib/fetch";
import { useI18n } from "@/lib/i18n";

export default function RechargePage() {
  const router = useRouter();
  const { dateLocale, t } = useI18n();
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "paypal">("mobile_money");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickAmounts = [1000, 5000, 10000];

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    if (!isNaN(parseInt(val))) {
      setAmount(parseInt(val));
    } else {
      setAmount(0); // Invalid amount
    }
  };

  const handleTopup = async () => {
    if (amount <= 0 || amount > 150000) {
      setError(t("recharge.amountRangeError"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiFetch("/api/v1/wallet/topup", {
        method: "POST",
        body: JSON.stringify({
          amount: amount,
          currency: "XAF",
          payment_method: paymentMethod
        })
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : {};

      if (!res.ok || json.success === false) {
        throw new Error(json.message || t("recharge.genericError"));
      }

      // Redirection logic based on response
      const data = json.data;
      if (data.checkout_url && data.checkout_url !== window.location.href) {
        window.location.href = data.checkout_url;
      } else if (data.approve_url && data.approve_url !== window.location.href) {
        window.location.href = data.approve_url;
      } else if (data.status === "COMPLETED") {
        // Direct method success
        router.push("/dashboard");
      } else {
        throw new Error(t("recharge.paymentUrlMissing"));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : t("recharge.genericError"));
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-mode bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
      <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-[#f6f6f8] sm:rounded-[40px] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col mx-auto h-[100dvh] sm:h-auto">
        
        <header className="sticky top-0 z-50 bg-[#f6f6f8]/95 backdrop-blur-md px-5 py-4 flex items-center justify-between gap-3 border-b border-transparent">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/dashboard" className="flex items-center justify-center size-9 shrink-0 rounded-full bg-white border border-gray-100 text-[#131118] hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight">{t("recharge.title")}</h1>
              <p className="truncate text-xs text-gray-500">{t("recharge.subtitle")}</p>
            </div>
          </div>
          <DashboardHeaderControls />
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth px-5 pb-5 pt-3 flex flex-col gap-4">
          
          {/* Amount Selection */}
          <section className="rounded-[30px] border border-gray-100 bg-white p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
                  {t("recharge.amountLabel")}
                </p>
                <h2 className="mt-2 text-xl font-black text-[#131118]">{t("recharge.amountQuestion")}</h2>
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#f7f3ff] text-[#5b13ec]">
                <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  onClick={() => handleAmountSelect(q)}
                  className={`h-12 rounded-2xl text-sm font-bold transition-colors ${
                    amount === q && !customAmount
                      ? "bg-[#131118] text-white shadow-md shadow-black/10"
                      : "bg-[#f2f0f4] text-gray-600 hover:bg-[#e8e6eb]"
                  }`}
                >
                  {q.toLocaleString(dateLocale).replace(/\s/g, ' ')}
                </button>
              ))}
            </div>

            <div className="relative mt-2">
              <input
                type="number"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder={t("recharge.customAmount")}
                className="w-full bg-[#fcfcfd] border-2 border-[#f2f0f4] rounded-2xl py-4 pl-5 pr-16 text-lg font-bold text-[#131118] font-[family:var(--font-inter)] placeholder:opacity-40 outline-none transition-colors focus:border-[#eab308]"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                AURI
              </div>
            </div>
            {amount > 150000 && (
              <p className="text-xs text-red-500">{t("recharge.maxAmount")}</p>
            )}

            <div className="bg-[#eab308]/10 text-[#ca8a04] px-4 py-3 rounded-2xl flex items-center gap-2 mt-1">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span className="text-sm font-bold">{t("recharge.rate")}</span>
            </div>
          </section>

          {/* Payment Method */}
          <section className="rounded-[30px] border border-gray-100 bg-white p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
                  {t("recharge.paymentLabel")}
                </p>
                <h2 className="mt-2 text-xl font-black text-[#131118]">{t("recharge.paymentMethod")}</h2>
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <span className="material-symbols-outlined text-[24px]">payments</span>
              </div>
            </div>
            
            <button
              onClick={() => setPaymentMethod("mobile_money")}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                paymentMethod === "mobile_money"
                  ? "border-[#5b13ec] bg-[#5b13ec]/5"
                  : "border-[#f2f0f4] hover:border-gray-300"
              }`}
            >
              <div className={`flex items-center justify-center size-12 rounded-xl ${paymentMethod === 'mobile_money' ? 'bg-[#5b13ec] text-white' : 'bg-[#f2f0f4] text-gray-500'}`}>
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div className="flex flex-col items-start flex-1">
                <span className="font-bold text-[#131118]">Moneroo</span>
                <span className="text-xs text-gray-500">{t("recharge.mobileMoneyHint")}</span>
              </div>
              <div className={`size-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'mobile_money' ? 'border-[#5b13ec]' : 'border-gray-300'}`}>
                {paymentMethod === 'mobile_money' && <div className="size-2.5 rounded-full bg-[#5b13ec]" />}
              </div>
            </button>

            <button
              disabled
              className="flex items-center gap-4 p-4 rounded-2xl border-2 border-[#f2f0f4] bg-gray-50 opacity-70 cursor-not-allowed"
            >
              <div className="flex items-center justify-center size-12 rounded-xl bg-gray-200 text-gray-400">
                <span className="material-symbols-outlined">language</span>
              </div>
              <div className="flex flex-col items-start flex-1 gap-0.5">
                <span className="font-bold text-[#131118] text-gray-400">PayPal</span>
                <span className="text-[11px] font-bold text-red-500">{t("recharge.temporarilyUnavailable")}</span>
              </div>
               <div className="size-5 rounded-full border-2 border-gray-200 flex items-center justify-center">
              </div>
            </button>
          </section>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-medium text-red-600">
              {error}
            </div>
          )}
        </main>

        <div className="sticky bottom-0 mt-auto w-full border-t border-[#f2f0f4] bg-white p-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-safe">
          <button
            type="button"
            onClick={handleTopup}
            disabled={isLoading || amount <= 0 || amount > 150000}
            className="w-full flex items-center justify-center gap-2 bg-[#eab308] hover:bg-[#ca8a04] disabled:bg-[#f2f0f4] disabled:text-gray-400 text-[#131118] font-bold text-lg py-4 rounded-2xl shadow-xl shadow-[#eab308]/20 transition-colors disabled:shadow-none"
          >
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <>
                {t("recharge.credit", {
                  amount: amount > 0 ? amount.toLocaleString(dateLocale).replace(/\s/g, ' ') : 0,
                })}
                <span className="material-symbols-outlined ml-1">arrow_forward</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

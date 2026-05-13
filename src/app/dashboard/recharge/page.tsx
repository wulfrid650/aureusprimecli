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
            <h1 className="truncate text-lg font-bold tracking-tight">{t("recharge.title")}</h1>
          </div>
          <DashboardHeaderControls />
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth px-5 pb-28 pt-3 flex flex-col gap-6">
          
          {/* Amount Selection */}
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t("recharge.amountQuestion")}</h2>
            
            <div className="grid grid-cols-3 gap-3">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  onClick={() => handleAmountSelect(q)}
                  className={`py-3 rounded-2xl font-bold transition-all ${
                    amount === q && !customAmount
                      ? "bg-[#eab308] text-white shadow-md shadow-[#eab308]/30 scale-105"
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
                className="w-full bg-white border-2 border-[#f2f0f4] rounded-2xl py-4 pl-5 pr-16 text-lg font-bold text-[#131118] font-[family:var(--font-inter)] placeholder:opacity-40 outline-none transition-colors focus:border-[#eab308]"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                AURI
              </div>
            </div>
            {amount > 150000 && (
              <p className="text-xs text-red-500">{t("recharge.maxAmount")}</p>
            )}

            <div className="bg-[#eab308]/10 text-[#ca8a04] px-4 py-3 rounded-xl flex items-center gap-2 mt-1">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span className="text-sm font-bold">{t("recharge.rate")}</span>
            </div>
          </section>

          {/* Payment Method */}
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t("recharge.paymentMethod")}</h2>
            
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
            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium text-center">
              {error}
            </div>
          )}
        </main>

        <div className="shrink-0 border-t border-[#f2f0f4] bg-white px-5 py-4 pb-safe">
          <button
            type="button"
            onClick={handleTopup}
            disabled={isLoading || amount <= 0 || amount > 150000}
            className="w-full flex items-center justify-center gap-2 bg-[#5b13ec] hover:bg-[#480ec0] disabled:bg-[#f2f0f4] disabled:text-gray-400 text-white font-bold py-4 rounded-full transition-all"
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

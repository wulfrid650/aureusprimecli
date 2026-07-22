"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { DashboardBottomNav } from "@/components/dashboard/bottom-nav";
import { ServiceCard } from "@/components/dashboard/service-card";
import { DashboardHeaderControls } from "@/components/dashboard/header-controls";
import { MissionPrimeHomeCard } from "@/components/dashboard/mission-prime-card";
import { fetchCatalogProducts, type CatalogProduct } from "@/lib/catalog";
import { safeFetch } from "@/lib/fetch";
import { useI18n } from "@/lib/i18n";

export default function Dashboard() {
  const { dateLocale, t } = useI18n();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<CatalogProduct[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");

  useEffect(() => {
    safeFetch<{ data?: { wallet?: { available_balance?: number | string } } }>("/api/v1/me/wallet")
      .then((data) => {
        const val = data?.data?.wallet?.available_balance;
        const num = parseFloat(String(val ?? 0));
        setBalance(!isNaN(num) ? num.toLocaleString(dateLocale).replace(/\s/g, ' ') : "0");
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch wallet:", err);
        setBalance("0");
        setIsLoading(false);
      });
  }, [dateLocale]);

  useEffect(() => {
    let isActive = true;

    fetchCatalogProducts(12)
      .then((catalogServices) => {
        if (!isActive) return;

        setServices(catalogServices);
        if (catalogServices.length === 0) {
          setServicesError(t("dashboard.catalogEmpty"));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch services:", err);

        if (isActive) {
          setServicesError(t("dashboard.servicesLoadError"));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsServicesLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [t]);

  return (
    <div className="dashboard-mode bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
      {/* Mobile View Simulator */}
      <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-[#f6f6f8] sm:rounded-[40px] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col mx-auto h-[100dvh] sm:h-auto">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between gap-2 border-b border-[#f2f0f4] bg-white/80 px-4 py-3 shadow-sm backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-1.5">
            <Link href="/dashboard" className="flex shrink-0 items-center">
              <Image src="/logo-aureusprime.svg" alt="Aureusprime Logo" width={110} height={16} className="logo-dark h-4 w-[110px] object-contain max-[359px]:w-[100px]" />
              <Image src="/logo-aureusprime-light.svg" alt="Aureusprime Logo" width={110} height={16} className="logo-light h-4 w-[110px] object-contain max-[359px]:w-[100px]" />
            </Link>
            <DashboardHeaderControls />
          </div>

          {/* Real-time Balance Box */}
          <div className="dashboard-balance-pill flex h-8 shrink-0 items-center rounded-full border border-gray-200/50 bg-[#f2f0f4] pl-2.5 pr-1 shadow-inner">
            {isLoading ? (
              <div className="h-3 w-8 animate-pulse rounded bg-gray-300/50 mr-2" />
            ) : (
              <span className="mr-1.5 whitespace-nowrap text-[11px] font-black leading-none tracking-tight text-[#131118] tabular-nums sm:text-[12px]">{balance} Auri</span>
            )}
            <Link
              href="/dashboard/recharge"
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#dbb723] text-white shadow-sm transition-transform duration-200 hover:scale-105 hover:bg-[#b79218] active:scale-95"
            >
              <span className="material-symbols-outlined font-bold text-[16px]">add</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          <MissionPrimeHomeCard />

          {/* Popular Services Carousel */}
          <section className="py-6">
            <div className="px-5 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#131118]">{t("dashboard.ourServices")}</h2>
              <Link className="text-sm font-semibold text-[#5b13ec]" href="/dashboard/services">{t("dashboard.seeAll")}</Link>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex overflow-x-auto gap-4 px-5 pb-6 no-scrollbar snap-x snap-mandatory">
              {isServicesLoading &&
                [0, 1, 2].map((item) => (
                  <div key={item} className="snap-center shrink-0 w-[260px] rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="h-32 w-full rounded-2xl bg-gray-100 animate-pulse" />
                    <div className="mt-4 h-4 w-20 rounded bg-gray-100 animate-pulse" />
                    <div className="mt-3 h-6 w-32 rounded bg-gray-200 animate-pulse" />
                    <div className="mt-3 h-4 w-full rounded bg-gray-100 animate-pulse" />
                    <div className="mt-2 h-4 w-4/5 rounded bg-gray-100 animate-pulse" />
                  </div>
                ))}

              {!isServicesLoading && services.map((service) => <ServiceCard key={service.slug} service={service} compact />)}

              {!isServicesLoading && services.length === 0 && (
                <div className="snap-center shrink-0 w-full rounded-3xl border border-dashed border-gray-200 bg-white p-6 text-center">
                  <p className="font-bold text-[#131118] mb-2">{t("dashboard.catalogUnavailable")}</p>
                  <p className="text-sm text-gray-500">{servicesError || t("dashboard.noVisibleService")}</p>
                </div>
              )}
            </div>
          </section>

          {/* Value Props List */}
          <section className="px-5 pb-8">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="size-10 rounded-full bg-[#5b13ec]/10 flex items-center justify-center text-[#5b13ec]">
                  <span className="material-symbols-outlined">bolt</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#131118]">{t("dashboard.instantDelivery")}</h4>
                  <p className="text-xs text-gray-500">{t("dashboard.instantDeliveryText")}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="size-10 rounded-full bg-[#5b13ec]/10 flex items-center justify-center text-[#5b13ec]">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#131118]">{t("dashboard.securePayment")}</h4>
                  <p className="text-xs text-gray-500">{t("dashboard.securePaymentText")}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="size-10 rounded-full bg-[#5b13ec]/10 flex items-center justify-center text-[#5b13ec]">
                  <span className="material-symbols-outlined">support_agent</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#131118]">{t("dashboard.support")}</h4>
                  <p className="text-xs text-gray-500">{t("dashboard.supportText")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Referral Program */}
          <section className="px-5 pb-24">
            <div className="bg-[#131118] rounded-3xl p-6 text-white relative overflow-hidden">
              {/* Background blobs */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#5b13ec] blur-[60px] rounded-full opacity-40"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#7e44f2] blur-[50px] rounded-full opacity-30"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{t("dashboard.inviteAndEarn")} <br/><span className="text-[#7e44f2]">{t("dashboard.earn")}</span></h2>
                  <div className="size-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="material-symbols-outlined text-[#dbb723]">emoji_events</span>
                  </div>
                </div>

                <div className="flex flex-col gap-6 relative">
                  {/* Vertical connector line */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-white/20"></div>
                  
                  {/* Step 1 */}
                  <div className="flex items-start gap-4">
                    <div className="size-10 rounded-full bg-white text-[#131118] flex items-center justify-center shrink-0 z-10 font-bold border-4 border-[#131118]">1</div>
                    <div>
                      <h4 className="font-bold text-sm mb-1">{t("dashboard.shareLink")}</h4>
                      <p className="text-xs text-gray-400">{t("dashboard.shareLinkText")}</p>
                    </div>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex items-start gap-4">
                    <div className="size-10 rounded-full bg-white text-[#131118] flex items-center justify-center shrink-0 z-10 font-bold border-4 border-[#131118]">2</div>
                    <div>
                      <h4 className="font-bold text-sm mb-1">{t("dashboard.friendsSubscribe")}</h4>
                      <p className="text-xs text-gray-400">{t("dashboard.friendsSubscribeText")}</p>
                    </div>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="flex items-start gap-4">
                    <div className="size-10 rounded-full bg-[#5b13ec] text-white flex items-center justify-center shrink-0 z-10 border-4 border-[#131118]">
                      <span className="material-symbols-outlined text-sm">check</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1">{t("dashboard.auriReward")}</h4>
                      <p className="text-xs text-gray-400">{t("dashboard.auriRewardText")}</p>
                    </div>
                  </div>
                </div>

                <Link href="/dashboard/parrainage" className="block w-full mt-8 py-3 rounded-full bg-white text-[#131118] font-bold text-sm hover:bg-gray-100 transition-colors text-center">
                  {t("dashboard.referralLink")}
                </Link>
              </div>
            </div>
          </section>
        </main>

        <DashboardBottomNav active="home" />

      </div>
    </div>
  );
}

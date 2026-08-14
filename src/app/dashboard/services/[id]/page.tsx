"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardHeaderControls } from "@/components/dashboard/header-controls";
import { ServiceIllustration } from "@/components/dashboard/service-illustration";
import { fetchCatalogProduct, type CatalogOption, type CatalogProduct } from "@/lib/catalog";
import { getPlural, useI18n } from "@/lib/i18n";

export default function SingleServicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { locale, t } = useI18n();
  const [service, setService] = useState<CatalogProduct | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadService() {
      setIsLoading(true);

      try {
        const product = await fetchCatalogProduct(resolvedParams.id);

        if (!isActive) return;

        setService(product);
        setSelectedOptionId(product?.defaultOption?.id ?? null);
      } catch (err) {
        console.error("Failed to fetch service:", err);

        if (isActive) {
          setService(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadService();

    return () => {
      isActive = false;
    };
  }, [resolvedParams.id]);

  const selectedOption = useMemo<CatalogOption | null>(() => {
    if (!service) return null;
    return service.options.find((option) => option.id === selectedOptionId) ?? service.defaultOption ?? null;
  }, [selectedOptionId, service]);

  const handleCheckout = () => {
    if (!service) return;

    const url = new URL(`/dashboard/checkout/${service.slug}`, window.location.origin);

    if (selectedOption?.checkoutPayload.variantId) {
      url.searchParams.set("variant", String(selectedOption.checkoutPayload.variantId));
    }

    if (selectedOption?.checkoutPayload.variationId) {
      url.searchParams.set("variation", String(selectedOption.checkoutPayload.variationId));
    }

    if (selectedOption?.checkoutPayload.offerType) {
      url.searchParams.set("offer", selectedOption.checkoutPayload.offerType);
    }

    router.push(`${url.pathname}${url.search}`);
  };

  if (isLoading) {
    return (
      <div className="dashboard-mode bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
        <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-white sm:rounded-[40px] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col mx-auto h-[100dvh] sm:h-auto">
          <div className="absolute left-4 right-4 z-50 flex items-center justify-between gap-3 top-[calc(1rem+env(safe-area-inset-top))]">
            <Link href="/dashboard/services" className="flex items-center justify-center size-10 shrink-0 rounded-full bg-black/30 backdrop-blur-xl text-white hover:bg-black/50 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <DashboardHeaderControls className="shrink-0" />
          </div>
          <div className="h-[40%] min-h-[300px] bg-gray-100 animate-pulse" />
          <div className="p-6">
            <div className="h-4 w-24 rounded bg-gray-100 animate-pulse mb-4" />
            <div className="h-10 w-2/3 rounded bg-gray-200 animate-pulse mb-6" />
            <div className="h-24 rounded-3xl bg-gray-100 animate-pulse mb-6" />
            <div className="h-5 w-40 rounded bg-gray-100 animate-pulse mb-3" />
            <div className="h-4 w-full rounded bg-gray-100 animate-pulse mb-2" />
            <div className="h-4 w-5/6 rounded bg-gray-100 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="dashboard-mode bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
        <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-white sm:rounded-[40px] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col mx-auto h-[100dvh] sm:h-auto items-center justify-center p-6 text-center">
          <div className="absolute left-4 right-4 z-50 flex items-center justify-between gap-3 top-[calc(1rem+env(safe-area-inset-top))]">
            <Link href="/dashboard/services" className="flex items-center justify-center size-10 shrink-0 rounded-full bg-white border border-gray-100 text-[#131118] hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <DashboardHeaderControls className="shrink-0" />
          </div>
          <div className="size-16 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
          <h1 className="text-2xl font-black mb-2 text-[#131118]">{t("serviceDetail.notFoundTitle")}</h1>
          <p className="text-gray-500 mb-8">{t("serviceDetail.notFoundText")}</p>
          <Link href="/dashboard/services" className="w-full bg-[#131118] text-white font-bold text-lg py-4 rounded-2xl transition-all">
            {t("serviceDetail.backToServices")}
          </Link>
        </div>
      </div>
    );
  }

  const selectedRequiresKyc = selectedOption?.requiresKyc ?? service.requiresKyc;

  return (
    <div className="dashboard-mode bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
      <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-white sm:rounded-[40px] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col mx-auto h-[100dvh] sm:h-auto">
        
        <div className="absolute left-4 right-4 z-50 flex items-center justify-between gap-3 top-[calc(1rem+env(safe-area-inset-top))]">
          <Link href="/dashboard/services" className="flex items-center justify-center size-10 shrink-0 rounded-full bg-black/30 backdrop-blur-xl text-white hover:bg-black/50 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <DashboardHeaderControls className="shrink-0" />
        </div>
        
        <div className="relative w-full h-[40%] min-h-[300px] shrink-0 bg-zinc-900 overflow-hidden">
          <ServiceIllustration service={service} variant="hero" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20"></div>
          <div className={`absolute top-20 right-4 z-20 rounded-full px-3 py-1.5 text-sm font-bold text-white shadow-lg ${service.badgeClassName}`}>
            {service.badgeLabel}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth -mt-8 relative z-10 bg-white rounded-t-[32px] pb-28">
          <div className="p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-2">{service.category}</p>

            <div className="flex flex-wrap items-start gap-x-4 gap-y-3 mb-6 pb-6 border-b border-gray-100">
              <div className="shrink-0">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">{t("serviceDetail.from")}</span>
                <div className="text-3xl font-black text-[#dbb723] transition-all">{selectedOption?.priceFormatted ?? service.currentPriceFormatted}</div>
                {(selectedOption?.originalPriceFormatted ?? service.originalPriceFormatted) && (
                  <span className="mt-1 block text-sm text-red-500 font-bold line-through transition-all">
                    {selectedOption?.originalPriceFormatted ?? service.originalPriceFormatted}
                  </span>
                )}
              </div>
              <h1 className="min-w-[10rem] flex-1 break-words text-3xl font-extrabold text-[#131118] tracking-tight">{service.title}</h1>
            </div>

            {service.options.length > 0 && (
              <div className="mb-6 rounded-3xl border border-gray-100 bg-[#f8f8fb] p-5">
                <h3 className="text-xs font-black uppercase tracking-[0.18em] text-gray-400 mb-4">
                  {t("serviceDetail.formulasTitle")}
                  {service.optionCount > 1
                    ? ` · ${t("serviceDetail.formulasCount", { count: service.optionCount, plural: getPlural(locale, service.optionCount) })}`
                    : ""}
                </h3>
                <div className="flex flex-col gap-2">
                  {service.options.map((option) => {
                    const isSelected = selectedOption?.id === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setSelectedOptionId(option.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 bg-white transition-all ${
                          isSelected
                            ? "border-[#5b13ec] shadow-sm shadow-[#5b13ec]/10"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {service.optionCount > 1 && (
                            <div className={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#5b13ec]' : 'border-gray-300'}`}>
                              {isSelected && <div className="size-2.5 rounded-full bg-[#5b13ec]" />}
                            </div>
                          )}
                          <div className="flex flex-col items-start">
                            <span className={`font-bold ${isSelected ? 'text-[#131118]' : 'text-gray-500'}`}>{option.name}</span>
                            <span className="text-xs text-gray-400">{option.billingSummary}</span>
                            {option.description && (
                              <span className="mt-1 text-left text-xs leading-relaxed text-gray-500">
                                {option.description}
                              </span>
                            )}
                            {option.requiresKyc && (
                              <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                <span className="material-symbols-outlined text-[12px]">school</span>
                                {t("serviceDetail.kycRequired")}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`font-bold shrink-0 ${isSelected ? 'text-[#5b13ec]' : 'text-[#131118]'}`}>
                          {option.priceFormatted}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedRequiresKyc && (
              <div className="mb-6 rounded-2xl border border-white/10 bg-[#131118] px-4 py-3 text-white">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px] text-[#dbb723]">school</span>
                  <div>
                    <p className="text-sm font-bold">{t("serviceDetail.kycNoticeTitle")}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/70">{t("serviceDetail.kycNoticeText")}</p>
                  </div>
                </div>
              </div>
            )}

            <h2 className="text-lg font-bold text-[#131118] mb-3">{t("serviceDetail.aboutTitle")}</h2>
            <p className="text-gray-500 leading-relaxed text-[15px] mb-6">
              {service.description}
              {selectedOption?.description && (
                <>
                  <br/><br/>
                  <strong className="text-[#131118]">{selectedOption.name} : </strong>
                  {selectedOption.description}
                </>
              )}
              <br/><br/>
              {t("serviceDetail.walletFlow")}
            </p>

            <div className="bg-[#f0fdf9] text-emerald-700 p-4 rounded-2xl flex items-start gap-3">
              <span className="material-symbols-outlined mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <div className="flex flex-col">
                <span className="font-bold">{t("serviceDetail.securePurchase")}</span>
                <span className="text-xs mt-1 text-emerald-700/80">{t("serviceDetail.securePurchaseText")}</span>
              </div>
            </div>
          </div>
        </main>

        <div className="absolute bottom-0 left-0 right-0 w-full bg-white border-t border-[#f2f0f4] p-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-safe sm:rounded-b-[40px]">
           <button 
             onClick={handleCheckout}
             className="w-full bg-black hover:bg-gray-800 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-black/30 transition-all active:scale-95 flex items-center justify-center gap-2"
           >
             <span>{t("serviceDetail.continueCheckout")}</span>
             <span className="material-symbols-outlined">shopping_cart_checkout</span>
           </button>
        </div>

      </div>
    </div>
  );
}

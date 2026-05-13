"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ServiceIllustration } from "@/components/dashboard/service-illustration";
import { fetchCatalogProduct, type CatalogOption, type CatalogProduct } from "@/lib/catalog";

export default function SingleServicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
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

    router.push(`${url.pathname}${url.search}`);
  };

  if (isLoading) {
    return (
      <div className="bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
        <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-white sm:rounded-[40px] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col mx-auto h-[100dvh] sm:h-auto">
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
      <div className="bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
        <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-white sm:rounded-[40px] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col mx-auto h-[100dvh] sm:h-auto items-center justify-center p-6 text-center">
          <div className="size-16 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
          <h1 className="text-2xl font-black mb-2 text-[#131118]">Service introuvable</h1>
          <p className="text-gray-500 mb-8">Le produit demandé n&apos;est pas disponible ou n&apos;existe plus dans le catalogue.</p>
          <Link href="/dashboard/services" className="w-full bg-[#131118] text-white font-bold text-lg py-4 rounded-2xl transition-all">
            Retour aux services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
      {/* Container */}
      <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-white sm:rounded-[40px] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col mx-auto h-[100dvh] sm:h-auto">
        
        {/* Floating Back Button */}
        <Link href="/dashboard/services" className="absolute top-4 left-4 z-50 flex items-center justify-center size-10 rounded-full bg-black/30 backdrop-blur-xl text-white hover:bg-black/50 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        
        {/* Hero Image */}
        <div className="relative w-full h-[40%] min-h-[300px] shrink-0 bg-zinc-900 overflow-hidden">
          <ServiceIllustration service={service} variant="hero" />
          {/* Gradient Overlay for soft transition */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20"></div>
          <div className={`absolute top-4 right-4 z-20 rounded-full px-3 py-1.5 text-sm font-bold text-white shadow-lg ${service.badgeClassName}`}>
            {service.badgeLabel}
          </div>
        </div>

        {/* Details Wrapper */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth -mt-8 relative z-10 bg-white rounded-t-[32px]">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wider">{service.category}</span>
              <span className="px-2.5 py-1 bg-[#5b13ec]/10 text-[#5b13ec] rounded-lg text-xs font-bold uppercase tracking-wider">
                {service.optionCount > 1 ? `${service.optionCount} formules` : service.billingSummary}
              </span>
            </div>
            
            <h1 className="text-3xl font-extrabold text-[#131118] mb-4 tracking-tight">{service.title}</h1>
            
            {service.options.length > 1 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Choisissez votre forfait</h3>
                <div className="flex flex-col gap-2">
                  {service.options.map((option) => {
                    const isSelected = selectedOption?.id === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setSelectedOptionId(option.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                          isSelected 
                            ? "border-[#5b13ec] bg-[#5b13ec]/5 shadow-sm shadow-[#5b13ec]/10" 
                            : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`size-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#5b13ec]' : 'border-gray-300'}`}>
                            {isSelected && <div className="size-2.5 rounded-full bg-[#5b13ec]" />}
                          </div>
                          <div className="flex flex-col items-start">
                            <span className={`font-bold ${isSelected ? 'text-[#131118]' : 'text-gray-500'}`}>{option.name}</span>
                            <span className="text-xs text-gray-400">{option.billingSummary}</span>
                          </div>
                        </div>
                        <span className={`font-bold ${isSelected ? 'text-[#5b13ec]' : 'text-[#131118]'}`}>
                          {option.priceFormatted}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="flex items-baseline gap-3 mb-8 pb-8 border-b border-gray-100">
              <span className="text-4xl font-black text-[#131118] transition-all">{selectedOption?.priceFormatted ?? service.currentPriceFormatted}</span>
              <span className="text-gray-400 font-medium">{selectedOption?.billingSummary ?? service.billingSummary}</span>
              {(selectedOption?.originalPriceFormatted ?? service.originalPriceFormatted) && (
                <span className="ml-auto text-sm text-red-500 font-bold line-through transition-all">
                  {selectedOption?.originalPriceFormatted ?? service.originalPriceFormatted}
                </span>
              )}
            </div>

            <h2 className="text-lg font-bold text-[#131118] mb-3">À propos du service</h2>
            <p className="text-gray-500 leading-relaxed text-[15px] mb-6">
              {service.description} 
              <br/><br/>
              Paiement direct par wallet, traitement rapide de votre commande et suivi centralisé dans votre espace Aureus Prime.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl flex items-start gap-3">
                <span className="material-symbols-outlined mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <div className="flex flex-col">
                  <span className="font-bold">Achat securise</span>
                  <span className="text-xs mt-1 text-blue-700/80">Commande validée depuis votre portefeuille avec suivi dans le dashboard.</span>
                </div>
              </div>

              <div className="bg-[#f7f3ff] text-[#5b13ec] p-4 rounded-2xl flex items-start gap-3">
                <span className="material-symbols-outlined mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                <div className="flex flex-col">
                  <span className="font-bold">Formule selectionnee</span>
                  <span className="text-xs mt-1 text-[#5b13ec]/80">{selectedOption?.name ?? service.defaultOption?.name ?? "Standard"} • {selectedOption?.billingSummary ?? service.billingSummary}</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Call To Action Bar */}
        <div className="sticky bottom-0 mt-auto w-full bg-white border-t border-[#f2f0f4] p-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-safe">
           <button 
             onClick={handleCheckout}
             className="w-full bg-black hover:bg-gray-800 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-black/30 transition-all active:scale-95 flex items-center justify-center gap-2"
           >
             <span>Continuer vers la caisse</span>
             <span className="material-symbols-outlined">shopping_cart_checkout</span>
           </button>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardBottomNav } from "@/components/dashboard/bottom-nav";
import { ServiceCard } from "@/components/dashboard/service-card";
import { DashboardHeaderControls } from "@/components/dashboard/header-controls";
import { fetchCatalogProductsPage, type CatalogProduct } from "@/lib/catalog";
import { getPlural, useI18n } from "@/lib/i18n";

const PAGE_SIZE = 100;
const ALL_CATEGORY = "__all__";

export default function ServicesPage() {
  const { locale, t } = useI18n();
  const [services, setServices] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalServices, setTotalServices] = useState(0);

  useEffect(() => {
    let isActive = true;

    fetchCatalogProductsPage(1, PAGE_SIZE)
      .then((page) => {
        if (!isActive) return;

        setServices(page.products);
        setCurrentPage(page.currentPage);
        setHasMore(page.hasMore);
        setTotalServices(page.total);
      })
      .catch((err) => {
        console.error("Failed to fetch catalog services:", err);

        if (isActive) {
          setError(t("services.loadError"));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [t]);

  async function handleLoadMore() {
    if (isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    setError("");

    try {
      let page = currentPage;
      let more: boolean = hasMore;
      let gainedVisibleService = false;

      // When a category filter is active, a single page of raw products may
      // not contain any item from that category: keep fetching until the
      // filtered list actually grows, or there are no more pages left.
      do {
        const nextPage = await fetchCatalogProductsPage(page + 1, PAGE_SIZE);
        page = nextPage.currentPage;
        more = nextPage.hasMore;

        setServices((previousServices) => {
          const mergedServices = [...previousServices];

          nextPage.products.forEach((service) => {
            if (!mergedServices.some((existingService) => existingService.slug === service.slug)) {
              mergedServices.push(service);
              if (activeCategory === ALL_CATEGORY || service.category === activeCategory) {
                gainedVisibleService = true;
              }
            }
          });

          return mergedServices;
        });
        setCurrentPage(page);
        setHasMore(more);
        setTotalServices(nextPage.total);
      } while (more && !gainedVisibleService);
    } catch (err) {
      console.error("Failed to load more catalog services:", err);
      setError(t("services.loadMoreError"));
    } finally {
      setIsLoadingMore(false);
    }
  }

  const uniqueCategories = useMemo(() => Array.from(new Set(services.map((service) => service.category))), [services]);
  const categories = useMemo(() => [ALL_CATEGORY, ...uniqueCategories], [uniqueCategories]);

  const servicesByCategory = useMemo(
    () =>
      services.reduce<Record<string, CatalogProduct[]>>((acc, service) => {
        if (!acc[service.category]) acc[service.category] = [];
        acc[service.category].push(service);
        return acc;
      }, {}),
    [services],
  );

  const filteredServices = activeCategory === ALL_CATEGORY ? services : services.filter((service) => service.category === activeCategory);

  return (
    <div className="dashboard-mode bg-[#f6f6f8] text-[#131118] min-h-screen flex justify-center sm:items-center sm:p-4">
      {/* Mobile View Simulator */}
      <div className="w-full sm:max-w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-[#f6f6f8] sm:rounded-[40px] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col mx-auto h-[100dvh] sm:h-auto">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#f2f0f4] px-5 py-4 flex flex-col shadow-sm gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center justify-center size-10 rounded-full bg-[#f2f0f4] text-[#131118] hover:bg-[#e8e6eb] transition-colors mr-1">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <h1 className="text-lg font-bold tracking-tight">{t("services.title")}</h1>
            </div>
            <DashboardHeaderControls />
          </div>
          
          {/* Horizontal Chips Filter */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? "bg-[#131118] text-white shadow-md shadow-gray-300"
                    : "bg-[#f2f0f4] text-gray-500 hover:bg-[#e8e6eb]"
                }`}
              >
                {cat === ALL_CATEGORY ? t("services.all") : cat}
              </button>
            ))}
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          <section className="py-6">
            <div className="px-5 mb-5">
              <p className="text-sm text-gray-500 font-medium">
                {t("services.description")}
              </p>
              {!isLoading && services.length > 0 && (
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                  {totalServices > services.length
                    ? t("services.displayedTotal", {
                        count: services.length,
                        plural: getPlural(locale, services.length),
                        total: totalServices,
                      })
                    : t("services.displayed", {
                        count: services.length,
                        plural: getPlural(locale, services.length),
                      })}
                </p>
              )}
            </div>

            {error && (
              <div className="px-5 mb-5">
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-700">
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-3 inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-bold text-red-700 shadow-sm transition-colors hover:bg-red-100"
                  >
                    {t("common.retry")}
                  </button>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 px-5 md:grid-cols-2">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="h-40 w-full rounded-2xl bg-gray-100 animate-pulse" />
                    <div className="mt-4 h-4 w-20 rounded bg-gray-100 animate-pulse" />
                    <div className="mt-3 h-6 w-40 rounded bg-gray-200 animate-pulse" />
                    <div className="mt-3 h-4 w-full rounded bg-gray-100 animate-pulse" />
                    <div className="mt-2 h-4 w-4/5 rounded bg-gray-100 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : !error && services.length === 0 ? (
              <div className="px-5 pb-4">
                <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-6 text-center">
                <h2 className="text-lg font-bold text-[#131118] mb-2">{t("services.noServiceTitle")}</h2>
                  <p className="text-sm text-gray-500">{t("services.noServiceText")}</p>
                </div>
              </div>
            ) : activeCategory === ALL_CATEGORY ? (
              // Affichage par section catégorisée (Scroll Horizontal)
              <div className="flex flex-col gap-8 pb-4">
                {uniqueCategories.map((categoryName) => (
                  <div key={categoryName} className="flex flex-col gap-4">
                    <div className="px-5 flex items-center justify-between">
                      <h2 className="text-lg font-bold text-[#131118]">{categoryName}</h2>
                      <button 
                        onClick={() => setActiveCategory(categoryName)}
                        className="text-xs font-bold text-[#5b13ec]"
                      >
                        {t("services.seeMore")}
                      </button>
                    </div>
                    {/* Horizontal Scroll pour les cartes de cette catégorie */}
                    <div className="flex overflow-x-auto gap-4 px-5 pb-2 no-scrollbar snap-x snap-mandatory">
                      {servicesByCategory[categoryName].map((service) => (
                        <ServiceCard key={service.slug} service={service} compact />
                      ))}
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <div className="px-5">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="flex w-full items-center justify-center rounded-full bg-[#131118] px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-[#221d2c] disabled:cursor-not-allowed disabled:bg-[#4b4655]"
                    >
                      {isLoadingMore ? t("services.loadingMore") : t("services.loadMore")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Affichage filtré (Scroll Vertical)
              <div className="grid grid-cols-1 gap-5 px-5 md:grid-cols-2">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.slug} service={service} />
                ))}
                {hasMore && (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="mb-2 flex w-full items-center justify-center rounded-full bg-[#131118] px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-[#221d2c] disabled:cursor-not-allowed disabled:bg-[#4b4655]"
                  >
                    {isLoadingMore ? t("services.loadingMore") : t("services.loadMore")}
                  </button>
                )}
              </div>
            )}
          </section>
        </main>

        <DashboardBottomNav active="services" />

      </div>
    </div>
  );
}

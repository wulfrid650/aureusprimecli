"use client";

import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog";
import { ServiceIllustration } from "@/components/dashboard/service-illustration";
import { getPlural, useI18n } from "@/lib/i18n";

type ServiceCardProps = {
  service: CatalogProduct;
  compact?: boolean;
};

export function ServiceCard({ service, compact = false }: ServiceCardProps) {
  const { locale, t } = useI18n();

  return (
    <Link
      href={`/dashboard/services/${service.slug}`}
      className={`group bg-white rounded-b-3xl rounded-t-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition-shadow ${
        compact ? "snap-center shrink-0 w-[260px]" : "w-full"
      }`}
    >
      <div className={`relative w-full bg-gray-100 shrink-0 ${compact ? "h-32" : "h-40"}`}>
        <ServiceIllustration service={service} className="transition-transform duration-500 group-hover:scale-[1.02]" />
        <div className={`absolute right-3 top-3 z-20 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm ${service.badgeClassName}`}>
          {service.badgeLabel}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 pt-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400">{service.category}</p>
            <h3 className="text-lg font-bold text-gray-900 truncate">{service.title}</h3>
          </div>
          {service.optionCount > 1 && (
            <span className="shrink-0 rounded-full bg-[#f2f0f4] px-2.5 py-1 text-[11px] font-bold text-[#5b13ec]">
              {t("marketing.offersCount", {
                count: service.optionCount,
                plural: getPlural(locale, service.optionCount),
              })}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{service.shortDescription}</p>

        {service.hasStudentOffer && service.studentOfferLabel && (
          <div className="mb-4 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
            <span className="material-symbols-outlined text-[14px]">school</span>
            {service.studentOfferLabel}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">{service.priceHint}</span>
            {service.originalPriceFormatted ? (
              <span className="text-xs text-gray-400 line-through mt-0.5">{service.originalPriceFormatted}</span>
            ) : null}
            <span className="text-xs text-gray-400 mt-0.5">{service.priceContextLabel}</span>
            <span className="text-lg font-bold text-[#131118] whitespace-nowrap mt-1">{service.currentPriceFormatted}</span>
          </div>

          <span className="flex items-center justify-center size-10 rounded-full bg-[#dbb723] text-white shadow-md shadow-[#dbb723]/20 transition-transform duration-200 group-hover:scale-105 group-hover:bg-[#b79218]">
            <span className="material-symbols-outlined font-bold text-[20px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

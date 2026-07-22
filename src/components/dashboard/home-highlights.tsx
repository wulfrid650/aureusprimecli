"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { safeFetch } from "@/lib/fetch";
import { useI18n } from "@/lib/i18n";

type HomeHighlight = {
  id: number;
  type: "promotion" | "tip";
  title: string;
  content?: string | null;
  action_url?: string | null;
  product?: { slug: string; name: string } | null;
  option?: {
    label?: string | null;
    price: number;
    price_formatted?: string | null;
    original_price?: number | null;
    duration_days?: number | null;
  } | null;
};

type HighlightResponse = {
  promotion?: HomeHighlight | null;
  tip?: HomeHighlight | null;
};

let highlightsRequest: Promise<{ data?: HighlightResponse } | null> | null = null;

export function HomePromotionCard() {
  const { promotion } = useHomeHighlights();
  const { t } = useI18n();

  if (!promotion?.product || !promotion.option) return null;

  const duration = durationLabel(promotion.option.duration_days, t);

  return (
    <section className="px-5 pt-5">
      <Link
        href={promotion.action_url || `/dashboard/services/${promotion.product.slug}`}
        className="group relative block overflow-hidden rounded-3xl border border-[#d8e8ff] bg-[linear-gradient(135deg,#f7fbff_0%,#eef7ff_48%,#f4fff9_100%)] p-5 shadow-sm transition-transform active:scale-[0.99]"
      >
        <div aria-hidden="true" className="absolute inset-x-0 top-0 flex h-1">
          <span className="flex-1 bg-[#2388ff]" />
          <span className="flex-1 bg-[#ef3340]" />
          <span className="flex-1 bg-[#13a66a]" />
        </div>
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#1671db] shadow-sm">
            <span className="material-symbols-outlined">local_offer</span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1671db]">
              {t("dashboard.promotionEyebrow")}
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-[#131118]">{promotion.title}</h2>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-lg font-black text-[#0b8553]">
                {promotion.option.price_formatted || `${promotion.option.price.toLocaleString()} Auri`}
              </span>
              {promotion.option.original_price ? (
                <span className="text-xs font-bold text-gray-400 line-through">
                  {promotion.option.original_price.toLocaleString()} Auri
                </span>
              ) : null}
              {duration ? <span className="text-xs font-bold text-gray-500">• {duration}</span> : null}
            </div>
            {promotion.content ? <p className="mt-2 text-sm font-medium leading-relaxed text-gray-600">{promotion.content}</p> : null}
          </div>
          <span className="material-symbols-outlined mt-2 text-[#1671db] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
        </div>
      </Link>
    </section>
  );
}

export function HomeTipCard() {
  const { tip } = useHomeHighlights();
  const { t } = useI18n();

  if (!tip) return null;

  const content = (
    <div className="flex items-start gap-3 rounded-2xl border border-[#dce8f7] bg-[#f7fbff] p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#1671db] shadow-sm">
        <span className="material-symbols-outlined text-[20px]">lightbulb</span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1671db]">{t("dashboard.tipEyebrow")}</p>
        <h3 className="mt-1 font-black text-[#131118]">{tip.title}</h3>
        {tip.content ? <p className="mt-1 text-sm font-medium leading-relaxed text-gray-600">{tip.content}</p> : null}
      </div>
      {tip.action_url ? <span className="material-symbols-outlined self-center text-gray-400">chevron_right</span> : null}
    </div>
  );

  return (
    <section className="px-5 pb-6">
      {tip.action_url ? <Link href={tip.action_url}>{content}</Link> : content}
    </section>
  );
}

function useHomeHighlights() {
  const [data, setData] = useState<HighlightResponse>({});

  useEffect(() => {
    let active = true;
    const request = highlightsRequest ??= safeFetch<{ data?: HighlightResponse }>("/api/v1/home-highlights");
    request
      .then((response) => {
        if (active && response?.data) setData(response.data);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return data;
}

function durationLabel(days: number | null | undefined, t: (key: string, variables?: Record<string, string | number>) => string) {
  if (!days) return "";
  if (days === 365) return t("dashboard.oneYear");
  if (days === 30) return t("dashboard.oneMonth");
  return t("dashboard.durationDays", { count: days });
}

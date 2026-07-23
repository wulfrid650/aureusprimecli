"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { safeFetch } from "@/lib/fetch";
import { useI18n } from "@/lib/i18n";

type TipPage = {
  id: number;
  position: number;
  title?: string | null;
  content: string;
  image_url?: string | null;
  background_color: string;
  duration_seconds: number;
  action_label?: string | null;
  action_url?: string | null;
};

type Tip = {
  id: number;
  title: string;
  category: string;
  thumbnail_url?: string | null;
  viewed: boolean;
  progress: { last_page: number; percent: number };
  pages: TipPage[];
};

type UpcomingTip = {
  id: number;
  title: string;
  category: string;
  thumbnail_url?: string | null;
  available_at: string;
  locked: true;
};

type TipsResponse = {
  data?: { items?: Tip[]; upcoming?: UpcomingTip[] };
};

const categoryIcons: Record<string, string> = {
  spotify: "graphic_eq",
  apple_music: "music_note",
  netflix: "movie",
  canva: "design_services",
  security: "shield_lock",
  savings: "savings",
  aureus_prime: "auto_awesome",
  aureus_plus: "stars",
};

export function TipStories() {
  const { locale } = useI18n();
  const [tips, setTips] = useState<Tip[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingTip[]>([]);
  const [activeTipIndex, setActiveTipIndex] = useState<number | null>(null);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    safeFetch<TipsResponse>("/api/v1/me/tips")
      .then((response) => {
        if (!active) return;
        const items = response?.data?.items ?? [];
        setTips(items);
        setUpcoming(response?.data?.upcoming ?? []);

        const requestedTip = new URLSearchParams(window.location.search).get("tip");
        if (requestedTip) {
          const index = items.findIndex((tip) => String(tip.id) === requestedTip);
          if (index >= 0) setActiveTipIndex(index);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openTip = (index: number) => {
    setActiveTipIndex(index);
    setActivePageIndex(0);
    void saveProgress(tips[index].id, 0, 0);
  };

  const closeStory = () => {
    setActiveTipIndex(null);
    setActivePageIndex(0);
  };

  const completePages = async (tipIndex: number, completedPages: number) => {
    const tip = tips[tipIndex];
    const pageCount = Math.max(1, tip.pages.length);
    const percent = Math.round((completedPages / pageCount) * 100);
    const updated = await saveProgress(tip.id, completedPages, percent);
    if (updated) {
      setTips((current) =>
        current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
    }
  };

  const goNext = () => {
    if (activeTipIndex === null) return;
    const tip = tips[activeTipIndex];
    void completePages(activeTipIndex, activePageIndex + 1);

    if (activePageIndex < tip.pages.length - 1) {
      setActivePageIndex((page) => page + 1);
      return;
    }
    if (activeTipIndex < tips.length - 1) {
      setActiveTipIndex((index) => (index ?? 0) + 1);
      setActivePageIndex(0);
      return;
    }
    closeStory();
  };

  const goPrevious = () => {
    if (activeTipIndex === null) return;
    if (activePageIndex > 0) {
      setActivePageIndex((page) => page - 1);
      return;
    }
    if (activeTipIndex > 0) {
      const previousIndex = activeTipIndex - 1;
      setActiveTipIndex(previousIndex);
      setActivePageIndex(Math.max(0, tips[previousIndex].pages.length - 1));
    }
  };

  if (!loading && tips.length === 0 && upcoming.length === 0) return null;

  const activeTip = activeTipIndex === null ? null : tips[activeTipIndex];

  return (
    <section className="pb-2 pt-1">
      <div className="mb-3 flex items-end justify-between px-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1671db]">
            {locale === "en" ? "Discover" : "Découvrir"}
          </p>
          <h2 className="mt-0.5 text-lg font-black text-[#131118]">
            {locale === "en" ? "Daily tips" : "Astuces du jour"}
          </h2>
        </div>
        {tips.some((tip) => !tip.viewed) ? (
          <span className="rounded-full bg-[#1671db]/10 px-2.5 py-1 text-[10px] font-black text-[#1671db]">
            {tips.filter((tip) => !tip.viewed).length} {locale === "en" ? "new" : "nouvelle(s)"}
          </span>
        ) : null}
      </div>

      <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-5 pb-5">
        {loading
          ? [0, 1, 2, 3].map((item) => (
              <div key={item} className="w-[68px] shrink-0 snap-start text-center">
                <div className="mx-auto size-16 animate-pulse rounded-full bg-gray-200" />
                <div className="mx-auto mt-2 h-2.5 w-12 animate-pulse rounded bg-gray-200" />
              </div>
            ))
          : null}
        {tips.map((tip, index) => (
          <button
            key={tip.id}
            type="button"
            onClick={() => openTip(index)}
            className="w-[70px] shrink-0 snap-start text-center"
            aria-label={`${locale === "en" ? "Open" : "Ouvrir"} ${tip.title}`}
          >
            <TipRing tip={tip} />
            <span className="mt-2 block truncate text-[11px] font-bold text-[#38343f]">{tip.title}</span>
          </button>
        ))}
        {upcoming.map((tip) => (
          <div key={`upcoming-${tip.id}`} className="w-[70px] shrink-0 snap-start text-center opacity-60">
            <div className="relative mx-auto flex size-16 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100 text-gray-500">
              <span className="material-symbols-outlined text-[22px]">lock</span>
            </div>
            <span className="mt-2 block truncate text-[11px] font-bold text-gray-500">{tip.title}</span>
            <span className="mt-0.5 block text-[9px] font-bold text-gray-400">{availabilityLabel(tip.available_at, locale)}</span>
          </div>
        ))}
      </div>

      {activeTip ? (
        <StoryViewer
          key={`${activeTip.id}-${activePageIndex}`}
          tip={activeTip}
          pageIndex={activePageIndex}
          onClose={closeStory}
          onNext={goNext}
          onPrevious={goPrevious}
        />
      ) : null}
    </section>
  );
}

function TipRing({ tip }: { tip: Tip }) {
  const icon = categoryIcons[tip.category] ?? "lightbulb";
  return (
    <div
      className={`relative mx-auto rounded-full p-[3px] ${
        tip.viewed ? "bg-gray-300" : "bg-[conic-gradient(#2388ff,#13a66a,#ef3340,#2388ff)]"
      }`}
    >
      <div className="flex size-[58px] items-center justify-center overflow-hidden rounded-full border-[3px] border-[#f6f6f8] bg-white text-[#1671db] shadow-sm">
        {tip.thumbnail_url ? (
          <span className="size-full bg-cover bg-center" style={{ backgroundImage: `url(${tip.thumbnail_url})` }} />
        ) : (
          <span className="material-symbols-outlined text-[25px]">{icon}</span>
        )}
      </div>
    </div>
  );
}

function StoryViewer({
  tip,
  pageIndex,
  onClose,
  onNext,
  onPrevious,
}: {
  tip: Tip;
  pageIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const { locale } = useI18n();
  const pointerStart = useRef<number | null>(null);
  const page = tip.pages[pageIndex];

  useEffect(() => {
    const timer = window.setTimeout(onNext, Math.max(3, page.duration_seconds) * 1000);
    return () => window.clearTimeout(timer);
  }, [onNext, page.duration_seconds, page.id]);

  return (
    <div className="fixed inset-0 z-[90] bg-black/75 sm:flex sm:items-center sm:justify-center sm:p-4" role="dialog" aria-modal="true" aria-label={tip.title}>
      <div
        className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] select-none flex-col overflow-hidden bg-[#111827] text-white sm:h-[850px] sm:max-h-[calc(100vh-2rem)] sm:rounded-[36px] sm:shadow-2xl"
        style={{ backgroundColor: page.background_color }}
        onPointerDown={(event) => {
          pointerStart.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (pointerStart.current === null) return;
          const delta = event.clientX - pointerStart.current;
          pointerStart.current = null;
          if (delta < -45) onNext();
          if (delta > 45) onPrevious();
        }}
      >
        {page.image_url ? (
          <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${page.image_url})` }} />
        ) : null}
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,20,.45),rgba(7,10,20,.08)_35%,rgba(7,10,20,.72))]" />

        <div className="relative z-10 flex gap-1.5 px-4 pt-[max(14px,env(safe-area-inset-top))]">
          {tip.pages.map((storyPage, index) => (
            <span key={storyPage.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <span
                className={`block h-full rounded-full bg-white ${index < pageIndex ? "w-full" : index > pageIndex ? "w-0" : "story-progress"}`}
                style={index === pageIndex ? { animationDuration: `${Math.max(3, page.duration_seconds)}s` } : undefined}
              />
            </span>
          ))}
        </div>

        <div className="relative z-10 flex items-center gap-3 px-4 py-4">
          <span className="flex size-10 items-center justify-center rounded-full bg-white/18 backdrop-blur-md">
            <span className="material-symbols-outlined text-[21px]">{categoryIcons[tip.category] ?? "lightbulb"}</span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black">{tip.title}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/65">{formatCategory(tip.category)}</p>
          </div>
          <button type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md" aria-label={locale === "en" ? "Close" : "Fermer"}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <button type="button" className="absolute inset-y-20 left-0 z-10 w-1/3" onClick={onPrevious} aria-label={locale === "en" ? "Previous" : "Précédent"} />
        <button type="button" className="absolute inset-y-20 right-0 z-10 w-1/3" onClick={onNext} aria-label={locale === "en" ? "Next" : "Suivant"} />

        <div className="relative z-10 mt-auto px-7 pb-[max(38px,env(safe-area-inset-bottom))] pointer-events-none">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/65">
            {locale === "en" ? "Good to know" : "Bon à savoir"}
          </p>
          {page.title ? <h3 className="mt-3 text-3xl font-black leading-tight tracking-tight">{page.title}</h3> : null}
          <p className="mt-3 text-base font-semibold leading-relaxed text-white/90">{page.content}</p>
          {page.action_url && page.action_label ? (
            <Link href={page.action_url} className="pointer-events-auto mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-black text-[#131118] shadow-lg">
              {page.action_label}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

async function saveProgress(tipId: number, lastPage: number, completionPercent: number): Promise<Tip | null> {
  const response = await safeFetch<{ data?: Tip }>(`/api/v1/me/tips/${tipId}/progress`, {
    method: "POST",
    body: JSON.stringify({ last_page: lastPage, completion_percent: completionPercent }),
  });
  return response?.data ?? null;
}

function availabilityLabel(value: string, locale: "fr" | "en") {
  const target = new Date(value);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (target.toDateString() === tomorrow.toDateString()) return locale === "en" ? "Tomorrow" : "Demain";
  return target.toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "short" });
}

function formatCategory(value: string) {
  return value.replaceAll("_", " ");
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { safeFetch } from "@/lib/fetch";
import { useI18n } from "@/lib/i18n";

type MissionPrimeSnapshot = {
  available: boolean;
  profile?: {
    points: number;
    level: { label: string };
    badges: string[];
    aureus_plus_offer?: { active: boolean; eligible_cta: boolean };
  };
  series?: { total: number };
  current_mission?: { name: string; position: number } | null;
};

export function MissionPrimeHomeCard() {
  const { t } = useI18n();
  const snapshot = useMissionPrimeAvailability();

  if (!snapshot) return null;

  if (!snapshot.available) {
    return (
      <section className="px-5 pb-6 pt-7">
        <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 flex h-1">
            <span className="flex-1 bg-[#2388ff]" />
            <span className="flex-1 bg-[#ef3340]" />
            <span className="flex-1 bg-[#13a66a]" />
          </div>
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#1671db]">
              <span className="material-symbols-outlined text-[23px]">hotel_class</span>
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#1671db]">
                  {t("dashboard.missionPrimeTeaserEyebrow")}
                </p>
                <span className="rounded-full bg-[#13a66a]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#0b8553]">
                  {t("dashboard.missionPrimeTeaserBadge")}
                </span>
              </div>
              <h2 className="mt-2 text-xl font-black tracking-tight text-[#131118]">
                {t("dashboard.missionPrimeTeaserTitle")}
              </h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
                {t("dashboard.missionPrimeTeaserDescription")}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const mission = snapshot.current_mission;
  if (!mission) return null;

  return (
    <section className="px-5 pb-6 pt-7">
      <Link
        href="/dashboard/missions"
        className="block rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-gray-200"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#1671db]">
            <span className="material-symbols-outlined text-[23px]">hotel_class</span>
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-black text-[#131118]">Mission Prime</h2>
              <span className="text-xs font-bold text-gray-400">
                {t("missionPrime.step", {
                  current: mission.position,
                  total: snapshot.series?.total ?? 15,
                })}
              </span>
            </div>
            <p className="mt-2 text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
              {t("missionPrime.currentMission")}
            </p>
            <p className="mt-1 truncate text-base font-black text-[#131118]">{mission.name}</p>
          </div>
          <span className="material-symbols-outlined text-gray-400">arrow_forward</span>
        </div>
      </Link>
    </section>
  );
}

export function MissionPrimeProfileLink() {
  const { locale, t } = useI18n();
  const snapshot = useMissionPrimeAvailability();

  if (!snapshot?.available || !snapshot.profile) return null;

  const badges = snapshot.profile.badges ?? [];

  return (
    <Link
      href="/dashboard/missions"
      className="group mb-6 block rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:border-gray-200"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#1671db]">
          <span className="material-symbols-outlined">hotel_class</span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-black text-[#131118]">Mission Prime</p>
          <p className="mt-0.5 truncate text-xs font-semibold text-gray-500">
            {snapshot.current_mission?.name ?? t("missionPrime.completedTitle")}
          </p>
        </div>
        <span className="material-symbols-outlined text-gray-400 transition-transform group-hover:translate-x-0.5">
          chevron_right
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-[#f6f6f8] px-3.5 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
            {locale === "en" ? "Prime level" : "Niveau Prime"}
          </p>
          <p className="mt-1 text-base font-black text-[#131118]">{snapshot.profile.level.label}</p>
        </div>
        <div className="rounded-2xl bg-[#eef5ff] px-3.5 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#1671db]/70">
            {t("missionPrime.primePoints")}
          </p>
          <p className="mt-1 text-base font-black text-[#1671db]">
            {snapshot.profile.points.toLocaleString(locale === "en" ? "en-US" : "fr-FR")} PP
          </p>
        </div>
      </div>

      {badges.length > 0 ? (
        <div className="mt-4 border-t border-gray-100 pt-3.5">
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
            <span className="material-symbols-outlined text-[16px] text-[#dbb723]">workspace_premium</span>
            Badges
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[11px] font-black text-amber-700"
              >
                <span className="material-symbols-outlined text-[15px]">verified</span>
                {formatPrimeBadge(badge, locale)}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {!snapshot.profile.aureus_plus_offer?.active ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 px-3.5 py-3">
          <span className="material-symbols-outlined text-[#dbb723]">stars</span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-700/70">
              {locale === "en" ? "Next evolution" : "Prochaine évolution"}
            </p>
            <p className="text-sm font-black text-[#131118]">Aureus+ · {locale === "en" ? "Coming soon" : "Bientôt disponible"}</p>
          </div>
        </div>
      ) : null}
    </Link>
  );
}

function formatPrimeBadge(badge: string, locale: "fr" | "en") {
  const labels: Record<string, { fr: string; en: string }> = {
    confirmed_user: { fr: "Utilisateur confirmé", en: "Confirmed user" },
    regular: { fr: "Habitué", en: "Regular" },
    prime_elite: { fr: "Prime Elite", en: "Prime Elite" },
  };

  return labels[badge]?.[locale] ?? badge.replaceAll("_", " ");
}

function useMissionPrimeAvailability() {
  const [snapshot, setSnapshot] = useState<MissionPrimeSnapshot | null>(null);

  useEffect(() => {
    let active = true;
    safeFetch<{ data?: MissionPrimeSnapshot }>("/api/v1/me/mission-prime")
      .then((response) => {
        if (active && response?.data) setSnapshot(response.data);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return snapshot;
}

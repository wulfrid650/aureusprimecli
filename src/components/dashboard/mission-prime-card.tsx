"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { safeFetch } from "@/lib/fetch";
import { useI18n } from "@/lib/i18n";

type MissionPrimeSnapshot = {
  available: boolean;
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
  const { t } = useI18n();
  const snapshot = useMissionPrimeAvailability();

  if (!snapshot?.available) return null;

  return (
    <Link
      href="/dashboard/missions"
      className="mb-6 flex items-center gap-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm"
    >
      <span className="flex size-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#1671db]">
        <span className="material-symbols-outlined">hotel_class</span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-black text-[#131118]">Mission Prime</p>
        <p className="mt-0.5 truncate text-xs font-semibold text-gray-500">
          {snapshot.current_mission?.name ?? t("missionPrime.completedTitle")}
        </p>
      </div>
      <span className="material-symbols-outlined text-gray-400">chevron_right</span>
    </Link>
  );
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

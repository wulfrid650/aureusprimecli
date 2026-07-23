"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardBottomNav } from "@/components/dashboard/bottom-nav";
import { safeFetch } from "@/lib/fetch";
import { useI18n } from "@/lib/i18n";

type PrimeMission = {
  code: string;
  position: number;
  name: string;
  description: string;
  progress: { current: number; target: number };
  reward: { auri: number; points: number; badge_label?: string | null };
};

type MissionPrimeSnapshot = {
  available: boolean;
  profile?: {
    points: number;
    level: { key: string; label: string };
    next_level?: { label: string; points_remaining?: number } | null;
    aureus_plus: boolean;
    aureus_plus_offer?: { active: boolean; eligible_cta: boolean; earned_via_prime: boolean };
    prime_elite_reward?: {
      offer_name?: string | null;
      status: "selection_pending" | "fulfillment_pending" | "fulfilled" | "failed";
      duration_days: number;
      awarded_at?: string | null;
    } | null;
  };
  series?: { completed: number; total: number; percentage: number };
  current_mission?: PrimeMission | null;
  next_mission?: { locked: boolean; title: string; description: string } | null;
  completed_missions?: Array<PrimeMission & { completed_at?: string | null }>;
  dynamic_missions?: {
    active: PrimeMission[];
    completed: Array<PrimeMission & { completed_at?: string | null }>;
  };
};

const actionRoutes: Record<string, string> = {
  profile_completed: "/dashboard/compte",
  first_wallet_topup: "/dashboard/recharge",
  regular_topup: "/dashboard/recharge",
  first_subscription: "/dashboard/services",
  category_discovery: "/dashboard/services",
  second_subscription: "/dashboard/services",
  premium_collection: "/dashboard/services",
  premium_explorer: "/dashboard/services",
  first_referral: "/dashboard/parrainage",
  dynamic_enable_notifications: "/dashboard/compte",
};

export default function MissionPrimePage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [snapshot, setSnapshot] = useState<MissionPrimeSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setIsLoading(true);
    setError("");
    safeFetch<{ data?: MissionPrimeSnapshot }>("/api/v1/me/mission-prime")
      .then((response) => {
        if (!response?.data) throw new Error(t("missionPrime.loadError"));
        if (!response.data.available) {
          router.replace("/dashboard");
          return;
        }
        setSnapshot(response.data);
      })
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : t("missionPrime.loadError")),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    let active = true;
    safeFetch<{ data?: MissionPrimeSnapshot }>("/api/v1/me/mission-prime")
      .then((response) => {
        if (!active) return;
        if (!response?.data) throw new Error(t("missionPrime.loadError"));
        if (!response.data.available) {
          router.replace("/dashboard");
          return;
        }
        setSnapshot(response.data);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : t("missionPrime.loadError"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router, t]);

  const mission = snapshot?.current_mission ?? null;
  const actionRoute = mission ? actionRoutes[mission.code] : undefined;
  const profile = snapshot?.profile;
  const series = snapshot?.series;

  return (
    <div className="dashboard-mode flex min-h-screen justify-center bg-[#f6f6f8] text-[#131118] sm:items-center sm:p-4">
      <div className="relative mx-auto flex h-[100dvh] w-full flex-col overflow-hidden bg-[#f6f6f8] sm:h-auto sm:max-h-[850px] sm:max-w-[420px] sm:rounded-[40px] sm:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#f2f0f4] bg-white/85 px-5 py-4 backdrop-blur-md">
          <CircleButton icon="arrow_back" label={t("missionPrime.back")} onClick={() => router.back()} />
          <h1 className="text-lg font-black">{t("missionPrime.title")}</h1>
          <CircleButton icon="refresh" label={t("missionPrime.refresh")} onClick={load} />
        </header>

        <main className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28 pt-5">
          {isLoading ? <MissionPrimeSkeleton /> : null}
          {!isLoading && error ? <LoadError message={error} retryLabel={t("missionPrime.retry")} onRetry={load} /> : null}

          {!isLoading && snapshot?.available && profile && series ? (
            <div className="space-y-5">
              <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#1671db]">
                    <span className="material-symbols-outlined">hotel_class</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-black">{profile.level.label}</h2>
                      {profile.aureus_plus ? <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-black text-red-600">Aureus+</span> : null}
                    </div>
                    <p className="text-xs font-bold text-gray-400">{profile.points} {t("missionPrime.primePoints")}</p>
                  </div>
                  <span className="text-xs font-black text-gray-400">{series.completed}/{series.total}</span>
                </div>
                {profile.next_level ? (
                  <p className="mt-4 text-xs font-semibold text-gray-500">
                    {t("missionPrime.nextLevel", {
                      count: profile.next_level.points_remaining ?? 0,
                      level: profile.next_level.label,
                    })}
                  </p>
                ) : null}
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-[11px] font-black text-gray-500">
                    <span>{t("missionPrime.programProgress")}</span>
                    <span>{series.percentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#dbb723] transition-[width] duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, series.percentage))}%` }}
                    />
                  </div>
                </div>
              </section>

              {profile.level.key === "prime_elite" && !profile.aureus_plus ? (
                <section className="rounded-3xl border border-amber-100 bg-amber-50/70 p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#dbb723] shadow-sm">
                      <span className="material-symbols-outlined">stars</span>
                    </span>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-700/70">
                        {t("missionPrime.nextEvolution")}
                      </p>
                      <h2 className="mt-1 text-lg font-black">Aureus+</h2>
                      <p className="mt-1 text-sm font-medium text-gray-600">
                        {profile.aureus_plus_offer?.eligible_cta
                          ? t("missionPrime.aureusPlusEliteTeaser")
                          : t("missionPrime.aureusPlusComingSoon")}
                      </p>
                    </div>
                  </div>
                </section>
              ) : null}

              {profile.prime_elite_reward ? (
                <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                      <span className="material-symbols-outlined">card_giftcard</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700/70">
                        {locale === "en" ? "Prime Elite reward" : "Cadeau Prime Elite"}
                      </p>
                      <h2 className="mt-1 text-lg font-black">
                        {profile.prime_elite_reward.offer_name || (locale === "en" ? "Selection pending" : "Sélection en attente")}
                      </h2>
                      <p className="mt-1 text-sm font-medium text-gray-600">
                        {primeEliteRewardStatus(profile.prime_elite_reward.status, locale, profile.prime_elite_reward.duration_days)}
                      </p>
                      <p className="mt-3 text-[11px] font-bold text-emerald-800/65">
                        {locale === "en"
                          ? "One-time reward, non-transferable, non-refundable and without automatic renewal."
                          : "Récompense unique, non transférable, non remboursable et sans renouvellement automatique."}
                      </p>
                    </div>
                  </div>
                </section>
              ) : null}

              {mission ? (
                <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#1671db]">
                      {t("missionPrime.currentMission")}
                    </p>
                    <span className="text-xs font-bold text-gray-400">
                      {t("missionPrime.step", { current: mission.position, total: series.total })}
                    </span>
                  </div>
                  <h2 className="mt-5 text-2xl font-black tracking-tight">{mission.name}</h2>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">{mission.description}</p>

                  <div className="mt-6 border-t border-gray-100 pt-5">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-gray-500">{t("missionPrime.progress")}</span>
                      <span>{mission.progress.current} / {mission.progress.target}</span>
                    </div>
                    <MissionProgress
                      current={mission.progress.current}
                      target={mission.progress.target}
                    />
                    <p className="mt-5 text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">{t("missionPrime.reward")}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {mission.reward.auri > 0 ? <RewardChip icon="account_balance_wallet" label={`${mission.reward.auri} Auri`} /> : null}
                      {mission.reward.points > 0 ? <RewardChip icon="stars" label={`${mission.reward.points} PP`} /> : null}
                      {mission.reward.badge_label ? <RewardChip icon="workspace_premium" label={mission.reward.badge_label} /> : null}
                    </div>
                    {actionRoute ? (
                      <button type="button" onClick={() => router.push(actionRoute)} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1671db] text-sm font-black text-white">
                        {t("missionPrime.continue")}
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    ) : null}
                  </div>
                </section>
              ) : (
                <section className="rounded-3xl border border-gray-100 bg-white p-7 text-center shadow-sm">
                  <span className="material-symbols-outlined text-5xl text-[#1671db]">workspace_premium</span>
                  <h2 className="mt-4 text-xl font-black">{t("missionPrime.completedTitle")}</h2>
                  <p className="mt-2 text-sm text-gray-500">{t("missionPrime.completedText")}</p>
                </section>
              )}

              {snapshot.next_mission ? (
                <section className="rounded-3xl border border-dashed border-gray-200 bg-white/70 p-5">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-gray-400">lock</span>
                    <div>
                      <h3 className="font-black">{snapshot.next_mission.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{snapshot.next_mission.description}</p>
                    </div>
                  </div>
                </section>
              ) : null}

              {(snapshot.dynamic_missions?.active.length ?? 0) > 0 ? (
                <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#1671db]">
                    {t("missionPrime.limitedMissions")}
                  </p>
                  <div className="mt-4 space-y-3">
                    {snapshot.dynamic_missions?.active.map((dynamicMission) => (
                      <article key={dynamicMission.code} className="rounded-2xl bg-[#f6f6f8] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-black">{dynamicMission.name}</h3>
                            <p className="mt-1 text-sm text-gray-500">{dynamicMission.description}</p>
                          </div>
                          <span className="shrink-0 text-xs font-black text-gray-500">
                            {dynamicMission.progress.current}/{dynamicMission.progress.target}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {dynamicMission.reward.auri > 0 ? <RewardChip icon="account_balance_wallet" label={`${dynamicMission.reward.auri} Auri`} /> : null}
                          {dynamicMission.reward.points > 0 ? <RewardChip icon="stars" label={`${dynamicMission.reward.points} PP`} /> : null}
                          {dynamicMission.reward.badge_label ? <RewardChip icon="workspace_premium" label={dynamicMission.reward.badge_label} /> : null}
                        </div>
                        <MissionProgress
                          current={dynamicMission.progress.current}
                          target={dynamicMission.progress.target}
                          compact
                        />
                        {actionRoutes[dynamicMission.code] ? (
                          <button
                            type="button"
                            onClick={() => router.push(actionRoutes[dynamicMission.code])}
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#9b7a08]"
                          >
                            {t("missionPrime.continue")}
                            <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
                          </button>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {((snapshot.completed_missions?.length ?? 0) + (snapshot.dynamic_missions?.completed.length ?? 0)) > 0 ? (
                <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0b8553]">
                        {t("missionPrime.completedMissions")}
                      </p>
                      <h2 className="mt-1 text-lg font-black">{t("missionPrime.yourJourney")}</h2>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                      {(snapshot.completed_missions?.length ?? 0) + (snapshot.dynamic_missions?.completed.length ?? 0)}
                    </span>
                  </div>
                  <div className="mt-4 divide-y divide-gray-100">
                    {[...(snapshot.completed_missions ?? []), ...(snapshot.dynamic_missions?.completed ?? [])].map((completedMission) => (
                      <article key={completedMission.code} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <span className="material-symbols-outlined text-[19px]">check</span>
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h3 className="font-black">{completedMission.name}</h3>
                            {completedMission.completed_at ? (
                              <time className="text-[11px] font-bold text-gray-400">
                                {new Intl.DateTimeFormat(undefined, { day: "2-digit", month: "short", year: "numeric" }).format(new Date(completedMission.completed_at))}
                              </time>
                            ) : null}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {completedMission.reward.auri > 0 ? <RewardChip icon="account_balance_wallet" label={`${completedMission.reward.auri} Auri`} /> : null}
                            {completedMission.reward.points > 0 ? <RewardChip icon="stars" label={`${completedMission.reward.points} PP`} /> : null}
                            {completedMission.reward.badge_label ? <RewardChip icon="workspace_premium" label={completedMission.reward.badge_label} /> : null}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}
        </main>
        <DashboardBottomNav />
      </div>
    </div>
  );
}

function primeEliteRewardStatus(status: string, locale: "fr" | "en", days: number) {
  if (status === "fulfilled") {
    return locale === "en" ? `Your ${days}-day subscription is active.` : `Votre abonnement de ${days} jours est actif.`;
  }
  if (status === "fulfillment_pending") {
    return locale === "en" ? "Your subscription is being activated." : "Votre abonnement est en cours d’activation.";
  }
  if (status === "failed") {
    return locale === "en" ? "Activation requires support assistance." : "L’activation nécessite l’intervention du support.";
  }
  return locale === "en" ? "An eligible subscription will be selected shortly." : "Un abonnement éligible sera sélectionné prochainement.";
}

function RewardChip({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef5ff] px-3 py-2 text-xs font-black text-[#1671db]">
      <span className="material-symbols-outlined text-[16px]">{icon}</span>{label}
    </span>
  );
}

function MissionProgress({ current, target, compact = false }: { current: number; target: number; compact?: boolean }) {
  const percent = target > 0 ? Math.min(100, Math.max(0, (current / target) * 100)) : 0;
  return (
    <div className={compact ? "mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200" : "mt-3 h-2 overflow-hidden rounded-full bg-gray-100"}>
      <div className="h-full rounded-full bg-[#dbb723] transition-[width] duration-500" style={{ width: `${percent}%` }} />
    </div>
  );
}

function CircleButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex size-10 items-center justify-center rounded-full border border-gray-100 bg-white" aria-label={label}><span className="material-symbols-outlined">{icon}</span></button>;
}

function LoadError({ message, retryLabel, onRetry }: { message: string; retryLabel: string; onRetry: () => void }) {
  return <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center"><p className="text-sm font-bold text-red-700">{message}</p><button type="button" onClick={onRetry} className="mt-4 rounded-full bg-[#1671db] px-5 py-2.5 text-sm font-bold text-white">{retryLabel}</button></div>;
}

function MissionPrimeSkeleton() {
  return <div className="space-y-5" aria-hidden="true"><div className="h-24 animate-pulse rounded-3xl bg-gray-200" /><div className="h-80 animate-pulse rounded-3xl bg-gray-200" /></div>;
}

"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export type DashboardNavItem = "home" | "services" | "subscriptions" | "wallet" | "account";

export const dashboardNavItems: Array<{
  id: DashboardNavItem;
  href: string;
  icon: string;
  labelKey: string;
}> = [
  { id: "home", href: "/dashboard", icon: "home", labelKey: "nav.home" },
  { id: "services", href: "/dashboard/services", icon: "grid_view", labelKey: "nav.services" },
  {
    id: "subscriptions",
    href: "/dashboard/souscriptions",
    icon: "subscriptions",
    labelKey: "nav.subscriptions",
  },
  { id: "wallet", href: "/dashboard/wallet", icon: "account_balance_wallet", labelKey: "nav.wallet" },
  { id: "account", href: "/dashboard/compte", icon: "person", labelKey: "nav.account" },
];

export function DashboardBottomNav({ active }: { active?: DashboardNavItem }) {
  const { t } = useI18n();

  return (
    <div className="dashboard-bottom-nav sticky bottom-0 z-50 mt-auto flex w-full items-center justify-between border-t border-[#f2f0f4] bg-white px-4 py-3 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] pb-safe">
      {dashboardNavItems.map((item) => {
        const isActive = item.id === active;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center gap-1 ${isActive ? "text-[#dbb723]" : "text-gray-400 hover:text-[#131118]"}`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </div>
  );
}

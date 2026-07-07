"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavItems, type DashboardNavItem } from "@/components/dashboard/bottom-nav";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { NotificationButton } from "@/components/dashboard/notification-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function getActiveNavItem(pathname: string): DashboardNavItem | undefined {
  if (pathname === "/dashboard") return "home";
  if (pathname.startsWith("/dashboard/services") || pathname.startsWith("/dashboard/checkout")) return "services";
  if (pathname.startsWith("/dashboard/souscriptions")) return "subscriptions";
  if (pathname.startsWith("/dashboard/wallet") || pathname.startsWith("/dashboard/recharge")) return "wallet";
  if (pathname.startsWith("/dashboard/compte") || pathname.startsWith("/dashboard/parrainage")) return "account";

  return undefined;
}

function DashboardDesktopNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const activeItem = getActiveNavItem(pathname);

  return (
    <nav className="dashboard-desktop-nav" aria-label="Navigation dashboard">
      {dashboardNavItems.map((item) => {
        const isActive = item.id === activeItem;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`dashboard-desktop-nav-item ${isActive ? "is-active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardHeaderControls({ className = "" }: { className?: string }) {
  return (
    <>
      <div className={`dashboard-header-controls flex shrink-0 items-center gap-1.5 ${className}`}>
        <NotificationButton className="shrink-0" />
        <ThemeToggle className="size-8 shadow-none sm:size-9" />
        <LanguageToggle className="h-8 p-0.5 text-[10px] sm:h-9 sm:text-[11px] [&_button]:h-7 [&_button]:min-w-7 [&_button]:px-1.5 sm:[&_button]:min-w-8 sm:[&_button]:px-2" />
      </div>
      <DashboardDesktopNav />
    </>
  );
}

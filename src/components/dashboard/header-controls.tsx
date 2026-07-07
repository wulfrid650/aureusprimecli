"use client";

import { LanguageToggle } from "@/components/ui/language-toggle";
import { NotificationButton } from "@/components/dashboard/notification-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function DashboardHeaderControls({ className = "" }: { className?: string }) {
  return (
    <div className={`dashboard-header-controls flex shrink-0 items-center gap-1.5 ${className}`}>
      <NotificationButton className="shrink-0" />
      <ThemeToggle className="size-8 shadow-none sm:size-9" />
      <LanguageToggle className="h-8 p-0.5 text-[10px] sm:h-9 sm:text-[11px] [&_button]:h-7 [&_button]:min-w-7 [&_button]:px-1.5 sm:[&_button]:min-w-8 sm:[&_button]:px-2" />
    </div>
  );
}

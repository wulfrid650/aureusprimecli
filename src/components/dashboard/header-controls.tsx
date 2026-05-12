"use client";

import { LanguageToggle } from "@/components/ui/language-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function DashboardHeaderControls({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ThemeToggle className="size-9 shadow-none" />
      <LanguageToggle className="h-9 text-[11px]" />
    </div>
  );
}

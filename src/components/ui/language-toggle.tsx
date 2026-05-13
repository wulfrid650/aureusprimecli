"use client";

import { type Locale, useI18n } from "@/lib/i18n";

const options: Array<{ locale: Locale; label: string; nameKey: string }> = [
  { locale: "fr", label: "FR", nameKey: "common.french" },
  { locale: "en", label: "EN", nameKey: "common.english" },
];

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("common.languageSelector")}
      className={`inline-flex h-11 items-center rounded-full border border-[var(--premium-card-border,rgba(0,0,0,0.08))] bg-[var(--premium-panel,#F7F8F8)] p-1 text-xs font-bold text-[var(--premium-text,#1F2937)] shadow-sm ${className}`}
    >
      {options.map((option) => {
        const isSelected = option.locale === locale;

        return (
          <button
            key={option.locale}
            type="button"
            aria-label={t(option.nameKey)}
            aria-pressed={isSelected}
            title={t(option.nameKey)}
            onClick={() => setLocale(option.locale)}
            className={`h-8 min-w-9 rounded-full px-2 transition-colors ${
              isSelected
                ? "bg-[#1F2937] text-[#F7F8F8] shadow-sm"
                : "text-[var(--premium-text-muted,#6b7280)] hover:bg-black/5 hover:text-[var(--premium-text,#1F2937)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

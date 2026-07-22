"use client";

import { resolveApiUrl } from "@/lib/fetch";
import { useI18n } from "@/lib/i18n";

type GoogleAuthButtonProps = {
  intent: "login" | "signup";
  referralCode?: string;
  disabled?: boolean;
};

export function GoogleAuthButton({ intent, referralCode, disabled = false }: GoogleAuthButtonProps) {
  const { t } = useI18n();
  const params = new URLSearchParams({ intent });
  if (referralCode) {
    params.set("referral_code", referralCode);
  }

  const href = resolveApiUrl(`/api/v1/auth/google/redirect?${params.toString()}`);

  return (
    <a
      href={disabled ? undefined : href}
      aria-disabled={disabled}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
        }
      }}
      className={`flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] px-4 text-sm font-bold text-[var(--premium-text)] transition-colors hover:border-primary-400/50 hover:bg-primary-500/5 ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <span className="flex size-6 items-center justify-center rounded-full bg-white text-base font-black text-[#4285f4] shadow-sm" aria-hidden="true">
        G
      </span>
      <span>{intent === "login" ? t("auth.googleLogin") : t("auth.googleSignup")}</span>
    </a>
  );
}

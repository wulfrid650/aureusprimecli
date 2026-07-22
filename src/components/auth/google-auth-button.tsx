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
      tabIndex={disabled ? -1 : undefined}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
        }
      }}
      className="gsi-material-button"
    >
      <span className="gsi-material-button-state" aria-hidden="true" />
      <span className="gsi-material-button-content-wrapper">
        <span className="gsi-material-button-icon" aria-hidden="true">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
        </span>
        <span className="gsi-material-button-contents">
          {intent === "login" ? t("auth.googleLogin") : t("auth.googleSignup")}
        </span>
        <span style={{ display: "none" }} aria-hidden="true">
          {intent === "login" ? t("auth.googleLogin") : t("auth.googleSignup")}
        </span>
      </span>
    </a>
  );
}

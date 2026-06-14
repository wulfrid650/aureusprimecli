"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { isRecaptchaEnabled, RecaptchaField, type RecaptchaFieldHandle } from "@/components/auth/recaptcha-field";
import { getApiFieldErrors, getApiMessage, readApiResponse } from "@/lib/api-response";
import { apiFetch } from "@/lib/fetch";
import { useI18n } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const recaptchaRef = useRef<RecaptchaFieldHandle>(null);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isRecaptchaEnabled() && !recaptchaToken) {
      setError(t("auth.recaptchaRequired"));
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiFetch("/api/v1/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email, recaptcha_token: recaptchaToken }),
      });
      const data = await readApiResponse(res);

      if (!res.ok) {
        recaptchaRef.current?.reset();
        const fieldErrors = getApiFieldErrors(data);
        setError(fieldErrors.recaptcha_token?.[0] ?? getApiMessage(data, t("auth.forgotGenericError")));
        return;
      }

      setSuccess(true);
    } catch {
      recaptchaRef.current?.reset();
      setError(t("common.networkError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="premium-page flex min-h-screen items-center justify-center p-4 selection:bg-primary-300 selection:text-[var(--premium-contrast)]">
      <div className="w-full max-w-md">
        <div className="mb-6 flex w-full items-center justify-between gap-3 px-2">
          <Link href="/login" className="flex items-center gap-2 text-sm font-medium text-[var(--premium-text-muted)] transition-colors hover:text-primary-500">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {t("auth.backToLogin")}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle className="h-9 text-[11px]" />
            <ThemeToggle />
          </div>
        </div>

        <div className="premium-card-surface relative flex flex-col overflow-hidden rounded-2xl border border-[var(--premium-card-border)] bg-[var(--premium-panel)] px-8 py-10 backdrop-blur-xl transition-all">
          <div className="mb-8 flex flex-col items-center">
            <Link href="/" className="mb-6 block transition-transform hover:scale-105">
              <Image src="/logo-aureusprime.svg" alt="Aureus Prime Logo" width={170} height={20} className="logo-dark h-6 w-auto" />
              <Image src="/logo-aureusprime-light.svg" alt="Aureus Prime Logo" width={170} height={20} className="logo-light h-6 w-auto" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--premium-text)]">{t("auth.forgotTitle")}</h1>
            <p className="mt-2 text-sm text-[var(--premium-text-muted)] text-center">
              {t("auth.forgotSubtitle")}
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="size-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[36px]">mark_email_read</span>
              </div>
              <div>
                <p className="font-bold text-[var(--premium-text)] mb-1">{t("auth.forgotSuccessTitle")}</p>
                <p className="text-sm text-[var(--premium-text-muted)]">
                  {t("auth.forgotSuccessText", { email })}
                </p>
              </div>
              <Link href="/login" className="mt-2 w-full text-center py-3 rounded-xl bg-primary-500 text-sm font-bold text-[var(--premium-contrast)] hover:bg-primary-400 transition-all">
                {t("auth.backToLogin")}
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-[var(--premium-text)]">{t("common.emailAddress")}</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--premium-text-soft)]">
                      <span className="material-symbols-outlined text-lg">mail</span>
                    </div>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@exemple.com"
                      className="w-full rounded-xl border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] py-3 pl-11 pr-4 text-sm text-[var(--premium-text)] placeholder:text-[var(--premium-text-soft)] outline-none transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50"
                      required />
                  </div>
                </div>

                <RecaptchaField ref={recaptchaRef} onTokenChange={setRecaptchaToken} />

                <button type="submit" disabled={isLoading}
                  className="group mt-2 relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary-500 px-4 py-3.5 text-sm font-bold text-[var(--premium-contrast)] transition-all hover:-translate-y-0.5 hover:bg-primary-400 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                    : <span className="flex items-center gap-2">{t("auth.forgotSubmit")} <span className="material-symbols-outlined text-lg">send</span></span>
                  }
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

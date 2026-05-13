"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getApiFieldErrors, getApiMessage, readApiResponse } from "@/lib/api-response";
import { apiFetch } from "@/lib/fetch";
import { useI18n } from "@/lib/i18n";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [form, setForm] = useState({ password: "", password_confirmation: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.password_confirmation) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    if (!token || !email) {
      setError(t("auth.resetInvalidLink"));
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiFetch("/api/v1/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, email, password: form.password, password_confirmation: form.password_confirmation }),
      });
      const data = await readApiResponse(res);

      if (!res.ok) {
        const fieldErrors = getApiFieldErrors(data);
        const fieldError =
          fieldErrors.password?.[0] ??
          fieldErrors.password_confirmation?.[0] ??
          fieldErrors.token?.[0] ??
          fieldErrors.email?.[0];

        setError(fieldError ?? getApiMessage(data, t("auth.resetInvalidLink")));
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
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
            <Link href="/accueil" className="mb-6 block transition-transform hover:scale-105">
              <Image src="/logo-aureusprime.svg" alt="Aureus Prime Logo" width={170} height={20} className="logo-dark h-6 w-auto" />
              <Image src="/logo-aureusprime-light.svg" alt="Aureus Prime Logo" width={170} height={20} className="logo-light h-6 w-auto" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--premium-text)]">{t("auth.resetTitle")}</h1>
            <p className="mt-2 text-sm text-[var(--premium-text-muted)] text-center">{t("auth.resetSubtitle")}</p>
          </div>

          {success ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="size-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[36px]">check_circle</span>
              </div>
              <div>
                <p className="font-bold text-[var(--premium-text)] mb-1">{t("auth.resetSuccessTitle")}</p>
                <p className="text-sm text-[var(--premium-text-muted)]">{t("auth.resetSuccessText")}</p>
              </div>
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
                {/* Email (pre-filled, read-only) */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--premium-text)]">Email</label>
                  <input type="email" value={email} readOnly
                    className="w-full rounded-xl border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] py-3 px-4 text-sm text-[var(--premium-text-muted)] outline-none opacity-70 cursor-not-allowed" />
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-[var(--premium-text)]">{t("auth.newPassword")}</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--premium-text-soft)]">
                      <span className="material-symbols-outlined text-lg">lock</span>
                    </div>
                    <input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••"
                      className="w-full rounded-xl border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] py-3 pl-11 pr-11 text-sm text-[var(--premium-text)] placeholder:text-[var(--premium-text-soft)] outline-none transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50"
                      required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--premium-text-soft)] hover:text-primary-500">
                      <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                  <p className="text-xs text-[var(--premium-text-soft)]">{t("auth.passwordHint")}</p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label htmlFor="confirm" className="text-sm font-medium text-[var(--premium-text)]">{t("auth.confirm")}</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--premium-text-soft)]">
                      <span className="material-symbols-outlined text-lg">lock_clock</span>
                    </div>
                    <input id="confirm" type={showPassword ? "text" : "password"} value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} placeholder="••••••••"
                      className={`w-full rounded-xl border bg-[var(--premium-card-deep)] py-3 pl-11 pr-4 text-sm text-[var(--premium-text)] placeholder:text-[var(--premium-text-soft)] outline-none transition-all focus:ring-1 focus:ring-primary-500/50 ${form.password_confirmation && form.password !== form.password_confirmation ? "border-red-400" : "border-[var(--premium-card-border)] focus:border-primary-500"}`}
                      required />
                  </div>
                </div>

                <button type="submit" disabled={isLoading}
                  className="group mt-2 relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary-500 px-4 py-3.5 text-sm font-bold text-[var(--premium-contrast)] transition-all hover:-translate-y-0.5 hover:bg-primary-400 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                    : <span className="flex items-center gap-2">{t("auth.resetSubmit")} <span className="material-symbols-outlined text-lg">check</span></span>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

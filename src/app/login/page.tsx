"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { GoogleAccountLinkForm } from "@/components/auth/google-account-link-form";
import { isRecaptchaEnabled, RecaptchaField, type RecaptchaFieldHandle } from "@/components/auth/recaptcha-fields";
import { getStoredAuthToken, storeAuthToken } from "@/lib/auth-token";
import { getApiMessage, readApiResponse } from "@/lib/api-response";
import { resolveApiUrl } from "@/lib/fetch";
import { useI18n } from "@/lib/i18n";

interface AuthResponseData {
  access_token?: string;
  token?: string;
  user?: {
    id?: number;
    name?: string | null;
    email?: string | null;
    email_verified_at?: string | null;
  };
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, t } = useI18n();
  const [form, setForm] = useState({ email: "", password: "" });
  const recaptchaRef = useRef<RecaptchaFieldHandle>(null);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const isEmailVerifiedNoticeVisible = searchParams.get("verified") === "1";
  const googleExchangeToken = searchParams.get("google_exchange");
  const googleLinkToken = searchParams.get("google_link")?.trim() ?? "";
  const googleError = searchParams.get("google_error");
  const referralCode = searchParams.get("referral_code")?.trim().toUpperCase() ?? "";
  const legalNotice =
    locale === "fr"
      ? "En vous connectant, vous acceptez automatiquement les documents légaux en vigueur :"
      : "By signing in, you automatically accept the current legal documents:";

  useEffect(() => {
    if (getStoredAuthToken() && !googleLinkToken) {
      router.replace("/dashboard");
    }
  }, [googleLinkToken, router]);

  useEffect(() => {
    if (googleError) {
      queueMicrotask(() => {
        setError(
          googleError === "cancelled"
            ? t("auth.googleCancelled")
            : googleError === "account_conflict"
              ? t("auth.googleAccountConflict")
              : t("auth.googleUnavailable"),
        );
      });
      return;
    }

    if (!googleExchangeToken) {
      return;
    }

    let active = true;
    queueMicrotask(() => {
      if (active) setIsGoogleLoading(true);
    });

    void fetch(resolveApiUrl("/api/v1/auth/google/exchange"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "Accept-Language": locale },
      body: JSON.stringify({ exchange_token: googleExchangeToken }),
    })
      .then((res) => readApiResponse<AuthResponseData>(res).then((data) => ({ res, data })))
      .then(({ res, data }) => {
        if (!active) return;
        if (!res.ok) {
          setError(getApiMessage(data, "La connexion Google a expire. Veuillez recommencer."));
          return;
        }

        const token = data?.data?.access_token || data?.data?.token;
        if (!token) {
          setError(t("auth.loginTokenMissing"));
          return;
        }

        storeAuthToken(token);
        router.replace("/dashboard");
      })
      .catch(() => {
        if (active) setError(t("common.networkError"));
      })
      .finally(() => {
        if (active) setIsGoogleLoading(false);
      });

    return () => {
      active = false;
    };
  }, [googleError, googleExchangeToken, locale, router, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isRecaptchaEnabled() && !recaptchaToken) {
      setError(t("auth.recaptchaRequired"));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(resolveApiUrl("/api/v1/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", "Accept-Language": locale },
        body: JSON.stringify({ email: form.email, password: form.password, recaptcha_token: recaptchaToken }),
      });
      const data = await readApiResponse<AuthResponseData>(res);

      if (!res.ok) {
        recaptchaRef.current?.reset();
        setError(getApiMessage(data, t("auth.invalidCredentials")));
        return;
      }

      const token = data?.data?.access_token || data?.data?.token;

      if (!token) {
        setError(t("auth.loginTokenMissing"));
        return;
      }

      storeAuthToken(token);
      router.push("/dashboard");
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
        {/* Header Options */}
        <div className="mb-6 flex w-full justify-between px-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-[var(--premium-text-muted)] transition-colors hover:text-primary-500"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {t("common.backHome")}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Login Card */}
        <div className="premium-card-surface relative flex flex-col overflow-hidden rounded-2xl border border-[var(--premium-card-border)] bg-[var(--premium-panel)] px-8 py-10 backdrop-blur-xl transition-all">
          {/* Logo Section */}
          <div className="mb-8 flex flex-col items-center">
            <Link href="/" className="mb-6 block transition-transform hover:scale-105">
              <Image src="/logo-aureusprime.svg" alt="Aureus Prime Logo" width={170} height={20} className="logo-dark h-6 w-auto" />
              <Image src="/logo-aureusprime-light.svg" alt="Aureus Prime Logo" width={170} height={20} className="logo-light h-6 w-auto" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--premium-text)]">
              {googleLinkToken ? t("auth.googleLinkTitle") : t("auth.loginTitle")}
            </h1>
            <p className="mt-2 text-center text-sm text-[var(--premium-text-muted)]">
              {googleLinkToken ? t("auth.googleLinkSubtitle") : t("auth.loginSubtitle")}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {!googleLinkToken && isEmailVerifiedNoticeVisible && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              {t("auth.emailVerifiedNotice")}
            </div>
          )}

          {googleLinkToken ? (
            <GoogleAccountLinkForm linkToken={googleLinkToken} />
          ) : (
          <>
          <div className="mb-5 space-y-3">
            <GoogleAuthButton intent="login" referralCode={referralCode} disabled={isLoading || isGoogleLoading} />
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--premium-text-soft)]">
              <span className="h-px flex-1 bg-[var(--premium-card-border)]" />
              <span>{locale === "fr" ? "ou" : "or"}</span>
              <span className="h-px flex-1 bg-[var(--premium-card-border)]" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[var(--premium-text)]">{t("common.emailAddress")}</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--premium-text-soft)]">
                  <span className="material-symbols-outlined text-lg">mail</span>
                </div>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="nom@exemple.com"
                  className="w-full rounded-xl border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] py-3 pl-11 pr-4 text-sm text-[var(--premium-text)] placeholder:text-[var(--premium-text-soft)] outline-none transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 hover:border-primary-400/50"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-[var(--premium-text)]">{t("common.password")}</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-primary-500 transition-colors hover:text-primary-400">
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--premium-text-soft)]">
                  <span className="material-symbols-outlined text-lg">lock</span>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] py-3 pl-11 pr-11 text-sm text-[var(--premium-text)] placeholder:text-[var(--premium-text-soft)] outline-none transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 hover:border-primary-400/50"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--premium-text-soft)] transition-colors hover:text-primary-500 focus:outline-none">
                  <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            <RecaptchaField ref={recaptchaRef} onTokenChange={setRecaptchaToken} />

            <p className="rounded-2xl border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] px-4 py-3 text-xs leading-relaxed text-[var(--premium-text-muted)]">
              {legalNotice}{" "}
              <Link href="/conditions-utilisation" className="font-bold text-primary-500 hover:underline">
                CGU
              </Link>
              {", "}
              <Link href="/conditions-generales" className="font-bold text-primary-500 hover:underline">
                CGV
              </Link>
              {locale === "fr" ? " et " : " and "}
              <Link href="/confidentialite" className="font-bold text-primary-500 hover:underline">
                {locale === "fr" ? "Politique de confidentialité" : "Privacy policy"}
              </Link>
              .
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="group mt-2 relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary-500 px-4 py-3.5 text-sm font-bold text-[var(--premium-contrast)] transition-all hover:-translate-y-0.5 hover:bg-primary-400 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
              ) : (
                <span className="relative z-10 flex items-center gap-2">
                  {t("auth.loginSubmit")}
                  <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:translate-x-1">login</span>
                </span>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--premium-text-muted)]">
              {t("auth.noAccount")}{" "}
              <Link href="/register" className="font-bold text-primary-500 transition-colors hover:text-primary-400 hover:underline hover:underline-offset-4">
                {t("auth.registerLink")}
              </Link>
            </p>
          </div>
          </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

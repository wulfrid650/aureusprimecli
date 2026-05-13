"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { isRecaptchaEnabled, RecaptchaField, type RecaptchaFieldHandle } from "@/components/auth/recaptcha-field";
import { getStoredAuthToken, storeAuthToken } from "@/lib/auth-token";
import { getApiFieldErrors, getApiMessage, readApiResponse } from "@/lib/api-response";
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

export default function RegisterPage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [form, setForm] = useState(() => ({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    referral_code: "",
  }));
  const recaptchaRef = useRef<RecaptchaFieldHandle>(null);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [hasReferralLink, setHasReferralLink] = useState(false);

  useEffect(() => {
    if (getStoredAuthToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const referralCodeFromLink = params.get("referral_code")?.trim().toUpperCase() ?? "";

    queueMicrotask(() => {
      setHasReferralLink(Boolean(referralCodeFromLink));

      if (referralCodeFromLink) {
        setForm((currentForm) => ({
          ...currentForm,
          referral_code: currentForm.referral_code || referralCodeFromLink,
        }));
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (form.password !== form.password_confirmation) {
      setFieldErrors({ password_confirmation: [t("auth.passwordMismatch")] });
      return;
    }

    if (isRecaptchaEnabled() && !recaptchaToken) {
      setError(t("auth.recaptchaRequired"));
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", "Accept-Language": locale },
        body: JSON.stringify({ ...form, recaptcha_token: recaptchaToken }),
      });
      const data = await readApiResponse<AuthResponseData>(res);

      if (!res.ok) {
        recaptchaRef.current?.reset();
        const errors = getApiFieldErrors(data);

        if (errors.recaptcha_token?.[0]) {
          setError(errors.recaptcha_token[0]);
          return;
        }

        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
        } else {
          setError(getApiMessage(data, t("auth.genericError")));
        }
        return;
      }

      const token = data?.data?.access_token || data?.data?.token;

      if (!token) {
        setError(t("auth.registerTokenMissing"));
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

  const getFieldError = (field: string) => fieldErrors[field]?.[0];

  return (
    <main className="premium-page flex min-h-screen items-center justify-center p-4 selection:bg-primary-300 selection:text-[var(--premium-contrast)]">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 flex w-full justify-between px-2">
          <Link href="/accueil" className="flex items-center gap-2 text-sm font-medium text-[var(--premium-text-muted)] transition-colors hover:text-primary-500">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {t("common.backHome")}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Card */}
        <div className="premium-card-surface relative flex flex-col overflow-hidden rounded-2xl border border-[var(--premium-card-border)] bg-[var(--premium-panel)] px-8 py-10 backdrop-blur-xl transition-all">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <Link href="/accueil" className="mb-6 block transition-transform hover:scale-105">
              <Image src="/logo-aureusprime.svg" alt="Aureus Prime Logo" width={170} height={20} className="logo-dark h-6 w-auto" />
              <Image src="/logo-aureusprime-light.svg" alt="Aureus Prime Logo" width={170} height={20} className="logo-light h-6 w-auto" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--premium-text)]">{t("auth.registerTitle")}</h1>
            <p className="mt-2 text-sm text-[var(--premium-text-muted)] text-center">{t("auth.registerSubtitle")}</p>
          </div>

          {/* Global Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-[var(--premium-text)]">{t("common.fullName")}</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--premium-text-soft)]">
                  <span className="material-symbols-outlined text-lg">person</span>
                </div>
                <input id="name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Faris Kemoe"
                  className={`w-full rounded-xl border bg-[var(--premium-card-deep)] py-3 pl-11 pr-4 text-sm text-[var(--premium-text)] placeholder:text-[var(--premium-text-soft)] outline-none transition-all focus:ring-1 focus:ring-primary-500/50 ${getFieldError("name") ? "border-red-400" : "border-[var(--premium-card-border)] focus:border-primary-500 hover:border-primary-400/50"}`}
                  required />
              </div>
              {getFieldError("name") && <p className="text-xs text-red-600 font-medium">{getFieldError("name")}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-[var(--premium-text)]">{t("common.phone")}</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--premium-text-soft)]">
                  <span className="material-symbols-outlined text-lg">phone</span>
                </div>
                <input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+237 600000000"
                  className={`w-full rounded-xl border bg-[var(--premium-card-deep)] py-3 pl-11 pr-4 text-sm text-[var(--premium-text)] placeholder:text-[var(--premium-text-soft)] outline-none transition-all focus:ring-1 focus:ring-primary-500/50 ${getFieldError("phone") ? "border-red-400" : "border-[var(--premium-card-border)] focus:border-primary-500 hover:border-primary-400/50"}`}
                  required />
              </div>
              {getFieldError("phone") && <p className="text-xs text-red-600 font-medium">{getFieldError("phone")}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[var(--premium-text)]">{t("common.emailAddress")}</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--premium-text-soft)]">
                  <span className="material-symbols-outlined text-lg">mail</span>
                </div>
                <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nom@exemple.com"
                  className={`w-full rounded-xl border bg-[var(--premium-card-deep)] py-3 pl-11 pr-4 text-sm text-[var(--premium-text)] placeholder:text-[var(--premium-text-soft)] outline-none transition-all focus:ring-1 focus:ring-primary-500/50 ${getFieldError("email") ? "border-red-400" : "border-[var(--premium-card-border)] focus:border-primary-500 hover:border-primary-400/50"}`}
                  required />
              </div>
              {getFieldError("email") && <p className="text-xs text-red-600 font-medium">{getFieldError("email")}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="referral_code" className="text-sm font-medium text-[var(--premium-text)]">{t("auth.referralCode")}</label>
                {hasReferralLink && (
                  <span className="rounded-full bg-primary-500/10 px-2.5 py-1 text-[11px] font-bold text-primary-500">
                    {t("auth.referralDetected")}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--premium-text-soft)]">
                  <span className="material-symbols-outlined text-lg">confirmation_number</span>
                </div>
                <input
                  id="referral_code"
                  type="text"
                  value={form.referral_code}
                  onChange={(e) => setForm({ ...form, referral_code: e.target.value.toUpperCase() })}
                  placeholder="Ex: QCRP4RID"
                  className={`w-full rounded-xl border bg-[var(--premium-card-deep)] py-3 pl-11 pr-4 text-sm uppercase tracking-[0.18em] text-[var(--premium-text)] placeholder:text-[var(--premium-text-soft)] outline-none transition-all focus:ring-1 focus:ring-primary-500/50 ${getFieldError("referral_code") ? "border-red-400" : "border-[var(--premium-card-border)] focus:border-primary-500 hover:border-primary-400/50"}`}
                />
              </div>
              {getFieldError("referral_code") ? (
                <p className="text-xs text-red-600 font-medium">{getFieldError("referral_code")}</p>
              ) : (
                <p className="text-xs text-[var(--premium-text-soft)]">{t("auth.referralHint")}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[var(--premium-text)]">{t("common.password")}</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--premium-text-soft)]">
                  <span className="material-symbols-outlined text-lg">lock</span>
                </div>
                <input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" aria-describedby="register-password-help"
                  className={`w-full rounded-xl border bg-[var(--premium-card-deep)] py-3 pl-11 pr-11 text-sm text-[var(--premium-text)] placeholder:text-[var(--premium-text-soft)] outline-none transition-all focus:ring-1 focus:ring-primary-500/50 ${getFieldError("password") ? "border-red-400" : "border-[var(--premium-card-border)] focus:border-primary-500 hover:border-primary-400/50"}`}
                  required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--premium-text-soft)] transition-colors hover:text-primary-500 focus:outline-none">
                  <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
              {getFieldError("password") && <p className="text-xs text-red-600 font-medium">{getFieldError("password")}</p>}
              <p id="register-password-help" className="text-xs leading-relaxed text-[var(--premium-text-soft)]">{t("auth.passwordHint")}</p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="password_confirmation" className="text-sm font-medium text-[var(--premium-text)]">{t("auth.confirmPassword")}</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--premium-text-soft)]">
                  <span className="material-symbols-outlined text-lg">lock_clock</span>
                </div>
                <input id="password_confirmation" type={showPassword ? "text" : "password"} value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} placeholder="••••••••"
                  className={`w-full rounded-xl border bg-[var(--premium-card-deep)] py-3 pl-11 pr-4 text-sm text-[var(--premium-text)] placeholder:text-[var(--premium-text-soft)] outline-none transition-all focus:ring-1 focus:ring-primary-500/50 ${getFieldError("password_confirmation") ? "border-red-400" : "border-[var(--premium-card-border)] focus:border-primary-500 hover:border-primary-400/50"}`}
                  required />
              </div>
              {getFieldError("password_confirmation") && <p className="text-xs text-red-600 font-medium">{getFieldError("password_confirmation")}</p>}
            </div>

            <RecaptchaField ref={recaptchaRef} onTokenChange={setRecaptchaToken} />

            {/* Terms */}
            <div className="flex items-start gap-2 py-1">
              <input id="terms" type="checkbox" required className="mt-1 h-4 w-4 rounded border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] text-primary-500 accent-primary-500 focus:ring-primary-500/50" />
              <label htmlFor="terms" className="select-none text-xs text-[var(--premium-text-muted)] cursor-pointer leading-relaxed">
                {t("auth.terms")}
              </label>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className="group mt-2 relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary-500 px-4 py-3.5 text-sm font-bold text-[var(--premium-contrast)] transition-all hover:-translate-y-0.5 hover:bg-primary-400 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
              ) : (
                <span className="relative z-10 flex items-center gap-2">
                  {t("auth.registerSubmit")}
                  <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
                </span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--premium-text-muted)]">
              {t("auth.alreadyAccount")}{" "}
              <Link href="/login" className="font-bold text-primary-500 transition-colors hover:text-primary-400 hover:underline hover:underline-offset-4">{t("auth.loginSubmit")}</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

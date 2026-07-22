"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isRecaptchaEnabled, RecaptchaField, type RecaptchaFieldHandle } from "@/components/auth/recaptcha-fields";
import { getApiMessage, readApiResponse } from "@/lib/api-response";
import { storeAuthToken } from "@/lib/auth-token";
import { resolveApiUrl } from "@/lib/fetch";
import { useI18n } from "@/lib/i18n";

interface LinkStatusData {
  masked_email?: string;
  expires_in?: number;
  remaining_attempts?: number;
  resend_available?: boolean;
  resend_in?: number;
}

interface LinkConfirmData {
  access_token?: string;
  token?: string;
}

type LinkMethod = "code" | "password";

export function GoogleAccountLinkForm({ linkToken }: { linkToken: string }) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const recaptchaRef = useRef<RecaptchaFieldHandle>(null);
  const [status, setStatus] = useState<LinkStatusData | null>(null);
  const [method, setMethod] = useState<LinkMethod>("code");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    void fetch(resolveApiUrl("/api/v1/auth/google/link/status"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "Accept-Language": locale },
      body: JSON.stringify({ link_token: linkToken }),
      signal: controller.signal,
    })
      .then((res) => readApiResponse<LinkStatusData>(res).then((data) => ({ res, data })))
      .then(({ res, data }) => {
        if (!res.ok || !data?.data) {
          setError(getApiMessage(data, t("auth.googleLinkExpired")));
          return;
        }

        setStatus(data.data);
        setResendIn(Math.max(0, Number(data.data.resend_in ?? 0)));
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(t("common.networkError"));
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [linkToken, locale, t]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setResendIn((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const resetCaptcha = () => {
    recaptchaRef.current?.reset();
    setRecaptchaToken("");
  };

  const handleConfirm = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (isRecaptchaEnabled() && !recaptchaToken) {
      setError(t("auth.recaptchaRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(resolveApiUrl("/api/v1/auth/google/link/confirm"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", "Accept-Language": locale },
        body: JSON.stringify({
          link_token: linkToken,
          method,
          code: method === "code" ? code : undefined,
          password: method === "password" ? password : undefined,
          recaptcha_token: recaptchaToken,
        }),
      });
      const data = await readApiResponse<LinkConfirmData>(res);

      if (!res.ok) {
        resetCaptcha();
        setError(getApiMessage(data, t("auth.googleLinkInvalid")));
        return;
      }

      const token = data?.data?.access_token || data?.data?.token;
      if (!token) {
        setError(t("auth.loginTokenMissing"));
        return;
      }

      storeAuthToken(token);
      router.replace("/dashboard");
    } catch {
      resetCaptcha();
      setError(t("common.networkError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setNotice("");
    setIsResending(true);

    try {
      const res = await fetch(resolveApiUrl("/api/v1/auth/google/link/resend"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", "Accept-Language": locale },
        body: JSON.stringify({ link_token: linkToken }),
      });
      const data = await readApiResponse<{ remaining_sends?: number }>(res);

      if (!res.ok) {
        setError(getApiMessage(data, t("auth.googleLinkResendError")));
        return;
      }

      setNotice(t("auth.googleLinkCodeResent"));
      setResendIn(45);
      setStatus((current) => ({
        ...current,
        resend_available: Number(data?.data?.remaining_sends ?? 0) > 0,
      }));
    } catch {
      setError(t("common.networkError"));
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center text-[var(--premium-text-muted)]">
        <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-red-300/50 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-300">
          <span className="material-symbols-outlined text-xl">error</span>
          <span>{error || t("auth.googleLinkExpired")}</span>
        </div>
        <button
          type="button"
          onClick={() => router.replace("/login")}
          className="w-full rounded-xl border border-[var(--premium-card-border)] px-4 py-3 text-sm font-bold text-[var(--premium-text)] transition-colors hover:border-primary-500"
        >
          {t("auth.googleLinkRestart")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleConfirm} className="flex flex-col gap-5">
      <div className="rounded-2xl border border-primary-500/35 bg-primary-500/10 px-4 py-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined rounded-full bg-primary-500/15 p-2 text-primary-500">shield_lock</span>
          <div>
            <p className="text-sm font-bold text-[var(--premium-text)]">{t("auth.googleLinkExistingAccount")}</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--premium-text-muted)]">
              {t("auth.googleLinkExplanation", { email: status.masked_email || "***" })}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-300/50 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-300">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-300/50 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-[var(--premium-card-deep)] p-1">
        {(["code", "password"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setMethod(option);
              setError("");
            }}
            className={`rounded-lg px-3 py-2.5 text-xs font-bold transition-colors ${
              method === option
                ? "bg-[var(--premium-panel)] text-primary-500 shadow-sm"
                : "text-[var(--premium-text-muted)] hover:text-[var(--premium-text)]"
            }`}
          >
            {option === "code" ? t("auth.googleLinkUseCode") : t("auth.googleLinkUsePassword")}
          </button>
        ))}
      </div>

      {method === "code" ? (
        <div className="space-y-2">
          <label htmlFor="google-link-code" className="text-sm font-medium text-[var(--premium-text)]">
            {t("auth.googleLinkCodeLabel")}
          </label>
          <input
            id="google-link-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="w-full rounded-xl border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] px-4 py-3 text-center text-xl font-bold tracking-[0.35em] text-[var(--premium-text)] outline-none transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50"
            required
          />
          <div className="flex items-center justify-between gap-3 text-xs text-[var(--premium-text-muted)]">
            <span>{t("auth.googleLinkCodeValidity")}</span>
            {status.resend_available !== false && (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || resendIn > 0}
                className="font-bold text-primary-500 disabled:cursor-not-allowed disabled:text-[var(--premium-text-soft)]"
              >
                {isResending
                  ? t("common.loading")
                  : resendIn > 0
                    ? t("auth.googleLinkResendIn", { seconds: resendIn })
                    : t("auth.googleLinkResend")}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label htmlFor="google-link-password" className="text-sm font-medium text-[var(--premium-text)]">
            {t("auth.googleLinkPasswordLabel")}
          </label>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-lg text-[var(--premium-text-soft)]">lock</span>
            <input
              id="google-link-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] py-3 pl-11 pr-11 text-sm text-[var(--premium-text)] outline-none transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--premium-text-soft)] hover:text-primary-500"
              aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
            >
              <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <RecaptchaField ref={recaptchaRef} onTokenChange={setRecaptchaToken} />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || (method === "code" ? code.length !== 6 : password.length === 0)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-3.5 text-sm font-bold text-[var(--premium-contrast)] transition-all hover:bg-primary-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
        ) : (
          <>
            <span className="material-symbols-outlined text-lg">link</span>
            {t("auth.googleLinkConfirm")}
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => router.replace("/login")}
        className="text-center text-xs font-semibold text-[var(--premium-text-muted)] hover:text-primary-500"
      >
        {t("auth.googleLinkCancel")}
      </button>
    </form>
  );
}

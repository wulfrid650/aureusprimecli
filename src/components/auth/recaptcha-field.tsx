"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

type RecaptchaRenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
};

type Grecaptcha = {
  render: (container: HTMLElement, options: RecaptchaRenderOptions) => number;
  reset: (widgetId?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

export type RecaptchaFieldHandle = {
  reset: () => void;
};

type RecaptchaFieldProps = {
  onTokenChange: (token: string) => void;
};

const productionSiteKey = "6LciwOgsAAAAAMqLezFOK7ubvTovPMCYOUjl-RfB";
const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() || (process.env.NODE_ENV === "production" ? productionSiteKey : "");
let recaptchaScriptPromise: Promise<void> | null = null;

export function isRecaptchaEnabled(): boolean {
  return siteKey.length > 0;
}

function loadRecaptchaScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.grecaptcha) {
    return Promise.resolve();
  }

  if (recaptchaScriptPromise) {
    return recaptchaScriptPromise;
  }

  recaptchaScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[src^="https://www.google.com/recaptcha/api.js"]');

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("reCAPTCHA script failed")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("reCAPTCHA script failed"));
    document.head.appendChild(script);
  });

  return recaptchaScriptPromise;
}

export const RecaptchaField = forwardRef<RecaptchaFieldHandle, RecaptchaFieldProps>(function RecaptchaField(
  { onTokenChange },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useImperativeHandle(ref, () => ({
    reset() {
      onTokenChange("");
      if (window.grecaptcha && widgetIdRef.current !== null) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
    },
  }));

  useEffect(() => {
    if (!siteKey || !containerRef.current || widgetIdRef.current !== null) {
      return;
    }

    let mounted = true;

    loadRecaptchaScript()
      .then(() => {
        if (!mounted || !containerRef.current || !window.grecaptcha) {
          return;
        }

        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => onTokenChange(token),
          "expired-callback": () => onTokenChange(""),
          "error-callback": () => onTokenChange(""),
        });
      })
      .catch(() => {
        if (mounted) {
          setIsUnavailable(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [onTokenChange]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="min-h-[78px]" />
      {isUnavailable && (
        <p className="text-xs font-medium text-red-600">
          Impossible de charger reCAPTCHA. Vérifiez votre connexion puis réessayez.
        </p>
      )}
    </div>
  );
});

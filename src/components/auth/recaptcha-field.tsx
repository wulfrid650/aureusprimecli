import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
  }
}

type RecaptchaRenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
};

type RecaptchaApi = {
  render?: (container: HTMLElement, options: RecaptchaRenderOptions) => number;
  reset?: (widgetId?: number) => void;
  ready?: (callback: () => void) => void;
  execute?: (...args: unknown[]) => unknown;
  enterprise?: RecaptchaApi;
};

export type RecaptchaFieldHandle = {
  reset: () => void;
};

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() || "";
let recaptchaScriptPromise: Promise<void> | null = null;

export function isRecaptchaEnabled(): boolean {
  return SITE_KEY.length > 0;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function loadRecaptchaScript(): Promise<void> {
  if (window.grecaptcha) {
    return Promise.resolve();
  }

  if (recaptchaScriptPromise) {
    return recaptchaScriptPromise;
  }

  recaptchaScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src^="https://www.google.com/recaptcha/api.js"]');

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("reCAPTCHA script failed")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("reCAPTCHA script failed"));
    document.head.appendChild(script);
  }).catch((error) => {
    recaptchaScriptPromise = null;
    throw error;
  });

  return recaptchaScriptPromise;
}

export const RecaptchaField = forwardRef<RecaptchaFieldHandle, { onTokenChange: (token: string) => void }>(
  function RecaptchaField({ onTokenChange }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<number | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      reset() {
        onTokenChange("");
        try {
          if (window.grecaptcha && widgetIdRef.current !== null) {
            window.grecaptcha.reset?.(widgetIdRef.current);
          }
        } catch {
          // The widget may already be gone during route changes.
        }
      },
    }));

    useEffect(() => {
      if (!SITE_KEY || !containerRef.current || widgetIdRef.current !== null) return;

      let mounted = true;

      loadRecaptchaScript()
        .then(() => {
          if (!mounted || !containerRef.current || !window.grecaptcha) return;
          const tryRender = () => {
            try {
              const grecaptcha = window.grecaptcha;
              const renderOptions = {
                sitekey: SITE_KEY,
                callback: (token: string) => onTokenChange(token),
                "expired-callback": () => onTokenChange(""),
                "error-callback": () => onTokenChange(""),
              };

              if (grecaptcha && typeof grecaptcha.render === "function" && containerRef.current) {
                widgetIdRef.current = grecaptcha.render(containerRef.current, renderOptions);
                return;
              }

              // If grecaptcha.ready exists but render is not a function, it may be a v3 key
              if (grecaptcha && typeof grecaptcha.ready === "function") {
                if (typeof grecaptcha.render !== "function" && typeof grecaptcha.execute === "function") {
                  const msg = "La clé reCAPTCHA semble être pour reCAPTCHA v3 (grecaptcha.execute présent) — le composant attend une clé v2 (case à cocher). Vérifiez NEXT_PUBLIC_RECAPTCHA_SITE_KEY en production.";
                  console.error(msg);
                  setLoadErrorMessage(msg);
                  setLoadError(true);
                  return;
                }
                grecaptcha.ready(() => {
                  try {
                    if (typeof grecaptcha.render === "function" && containerRef.current) {
                      widgetIdRef.current = grecaptcha.render(containerRef.current, renderOptions);
                      return;
                    }
                    // enterprise fallback
                    if (grecaptcha.enterprise && typeof grecaptcha.enterprise.render === "function" && containerRef.current) {
                      widgetIdRef.current = grecaptcha.enterprise.render(containerRef.current, renderOptions);
                      return;
                    }
                    throw new Error("grecaptcha.render not available after ready()");
                  } catch (error) {
                    console.error("reCAPTCHA render error inside ready:", error);
                    setLoadErrorMessage(getErrorMessage(error));
                    setLoadError(true);
                  }
                });
                return;
              }

              // enterprise direct fallback
              if (grecaptcha && grecaptcha.enterprise && typeof grecaptcha.enterprise.render === "function" && containerRef.current) {
                widgetIdRef.current = grecaptcha.enterprise.render(containerRef.current, renderOptions);
                return;
              }

              throw new Error("grecaptcha.render is not a function");
            } catch (error) {
              console.error("reCAPTCHA render error:", error);
              setLoadErrorMessage(getErrorMessage(error));
              setLoadError(true);
            }
          };

          tryRender();
        })
        .catch((error: unknown) => {
          console.error("reCAPTCHA script load failed:", error);
          setLoadErrorMessage(getErrorMessage(error));
          setLoadError(true);
        });

      return () => {
        mounted = false;
      };
    }, [onTokenChange]);

    if (!SITE_KEY) return null;

    return (
      <div className="space-y-2">
        <div className="recaptcha-shell" aria-label="reCAPTCHA">
          <div ref={containerRef} className="recaptcha-frame min-h-[78px]" />
        </div>
        {loadError && (
          <div className="text-center">
            <p className="text-xs font-medium text-red-600">Impossible de charger reCAPTCHA. Vérifiez votre connexion puis réessayez.</p>
            {loadErrorMessage && (
              <p className="text-xs text-red-500">Détails: {loadErrorMessage}</p>
            )}
            <p className="text-xs text-[var(--premium-text-muted)]">Vérifiez la console réseau et les bloqueurs de publicité.</p>
          </div>
        )}
      </div>
    );
  }
);

export default RecaptchaField;

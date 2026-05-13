import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

declare global {
  interface Window {
    grecaptcha?: any;
  }
}

export type RecaptchaFieldHandle = {
  reset: () => void;
};

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() || "";

export function isRecaptchaEnabled(): boolean {
  return SITE_KEY.length > 0;
}

export const RecaptchaField = forwardRef<RecaptchaFieldHandle, { onTokenChange: (token: string) => void }>(
  function RecaptchaField({ onTokenChange }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<number | null>(null);
    const [loadError, setLoadError] = useState(false);

    useImperativeHandle(ref, () => ({
      reset() {
        onTokenChange("");
        try {
          if (window.grecaptcha && widgetIdRef.current !== null) {
            window.grecaptcha.reset(widgetIdRef.current);
          }
        } catch (e) {
          // noop
        }
      },
    }));

    useEffect(() => {
      if (!SITE_KEY || !containerRef.current || widgetIdRef.current !== null) return;

      let mounted = true;

      const loadScript = () => {
        const existing = document.querySelector('script[src^="https://www.google.com/recaptcha/api.js"]');
        if (existing) {
          if ((window as any).grecaptcha) return Promise.resolve();
          return new Promise<void>((resolve, reject) => {
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => reject(new Error("reCAPTCHA script failed")), { once: true });
          });
        }

        return new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
          script.async = true;
          script.defer = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("reCAPTCHA script failed"));
          document.head.appendChild(script);
        });
      };

      loadScript()
        .then(() => {
          if (!mounted || !containerRef.current || !window.grecaptcha) return;
          try {
            widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
              sitekey: SITE_KEY,
              callback: (token: string) => onTokenChange(token),
              "expired-callback": () => onTokenChange(""),
              "error-callback": () => onTokenChange(""),
            });
          } catch (e) {
            setLoadError(true);
          }
        })
        .catch(() => {
          setLoadError(true);
        });

      return () => {
        mounted = false;
      };
    }, [onTokenChange]);

    if (!SITE_KEY) return null;

    return (
      <div className="space-y-2">
        <div ref={containerRef} className="min-h-[78px]" />
        {loadError && (
          <p className="text-xs font-medium text-red-600">Impossible de charger reCAPTCHA. Vérifiez votre connexion puis réessayez.</p>
        )}
      </div>
    );
  }
);

export default RecaptchaField;

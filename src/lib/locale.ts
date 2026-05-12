export type AppLocale = "fr" | "en";

export const LOCALE_COOKIE_NAME = "ap_locale";
export const LEGACY_LOCALE_STORAGE_KEY = "ap_locale";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return value === "fr" || value === "en";
}

export function normalizeLocale(value: string | null | undefined): AppLocale {
  const normalizedValue = value?.trim().toLowerCase() ?? "";

  if (normalizedValue.startsWith("en")) {
    return "en";
  }

  return "fr";
}

export function getBrowserLocale(): AppLocale {
  if (typeof navigator === "undefined") {
    return "fr";
  }

  const browserLocale = navigator.languages?.[0] ?? navigator.language;
  return normalizeLocale(browserLocale);
}

export function getLocaleFromCookieString(cookieString: string | null | undefined): AppLocale | null {
  if (!cookieString) {
    return null;
  }

  const cookies = cookieString.split(";").map((cookie) => cookie.trim());
  const localeCookie = cookies.find((cookie) => cookie.startsWith(`${LOCALE_COOKIE_NAME}=`));
  const value = localeCookie ? decodeURIComponent(localeCookie.split("=").slice(1).join("=")) : null;

  return isAppLocale(value) ? value : null;
}

export function getClientCookieLocale(): AppLocale | null {
  if (typeof document === "undefined") {
    return null;
  }

  return getLocaleFromCookieString(document.cookie);
}

export function getLegacyStoredLocale(): AppLocale | null {
  if (typeof window === "undefined") {
    return null;
  }

  const locale = window.localStorage.getItem(LEGACY_LOCALE_STORAGE_KEY);
  return isAppLocale(locale) ? locale : null;
}

export function getClientLocale(): AppLocale | null {
  return getClientCookieLocale() ?? getLegacyStoredLocale();
}

export function resolveClientLocale(): AppLocale {
  return getClientLocale() ?? getBrowserLocale();
}

export function writeLocaleCookie(locale: AppLocale) {
  if (typeof document === "undefined") {
    return;
  }

  const secureAttribute = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secureAttribute}`;
}

export function persistClientLocale(locale: AppLocale) {
  writeLocaleCookie(locale);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(LEGACY_LOCALE_STORAGE_KEY, locale);
  }
}

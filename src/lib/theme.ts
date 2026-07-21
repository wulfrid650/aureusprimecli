export type AppTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "ap_theme";
const THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function isAppTheme(value: unknown): value is AppTheme {
  return value === "light" || value === "dark";
}

export function applyTheme(theme: AppTheme) {
  document.documentElement.dataset.theme = theme;
}

export function getCurrentTheme(): AppTheme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function getStoredTheme(): AppTheme | null {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isAppTheme(storedTheme)) {
      return storedTheme;
    }

    const cookieMatch = document.cookie.match(new RegExp(`(?:^|; )${THEME_STORAGE_KEY}=([^;]*)`));
    const cookieTheme = cookieMatch ? decodeURIComponent(cookieMatch[1]) : "";
    return isAppTheme(cookieTheme) ? cookieTheme : null;
  } catch {
    return null;
  }
}

export function persistTheme(theme: AppTheme) {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.cookie = `${THEME_STORAGE_KEY}=${theme}; path=/; max-age=${THEME_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function restoreStoredTheme() {
  const theme = getStoredTheme();
  if (!theme) {
    return null;
  }

  applyTheme(theme);
  persistTheme(theme);
  return theme;
}

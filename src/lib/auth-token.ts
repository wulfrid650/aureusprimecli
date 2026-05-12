const PRIMARY_TOKEN_KEY = "ap_token";
const LEGACY_TOKEN_KEY = "auth_token";

export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(PRIMARY_TOKEN_KEY) || window.localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function storeAuthToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PRIMARY_TOKEN_KEY, token);
  window.localStorage.setItem(LEGACY_TOKEN_KEY, token);
}

export function clearStoredAuthToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PRIMARY_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_TOKEN_KEY);
}

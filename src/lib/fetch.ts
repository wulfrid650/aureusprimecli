import { clearStoredAuthToken, getStoredAuthToken } from "@/lib/auth-token";
import { getClientLocale, getBrowserLocale } from "@/lib/locale";

function isFormDataBody(body: BodyInit | null | undefined): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function getStoredLocale(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return getClientLocale() ?? getBrowserLocale();
}

function buildApiHeaders(options?: RequestInit, token?: string | null): Headers {
  const headers = new Headers(options?.headers);
  const locale = getStoredLocale();

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (locale && !headers.has("Accept-Language")) {
    headers.set("Accept-Language", locale);
  }

  if (options?.body && !isFormDataBody(options.body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const token = getStoredAuthToken();
  const res = await fetch(url, {
    ...options,
    headers: buildApiHeaders(options, token),
  });

  if (res.status === 401 && typeof window !== "undefined") {
    clearStoredAuthToken();
    window.location.href = "/login";
  }

  return res;
}

/**
 * Safe fetch helper: parses JSON only if the response has content.
 * Throws on non-ok responses with a meaningful message.
 */
export async function safeFetch<T = unknown>(url: string, options?: RequestInit): Promise<T | null> {
  const res = await apiFetch(url, options);

  // Try to parse JSON only if there's content
  const text = await res.text();
  if (!text || text.trim() === "") return null;

  let data: T;
  try {
    data = JSON.parse(text) as T;
  } catch {
    console.error(`[safeFetch] Invalid JSON from ${url}:`, text.slice(0, 200));
    return null;
  }

  if (!res.ok) {
    console.error(`[safeFetch] HTTP ${res.status} from ${url}`);
    return null;
  }

  return data;
}

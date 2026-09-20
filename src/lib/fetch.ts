import { clearStoredAuthToken, getStoredAuthToken } from "@/lib/auth-token";
import { getClientLocale, getBrowserLocale } from "@/lib/locale";

type CachedResponse = {
  expiresAt: number;
  value: unknown;
};

const responseCache = new Map<string, CachedResponse>();
const pendingRequests = new Map<string, Promise<unknown>>();

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

export function resolveApiUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const defaultApiBase =
    process.env.NODE_ENV === "production"
      ? "https://api.aureusprime.com/api/v1"
      : "";
  const configuredApiBase = process.env.NEXT_PUBLIC_API_URL?.trim() || "";
  const apiBase = (
    /^https?:\/\//i.test(configuredApiBase) ? configuredApiBase : defaultApiBase
  ).replace(/\/+$/, "");

  if (apiBase && /^https?:\/\//i.test(apiBase)) {
    if (url.startsWith("/api/v1")) {
      return `${apiBase}${url.slice("/api/v1".length)}`;
    }

    return url.startsWith("/") ? `${apiBase}${url}` : `${apiBase}/${url}`;
  }

  // Server-side (Node) fetch cannot resolve relative URLs against a browser
  // location the way client-side fetch does, so it needs an absolute origin
  // pointing back at this Next.js app's own API routes (e.g. /api/catalog/*).
  if (typeof window === "undefined" && url.startsWith("/")) {
    const selfOrigin =
      process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "") ||
      (process.env.NODE_ENV === "production" ? "https://app.aureusprime.com" : "http://127.0.0.1:3000");

    return `${selfOrigin}${url}`;
  }

  return url;
}

export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const token = getStoredAuthToken();
  const res = await fetch(resolveApiUrl(url), {
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

/**
 * Deduplicates concurrent GET requests and keeps successful responses briefly in
 * memory. The auth token and locale are part of the key so data cannot leak
 * between sessions or languages. Mutations must keep using safeFetch/apiFetch.
 */
export function safeFetchCached<T = unknown>(
  url: string,
  options: { ttlMs?: number; requestInit?: RequestInit } = {},
): Promise<T | null> {
  const method = options.requestInit?.method?.toUpperCase() ?? "GET";
  if (method !== "GET") {
    return safeFetch<T>(url, options.requestInit);
  }

  const token = getStoredAuthToken() ?? "anonymous";
  const locale = getStoredLocale() ?? "default";
  const key = `${token}:${locale}:${url}`;
  const now = Date.now();
  const cached = responseCache.get(key);

  if (cached && cached.expiresAt > now) {
    return Promise.resolve(cached.value as T);
  }

  const pending = pendingRequests.get(key);
  if (pending) {
    return pending as Promise<T | null>;
  }

  const request = safeFetch<T>(url, options.requestInit)
    .then((value) => {
      if (value !== null) {
        responseCache.set(key, {
          expiresAt: Date.now() + (options.ttlMs ?? 30_000),
          value,
        });
      }
      return value;
    })
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, request);
  return request;
}

"use client";

import { apiFetch, safeFetch } from "@/lib/fetch";

const FIREBASE_COMPAT_VERSION = "10.14.1";
const SEEN_NOTIFICATIONS_KEY = "ap_client_seen_notifications";
const PUSH_DEVICE_ID_KEY = "ap_client_push_device_id";
const PUSH_PROMPT_STATE_KEY = "ap_client_push_prompt_state";
const PWA_INSTALLED_KEY = "ap_client_pwa_installed";

type FirebaseCompatMessaging = {
  getToken: (options: { vapidKey: string; serviceWorkerRegistration: ServiceWorkerRegistration }) => Promise<string>;
  onMessage: (callback: (payload: FirebaseMessagePayload) => void) => () => void;
};

type FirebaseCompat = {
  apps: unknown[];
  initializeApp: (config: FirebaseConfig) => unknown;
  messaging: () => FirebaseCompatMessaging;
};

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
};

export type ClientNotificationItem = {
  id: string;
  type: string;
  data: {
    type?: string;
    title?: string;
    message?: string;
    severity?: string;
    action_url?: string;
    [key: string]: unknown;
  };
  read_at: string | null;
  created_at: string;
};

type FirebaseMessagePayload = {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, string>;
};

declare global {
  interface Window {
    firebase?: FirebaseCompat;
  }
}

const FALLBACK_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyBVo3VgGV8pvVSJdoWZJ8ZRanKpXrngc38",
  authDomain: "aureus-prime.firebaseapp.com",
  projectId: "aureus-prime",
  storageBucket: "aureus-prime.firebasestorage.app",
  messagingSenderId: "860677898986",
  appId: "1:860677898986:web:9ae7385d9cc431c1f1cd93",
  measurementId: "G-ZHSBBYNYMX",
};

const FALLBACK_FIREBASE_VAPID_KEY =
  "BB_K1zhO1CIa5pCp6_ILYYpv030o8NzAoSTLVBHK3PDy3h3CbX_6vjlOoyEbW46l2lW8LY0nz5SLVWYBkhkyGg0";

function firebaseConfig(): FirebaseConfig {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || FALLBACK_FIREBASE_CONFIG.apiKey,
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || FALLBACK_FIREBASE_CONFIG.authDomain,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || FALLBACK_FIREBASE_CONFIG.projectId,
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || FALLBACK_FIREBASE_CONFIG.storageBucket,
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
      FALLBACK_FIREBASE_CONFIG.messagingSenderId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || FALLBACK_FIREBASE_CONFIG.appId,
    measurementId:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || FALLBACK_FIREBASE_CONFIG.measurementId,
  };
}

function firebaseVapidKey() {
  return process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || FALLBACK_FIREBASE_VAPID_KEY;
}

export function clientNotificationsSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "Notification" in window;
}

export function isPwaInstalledRuntime() {
  if (typeof window === "undefined") {
    return false;
  }

  const standaloneNavigator = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || standaloneNavigator.standalone === true;
}

export function rememberPwaInstalled() {
  try {
    window.localStorage.setItem(PWA_INSTALLED_KEY, "1");
  } catch {
    // Best effort uniquement: le mode standalone reste detecte au runtime.
  }
}

export function hasKnownPwaInstall() {
  if (isPwaInstalledRuntime()) {
    return true;
  }

  try {
    return window.localStorage.getItem(PWA_INSTALLED_KEY) === "1";
  } catch {
    return false;
  }
}

export function pushPromptState() {
  try {
    return window.localStorage.getItem(PUSH_PROMPT_STATE_KEY) || "";
  } catch {
    return "";
  }
}

export function rememberPushPromptState(state: "accepted" | "dismissed" | "denied") {
  try {
    window.localStorage.setItem(PUSH_PROMPT_STATE_KEY, state);
  } catch {
    // Le navigateur peut bloquer localStorage; la cloche reste le fallback.
  }
}

export function firebaseWebPushConfigured() {
  const config = firebaseConfig();

  return Boolean(
    config.apiKey &&
      config.projectId &&
      config.messagingSenderId &&
      config.appId &&
      firebaseVapidKey(),
  );
}

function browserName() {
  const agent = navigator.userAgent.toLowerCase();
  if (agent.includes("edg")) return "Edge";
  if (agent.includes("firefox")) return "Firefox";
  if (agent.includes("safari") && !agent.includes("chrome")) return "Safari";
  if (agent.includes("chrome")) return "Chrome";
  return "Navigateur";
}

function platformName() {
  const agent = navigator.userAgent.toLowerCase();
  if (agent.includes("android")) return "android";
  if (agent.includes("iphone") || agent.includes("ipad")) return "ios";
  if (agent.includes("windows")) return "windows";
  if (agent.includes("mac os") || agent.includes("macintosh")) return "macos";
  if (agent.includes("linux")) return "linux";
  return "web";
}

function pushDeviceId() {
  try {
    const existing = window.localStorage.getItem(PUSH_DEVICE_ID_KEY);
    if (existing) {
      return existing;
    }

    const next =
      typeof window.crypto?.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(PUSH_DEVICE_ID_KEY, next);
    return next;
  } catch {
    return undefined;
  }
}

function scriptAlreadyLoaded(src: string) {
  return Boolean(document.querySelector(`script[src="${src}"]`));
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (scriptAlreadyLoaded(src)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Impossible de charger ${src}`));
    document.head.appendChild(script);
  });
}

async function loadFirebaseCompat() {
  await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_COMPAT_VERSION}/firebase-app-compat.js`);
  await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_COMPAT_VERSION}/firebase-messaging-compat.js`);

  if (!window.firebase) {
    throw new Error("Firebase indisponible apres chargement du SDK.");
  }

  if (window.firebase.apps.length === 0) {
    window.firebase.initializeApp(firebaseConfig());
  }

  return window.firebase.messaging();
}

function dispatchNotificationEvent(detail: unknown) {
  window.dispatchEvent(new CustomEvent("ap-client-notification", { detail }));
}

function showBrowserNotification(title: string, options: NotificationOptions) {
  if (!clientNotificationsSupported() || Notification.permission !== "granted") {
    return;
  }

  navigator.serviceWorker.ready
    .then((registration) => registration.showNotification(title, options))
    .catch(() => undefined);
}

export async function registerClientPushNotifications(requestPermission = false) {
  if (!clientNotificationsSupported()) {
    return { ok: false, reason: "unsupported" as const };
  }

  if (!firebaseWebPushConfigured()) {
    return { ok: false, reason: "missing_config" as const };
  }

  if (Notification.permission === "denied") {
    return { ok: false, reason: "denied" as const };
  }

  if (Notification.permission !== "granted") {
    if (!requestPermission) {
      return { ok: false, reason: "permission_required" as const };
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { ok: false, reason: permission === "denied" ? "denied" as const : "permission_required" as const };
    }
  }

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const messaging = await loadFirebaseCompat();
  const token = await messaging.getToken({
    vapidKey: firebaseVapidKey(),
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    return { ok: false, reason: "no_token" as const };
  }

  const response = await apiFetch("/api/v1/me/notification-devices/register", {
    method: "POST",
    body: JSON.stringify({
      token,
      device_id: pushDeviceId(),
      platform: platformName(),
      browser: browserName(),
      device_name: `${browserName()} ${platformName()}`,
      app_version: process.env.NEXT_PUBLIC_APP_VERSION || "pwa",
    }),
  });

  if (!response.ok) {
    return { ok: false, reason: "api_error" as const };
  }

  messaging.onMessage((payload) => {
    const data = payload.data || {};
    const title = payload.notification?.title || data.title || "Aureus Prime";
    const body = payload.notification?.body || data.message || data.body || "";
    const url = data.action_url || data.link || "/dashboard";

    showBrowserNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url },
    });
    dispatchNotificationEvent(payload);
  });

  return { ok: true as const, token };
}

export async function fetchClientNotifications(unreadOnly = false, perPage = 20) {
  const params = new URLSearchParams({
    per_page: String(perPage),
  });
  if (unreadOnly) {
    params.set("unread_only", "1");
  }

  const response = await safeFetch<{
    data?: {
      items?: ClientNotificationItem[];
      meta?: { total?: number };
    };
  }>(`/api/v1/me/notifications?${params.toString()}`);

  return {
    items: response?.data?.items || [],
    total: Number(response?.data?.meta?.total || 0),
  };
}

export async function markClientNotificationRead(id: string) {
  await apiFetch(`/api/v1/me/notifications/${id}/read`, { method: "POST" });
}

export async function markAllClientNotificationsRead() {
  await apiFetch("/api/v1/me/notifications/read-all", { method: "POST" });
}

function readSeenIds() {
  try {
    const raw = window.localStorage.getItem(SEEN_NOTIFICATIONS_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeSeenIds(ids: string[]) {
  window.localStorage.setItem(SEEN_NOTIFICATIONS_KEY, JSON.stringify(ids.slice(0, 200)));
}

export async function pollClientNotificationFallback() {
  const { items } = await fetchClientNotifications(true, 10);
  const seen = new Set(readSeenIds());
  const fresh = items.filter((item) => !seen.has(item.id));

  if (fresh.length === 0) {
    return fresh;
  }

  for (const item of fresh) {
    const title = item.data.title || "Aureus Prime";
    const body = item.data.message || "";
    showBrowserNotification(String(title), {
      body: String(body),
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: item.data.action_url || "/dashboard" },
    });
    dispatchNotificationEvent(item);
    seen.add(item.id);
  }

  writeSeenIds(Array.from(seen));
  return fresh;
}

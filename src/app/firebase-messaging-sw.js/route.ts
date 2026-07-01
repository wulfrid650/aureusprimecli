const FIREBASE_COMPAT_VERSION = "10.14.1";

const FALLBACK_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBVo3VgGV8pvVSJdoWZJ8ZRanKpXrngc38",
  authDomain: "aureus-prime.firebaseapp.com",
  projectId: "aureus-prime",
  storageBucket: "aureus-prime.firebasestorage.app",
  messagingSenderId: "860677898986",
  appId: "1:860677898986:web:9ae7385d9cc431c1f1cd93",
  measurementId: "G-ZHSBBYNYMX",
};

function firebaseConfig() {
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

function isConfigured(config: ReturnType<typeof firebaseConfig>) {
  return Boolean(config.apiKey && config.projectId && config.messagingSenderId && config.appId);
}

export function GET() {
  const config = firebaseConfig();

  const source = isConfigured(config)
    ? `
importScripts("https://www.gstatic.com/firebasejs/${FIREBASE_COMPAT_VERSION}/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/${FIREBASE_COMPAT_VERSION}/firebase-messaging-compat.js");

firebase.initializeApp(${JSON.stringify(config)});

const messaging = firebase.messaging();

function notificationUrl(data) {
  const rawUrl = data && (data.action_url || data.link || data.url);
  if (!rawUrl) return "/dashboard";
  try {
    return new URL(rawUrl, self.location.origin).href;
  } catch (error) {
    return "/dashboard";
  }
}

messaging.onBackgroundMessage(function(payload) {
  const data = payload.data || {};
  const title = (payload.notification && payload.notification.title) || data.title || "Aureus Prime";
  const body = (payload.notification && payload.notification.body) || data.message || data.body || "";

  self.registration.showNotification(title, {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: {
      url: notificationUrl(data),
      notification_id: data.notification_id || data.id || null,
    },
  });
});

self.addEventListener("notificationclick", function(event) {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : new URL("/dashboard", self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if ("focus" in client && client.url === url) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }
      return undefined;
    })
  );
});
`
    : `
self.addEventListener("install", function() {
  self.skipWaiting();
});

console.warn("Firebase Messaging is not configured for this build.");
`;

  return new Response(source, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
      "Service-Worker-Allowed": "/",
    },
  });
}

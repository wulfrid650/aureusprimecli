"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuthToken } from "@/lib/auth-token";
import {
  clientNotificationsSupported,
  fetchClientNotifications,
  firebaseWebPushConfigured,
  markAllClientNotificationsRead,
  markClientNotificationRead,
  registerClientPushNotifications,
  type ClientNotificationItem,
} from "@/lib/client-notifications";

function notificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function notificationHref(item: ClientNotificationItem) {
  const raw = item.data.action_url;
  return typeof raw === "string" && raw.startsWith("/") ? raw : "/dashboard";
}

export function NotificationButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState(notificationPermission);
  const [items, setItems] = useState<ClientNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const isLoggedIn = typeof window !== "undefined" && Boolean(getStoredAuthToken());

  const pushState = useMemo(() => {
    if (!clientNotificationsSupported()) return "unsupported";
    if (!firebaseWebPushConfigured()) return "missing_config";
    return permission;
  }, [permission]);

  const refresh = async () => {
    if (!getStoredAuthToken()) {
      return;
    }

    const [latest, unread] = await Promise.all([
      fetchClientNotifications(false, 8),
      fetchClientNotifications(true, 1),
    ]);
    setItems(latest.items);
    setUnreadCount(unread.total);
  };

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const timeoutId = window.setTimeout(() => refresh().catch(() => undefined), 0);

    const handleNotification = () => {
      refresh().catch(() => undefined);
    };

    window.addEventListener("ap-client-notification", handleNotification);
    const intervalId = window.setInterval(() => refresh().catch(() => undefined), 60_000);

    return () => {
      window.removeEventListener("ap-client-notification", handleNotification);
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

  const enablePush = async () => {
    setIsBusy(true);
    setStatusMessage("");

    try {
      const result = await registerClientPushNotifications(true);
      setPermission(notificationPermission());
      if (result.ok) {
        setStatusMessage("Alertes activees sur cet appareil.");
      } else if (result.reason === "missing_config") {
        setStatusMessage("Configuration Firebase manquante.");
      } else if (result.reason === "denied") {
        setStatusMessage("Notifications bloquees par le navigateur.");
      } else {
        setStatusMessage("Activation impossible sur ce navigateur.");
      }
      await refresh();
    } finally {
      setIsBusy(false);
    }
  };

  const openItem = async (item: ClientNotificationItem) => {
    if (!item.read_at) {
      await markClientNotificationRead(item.id).catch(() => undefined);
      await refresh().catch(() => undefined);
    }

    router.push(notificationHref(item));
  };

  const markAll = async () => {
    setIsBusy(true);
    try {
      await markAllClientNotificationsRead();
      await refresh();
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="relative flex size-9 items-center justify-center rounded-full bg-white text-[#131118] shadow-sm ring-1 ring-black/5 transition hover:bg-[#f2f0f4]"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-[#e11d48] px-1 text-[10px] font-black leading-4 text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-[70] w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-black text-[#131118]">Notifications</p>
              <p className="text-[11px] font-semibold text-gray-500">{unreadCount} non lue(s)</p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAll}
                disabled={isBusy}
                className="rounded-full bg-[#f2f0f4] px-3 py-1 text-[11px] font-bold text-[#131118]"
              >
                Tout lu
              </button>
            )}
          </div>

          <div className="border-b border-gray-100 px-4 py-3">
            {pushState === "granted" ? (
              <div className="flex items-center gap-2 text-[12px] font-bold text-emerald-700">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Alertes actives
              </div>
            ) : (
              <button
                type="button"
                onClick={enablePush}
                disabled={isBusy || pushState === "unsupported"}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#131118] px-4 py-2 text-[12px] font-black text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isBusy ? "progress_activity" : "notification_add"}
                </span>
                Activer les alertes
              </button>
            )}
            {statusMessage && <p className="mt-2 text-[11px] font-semibold text-gray-500">{statusMessage}</p>}
            {pushState === "missing_config" && (
              <p className="mt-2 text-[11px] font-semibold text-amber-700">
                Les notifications restent visibles ici; il manque la config Firebase pour le push natif.
              </p>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <span className="material-symbols-outlined text-[34px] text-gray-300">notifications_off</span>
                <p className="mt-2 text-sm font-bold text-gray-500">Aucune notification</p>
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void openItem(item)}
                  className="flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left transition hover:bg-[#f8f7fb]"
                >
                  <span
                    className={`mt-1 size-2 shrink-0 rounded-full ${
                      item.read_at ? "bg-gray-200" : "bg-[#5b13ec]"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-black text-[#131118]">
                      {String(item.data.title || "Aureus Prime")}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-[12px] font-semibold leading-snug text-gray-500">
                      {String(item.data.message || "")}
                    </span>
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      {formatTime(item.created_at)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuthToken } from "@/lib/auth-token";
import {
  clientNotificationsSupported,
  fetchClientNotifications,
  firebaseWebPushConfigured,
  markAllClientNotificationsRead,
  markClientNotificationRead,
  rememberPushPromptState,
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
  if (typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }

  const type = String(item.data.type || item.type || "");
  const subscriptionId = item.data.subscription_id;

  if (type.startsWith("subscription_")) {
    return typeof subscriptionId === "number" || typeof subscriptionId === "string"
      ? `/dashboard/souscriptions/${subscriptionId}`
      : "/dashboard/souscriptions";
  }

  if (type === "referral_validated") {
    return "/dashboard/parrainage";
  }

  if (type.startsWith("wallet_") || type === "payment_failed") {
    return type === "wallet_topup_succeeded" ? "/dashboard/wallet" : "/dashboard/recharge";
  }

  if (type.startsWith("student_verification_") || type.startsWith("kyc_")) {
    return "/dashboard/compte";
  }

  if (type.startsWith("security_")) {
    return "/dashboard/compte";
  }

  return "/dashboard";
}

function notificationTitle(item: ClientNotificationItem) {
  const title = String(item.data.title || "").trim();
  if (title) {
    return title;
  }

  const type = String(item.data.type || item.type || "");
  const labels: Record<string, string> = {
    wallet_topup_succeeded: "Recharge effectuee",
    wallet_topup_failed: "Recharge echouee",
    payment_failed: "Paiement echoue",
    wallet_insufficient_balance: "Solde Auri insuffisant",
    subscription_pending_assignment: "Abonnement en attente",
    subscription_ready: "Abonnement pret",
    subscription_renewed: "Renouvellement effectue",
    subscription_expiry_reminder: "Expiration proche",
    subscription_expired: "Abonnement expire",
    subscription_suspended: "Abonnement suspendu",
    referral_validated: "Parrainage valide",
    student_verification_approved: "Verification etudiante approuvee",
    student_verification_rejected: "Verification etudiante refusee",
    security_password_changed: "Mot de passe modifie",
    security_new_device_login: "Nouvelle connexion",
  };

  return labels[type] || "Notification Aureus Prime";
}

function notificationMessage(item: ClientNotificationItem) {
  const data = item.data;
  const direct = String(data.message || data.body || data.content || "").trim();
  if (direct) {
    return direct;
  }

  const serviceName = String(data.service_name || "").trim();
  const type = String(data.type || item.type || "");

  if (serviceName && type.startsWith("subscription_")) {
    return `Voir le detail de votre abonnement ${serviceName}.`;
  }

  if (type === "referral_validated") {
    return "Ouvrir la page parrainage.";
  }

  return "Ouvrir le detail de cette notification.";
}

export function NotificationButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState(notificationPermission);
  const [items, setItems] = useState<ClientNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(getStoredAuthToken()));
  }, []);

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
    const handlePermissionChange = () => {
      setPermission(notificationPermission());
      refresh().catch(() => undefined);
    };

    window.addEventListener("ap-client-notification", handleNotification);
    window.addEventListener("ap-client-notification-permission-changed", handlePermissionChange);
    const intervalId = window.setInterval(() => refresh().catch(() => undefined), 60_000);

    return () => {
      window.removeEventListener("ap-client-notification", handleNotification);
      window.removeEventListener("ap-client-notification-permission-changed", handlePermissionChange);
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && containerRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

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
        rememberPushPromptState("accepted");
        setStatusMessage("Alertes activees sur cet appareil.");
      } else if (result.reason === "missing_config") {
        setStatusMessage("Configuration Firebase manquante.");
      } else if (result.reason === "denied") {
        rememberPushPromptState("denied");
        setStatusMessage("Notifications bloquees par le navigateur.");
      } else {
        rememberPushPromptState("dismissed");
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

    setIsOpen(false);
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
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="relative flex size-8 items-center justify-center rounded-full bg-white text-[#131118] shadow-sm ring-1 ring-black/5 transition hover:bg-[#f2f0f4] max-[380px]:size-7 sm:size-9"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-[18px] max-[380px]:text-[16px] sm:text-[20px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-[#e11d48] px-1 text-[10px] font-black leading-4 text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/15 px-3 pt-20 sm:absolute sm:inset-auto sm:right-0 sm:top-11 sm:block sm:bg-transparent sm:p-0"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-[360px] overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl sm:w-[340px]"
            onClick={(event) => event.stopPropagation()}
          >
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

            <div className="max-h-[58vh] overflow-y-auto sm:max-h-[360px]">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <span className="material-symbols-outlined text-[34px] text-gray-300">notifications_off</span>
                  <p className="mt-2 text-sm font-bold text-gray-500">Aucune notification</p>
                </div>
              ) : (
                items.map((item) => {
                  const href = notificationHref(item);
                  return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void openItem(item)}
                    className="group flex w-full gap-3 border-b border-gray-100 bg-white px-4 py-3 text-left transition hover:bg-[#f4f0ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#5b13ec]"
                    title={`Ouvrir ${href}`}
                  >
                    <span
                      className={`mt-1 size-2 shrink-0 rounded-full transition ${
                        item.read_at ? "bg-gray-300 group-hover:bg-gray-400" : "bg-[#5b13ec]"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-black text-[#131118] group-hover:text-[#1c0b4f]">
                        {notificationTitle(item)}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-[12px] font-semibold leading-snug text-[#5b5963] group-hover:text-[#342e44]">
                        {notificationMessage(item)}
                      </span>
                      <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-[#8a8791] group-hover:text-[#5b13ec]">
                        {formatTime(item.created_at)}
                      </span>
                    </span>
                    <span className="material-symbols-outlined mt-0.5 shrink-0 text-[18px] text-[#9b98a4] opacity-0 transition group-hover:text-[#5b13ec] group-hover:opacity-100">
                      arrow_forward
                    </span>
                  </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getStoredAuthToken } from "@/lib/auth-token";
import {
  canShowPushPrompt,
  clientNotificationsSupported,
  firebaseWebPushConfigured,
  hasKnownPwaInstall,
  isPwaInstalledRuntime,
  pollClientNotificationFallback,
  rememberPushPromptState,
  rememberPwaInstalled,
  registerClientPushNotifications,
} from "@/lib/client-notifications";

export function ClientNotificationBridge() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!getStoredAuthToken()) {
      return;
    }

    let isActive = true;
    const handleInstalled = () => {
      rememberPwaInstalled();
      if (shouldExplainPush()) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("appinstalled", handleInstalled);
    if (isPwaInstalledRuntime()) {
      rememberPwaInstalled();
    }

    if (
      clientNotificationsSupported() &&
      firebaseWebPushConfigured() &&
      Notification.permission === "granted"
    ) {
      registerClientPushNotifications(false).catch((error) => {
        console.warn("Client push registration failed", error);
      });
    }

    let timeoutId: number | null = null;
    if (shouldExplainPush()) {
      timeoutId = window.setTimeout(() => {
        if (isActive) {
          setShowPrompt(true);
        }
      }, 900);
    }

    const poll = () => {
      if (!isActive || !getStoredAuthToken()) {
        return;
      }

      pollClientNotificationFallback().catch(() => undefined);
    };

    const initialPollId = window.setTimeout(poll, 1_500);
    const intervalId = window.setInterval(poll, 60_000);

    return () => {
      isActive = false;
      window.removeEventListener("appinstalled", handleInstalled);
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      window.clearTimeout(initialPollId);
      window.clearInterval(intervalId);
    };
  }, []);

  const enablePush = async () => {
    setIsBusy(true);
    setMessage("");
    try {
      const result = await registerClientPushNotifications(true);
      if (result.ok) {
        rememberPushPromptState("accepted");
        setShowPrompt(false);
        window.dispatchEvent(new CustomEvent("ap-client-notification-permission-changed"));
        return;
      }

      if (result.reason === "denied") {
        rememberPushPromptState("denied");
        setMessage("Notifications bloquees par le navigateur. Vous pourrez les reactiver depuis les reglages.");
        return;
      }

      setMessage("Activation impossible sur ce navigateur pour le moment.");
    } finally {
      setIsBusy(false);
    }
  };

  const dismissPrompt = () => {
    rememberPushPromptState("dismissed");
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/35 px-4 pb-4 pt-12 sm:items-center sm:p-6">
      <div className="w-full max-w-[420px] rounded-[28px] bg-white p-5 shadow-2xl ring-1 ring-black/10">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined rounded-2xl bg-[#f5c400] p-3 text-[28px] text-[#131118]">
            notifications_active
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black text-[#131118]">Recevoir les alertes utiles</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-gray-600">
              Activez les notifications pour suivre vos recharges, renouvellements, assignations,
              expirations et validations etudiantes sans devoir ouvrir vos mails.
            </p>
          </div>
        </div>

        {message && <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-bold text-amber-800">{message}</p>}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={dismissPrompt}
            className="rounded-full bg-[#f2f0f4] px-4 py-3 text-sm font-black text-[#131118]"
          >
            Plus tard
          </button>
          <button
            type="button"
            onClick={enablePush}
            disabled={isBusy}
            className="rounded-full bg-[#131118] px-4 py-3 text-sm font-black text-white disabled:bg-gray-300"
          >
            {isBusy ? "Activation..." : "Activer les notifications"}
          </button>
        </div>
      </div>
    </div>
  );
}

function shouldExplainPush() {
  if (!getStoredAuthToken()) {
    return false;
  }

  if (!clientNotificationsSupported() || !firebaseWebPushConfigured()) {
    return false;
  }

  if (!hasKnownPwaInstall()) {
    return false;
  }

  if (Notification.permission === "granted") {
    return false;
  }

  return canShowPushPrompt();
}

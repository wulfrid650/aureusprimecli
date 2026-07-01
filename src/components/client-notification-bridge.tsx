"use client";

import { useEffect } from "react";
import { getStoredAuthToken } from "@/lib/auth-token";
import {
  clientNotificationsSupported,
  firebaseWebPushConfigured,
  pollClientNotificationFallback,
  registerClientPushNotifications,
} from "@/lib/client-notifications";

export function ClientNotificationBridge() {
  useEffect(() => {
    if (!getStoredAuthToken()) {
      return;
    }

    let isActive = true;
    if (
      clientNotificationsSupported() &&
      firebaseWebPushConfigured() &&
      Notification.permission === "granted"
    ) {
      registerClientPushNotifications(false).catch((error) => {
        console.warn("Client push registration failed", error);
      });
    }

    const poll = () => {
      if (!isActive || !getStoredAuthToken()) {
        return;
      }

      pollClientNotificationFallback().catch(() => undefined);
    };

    poll();
    const intervalId = window.setInterval(poll, 60_000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return null;
}

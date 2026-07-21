"use client";

import { useEffect } from "react";
import { getStoredAuthToken } from "@/lib/auth-token";
import { apiFetch } from "@/lib/fetch";
import { applyTheme, isAppTheme, persistTheme, restoreStoredTheme } from "@/lib/theme";

interface UserPayload {
  data?: {
    theme_preference?: unknown;
  };
}

export function ThemePersistenceBridge() {
  useEffect(() => {
    const applyStoredTheme = () => {
      restoreStoredTheme();
    };

    applyStoredTheme();
    window.addEventListener("pageshow", applyStoredTheme);
    document.addEventListener("visibilitychange", applyStoredTheme);

    if (getStoredAuthToken()) {
      apiFetch("/api/v1/me")
        .then(async (response) => {
          if (!response.ok) {
            return null;
          }

          return (await response.json()) as UserPayload;
        })
        .then((payload) => {
          const profileTheme = payload?.data?.theme_preference;
          if (!isAppTheme(profileTheme)) {
            return;
          }

          applyTheme(profileTheme);
          persistTheme(profileTheme);
        })
        .catch((error) => {
          console.warn("[theme] Failed to restore profile theme preference:", error);
        });
    }

    return () => {
      window.removeEventListener("pageshow", applyStoredTheme);
      document.removeEventListener("visibilitychange", applyStoredTheme);
    };
  }, []);

  return null;
}

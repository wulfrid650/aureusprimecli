"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
}

interface AuthStore {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("ap_token", token);
        }

        set({ token, user });
      },
      clearAuth: () => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("ap_token");
        }

        set({ token: null, user: null });
      },
    }),
    {
      name: "ap_auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

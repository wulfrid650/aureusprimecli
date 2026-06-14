"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuthToken } from "@/lib/auth-token";

function isStandalonePwa() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function HomeEntryRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (getStoredAuthToken()) {
      router.replace("/dashboard");
      return;
    }

    if (isStandalonePwa()) {
      router.replace("/dashboard");
    }
  }, [router]);

  return null;
}

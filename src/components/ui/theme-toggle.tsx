"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "ap_theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function getCurrentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const syncTheme = () => {
      setTheme(getCurrentTheme());
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
      aria-pressed={theme === "dark"}
      className={`inline-flex size-11 items-center justify-center rounded-full border border-[var(--premium-card-border)] bg-[var(--premium-panel)] text-[var(--premium-text)] shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-400/35 hover:text-primary-500 ${className}`}
    >
      <ThemeIcon theme={theme} className="size-[18px]" />
    </button>
  );
}

function ThemeIcon({
  className,
  theme,
}: {
  className?: string;
  theme: Theme;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
    >
      {theme === "dark" ? (
        <>
          <circle cx="12" cy="12" r="4.5" strokeWidth="1.8" />
          <path d="M12 2.8v2.4" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 18.8v2.4" strokeWidth="1.8" strokeLinecap="round" />
          <path d="m5.5 5.5 1.7 1.7" strokeWidth="1.8" strokeLinecap="round" />
          <path d="m16.8 16.8 1.7 1.7" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M2.8 12h2.4" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M18.8 12h2.4" strokeWidth="1.8" strokeLinecap="round" />
          <path d="m5.5 18.5 1.7-1.7" strokeWidth="1.8" strokeLinecap="round" />
          <path d="m16.8 7.2 1.7-1.7" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ) : (
        <path
          d="M20.2 14.1A7.8 7.8 0 1 1 9.9 3.8a6.4 6.4 0 0 0 10.3 10.3Z"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

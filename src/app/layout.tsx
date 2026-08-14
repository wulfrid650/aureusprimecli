import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClientNotificationBridge } from "@/components/client-notification-bridge";
import { CookieAuriNotice } from "@/components/cookie-auri-notice";
import { DevServiceWorkerReset } from "@/components/dev-service-worker-reset";
import { FullscreenManager } from "@/components/fullscreen-manager";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { PwaServiceWorkerRegister } from "@/components/pwa-service-worker-register";
import { ThemePersistenceBridge } from "@/components/theme-persistence-bridge";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://app.aureusprime.com").replace(/\/$/, "");

const bodyFont = localFont({
  src: [
    {
      path: "./fonts/UbuntuSans.ttf",
      weight: "100 800",
      style: "normal",
    },
  ],
  fallback: ["system-ui", "sans-serif"],
  variable: "--font-body",
  preload: false,
});

const displayFont = localFont({
  src: [
    {
      path: "./fonts/NotoSerifDisplay-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/NotoSerifDisplay-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  fallback: ["Georgia", "serif"],
  variable: "--font-display",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: "Aureus Prime",
  title: {
    default: "Aureus Prime",
    template: "%s | Aureus Prime",
  },
  description:
    "Aureus Prime centralise vos abonnements, vos paiements et votre wallet dans une interface claire, rapide et premium.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aureus Prime",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

const themeInitScript = `
  (function () {
    try {
      var storageKey = "ap_theme";
      var storedTheme = window.localStorage.getItem(storageKey);
      var cookieMatch = document.cookie.match(new RegExp("(?:^|; )" + storageKey + "=([^;]*)"));
      var cookieTheme = cookieMatch ? decodeURIComponent(cookieMatch[1]) : "";
      var systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      var theme =
        storedTheme === "light" || storedTheme === "dark"
          ? storedTheme
          : cookieTheme === "light" || cookieTheme === "dark"
            ? cookieTheme
          : systemTheme;
      document.documentElement.dataset.theme = theme;
      if (storedTheme !== theme) {
        window.localStorage.setItem(storageKey, theme);
      }
    } catch (error) {
      document.documentElement.dataset.theme = "light";
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-theme="light"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">
        <I18nProvider>
          <FullscreenManager />
          <DevServiceWorkerReset />
          <PwaServiceWorkerRegister />
          <ThemePersistenceBridge />
          <ClientNotificationBridge />
          {children}
          <PwaInstallPrompt />
          <CookieAuriNotice />
          <Analytics />
          <SpeedInsights />
        </I18nProvider>
      </body>
    </html>
  );
}

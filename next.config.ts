import type { NextConfig } from "next";
import nextPwa from "next-pwa";
import defaultRuntimeCaching from "next-pwa/cache";

const laravelApiUrl = (process.env.LARAVEL_API_URL || "http://api.aureusprime.local/api/v1").replace(/\/$/, "");
const laravelAppUrl = laravelApiUrl.replace(/\/api\/v1$/, "");

const pwaRuntimeCaching = [
  {
    urlPattern: /^https:\/\/assets\.cdn\.moneroo\.io\/icons\/.+$/i,
    handler: "CacheFirst",
    options: {
      cacheName: "payment-method-icons",
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  {
    urlPattern: /^https?:\/\/[^/]+\/storage\/.+\.(?:png|jpg|jpeg|webp|svg|ico)$/i,
    handler: "CacheFirst",
    options: {
      cacheName: "catalog-storage-icons",
      expiration: {
        maxEntries: 128,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  {
    urlPattern: /^https?:\/\/[^/]+\/(?:icons\/.+|logo-aureusprime(?:-light)?\.svg|apple-touch-icon\.png|favicon\.ico)$/i,
    handler: "CacheFirst",
    options: {
      cacheName: "app-shell-icons",
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 60 * 60 * 24 * 90,
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
];

const withPWA = nextPwa({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [...pwaRuntimeCaching, ...defaultRuntimeCaching],
});

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  allowedDevOrigins: ["192.168.1.121"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${laravelApiUrl}/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${laravelAppUrl}/storage/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "assets.cdn.moneroo.io",
      },
    ],
  },
} satisfies NextConfig;

export default withPWA(nextConfig);

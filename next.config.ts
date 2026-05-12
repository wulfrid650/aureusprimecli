import type { NextConfig } from "next";
import nextPwa from "next-pwa";

const laravelApiUrl = (process.env.LARAVEL_API_URL || "http://api.aureusprime.local/api/v1").replace(/\/$/, "");
const laravelAppUrl = laravelApiUrl.replace(/\/api\/v1$/, "");

const withPWA = nextPwa({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
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
    ],
  },
} satisfies NextConfig;

export default withPWA(nextConfig);

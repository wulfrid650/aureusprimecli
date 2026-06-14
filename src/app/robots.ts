import type { MetadataRoute } from "next";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://app.aureusprime.com").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/offres", "/catalogue", "/a-propos", "/aide", "/blog", "/contact", "/conditions-generales", "/conditions-utilisation", "/confidentialite", "/remboursement"],
        disallow: ["/dashboard", "/login", "/register", "/forgot-password", "/reset-password", "/verification-email", "/payment"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}

import type { MetadataRoute } from "next";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://app.aureusprime.com").replace(/\/$/, "");

const publicRoutes = [
  "",
  "/offres",
  "/catalogue",
  "/a-propos",
  "/aide",
  "/blog",
  "/contact",
  "/conditions-generales",
  "/conditions-utilisation",
  "/confidentialite",
  "/remboursement",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route, index) => ({
    url: `${appUrl}${route || "/"}`,
    lastModified: new Date(),
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : 0.7,
  }));
}

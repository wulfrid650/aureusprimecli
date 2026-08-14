import type { MetadataRoute } from "next";
import { fetchCatalogProducts } from "@/lib/catalog";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = publicRoutes.map((route, index) => ({
    url: `${appUrl}${route || "/"}`,
    lastModified: new Date(),
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : 0.7,
  }));

  const services = await fetchCatalogProducts(100).catch(() => []);
  const serviceEntries: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${appUrl}/catalogue/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...serviceEntries];
}

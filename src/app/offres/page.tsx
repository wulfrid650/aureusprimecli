import type { Metadata } from "next";
import { PublicOffersPage } from "@/components/marketing/public-pages";
import { fetchCatalogProducts, type CatalogProduct } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Nos offres",
  description: "Découvrez le catalogue Aureus Prime et ses abonnements digitaux premium.",
};

export default async function OffersPage() {
  let initialServices: CatalogProduct[] = [];
  let initialError = false;

  try {
    initialServices = await fetchCatalogProducts(60);
  } catch (err) {
    console.error("Failed to load public offers (SSR):", err);
    initialError = true;
  }

  return <PublicOffersPage initialServices={initialServices} initialError={initialError} />;
}

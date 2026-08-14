import type { Metadata } from "next";
import { PublicOffersPage } from "@/components/marketing/public-pages";
import { fetchCatalogProducts, type CatalogProduct } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Nos offres premium",
  description: "Tous nos services premium aux prix affichés en direct. Payez directement depuis votre wallet Auri, sans carte bancaire.",
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

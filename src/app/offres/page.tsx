import type { Metadata } from "next";
import { PublicOffersPage } from "@/components/marketing/public-pages";

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Découvrez le catalogue Aureus Prime et ses abonnements digitaux premium.",
};

export default function OffersPage() {
  return <PublicOffersPage />;
}

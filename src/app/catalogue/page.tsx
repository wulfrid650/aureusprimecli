import type { Metadata } from "next";
import { PublicOffersPage } from "@/components/marketing/public-pages";

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Catalogue public Aureus Prime : streaming, musique, cloud, IA et services digitaux sans connexion préalable.",
};

export default function CataloguePage() {
  return <PublicOffersPage />;
}

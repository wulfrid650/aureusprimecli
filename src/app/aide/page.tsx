import type { Metadata } from "next";
import { PublicContentPage } from "@/components/marketing/public-pages";

export const metadata: Metadata = {
  title: "Centre d'aide",
  description: "Aide Aureus Prime pour les commandes, le wallet Auri, les accès et le KYC étudiant.",
};

export default function HelpPage() {
  return <PublicContentPage page="help" />;
}

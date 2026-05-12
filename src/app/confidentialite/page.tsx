import type { Metadata } from "next";
import { PublicContentPage } from "@/components/marketing/public-pages";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et gestion des données sur Aureus Prime.",
};

export default function PrivacyPage() {
  return <PublicContentPage page="privacy" />;
}

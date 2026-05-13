import type { Metadata } from "next";
import { PublicLegalDocumentPage } from "@/components/marketing/legal-doc-pages";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et gestion des données sur Aureus Prime.",
};

export default function PrivacyPage() {
  return <PublicLegalDocumentPage page="privacy" />;
}

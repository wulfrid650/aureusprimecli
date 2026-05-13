import type { Metadata } from "next";
import { PublicLegalDocumentPage } from "@/components/marketing/legal-doc-pages";

export const metadata: Metadata = {
  title: "Conditions générales",
  description: "Conditions générales d'utilisation de la plateforme Aureus Prime.",
};

export default function TermsPage() {
  return <PublicLegalDocumentPage page="terms" />;
}

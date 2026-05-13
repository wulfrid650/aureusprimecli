import type { Metadata } from "next";
import { PublicLegalDocumentPage } from "@/components/marketing/legal-doc-pages";

export const metadata: Metadata = {
  title: "Politique de remboursement",
  description: "Conditions de remboursement des commandes et abonnements Aureus Prime.",
};

export default function RefundPage() {
  return <PublicLegalDocumentPage page="refund" />;
}

import type { Metadata } from "next";
import { PublicContentPage } from "@/components/marketing/public-pages";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contacter Aureus Prime pour une commande, un abonnement, un wallet ou un KYC.",
};

export default function ContactPage() {
  return <PublicContentPage page="contact" />;
}

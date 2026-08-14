import type { Metadata } from "next";
import { PublicContactPage } from "@/components/marketing/public-pages";

export const metadata: Metadata = {
  title: "Contacter Aureus Prime",
  description: "Commande, accès, recharge ou KYC — contactez le support Aureus Prime par WhatsApp ou email.",
};

export default function ContactPage() {
  return <PublicContactPage />;
}

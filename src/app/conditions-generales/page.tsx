import type { Metadata } from "next";
import { PublicContentPage } from "@/components/marketing/public-pages";

export const metadata: Metadata = {
  title: "Conditions générales",
  description: "Conditions générales d'utilisation de la plateforme Aureus Prime.",
};

export default function TermsPage() {
  return <PublicContentPage page="terms" />;
}

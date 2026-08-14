import type { Metadata } from "next";
import { PublicContentPage } from "@/components/marketing/public-pages";

export const metadata: Metadata = {
  title: "L'accès premium sans les contraintes",
  description: "Aureus Prime réunit catalogue, wallet et suivi des accès dans un seul espace, sans carte bancaire.",
};

export default function AboutPage() {
  return <PublicContentPage page="about" />;
}

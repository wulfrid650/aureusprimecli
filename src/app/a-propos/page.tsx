import type { Metadata } from "next";
import { PublicContentPage } from "@/components/marketing/public-pages";

export const metadata: Metadata = {
  title: "À propos",
  description: "Découvrez Aureus Prime, la plateforme de services digitaux premium accessibles.",
};

export default function AboutPage() {
  return <PublicContentPage page="about" />;
}

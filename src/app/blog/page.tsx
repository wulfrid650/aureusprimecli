import type { Metadata } from "next";
import { PublicBlogPage } from "@/components/marketing/public-pages";

export const metadata: Metadata = {
  title: "Guides Aureus Prime",
  description: "Choisir la bonne offre, utiliser votre wallet, suivre vos accès — guides courts Aureus Prime.",
};

export default function BlogPage() {
  return <PublicBlogPage />;
}

import type { Metadata } from "next";
import { PublicBlogPage } from "@/components/marketing/public-pages";

export const metadata: Metadata = {
  title: "Blog",
  description: "Guides Aureus Prime pour choisir vos offres, gérer votre wallet et suivre vos accès.",
};

export default function BlogPage() {
  return <PublicBlogPage />;
}

import type { Metadata } from "next";
import { PublicContentPage } from "@/components/marketing/public-pages";

export const metadata: Metadata = {
  title: "Centre d'aide",
  description: "Tout savoir pour acheter, suivre une commande, gérer votre wallet Auri et retrouver vos accès.",
};

export default function HelpPage() {
  return <PublicContentPage page="help" />;
}

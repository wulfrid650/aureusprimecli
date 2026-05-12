import type { Metadata } from "next";
import { MarketingHomePage } from "@/components/marketing/home-page";

export const metadata: Metadata = {
  title: "Aureus Prime - Le Premium Accessible à Tous",
  description:
    "Accédez à Netflix, Spotify, Canva et à vos outils marketing préférés à une fraction du prix depuis une interface premium.",
};

export default function MarketingLandingPage() {
  return <MarketingHomePage />;
}

import type { Metadata } from "next";
import { MarketingHomePage } from "@/components/marketing/home-page";
import { HomeEntryRedirect } from "@/components/marketing/home-entry-redirect";

export const metadata: Metadata = {
  title: "Aureus Prime - Le Premium Accessible à Tous",
  description:
    "Accédez à Netflix, Spotify, Canva et à vos outils marketing préférés à une fraction du prix depuis une interface premium.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AppHomePage() {
  return (
    <>
      <HomeEntryRedirect />
      <MarketingHomePage />
    </>
  );
}

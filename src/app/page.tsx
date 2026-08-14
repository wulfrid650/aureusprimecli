import type { Metadata } from "next";
import { MarketingHomePage } from "@/components/marketing/home-page";
import { HomeEntryRedirect } from "@/components/marketing/home-entry-redirect";

export const metadata: Metadata = {
  title: "Aureus Prime — Netflix, Spotify, Canva payés en Mobile Money",
  description:
    "Rechargez votre wallet en Mobile Money et payez Netflix, Spotify, Canva et plus de 30 services premium. Sans carte bancaire, sans engagement.",
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

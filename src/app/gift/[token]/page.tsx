import type { Metadata } from "next";
import { GiftPurchaseClient } from "./gift-purchase-client";

type GiftPageParams = { token: string };

// This page only makes sense reached through an opaque token scanned from a
// QR code shared in person — it must never be indexed or discoverable via
// site navigation (see robots.ts, which also disallows /gift).
export const metadata: Metadata = {
  title: "Offrir des Auri",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function GiftPage({ params }: { params: Promise<GiftPageParams> }) {
  const { token } = await params;
  return <GiftPurchaseClient token={token} />;
}

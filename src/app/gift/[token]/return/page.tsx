import type { Metadata } from "next";
import { GiftReturnClient } from "./gift-return-client";

type GiftReturnParams = { token: string };

// Same non-indexable rule as /gift/[token]: only reachable after a payment
// redirect, never through navigation or search.
export const metadata: Metadata = {
  title: "Paiement du cadeau Auri",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function GiftReturnPage({ params }: { params: Promise<GiftReturnParams> }) {
  const { token } = await params;
  return <GiftReturnClient token={token} />;
}

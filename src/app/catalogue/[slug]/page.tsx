import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicServicePage } from "@/components/marketing/public-pages";
import { fetchCatalogProduct } from "@/lib/catalog";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://app.aureusprime.com").replace(/\/$/, "");

type ServicePageParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<ServicePageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await fetchCatalogProduct(slug).catch(() => null);

  if (!service) {
    return { title: "Service introuvable" };
  }

  const title = `${service.title} — prix et formules`;
  const description =
    service.shortDescription ||
    `Découvrez ${service.title} sur Aureus Prime : prix, formules et paiement via wallet Auri (Mobile Money).`;
  const canonicalUrl = `${appUrl}/catalogue/${service.slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<ServicePageParams>;
}) {
  const { slug } = await params;
  const service = await fetchCatalogProduct(slug).catch(() => null);

  if (!service) {
    notFound();
  }

  const canonicalUrl = `${appUrl}/catalogue/${service.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: service.title,
    description: service.shortDescription || service.description,
    category: service.category,
    url: canonicalUrl,
    offers: {
      "@type": "Offer",
      price: service.currentPrice,
      priceCurrency: "XAF",
      availability: "https://schema.org/InStock",
      url: canonicalUrl,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicServicePage service={service} />
    </>
  );
}

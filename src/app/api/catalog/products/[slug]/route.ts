import { proxyCatalogRequest } from "@/lib/server/catalog-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const { searchParams } = new URL(request.url);

  return proxyCatalogRequest(`/products/${encodeURIComponent(slug)}`, searchParams, request.headers);
}

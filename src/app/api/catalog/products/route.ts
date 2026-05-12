import { proxyCatalogRequest } from "@/lib/server/catalog-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return proxyCatalogRequest("/products", searchParams, request.headers);
}

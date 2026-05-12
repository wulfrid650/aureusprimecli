import { getLocaleFromCookieString, normalizeLocale } from "@/lib/locale";

const laravelApiUrl = (process.env.LARAVEL_API_URL || "http://api.aureusprime.local/api/v1").replace(/\/$/, "");

function buildCatalogUrl(pathname: string, searchParams?: URLSearchParams): string {
  const url = new URL(`${laravelApiUrl}${pathname}`);

  if (searchParams) {
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}

function resolveForwardedLocale(headers?: Headers, searchParams?: URLSearchParams): string {
  const queryLocale = searchParams?.get("locale");

  if (queryLocale) {
    return normalizeLocale(queryLocale);
  }

  const cookieLocale = getLocaleFromCookieString(headers?.get("cookie"));

  if (cookieLocale) {
    return cookieLocale;
  }

  const headerLocale = headers?.get("accept-language")?.split(",")[0]?.trim().toLowerCase();

  return normalizeLocale(headerLocale);
}

function proxyMessage(locale: string, key: "unavailable" | "invalid"): string {
  if (locale === "en") {
    return key === "unavailable"
      ? "The catalog is unavailable right now."
      : "The catalog response is invalid.";
  }

  return key === "unavailable"
    ? "Le catalogue est indisponible pour le moment."
    : "La réponse catalogue est invalide.";
}

function parseJsonBody(body: string): unknown | null {
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    return null;
  }

  try {
    return JSON.parse(trimmedBody) as unknown;
  } catch {
    return null;
  }
}

export async function proxyCatalogRequest(
  pathname: string,
  searchParams?: URLSearchParams,
  requestHeaders?: Headers,
): Promise<Response> {
  const locale = resolveForwardedLocale(requestHeaders, searchParams);

  try {
    const upstream = await fetch(buildCatalogUrl(pathname, searchParams), {
      headers: {
        Accept: "application/json",
        "Accept-Language": locale,
      },
      cache: "no-store",
    });

    const body = await upstream.text();
    const payload = parseJsonBody(body);

    if (!upstream.ok) {
      if (payload !== null) {
        return Response.json(payload, {
          status: upstream.status,
          headers: {
            "cache-control": "no-store",
          },
        });
      }

      console.error("[catalog-proxy] Invalid upstream error payload:", body.slice(0, 200));

      return Response.json(
        {
          status: "error",
          message: proxyMessage(locale, "unavailable"),
          upstreamStatus: upstream.status,
        },
        {
          status: upstream.status,
          headers: {
            "cache-control": "no-store",
          },
        },
      );
    }

    if (payload === null) {
      console.error("[catalog-proxy] Invalid upstream success payload:", body.slice(0, 200));

      return Response.json(
        {
          status: "error",
          message: proxyMessage(locale, "invalid"),
        },
        {
          status: 502,
          headers: {
            "cache-control": "no-store",
          },
        },
      );
    }

    return Response.json(payload, {
      status: upstream.status,
      headers: {
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    console.error("[catalog-proxy] Upstream request failed:", error);

    return Response.json(
      {
        status: "error",
        message: proxyMessage(locale, "unavailable"),
      },
      {
        status: 502,
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  }
}

const laravelApiUrl= (process.env.LARAVEL_API_URL || "HTTP:API.AUREUSPRIME.LOCAL/api/v1").replace(/\/$/, "")

function buildCatalogUrl(pathname: string, searchParams?: URLSearchParams): string {
  const url = new URL(`${laravelApiUrl}${pathname}`);

  if (searchParams) {
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}
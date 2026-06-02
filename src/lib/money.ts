export function formatAuriAmount(amount?: number | null, locale = "fr-FR"): string {
  const safeAmount = Number.isFinite(amount) ? Number(amount) : 0;
  const formatterLocale = locale.toLowerCase().startsWith("en") ? "en-US" : "fr-FR";

  return `${new Intl.NumberFormat(formatterLocale)
    .format(Math.round(safeAmount))
    .replace(/\u202f/g, " ")} Auri`;
}

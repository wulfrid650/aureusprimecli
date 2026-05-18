import { safeFetch } from "@/lib/fetch";
import { resolveClientLocale } from "@/lib/locale";

type ApiEnvelope<T> = {
  data?: T;
  message?: string;
  status?: string;
};

type ApiPaginationMeta = {
  current_page?: number;
  last_page?: number;
  total?: number;
  per_page?: number;
};

type PaginatedApiEnvelope<T> = ApiEnvelope<T> & {
  meta?: ApiPaginationMeta;
};

type CatalogOptionKind = "product" | "variant" | "product_variation";

export type CatalogVariantApi = {
  id: number;
  name?: string | null;
  image_url?: string | null;
  price?: number | null;
  price_formatted?: string | null;
  sale_price?: number | null;
  duration_days?: number | null;
  billing_cycle?: string | null;
  is_featured?: boolean;
  sort_order?: number | null;
  is_student_offer?: boolean;
  kyc_required_type?: string | null;
  checkout_payload?: {
    product_id?: number;
    variant_id?: number;
    variation_id?: number;
    offer_type?: string;
  };
};

export type CatalogPurchaseOptionApi = {
  kind?: string | null;
  id: number;
  label?: string | null;
  price?: number | null;
  display_price?: number | null;
  display_price_formatted?: string | null;
  sale_price?: number | null;
  duration_days?: number | null;
  billing_cycle?: string | null;
  active?: boolean;
  is_featured?: boolean;
  is_student_offer?: boolean;
  kyc_required_type?: string | null;
  checkout_payload?: {
    product_id?: number;
    variant_id?: number;
    variation_id?: number;
    offer_type?: string;
  };
};

export type CatalogProductApi = {
  id: number;
  name?: string | null;
  slug: string;
  type?: string | null;
  is_gift_card?: boolean;
  gift_card_type?: string | null;
  category?: {
    id?: number | null;
    name?: string | null;
  } | null;
  description?: string | null;
  short_description?: string | null;
  image_url?: string | null;
  price?: number | null;
  sale_price?: number | null;
  billing_cycle?: string | null;
  is_student_offer?: boolean;
  kyc_required_type?: string | null;
  display_price?: {
    amount?: number | null;
    formatted?: string | null;
    original_amount?: number | null;
    original_formatted?: string | null;
  } | null;
  display_variant?: {
    kind?: string | null;
    id?: number | null;
    label?: string | null;
    is_featured?: boolean;
    is_student_offer?: boolean;
    checkout_payload?: {
      product_id?: number;
      variant_id?: number;
      variation_id?: number;
      offer_type?: string;
    };
  } | null;
  display_badge?: {
    type?: string | null;
    label?: string | null;
  } | null;
  display_kyc?: {
    required?: boolean;
    type?: string | null;
    label?: string | null;
  } | null;
  purchase_mode?: string | null;
  purchase_options?: CatalogPurchaseOptionApi[] | null;
  variants?: CatalogVariantApi[] | null;
};

export type CatalogOption = {
  id: string;
  apiId?: number;
  kind: CatalogOptionKind;
  name: string;
  price: number;
  priceFormatted: string;
  originalPrice: number | null;
  originalPriceFormatted: string | null;
  billingCycle: string | null;
  billingCycleLabel: string;
  billingSummary: string;
  durationDays: number | null;
  isFeatured: boolean;
  isStudentOffer: boolean;
  kycRequiredType: string | null;
  requiresKyc: boolean;
  imageSrc: string;
  checkoutPayload: {
    productId?: number;
    variantId?: number;
    variationId?: number;
    offerType?: string;
  };
};

export type CatalogProduct = {
  id: string;
  slug: string;
  productId: number;
  type: string;
  isGiftCard: boolean;
  giftCardType: string | null;
  isStudentOffer: boolean;
  kycRequiredType: string | null;
  hasStudentOffer: boolean;
  requiresKyc: boolean;
  title: string;
  category: string;
  description: string;
  shortDescription: string;
  imageSrc: string;
  imageAlt: string;
  purchaseMode: string;
  optionCount: number;
  options: CatalogOption[];
  defaultOption: CatalogOption | null;
  currentPrice: number;
  currentPriceFormatted: string;
  originalPrice: number | null;
  originalPriceFormatted: string | null;
  priceHint: string;
  billingSummary: string;
  priceContextLabel: string;
  studentOfferLabel: string | null;
  kycRequiredLabel: string | null;
  badgeLabel: string;
  badgeClassName: string;
};

export type CatalogProductsPage = {
  products: CatalogProduct[];
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  hasMore: boolean;
};

const fallbackImage = "/logo-aureusprime.svg";

type CatalogLocale = "fr" | "en";

function getCatalogLocale(): CatalogLocale {
  if (typeof window === "undefined") {
    return "fr";
  }

  return resolveClientLocale();
}

function getCatalogPlural(locale: CatalogLocale, count: number): string {
  return locale === "fr" ? (Math.abs(count) > 1 ? "s" : "") : Math.abs(count) === 1 ? "" : "s";
}

const catalogCopy = {
  fr: {
    standard: "Standard",
    premiumService: "Service premium",
    catalog: "Catalogue",
    directAccess: "Accès premium disponible directement depuis votre espace Aureus Prime.",
    instantActivation: "Activez votre service en quelques instants depuis votre wallet.",
    imageAlt: "Illustration du service {title}",
    from: "À partir de",
    price: "Prix",
    giftCode: "Code cadeau",
    studentOffer: "Offre étudiant",
    studentPrice: "Prix étudiant",
    kycRequired: "KYC requis",
    kycPriceContext: "KYC requis · {summary}",
    formulas: "{count} formule{plural}",
    days: "{count} jour{plural}",
    available: "Disponible",
    accessDays: "Accès {count} jours",
    oneTimePayment: "Paiement unique",
    cycle: "Cycle {cycle}",
    cycles: {
      daily: "quotidien",
      weekly: "hebdomadaire",
      monthly: "mensuel",
      yearly: "annuel",
      one_time: "achat unique",
      flexible: "flexible",
    },
    requestFailed: "La requête catalogue a échoué.",
    invalidResponse: "La réponse catalogue est invalide.",
  },
  en: {
    standard: "Standard",
    premiumService: "Premium service",
    catalog: "Catalog",
    directAccess: "Premium access available directly from your Aureus Prime space.",
    instantActivation: "Activate your service in a few moments from your wallet.",
    imageAlt: "{title} service illustration",
    from: "From",
    price: "Price",
    giftCode: "Gift code",
    studentOffer: "Student offer",
    studentPrice: "Student price",
    kycRequired: "KYC required",
    kycPriceContext: "KYC required · {summary}",
    formulas: "{count} plan{plural}",
    days: "{count} day{plural}",
    available: "Available",
    accessDays: "{count}-day access",
    oneTimePayment: "One-time payment",
    cycle: "{cycle} cycle",
    cycles: {
      daily: "daily",
      weekly: "weekly",
      monthly: "monthly",
      yearly: "yearly",
      one_time: "one-time purchase",
      flexible: "flexible",
    },
    requestFailed: "The catalog request failed.",
    invalidResponse: "The catalog response is invalid.",
  },
} as const;

const categoryTranslations: Record<CatalogLocale, Record<string, string>> = {
  fr: {},
  en: {
    autre: "Other",
    "carte cadeau": "Gift card",
    "carte cadeaux": "Gift cards",
    cloud: "Cloud",
    education: "Education",
    jeux: "Games",
    logiciel: "Software",
    musique: "Music",
    "non classe": "Uncategorized",
    securite: "Security",
    streaming: "Streaming",
    vpn: "VPN",
    ia: "AI",
  },
};

const productDescriptionTranslations: Record<CatalogLocale, Record<string, string>> = {
  fr: {},
  en: {
    netflix: "Enjoy the streaming giant's catalog at a reduced price.",
    "prime-video": "The American platform offers plenty of original series. What are you waiting for?",
    canva: "1 month of premium Canva subscription.",
    "youtube-music": "Listen to your music with YouTube Music.",
    "proton-vpn": "Use Proton VPN and stay protected online.",
    package: "Bundle includes: NETFLIX + Spotify.",
    test: "This is a test.",
    "iptv-sport": "Your app to never miss your sports matches.\n\nNB <strong>Only available on Android devices and on PC through an .apk runner such as Bluestacks, LDPlayer, ...</strong>",
    photoroom: "Your product presentation images will never look the same again.",
    "robux-100": "Top up your Roblox account with Robux.",
    snapchat: "Enjoy all Snapchat+ benefits.",
    icloud: "Get cloud storage for your files.",
    "apple-music": "Enjoy the full Apple Music service.",
    "capcut-pro": "All Capcut Pro benefits at a reduced price.\n\nNB: This is not a modded app. You will share the account with 3 other users because it is not possible to have a personal workspace like with Canva, for example.",
    "microsoft-365-1-to-cloud-pack-office": "Get the most popular productivity apps for your office with up to 1 TB of cloud storage.",
    "kapersky-antivirus-1-an": "Protect your devices with an authentic Kapersky license.",
    "1-password": "Keep your passwords secure and avoid account breaches.",
    "google-one": "Increase the storage provided by Google.",
    "psn-10e": "Top up your PSN account with 10€.",
    "xbox-10e": "Top up your Xbox One account with 10€.",
    duolingo: "Learn with Duolingo.",
    "filmora-wondershare": "Video and photo editing subscription. Boost your creativity with the pro version.",
    viki: "Your K-dramas and 100% Asian series.",
    disney: "One profile available. The offer does not include a VPN for countries that are not eligible.\n\nOffer subject to conditions.",
    "cyberghost-vpn": "A VPN to increase your online security.",
  },
};

const frenchCopyPattern = /[éèêëàâùûîïôç]|\b(acc[eè]s|b[eé]n[eé]ficiez|votre|vos|avec|pour|offre|abonnement|souscription|recharger|s[eé]cur|disponible|compte|apprendre|prot[eé]ger|r[eé]duit|jamais|matchs|utilisateurs)\b/i;

function copy(locale: CatalogLocale, key: keyof typeof catalogCopy.fr): string {
  const value = catalogCopy[locale][key];
  return typeof value === "string" ? value : "";
}

function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => String(values[key] ?? match));
}

function normalizeTranslationKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function localizeCatalogCategory(category: string, locale: CatalogLocale): string {
  if (locale !== "en") {
    return category;
  }

  return categoryTranslations.en[normalizeTranslationKey(category)] ?? category;
}

function localizeCatalogDescription(
  product: CatalogProductApi,
  field: "description" | "short_description",
  locale: CatalogLocale,
): string {
  const rawValue = product[field]?.trim() ?? "";

  if (locale !== "en") {
    return rawValue;
  }

  const translatedDescription = productDescriptionTranslations.en[product.slug];

  if (translatedDescription && (!rawValue || frenchCopyPattern.test(rawValue))) {
    return translatedDescription;
  }

  if (rawValue && frenchCopyPattern.test(rawValue)) {
    return "";
  }

  return rawValue;
}

const accentMap: Record<string, string> = {
  Streaming: "bg-red-600",
  Logiciel: "bg-sky-600",
  Software: "bg-sky-600",
  Musique: "bg-emerald-600",
  Music: "bg-emerald-600",
  Productivite: "bg-blue-600",
  Productivité: "bg-blue-600",
  Education: "bg-amber-500",
  Jeux: "bg-fuchsia-600",
  Games: "bg-fuchsia-600",
  IA: "bg-violet-600",
  AI: "bg-violet-600",
  VPN: "bg-cyan-600",
  Securite: "bg-cyan-600",
  Sécurité: "bg-cyan-600",
  Security: "bg-cyan-600",
  Cloud: "bg-blue-600",
  "Carte cadeaux": "bg-amber-500",
  "Gift cards": "bg-amber-500",
};

const accentFallbacks = [
  "bg-[#5b13ec]",
  "bg-[#0f766e]",
  "bg-[#b45309]",
  "bg-[#1d4ed8]",
  "bg-[#be123c]",
];

function hashString(value: string): number {
  return Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function normalizeLegacyLabel(value?: string | null): string {
  if (!value) return "";

  const trimmed = value.replace(/\s+/g, " ").trim();
  const parts = trimmed.split(" ");

  if (parts.length >= 2 && parts.every((part) => /^[A-Za-z0-9]$/.test(part))) {
    return parts.join("");
  }

  return trimmed;
}

export function formatXaf(amount?: number | null, locale: CatalogLocale = getCatalogLocale()): string {
  const safeAmount = Number.isFinite(amount) ? Number(amount) : 0;
  return `${new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR").format(Math.round(safeAmount)).replace(/\u202f/g, " ")} Auri`;
}

function formatBillingCycleLabel(billingCycle?: string | null, locale: CatalogLocale = getCatalogLocale()): string {
  const cycles = catalogCopy[locale].cycles;

  switch (billingCycle) {
    case "daily":
      return cycles.daily;
    case "weekly":
      return cycles.weekly;
    case "monthly":
      return cycles.monthly;
    case "yearly":
      return cycles.yearly;
    case "one_time":
      return cycles.one_time;
    default:
      return cycles.flexible;
  }
}

function formatBillingSummary(
  durationDays?: number | null,
  billingCycle?: string | null,
  locale: CatalogLocale = getCatalogLocale(),
): string {
  if (durationDays && durationDays > 0) {
    return interpolate(copy(locale, "accessDays"), { count: durationDays });
  }

  const cycleLabel = formatBillingCycleLabel(billingCycle, locale);
  return billingCycle === "one_time"
    ? copy(locale, "oneTimePayment")
    : interpolate(copy(locale, "cycle"), { cycle: cycleLabel });
}

export function resolveCatalogImage(imageUrl?: string | null): string {
  if (!imageUrl) return fallbackImage;

  if (/^\/storage\/https?:\/\//.test(imageUrl)) {
    return imageUrl.replace(/^\/storage\//, "");
  }

  if (/^https?:\/\//.test(imageUrl)) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return imageUrl;
  }

  return `/${imageUrl}`;
}

function buildCatalogListQuery(perPage: number, page = 1, locale: CatalogLocale = getCatalogLocale()): string {
  const searchParams = new URLSearchParams({
    locale,
    per_page: String(perPage),
  });

  if (page > 1) {
    searchParams.set("page", String(page));
  }

  return searchParams.toString();
}

async function cachedCatalogFetch<T>(url: string): Promise<ApiEnvelope<T> | null> {
  return safeFetch<ApiEnvelope<T>>(url, { cache: "no-store" });
}

function resolveBadgeClassName(category: string): string {
  if (accentMap[category]) {
    return accentMap[category];
  }

  const fallbackIndex = hashString(category || "default") % accentFallbacks.length;
  return accentFallbacks[fallbackIndex];
}

function pickOriginalPrice(price?: number | null, salePrice?: number | null): number | null {
  const normalizedPrice = Number.isFinite(price) ? Number(price) : null;
  const normalizedSalePrice = Number.isFinite(salePrice) ? Number(salePrice) : null;

  if (
    normalizedPrice !== null &&
    normalizedSalePrice !== null &&
    normalizedSalePrice < normalizedPrice
  ) {
    return normalizedPrice;
  }

  return null;
}

function isGiftCatalogProduct(product: CatalogProductApi): boolean {
  if (product.is_gift_card) {
    return true;
  }

  return product.type?.trim().toLowerCase() === "gift";
}

function normalizeKycRequiredType(value?: string | null): string | null {
  const normalized = value?.trim().toLowerCase() ?? "";
  return normalized || null;
}

function isStudentFlagged(
  source?: { is_student_offer?: boolean; kyc_required_type?: string | null } | null,
): boolean {
  return Boolean(source?.is_student_offer) || normalizeKycRequiredType(source?.kyc_required_type) === "student";
}

function normalizeCatalogOptionKind(kind?: string | null): CatalogOptionKind {
  const normalized = kind?.trim().toLowerCase();

  if (normalized === "product_variation" || normalized === "variation") {
    return "product_variation";
  }

  if (normalized === "product") {
    return "product";
  }

  return "variant";
}

function optionMatchesDisplayVariant(option: CatalogOption, product: CatalogProductApi): boolean {
  const displayVariant = product.display_variant;

  if (!displayVariant) {
    return false;
  }

  const displayKind = displayVariant.kind?.trim() ?? "";
  const displayId = displayVariant.id;
  const payload = displayVariant.checkout_payload;
  const displayOfferType = payload?.offer_type?.trim();
  const optionOfferType = option.checkoutPayload.offerType?.trim();
  const offerMatches = !displayOfferType || optionOfferType === displayOfferType;

  if (payload?.variant_id && option.checkoutPayload.variantId === payload.variant_id && offerMatches) {
    return true;
  }

  if (payload?.variation_id && option.checkoutPayload.variationId === payload.variation_id && offerMatches) {
    return true;
  }

  if (payload?.product_id && option.checkoutPayload.productId === payload.product_id && offerMatches) {
    return true;
  }

  if (!displayId) {
    return false;
  }

  if (displayKind === "variant" && option.checkoutPayload.variantId === displayId && offerMatches) {
    return true;
  }

  if (displayKind === "product_variation" && option.checkoutPayload.variationId === displayId && offerMatches) {
    return true;
  }

  return displayKind === "product" && option.checkoutPayload.productId === displayId && offerMatches;
}

function buildCatalogOptions(product: CatalogProductApi, locale: CatalogLocale): CatalogOption[] {
  const variants = product.variants ?? [];
  const variantMap = new Map(variants.map((variant) => [variant.id, variant]));
  const purchaseOptions = product.purchase_options?.filter((option) => option.active !== false) ?? [];
  const isGiftCard = isGiftCatalogProduct(product);
  const fallbackBillingCycle = isGiftCard ? (product.billing_cycle ?? "one_time") : (product.billing_cycle ?? null);
  const productIsStudentOffer = isStudentFlagged(product);

  const mappedOptions = purchaseOptions.map((option) => {
    const kind = normalizeCatalogOptionKind(option.kind);
    const variant = variantMap.get(option.id);
    const price = Number(option.display_price ?? option.sale_price ?? option.price ?? variant?.sale_price ?? variant?.price ?? 0);
    const originalPrice = pickOriginalPrice(option.price ?? variant?.price ?? null, option.sale_price ?? variant?.sale_price ?? null);
    const billingCycle = isGiftCard
      ? fallbackBillingCycle
      : (option.billing_cycle ?? variant?.billing_cycle ?? fallbackBillingCycle);
    const durationDays = isGiftCard ? null : (option.duration_days ?? variant?.duration_days ?? null);
    const hasExplicitOfferType = Boolean(option.checkout_payload?.offer_type);
    const isStudentOffer =
      isStudentFlagged(option) ||
      isStudentFlagged(variant) ||
      (!hasExplicitOfferType && productIsStudentOffer);
    const kycRequiredType =
      normalizeKycRequiredType(option.kyc_required_type) ??
      normalizeKycRequiredType(variant?.kyc_required_type) ??
      (!hasExplicitOfferType ? normalizeKycRequiredType(product.kyc_required_type) : null);

    return {
      id: `${kind}-${option.id}`,
      apiId: option.id,
      kind,
      name: normalizeLegacyLabel(option.label ?? variant?.name) || copy(locale, "standard"),
      price,
      priceFormatted: option.display_price_formatted ?? formatXaf(price, locale),
      originalPrice,
      originalPriceFormatted: originalPrice ? formatXaf(originalPrice, locale) : null,
      billingCycle,
      billingCycleLabel: formatBillingCycleLabel(billingCycle, locale),
      billingSummary: formatBillingSummary(durationDays, billingCycle, locale),
      durationDays,
      isFeatured: Boolean(option.is_featured),
      isStudentOffer,
      kycRequiredType,
      requiresKyc: isStudentOffer || kycRequiredType === "student",
      imageSrc: resolveCatalogImage(variant?.image_url ?? product.image_url),
      checkoutPayload: {
        productId: option.checkout_payload?.product_id,
        variantId: option.checkout_payload?.variant_id,
        variationId: option.checkout_payload?.variation_id,
        offerType: option.checkout_payload?.offer_type,
      },
    } satisfies CatalogOption;
  });

  if (mappedOptions.length > 0) {
    return mappedOptions;
  }

  if (variants.length > 0) {
    return variants.map((variant) => {
      const price = Number(variant.sale_price ?? variant.price ?? 0);
      const originalPrice = pickOriginalPrice(variant.price ?? null, variant.sale_price ?? null);
      const billingCycle = isGiftCard
        ? fallbackBillingCycle
        : (variant.billing_cycle ?? fallbackBillingCycle);
      const durationDays = isGiftCard ? null : (variant.duration_days ?? null);
      const isStudentOffer = productIsStudentOffer || isStudentFlagged(variant);
      const kycRequiredType =
        normalizeKycRequiredType(variant.kyc_required_type) ??
        normalizeKycRequiredType(product.kyc_required_type);

      return {
        id: `variant-${variant.id}`,
        apiId: variant.id,
        kind: "variant",
        name: normalizeLegacyLabel(variant.name) || copy(locale, "standard"),
        price,
        priceFormatted: formatXaf(price, locale),
        originalPrice,
        originalPriceFormatted: originalPrice ? formatXaf(originalPrice, locale) : null,
        billingCycle,
        billingCycleLabel: formatBillingCycleLabel(billingCycle, locale),
        billingSummary: formatBillingSummary(durationDays, billingCycle, locale),
        durationDays,
        isFeatured: Boolean(variant.is_featured),
        isStudentOffer,
        kycRequiredType,
        requiresKyc: isStudentOffer || kycRequiredType === "student",
        imageSrc: resolveCatalogImage(variant.image_url ?? product.image_url),
        checkoutPayload: {
          productId: variant.checkout_payload?.product_id,
          variantId: variant.checkout_payload?.variant_id ?? variant.id,
          variationId: variant.checkout_payload?.variation_id,
          offerType: variant.checkout_payload?.offer_type,
        },
      } satisfies CatalogOption;
    });
  }

  const productPrice = Number(product.sale_price ?? product.price ?? 0);
  const productOriginalPrice = pickOriginalPrice(product.price ?? null, product.sale_price ?? null);
  const productKycRequiredType = normalizeKycRequiredType(product.kyc_required_type);

  return [
    {
      id: `product-${product.id}`,
      apiId: product.id,
      kind: "product",
      name: copy(locale, "standard"),
      price: productPrice,
      priceFormatted: formatXaf(productPrice, locale),
      originalPrice: productOriginalPrice,
      originalPriceFormatted: productOriginalPrice ? formatXaf(productOriginalPrice, locale) : null,
      billingCycle: fallbackBillingCycle,
      billingCycleLabel: formatBillingCycleLabel(fallbackBillingCycle, locale),
      billingSummary: formatBillingSummary(null, fallbackBillingCycle, locale),
      durationDays: null,
      isFeatured: true,
      isStudentOffer: productIsStudentOffer,
      kycRequiredType: productKycRequiredType,
      requiresKyc: productIsStudentOffer || productKycRequiredType === "student",
      imageSrc: resolveCatalogImage(product.image_url),
      checkoutPayload: {
        productId: product.id,
      },
    },
  ];
}

export function normalizeCatalogProduct(product: CatalogProductApi, locale: CatalogLocale = getCatalogLocale()): CatalogProduct {
  const title = normalizeLegacyLabel(product.name) || copy(locale, "premiumService");
  const category = localizeCatalogCategory(normalizeLegacyLabel(product.category?.name), locale) || copy(locale, "catalog");
  const description = localizeCatalogDescription(product, "description", locale) || copy(locale, "directAccess");
  const shortDescription =
    localizeCatalogDescription(product, "short_description", locale) ||
    description ||
    copy(locale, "instantActivation");
  const isGiftCard = isGiftCatalogProduct(product);
  const options = buildCatalogOptions(product, locale);
  const displayOption = options.find((option) => optionMatchesDisplayVariant(option, product));
  const featuredOption = options.find((option) => option.isFeatured);
  const defaultOption = displayOption ?? featuredOption ?? options[0] ?? null;
  const backendDisplayPrice = product.display_price;
  const currentPrice = Number(backendDisplayPrice?.amount ?? defaultOption?.price ?? product.sale_price ?? product.price ?? 0);
  const currentPriceFormatted = backendDisplayPrice?.formatted ?? defaultOption?.priceFormatted ?? formatXaf(currentPrice, locale);
  const originalPrice = backendDisplayPrice?.original_amount ?? defaultOption?.originalPrice ?? null;
  const originalPriceFormatted = backendDisplayPrice?.original_formatted ?? defaultOption?.originalPriceFormatted ?? null;
  const optionCount = options.length;
  const productKycRequiredType = normalizeKycRequiredType(product.kyc_required_type);
  const productIsStudentOffer = isStudentFlagged(product);
  const backendKycRequired = Boolean(product.display_kyc?.required);
  const hasStudentOffer =
    productIsStudentOffer ||
    backendKycRequired ||
    options.some((option) => option.isStudentOffer || option.requiresKyc);
  const requiresKyc = backendKycRequired || (defaultOption?.requiresKyc ?? productIsStudentOffer);
  const defaultBillingSummary = defaultOption?.billingSummary ?? formatBillingSummary(null, product.billing_cycle, locale);
  const studentOfferLabel = hasStudentOffer ? (product.display_badge?.label ?? copy(locale, "studentOffer")) : null;
  const kycRequiredLabel = hasStudentOffer ? (product.display_kyc?.label ?? copy(locale, "kycRequired")) : null;
  const priceContextLabel = requiresKyc
    ? interpolate(copy(locale, "kycPriceContext"), { summary: defaultBillingSummary })
    : defaultBillingSummary;

  return {
    id: product.slug,
    slug: product.slug,
    productId: product.id,
    type: product.type?.trim().toLowerCase() || "product",
    isGiftCard,
    giftCardType: product.gift_card_type?.trim() || (isGiftCard ? "external" : null),
    isStudentOffer: productIsStudentOffer,
    kycRequiredType: productKycRequiredType,
    hasStudentOffer,
    requiresKyc,
    title,
    category,
    description,
    shortDescription,
    imageSrc: defaultOption?.imageSrc ?? resolveCatalogImage(product.image_url),
    imageAlt: interpolate(copy(locale, "imageAlt"), { title }),
    purchaseMode: product.purchase_mode ?? "product",
    optionCount,
    options,
    defaultOption,
    currentPrice,
    currentPriceFormatted,
    originalPrice,
    originalPriceFormatted,
    priceHint: requiresKyc ? copy(locale, "studentPrice") : optionCount > 1 ? copy(locale, "from") : copy(locale, "price"),
    billingSummary: defaultBillingSummary,
    priceContextLabel,
    studentOfferLabel,
    kycRequiredLabel,
    badgeLabel:
      product.display_badge?.label ??
      (hasStudentOffer
        ? copy(locale, "studentOffer")
        : isGiftCard
        ? copy(locale, "giftCode")
        : optionCount > 1
        ? interpolate(copy(locale, "formulas"), {
            count: optionCount,
            plural: getCatalogPlural(locale, optionCount),
          })
        : defaultOption?.durationDays
          ? interpolate(copy(locale, "days"), {
              count: defaultOption.durationDays,
              plural: getCatalogPlural(locale, defaultOption.durationDays),
            })
          : defaultOption?.billingCycleLabel ?? copy(locale, "available")),
    badgeClassName: hasStudentOffer ? "bg-emerald-600" : resolveBadgeClassName(category),
  };
}

async function fetchCatalogEnvelope<T>(
  primaryUrl: string,
  fallbackUrl?: string,
): Promise<ApiEnvelope<T> | null> {
  const primaryPayload = await cachedCatalogFetch<T>(primaryUrl);

  if (primaryPayload) {
    return primaryPayload;
  }

  if (!fallbackUrl) {
    return null;
  }

  console.warn(`[catalog] Primary source unavailable, retrying via ${fallbackUrl}`);
  return cachedCatalogFetch<T>(fallbackUrl);
}

export async function fetchCatalogProducts(perPage = 100): Promise<CatalogProduct[]> {
  const locale = getCatalogLocale();
  const query = buildCatalogListQuery(perPage, 1, locale);
  const payload = await fetchCatalogEnvelope<CatalogProductApi[]>(
    `/api/catalog/products?${query}`,
    `/api/v1/products?${query}`,
  );

  if (!payload) {
    throw new Error(copy(locale, "requestFailed"));
  }

  if (!Array.isArray(payload.data)) {
    throw new Error(copy(locale, "invalidResponse"));
  }

  return payload.data.map((product) => normalizeCatalogProduct(product, locale));
}

export async function fetchCatalogProductsPage(page = 1, perPage = 12): Promise<CatalogProductsPage> {
  const locale = getCatalogLocale();
  const query = buildCatalogListQuery(perPage, page, locale);
  const payload = await fetchCatalogEnvelope<CatalogProductApi[]>(
    `/api/catalog/products?${query}`,
    `/api/v1/products?${query}`,
  ) as PaginatedApiEnvelope<CatalogProductApi[]> | null;

  if (!payload) {
    throw new Error(copy(locale, "requestFailed"));
  }

  if (!Array.isArray(payload.data)) {
    throw new Error(copy(locale, "invalidResponse"));
  }

  const currentPage = Number(payload.meta?.current_page ?? page);
  const lastPage = Number(payload.meta?.last_page ?? currentPage);
  const total = Number(payload.meta?.total ?? payload.data.length);
  const resolvedPerPage = Number(payload.meta?.per_page ?? perPage);

  return {
    products: payload.data.map((product) => normalizeCatalogProduct(product, locale)),
    currentPage,
    lastPage,
    total,
    perPage: resolvedPerPage,
    hasMore: currentPage < lastPage,
  };
}

export async function fetchCatalogProduct(slug: string): Promise<CatalogProduct | null> {
  const locale = getCatalogLocale();
  const encodedSlug = encodeURIComponent(slug);
  const query = new URLSearchParams({ locale }).toString();
  const payload = await fetchCatalogEnvelope<CatalogProductApi>(
    `/api/catalog/products/${encodedSlug}?${query}`,
    `/api/v1/products/${encodedSlug}?${query}`,
  );
  return payload?.data ? normalizeCatalogProduct(payload.data, locale) : null;
}

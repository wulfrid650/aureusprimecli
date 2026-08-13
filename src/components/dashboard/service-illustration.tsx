import type { CatalogProduct } from "@/lib/catalog";

type ServiceIllustrationProps = {
  service: Pick<
    CatalogProduct,
    "title" | "category" | "currentPriceFormatted" | "priceHint" | "billingSummary" | "optionCount"
  > & {
    badgeLabel?: string;
  };
  variant?: "card" | "hero" | "thumb";
  className?: string;
};

type MockupTheme = {
  gradient: string;
  icon: string;
  chip: string;
};

type VisualPattern = "halo" | "wave" | "orbs" | "fluid" | "beam" | "grid";

const platformThemes: Array<{ match: RegExp; theme: MockupTheme }> = [
  {
    match: /netflix/i,
    theme: {
      gradient: "from-[#080607] via-[#7a0712] to-[#e50914]",
      icon: "movie",
      chip: "Streaming",
    },
  },
  {
    match: /spotify/i,
    theme: {
      gradient: "from-[#06150c] via-[#137333] to-[#1ed760]",
      icon: "music_note",
      chip: "Audio",
    },
  },
  {
    match: /apple\s*music/i,
    theme: {
      gradient: "from-[#2b0714] via-[#d91d5c] to-[#ff8aa8]",
      icon: "music_note",
      chip: "Music",
    },
  },
  {
    match: /apple\s*tv/i,
    theme: {
      gradient: "from-[#020203] via-[#15151a] to-[#7b7f8c]",
      icon: "live_tv",
      chip: "Streaming",
    },
  },
  {
    match: /\bhbo\b|hbo\s*max/i,
    theme: {
      gradient: "from-[#050509] via-[#12101c] to-[#4b26d9]",
      icon: "movie",
      chip: "Premium",
    },
  },
  {
    match: /prime\s*video|amazon/i,
    theme: {
      gradient: "from-[#03121f] via-[#0066c9] to-[#00a8e1]",
      icon: "live_tv",
      chip: "Prime",
    },
  },
  {
    match: /disney/i,
    theme: {
      gradient: "from-[#05091f] via-[#113ccf] to-[#6fb8ff]",
      icon: "auto_awesome",
      chip: "Streaming",
    },
  },
  {
    match: /crunchyroll/i,
    theme: {
      gradient: "from-[#1d0b02] via-[#c55300] to-[#ff8a00]",
      icon: "animated_images",
      chip: "Anime",
    },
  },
  {
    match: /youtube/i,
    theme: {
      gradient: "from-[#150203] via-[#b00000] to-[#ff0033]",
      icon: "smart_display",
      chip: "Video",
    },
  },
  {
    match: /canva/i,
    theme: {
      gradient: "from-[#091a4f] via-[#6d2cff] to-[#25d6d6]",
      icon: "design_services",
      chip: "Design",
    },
  },
  {
    match: /photoroom/i,
    theme: {
      gradient: "from-[#111827] via-[#5b21b6] to-[#f4f0ff]",
      icon: "photo_camera",
      chip: "Studio",
    },
  },
  {
    match: /capcut/i,
    theme: {
      gradient: "from-[#06080c] via-[#1a2433] to-[#d8f2ff]",
      icon: "movie_edit",
      chip: "Edition",
    },
  },
  {
    match: /adobe|photoshop/i,
    theme: {
      gradient: "from-[#140006] via-[#b00022] to-[#ff4f64]",
      icon: "brush",
      chip: "Creative",
    },
  },
  {
    match: /lightroom/i,
    theme: {
      gradient: "from-[#061021] via-[#0b5cab] to-[#31a8ff]",
      icon: "photo_filter",
      chip: "Photo",
    },
  },
  {
    match: /filmora|wondershare/i,
    theme: {
      gradient: "from-[#061f24] via-[#008f99] to-[#7fffd4]",
      icon: "movie_edit",
      chip: "Video",
    },
  },
  {
    match: /office|microsoft|365/i,
    theme: {
      gradient: "from-[#071633] via-[#1f6feb] to-[#f25022]",
      icon: "grid_view",
      chip: "Office",
    },
  },
  {
    match: /icloud/i,
    theme: {
      gradient: "from-[#0a1b36] via-[#1478d4] to-[#d8f2ff]",
      icon: "cloud",
      chip: "Cloud",
    },
  },
  {
    match: /google\s*one/i,
    theme: {
      gradient: "from-[#07162d] via-[#1a73e8] to-[#34a853]",
      icon: "cloud",
      chip: "Cloud",
    },
  },
  {
    match: /google\s*ai|gemini/i,
    theme: {
      gradient: "from-[#07162d] via-[#4285f4] to-[#a8c7fa]",
      icon: "auto_awesome",
      chip: "AI",
    },
  },
  {
    match: /chatgpt|openai/i,
    theme: {
      gradient: "from-[#061914] via-[#0c6b5a] to-[#75e0c2]",
      icon: "auto_awesome",
      chip: "AI",
    },
  },
  {
    match: /\bclaude\b|anthropic/i,
    theme: {
      gradient: "from-[#1a1207] via-[#c2530f] to-[#ffb066]",
      icon: "auto_awesome",
      chip: "AI",
    },
  },
  {
    match: /deezer/i,
    theme: {
      gradient: "from-[#19002d] via-[#8b1fe8] to-[#ff2e8a]",
      icon: "graphic_eq",
      chip: "Audio",
    },
  },
  {
    match: /snapchat/i,
    theme: {
      gradient: "from-[#1a1600] via-[#d6b900] to-[#fffc00]",
      icon: "chat_bubble",
      chip: "Social",
    },
  },
  {
    match: /telegram/i,
    theme: {
      gradient: "from-[#061727] via-[#168acd] to-[#60b8f5]",
      icon: "send",
      chip: "Social",
    },
  },
  {
    match: /duolingo/i,
    theme: {
      gradient: "from-[#071a09] via-[#58a700] to-[#89e219]",
      icon: "school",
      chip: "Education",
    },
  },
  {
    match: /viki/i,
    theme: {
      gradient: "from-[#101024] via-[#6f2cff] to-[#1cc7d0]",
      icon: "subtitles",
      chip: "Drama",
    },
  },
  {
    match: /tf1/i,
    theme: {
      gradient: "from-[#081733] via-[#0046ad] to-[#e30613]",
      icon: "live_tv",
      chip: "Streaming",
    },
  },
  {
    match: /kaspersky|kapersky/i,
    theme: {
      gradient: "from-[#031715] via-[#00a88e] to-[#5df2d6]",
      icon: "security",
      chip: "Securite",
    },
  },
  {
    match: /vpn|proton|cyberghost/i,
    theme: {
      gradient: "from-[#06111f] via-[#4b2be8] to-[#6ee7d8]",
      icon: "shield_lock",
      chip: "Securite",
    },
  },
  {
    match: /robux|playstation|psn|xbox|gift\s*card|carte/i,
    theme: {
      gradient: "from-[#121212] via-[#2b6cff] to-[#00d084]",
      icon: "redeem",
      chip: "Gift",
    },
  },
  {
    match: /numero|num[eé]ro|virtuel/i,
    theme: {
      gradient: "from-[#09111f] via-[#6d28d9] to-[#38bdf8]",
      icon: "phone_iphone",
      chip: "Numero",
    },
  },
  {
    match: /pack|package|aureus/i,
    theme: {
      gradient: "from-[#09090b] via-[#3f3214] to-[#dbb723]",
      icon: "inventory_2",
      chip: "Pack",
    },
  },
];

const categoryThemes: Array<{ match: (service: ServiceIllustrationProps["service"]) => boolean; theme: MockupTheme }> = [
  {
    match: (service) => service.category.toLowerCase().includes("stream") || /netflix|prime video|disney|crunchyroll/i.test(service.title),
    theme: {
      gradient: "from-[#1b0a10] via-[#7f1734] to-[#ff7a45]",
      icon: "movie",
      chip: "Streaming",
    },
  },
  {
    match: (service) => /logic|software/i.test(service.category) || /canva|capcut|adobe|office|photoroom|filmora/i.test(service.title),
    theme: {
      gradient: "from-[#051937] via-[#0f5ba7] to-[#56d6ff]",
      icon: "design_services",
      chip: "Studio",
    },
  },
  {
    match: (service) => /musique|music/i.test(service.category) || /spotify|deezer|apple music|youtube music/i.test(service.title),
    theme: {
      gradient: "from-[#07160c] via-[#0a7f4f] to-[#45f3a6]",
      icon: "headphones",
      chip: "Audio",
    },
  },
  {
    match: (service) => /\bia\b|\bai\b/i.test(service.category) || /chatgpt|midjourney|claude|gemini/i.test(service.title),
    theme: {
      gradient: "from-[#180d32] via-[#5c2ccf] to-[#b98cff]",
      icon: "auto_awesome",
      chip: "IA",
    },
  },
  {
    match: (service) => /vpn|securite|sécurité|security/i.test(service.category) || /vpn|kapersky|password/i.test(service.title),
    theme: {
      gradient: "from-[#071822] via-[#0c6477] to-[#5ae1df]",
      icon: "shield_lock",
      chip: "Securite",
    },
  },
  {
    match: (service) => /cloud/i.test(service.category),
    theme: {
      gradient: "from-[#04101f] via-[#1478d4] to-[#8fd3ff]",
      icon: "cloud",
      chip: "Cloud",
    },
  },
  {
    match: (service) => /education|éducation/i.test(service.category),
    theme: {
      gradient: "from-[#071a09] via-[#58a700] to-[#c8f28c]",
      icon: "school",
      chip: "Education",
    },
  },
  {
    match: (service) => /carte cadeau|gift/i.test(service.category),
    theme: {
      gradient: "from-[#241405] via-[#b45309] to-[#ffcf6b]",
      icon: "redeem",
      chip: "Gift",
    },
  },
];

const defaultTheme: MockupTheme = {
  gradient: "from-[#17111f] via-[#5b13ec] to-[#d6b2ff]",
  icon: "bolt",
  chip: "Premium",
};

// Categories with no explicit theme above still need a symbol that sets them
// apart from one another. Only these two stay on the plain defaultTheme.
const unthemedCategoryPattern = /^(non\s*classe|non\s*class[ée]|uncategorized|autre|other)$/i;

const fallbackThemePool: Array<{ theme: MockupTheme; pattern: VisualPattern }> = [
  { theme: { gradient: "from-[#1d0b2e] via-[#7c3aed] to-[#c4b5fd]", icon: "workspace_premium", chip: "Service" }, pattern: "fluid" },
  { theme: { gradient: "from-[#031b2e] via-[#0891b2] to-[#67e8f9]", icon: "bolt", chip: "Service" }, pattern: "beam" },
  { theme: { gradient: "from-[#2a0a05] via-[#ea580c] to-[#fdba74]", icon: "local_fire_department", chip: "Service" }, pattern: "orbs" },
  { theme: { gradient: "from-[#031f14] via-[#059669] to-[#6ee7b7]", icon: "eco", chip: "Service" }, pattern: "grid" },
  { theme: { gradient: "from-[#1f0a1a] via-[#db2777] to-[#f9a8d4]", icon: "favorite", chip: "Service" }, pattern: "halo" },
  { theme: { gradient: "from-[#0a1f3d] via-[#2563eb] to-[#93c5fd]", icon: "hub", chip: "Service" }, pattern: "orbs" },
  { theme: { gradient: "from-[#241f05] via-[#ca8a04] to-[#fde68a]", icon: "diamond", chip: "Service" }, pattern: "wave" },
  { theme: { gradient: "from-[#031326] via-[#0d9488] to-[#5eead4]", icon: "rocket_launch", chip: "Service" }, pattern: "beam" },
];

function hashCategoryName(value: string): number {
  return Array.from(value.trim().toLowerCase()).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getFallbackForCategory(category: string): { theme: MockupTheme; pattern: VisualPattern } | null {
  if (!category.trim() || unthemedCategoryPattern.test(category.trim())) {
    return null;
  }

  const index = hashCategoryName(category) % fallbackThemePool.length;
  return fallbackThemePool[index];
}

function getTheme(service: ServiceIllustrationProps["service"]): MockupTheme {
  const searchable = `${service.title} ${service.category}`;
  const platformTheme = platformThemes.find((entry) => entry.match.test(searchable))?.theme;
  const categoryTheme = categoryThemes.find((entry) => entry.match(service))?.theme;

  return platformTheme ?? categoryTheme ?? getFallbackForCategory(service.category)?.theme ?? defaultTheme;
}

function getVisualPattern(service: Pick<CatalogProduct, "title" | "category">): VisualPattern {
  const searchable = `${service.title} ${service.category}`;

  if (/netflix/i.test(searchable)) return "halo";
  if (/spotify|apple\s*music|deezer|music/i.test(searchable)) return "wave";
  if (/hbo|apple\s*tv|prime\s*video|disney|icloud|google\s*one/i.test(searchable)) return "orbs";
  if (/canva|photoroom|capcut|adobe|photoshop|lightroom|filmora|wondershare|viki/i.test(searchable)) return "fluid";
  if (/vpn|kaspersky|kapersky|security|securite|sécurité|telegram|numero|virtuel/i.test(searchable)) return "beam";
  if (/robux|playstation|psn|xbox|gift|carte/i.test(searchable)) return "grid";

  if (/stream/i.test(service.category)) return "orbs";
  if (/musique|music/i.test(service.category)) return "wave";
  if (/logic|software|design/i.test(service.category)) return "fluid";
  if (/cloud/i.test(service.category)) return "orbs";
  if (/securite|sécurité|security/i.test(service.category)) return "beam";
  if (/education|éducation/i.test(service.category)) return "grid";
  if (/carte cadeau|gift/i.test(service.category)) return "grid";

  const fallback = getFallbackForCategory(service.category);
  return fallback?.pattern ?? "fluid";
}

export function isWaveIllustration(service: Pick<CatalogProduct, "title" | "category">): boolean {
  return getVisualPattern(service) === "wave";
}

function getInitials(title: string): string {
  const parts = title
    .split(/[\s/-]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "AP";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function getShellClasses(variant: NonNullable<ServiceIllustrationProps["variant"]>) {
  switch (variant) {
    case "hero":
      return {
        root: "h-full w-full rounded-none",
        padding: "p-6 sm:p-7",
        card: "mx-auto mt-auto w-[82%] max-w-[360px] rounded-[28px] p-4",
        title: "text-[22px]",
        price: "text-base",
      };
    case "thumb":
      return {
        root: "h-full w-full rounded-2xl",
        padding: "p-2.5",
        card: "mt-auto w-full rounded-[20px] p-2.5",
        title: "text-[11px]",
        price: "text-[11px]",
      };
    default:
      return {
        root: "h-full w-full rounded-none",
        padding: "p-4",
        card: "mx-auto mt-auto w-[84%] rounded-[24px] p-3.5",
        title: "text-[18px]",
        price: "text-sm",
      };
  }
}

export function ServiceIllustration({
  service,
  variant = "card",
  className = "",
}: ServiceIllustrationProps) {
  const theme = getTheme(service);
  const visualPattern = getVisualPattern(service);
  const shell = getShellClasses(variant);
  const initials = getInitials(service.title);
  const title = variant === "thumb" ? initials : service.title;
  const subtitle = variant === "thumb" ? service.category : service.billingSummary;

  if (variant !== "hero") {
    return (
      <div className={`relative overflow-hidden ${shell.root} ${className}`} aria-hidden="true">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
        <div className="absolute inset-0 bg-black/10" />

        {visualPattern === "halo" && (
          <>
            <div className="absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/80 blur-2xl" />
            <div className="absolute left-1/2 top-1/2 size-[28%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-300/90 blur-md" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,transparent_0_22%,rgba(0,0,0,0.65)_62%,rgba(0,0,0,0.92)_100%)]" />
          </>
        )}

        {visualPattern === "wave" && (
          <div className="absolute inset-x-[8%] top-1/2 flex h-[58%] -translate-y-1/2 items-center justify-between rounded-full border border-white/15 bg-white/5 px-[2%] opacity-90 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
            {[18, 34, 52, 76, 44, 28, 62, 88, 54, 36, 70, 92, 58, 30, 48, 74, 42, 22, 56, 82, 46, 30, 66, 86, 50, 24, 44, 72, 38, 20].map(
              (height, index) => (
                <span
                  key={`${height}-${index}`}
                  className="w-[2.2%] rounded-full border border-white/45 bg-gradient-to-b from-white/75 via-white/25 to-white/10 shadow-[inset_1px_1px_0_rgba(255,255,255,0.48),inset_-2px_-3px_6px_rgba(0,0,0,0.12)]"
                  style={{ height: `${height}%` }}
                />
              ),
            )}
          </div>
        )}

        {visualPattern === "orbs" && (
          <>
            <div className="absolute -left-[18%] top-[10%] size-[72%] rounded-full border border-white/20 bg-white/15 shadow-[inset_-20px_-18px_40px_rgba(0,0,0,0.18)]" />
            <div className="absolute left-[34%] -top-[24%] size-[62%] rounded-full border border-white/25 bg-white/35 shadow-[0_20px_50px_rgba(0,0,0,0.18)]" />
            <div className="absolute left-[43%] top-[38%] size-[38%] rounded-full bg-black/25 blur-[1px]" />
            <div className="absolute -right-[14%] bottom-[-24%] size-[70%] rounded-full border border-white/15 bg-black/15" />
          </>
        )}

        {visualPattern === "fluid" && (
          <>
            <div className="absolute -left-[18%] top-[30%] h-[42%] w-[136%] rotate-[13deg] rounded-[50%] border-[18px] border-white/18 blur-[2px]" />
            <div className="absolute -left-[12%] top-[14%] h-[50%] w-[128%] rotate-[-13deg] rounded-[50%] border-[8px] border-white/20 blur-[1px]" />
            <div className="absolute -right-[20%] bottom-[-44%] size-[92%] rounded-full bg-white/20 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_110%,rgba(255,255,255,0.35),transparent_46%),linear-gradient(125deg,transparent_32%,rgba(255,255,255,0.14)_51%,transparent_68%)]" />
          </>
        )}

        {visualPattern === "beam" && (
          <>
            <div className="absolute -left-[18%] top-[34%] h-[16%] w-[138%] rotate-[-18deg] bg-white/25 blur-md" />
            <div className="absolute -left-[12%] top-[44%] h-px w-[124%] rotate-[-18deg] bg-white/75 shadow-[0_0_18px_rgba(255,255,255,0.8)]" />
            <div className="absolute -left-[15%] top-[58%] h-[8%] w-[132%] rotate-[-18deg] bg-black/30 blur-lg" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0_38%,rgba(255,255,255,0.14)_39%_40%,transparent_41%_100%)]" />
          </>
        )}

        {visualPattern === "grid" && (
          <>
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute -right-[12%] top-[12%] size-[62%] rounded-full border border-white/30 bg-white/15 shadow-[0_0_45px_rgba(255,255,255,0.18)]" />
            <div className="absolute -left-[24%] bottom-[-46%] size-[88%] rounded-full bg-black/30 blur-xl" />
          </>
        )}

        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/25 to-transparent" />
        <div className="absolute inset-0 border border-white/10" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${shell.root} ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
      <div className="absolute -right-12 -top-10 size-36 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute -left-16 bottom-0 size-44 rounded-full bg-black/25 blur-2xl" />
      <div className="absolute left-1/2 top-1/2 h-24 w-[120%] -translate-x-1/2 -translate-y-1/2 -rotate-6 rounded-full bg-white/10 blur-md" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.16)_42%,transparent_68%)]" />
      <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.7)_1px,transparent_0)] [background-size:18px_18px]" />
      <div className="absolute inset-0 border border-white/10" />
      <div className="absolute inset-x-0 top-0 h-20 bg-white/10" />

      <div className={`relative z-10 flex h-full flex-col ${shell.padding}`}>
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white/80 backdrop-blur-sm">
            {service.category}
          </span>

          <div className="flex size-11 items-center justify-center rounded-2xl border border-white/15 bg-black/30 text-white shadow-[0_20px_35px_rgba(0,0,0,0.18)] backdrop-blur-sm">
            <span className="material-symbols-outlined text-[22px]">{theme.icon}</span>
          </div>
        </div>

        <div className={`border border-white/15 bg-black/30 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl ${shell.card}`}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/12 text-sm font-black tracking-[0.18em] text-white">
                {initials}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">Aureus Prime</p>
                <p className="text-[11px] font-medium text-white/70">{theme.chip}</p>
              </div>
            </div>

            {service.optionCount > 1 && (
              <span className="rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-bold text-white/85">
                {service.badgeLabel ?? service.optionCount}
              </span>
            )}
          </div>

          <div className={`font-black leading-tight text-white ${shell.title}`}>{title}</div>
          <p className="mt-1 text-xs text-white/70">{subtitle}</p>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">{service.priceHint}</p>
              <p className={`truncate font-bold text-white ${shell.price}`}>{service.currentPriceFormatted}</p>
            </div>

            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#131118] shadow-lg">
              <span className="material-symbols-outlined text-[18px]">arrow_outward</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

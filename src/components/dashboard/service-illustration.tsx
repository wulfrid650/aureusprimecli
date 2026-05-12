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
  glow: string;
  icon: string;
  chip: string;
};

const themes: Array<{ match: (service: ServiceIllustrationProps["service"]) => boolean; theme: MockupTheme }> = [
  {
    match: (service) => service.category.toLowerCase().includes("stream") || /netflix|prime video|disney|crunchyroll/i.test(service.title),
    theme: {
      gradient: "from-[#1b0a10] via-[#7f1734] to-[#ff7a45]",
      glow: "bg-[#ff7a45]/35",
      icon: "movie",
      chip: "Streaming",
    },
  },
  {
    match: (service) => /logic|software/i.test(service.category) || /canva|capcut|adobe|office|photoroom|filmora/i.test(service.title),
    theme: {
      gradient: "from-[#051937] via-[#0f5ba7] to-[#56d6ff]",
      glow: "bg-[#56d6ff]/35",
      icon: "design_services",
      chip: "Studio",
    },
  },
  {
    match: (service) => /musique|music/i.test(service.category) || /spotify|deezer|apple music|youtube music/i.test(service.title),
    theme: {
      gradient: "from-[#07160c] via-[#0a7f4f] to-[#45f3a6]",
      glow: "bg-[#45f3a6]/35",
      icon: "headphones",
      chip: "Audio",
    },
  },
  {
    match: (service) => /\bia\b|\bai\b/i.test(service.category) || /chatgpt|midjourney|claude|gemini/i.test(service.title),
    theme: {
      gradient: "from-[#180d32] via-[#5c2ccf] to-[#b98cff]",
      glow: "bg-[#b98cff]/35",
      icon: "auto_awesome",
      chip: "IA",
    },
  },
  {
    match: (service) => /vpn|securite|sécurité|security/i.test(service.category) || /vpn|kapersky|password/i.test(service.title),
    theme: {
      gradient: "from-[#071822] via-[#0c6477] to-[#5ae1df]",
      glow: "bg-[#5ae1df]/35",
      icon: "shield_lock",
      chip: "Securite",
    },
  },
];

const defaultTheme: MockupTheme = {
  gradient: "from-[#17111f] via-[#5b13ec] to-[#d6b2ff]",
  glow: "bg-[#d6b2ff]/30",
  icon: "bolt",
  chip: "Premium",
};

function getTheme(service: ServiceIllustrationProps["service"]): MockupTheme {
  return themes.find((entry) => entry.match(service))?.theme ?? defaultTheme;
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
  const shell = getShellClasses(variant);
  const initials = getInitials(service.title);
  const title = variant === "thumb" ? initials : service.title;
  const subtitle = variant === "thumb" ? service.category : service.billingSummary;

  return (
    <div className={`relative overflow-hidden ${shell.root} ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
      <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl ${theme.glow}`} />
      <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.38),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18),transparent_34%)]" />

      <div className={`relative z-10 flex h-full flex-col ${shell.padding}`}>
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white/80 backdrop-blur-sm">
            {service.category}
          </span>

          <div className="flex size-11 items-center justify-center rounded-2xl border border-white/15 bg-black/20 text-white shadow-[0_20px_35px_rgba(0,0,0,0.18)] backdrop-blur-sm">
            <span className="material-symbols-outlined text-[22px]">{theme.icon}</span>
          </div>
        </div>

        <div className={`border border-white/15 bg-black/20 shadow-[0_24px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl ${shell.card}`}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/12 text-sm font-black tracking-[0.18em] text-white">
                {initials}
              </div>
              {variant !== "thumb" && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">Aureus Prime</p>
                  <p className="text-[11px] font-medium text-white/70">{theme.chip}</p>
                </div>
              )}
            </div>

            {variant !== "thumb" && service.optionCount > 1 && (
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

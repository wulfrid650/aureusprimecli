type PremiumHeroCardProps = {
  badge: string;
  title: string;
  subtitle: string;
};

export function PremiumHeroCard({ badge, title, subtitle }: PremiumHeroCardProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_12px_36px_-18px_rgba(19,17,24,0.28)]">
      <div className="relative h-40 overflow-hidden bg-[#09090b] sm:h-44 md:h-52">
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(245,196,0,0.78),transparent_24%),linear-gradient(135deg,#07080b_12%,#171a22_58%,#59470a_100%)]" />
          <div className="absolute -left-[22%] top-[32%] h-[92%] w-[128%] -rotate-[8deg] rounded-[50%] border-[18px] border-white/10" />
          <div className="absolute -left-[18%] top-[42%] h-[72%] w-[120%] -rotate-[8deg] rounded-[50%] border-[5px] border-[#f5c400]/80 shadow-[0_0_28px_rgba(245,196,0,0.3)]" />
          <div className="absolute -right-[18%] -top-[54%] size-[92%] rounded-full border border-white/15 bg-white/[0.04]" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />
        </div>

        <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
          {badge}
        </span>
        <span className="material-symbols-outlined absolute right-4 top-4 flex size-10 items-center justify-center rounded-2xl border border-white/15 bg-black/35 text-[21px] text-[#f5c400] backdrop-blur-md">
          subscriptions
        </span>

        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-lg backdrop-blur-md">
            <span className="material-symbols-outlined text-[20px]">play_arrow</span>
          </span>
          <div className="text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/60">Aureus Prime</p>
            <p className="text-xs font-semibold text-white/90">Premium digital</p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <h1 className="text-[26px] font-black leading-tight tracking-[-0.03em] text-[#131118] sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

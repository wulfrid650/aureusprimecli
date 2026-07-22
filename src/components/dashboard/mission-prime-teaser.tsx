type MissionPrimeTeaserProps = {
  badge: string;
  eyebrow: string;
  title: string;
  description: string;
  levelPath: string;
};

export function MissionPrimeTeaser({
  badge,
  eyebrow,
  title,
  description,
  levelPath,
}: MissionPrimeTeaserProps) {
  return (
    <section className="px-5 pb-6 pt-7">
      <div className="relative overflow-hidden rounded-[30px] bg-[#0a2357] p-6 text-white shadow-[0_18px_45px_-22px_rgba(10,35,87,0.75)] sm:p-7">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-10 -top-14 size-44 rounded-full bg-[#ef3340]" />
          <div className="absolute -right-2 -top-2 size-24 rounded-full border-[18px] border-white/15" />
          <div className="absolute -bottom-16 -left-10 size-44 rounded-full bg-[#13a66a]" />
          <div className="absolute bottom-6 left-24 h-3 w-32 -rotate-6 rounded-full bg-[#2388ff]" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0_58%,rgba(255,255,255,0.08)_58%_59%,transparent_59%_100%)]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-md">
              <span className="material-symbols-outlined text-[25px] text-[#ffd54a]">hotel_class</span>
            </div>
            <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] backdrop-blur-md">
              {badge}
            </span>
          </div>

          <p className="mt-8 text-[11px] font-black uppercase tracking-[0.24em] text-[#8fc4ff]">{eyebrow}</p>
          <h1 className="mt-2 max-w-[290px] text-[30px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[34px]">
            {title}
          </h1>
          <p className="mt-3 max-w-[315px] text-sm font-medium leading-relaxed text-white/78">{description}</p>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/15 bg-black/15 px-4 py-3 backdrop-blur-md">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#13a66a] text-sm font-black">I</span>
            <div className="h-px flex-1 bg-white/25" />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">{levelPath}</span>
            <div className="h-px flex-1 bg-white/25" />
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#ef3340]">
              <span className="material-symbols-outlined text-[17px]">workspace_premium</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

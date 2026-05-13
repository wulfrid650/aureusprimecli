import Image from "next/image";

const paymentMethods = [
  {
    src: "https://assets.cdn.moneroo.io/icons/circle/eu_mobile_cm.svg",
    alt: "Mobile Money Cameroun",
  },
  {
    src: "https://assets.cdn.moneroo.io/icons/circle/momo.svg",
    alt: "MTN MoMo",
  },
  {
    src: "https://assets.cdn.moneroo.io/icons/circle/orange_money.svg",
    alt: "Orange Money",
  },
  {
    src: "https://assets.cdn.moneroo.io/icons/circle/wave.svg",
    alt: "Wave",
  },
  {
    src: "https://assets.cdn.moneroo.io/icons/circle/moov_money.svg",
    alt: "Moov Money",
  },
  {
    src: "https://assets.cdn.moneroo.io/icons/circle/airtel.svg",
    alt: "Airtel Money",
  },
];

export function PaymentMethodLogos({
  moreLabel = "et plus",
  className = "",
}: {
  moreLabel?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {paymentMethods.map((method) => (
        <span
          key={method.src}
          className="inline-flex size-9 items-center justify-center rounded-full border border-[var(--premium-card-border)] bg-[var(--premium-card-deep)] shadow-[0_8px_18px_rgba(31,41,55,0.08)]"
          title={method.alt}
        >
          <Image
            src={method.src}
            alt={method.alt}
            width={28}
            height={28}
            unoptimized
            className="size-7 rounded-full"
          />
        </span>
      ))}
      <span className="inline-flex h-9 items-center rounded-full border border-[var(--premium-card-border)] bg-[var(--premium-panel)] px-3 text-xs font-black text-[var(--premium-text-muted)]">
        {moreLabel}
      </span>
    </div>
  );
}

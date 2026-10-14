import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { localePath } from "@/lib/i18n";
import { ArrowIcon, Container } from "./ui";

interface PricingProps {
  lang: string;
  t: Dictionary["landing"]["pricing"];
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0 mt-0.5">
      <circle cx="9" cy="9" r="9" fill="rgba(242,182,50,0.12)" />
      <path d="M5 9l3 3 5-6" stroke="#f2b632" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Pricing({ lang, t }: PricingProps) {
  return (
    <section id="pricing" className="bg-lp-ink py-20 lg:py-[120px]">
      <Container>
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-14">
          <span className="eyebrow !text-[#a9b4bf]">{t.eyebrow}</span>
          <h2 className="font-serif text-4xl font-normal tracking-[-0.025em] text-paper sm:text-5xl lg:text-[62px] lg:leading-[1.03]">
            {t.title}
          </h2>
          <p className="max-w-[460px] text-lg leading-relaxed text-[#c9d1d9]">{t.subtitle}</p>
        </div>

        {/* Card */}
        <div className="mx-auto max-w-[540px] rounded-2xl border border-[rgba(242,182,50,0.2)] bg-[rgba(255,255,255,0.035)] p-8 lg:p-10 shadow-[0_0_80px_rgba(242,182,50,0.07)]">

          {/* Badge */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[rgba(242,182,50,0.35)] bg-[rgba(242,182,50,0.1)] px-3.5 py-1.5 text-xs font-semibold text-gold tracking-wider">
            <span aria-hidden="true">✦</span>
            {t.badge}
          </div>

          {/* Price block */}
          <div className="mb-8 flex items-end gap-3">
            <span className="font-serif text-[80px] leading-none text-gold tracking-tight lg:text-[88px]">
              1,500
            </span>
            <div className="mb-2 flex flex-col leading-tight">
              <span className="text-xl font-semibold text-paper">{t.currency}</span>
              <span className="text-[15px] text-[#a9b4bf]">{t.period}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-8 border-t border-[rgba(255,255,255,0.08)]" />

          {/* Features */}
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a8591]">
            {t.includes}
          </p>
          <ul className="mb-10 space-y-3.5">
            {t.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-[15px] leading-snug text-[#c9d1d9]">
                <CheckIcon />
                {feature}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href={localePath(lang, "/request-access")}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-gold text-base font-semibold text-[#1b1a17] transition-colors hover:bg-gold-deep"
          >
            {t.cta}
            <ArrowIcon />
          </Link>

          {/* Fine print */}
          <p className="mt-4 text-center text-xs text-[#5a6470]">{t.vatNote}</p>
        </div>
      </Container>
    </section>
  );
}

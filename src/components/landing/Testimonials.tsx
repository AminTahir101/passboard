import type { Dictionary } from "@/lib/i18n";
import { Container } from "./ui";

export function Testimonials({ t }: { t: Dictionary["landing"]["howItWorks"] }) {
  return (
    <section id="results" className="scroll-mt-8 bg-sand py-20 lg:py-[120px]">
      <Container>
        <div className="flex flex-col gap-4">
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 className="font-serif text-4xl leading-[1.05] font-normal tracking-[-0.02em] sm:text-5xl lg:text-6xl">
            {t.title}
          </h2>
        </div>

        <div className="mt-14 grid gap-px border-t border-lp-ink bg-lp-line-strong lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Featured column */}
          <div className="flex flex-col gap-6 bg-sand pt-10 pb-10 lg:pe-12">
            <h3 className="font-serif text-[28px] leading-[1.2] font-normal lg:text-[32px]">
              {t.featured.headline}
            </h3>
            <p className="text-[17px] leading-relaxed text-lp-ink-2">{t.featured.body}</p>
          </div>

          {/* Pillars */}
          {t.pillars.map((p) => (
            <div key={p.n} className="flex flex-col gap-5 bg-sand py-10 lg:px-9 lg:last:pe-0">
              <span className="font-mono text-[13px] text-amber">{p.n}</span>
              <h3 className="font-serif text-[22px] leading-[1.25] font-normal">{p.title}</h3>
              <p className="text-[15px] leading-relaxed text-lp-ink-2">{p.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

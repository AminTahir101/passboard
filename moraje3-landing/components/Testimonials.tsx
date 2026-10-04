import type { Dictionary } from "@/lib/dictionaries";
import { Container } from "./ui";

// NOTE: carried over from the current site. Confirm each quote is from a real,
// consenting student before launch.
export function Testimonials({ t }: { t: Dictionary["testimonials"] }) {
  const f = t.featured;
  return (
    <section id="results" className="scroll-mt-8 bg-sand py-20 lg:py-[120px]">
      <Container>
        <div className="flex flex-col gap-4">
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 className="font-serif text-4xl leading-[1.05] font-normal tracking-[-0.02em] sm:text-5xl lg:text-6xl">{t.title}</h2>
        </div>

        <div className="mt-14 grid gap-px border-t border-ink bg-line-strong lg:grid-cols-[1.4fr_1fr_1fr]">
          <figure className="flex flex-col gap-7 bg-sand pt-10 pb-10 lg:pe-12">
            <span dir="ltr" className="font-serif text-6xl leading-none text-amber rtl:text-right lg:text-7xl">{f.metric}</span>
            <blockquote className="font-serif text-2xl leading-[1.35] italic lg:text-[28px]">{f.quote}</blockquote>
            <figcaption className="flex flex-col gap-0.5 text-sm">
              <span className="font-medium">{f.name}</span>
              <span className="text-muted">{f.role}</span>
            </figcaption>
          </figure>

          {t.others.map((o) => (
            <figure key={o.name} className="flex flex-col gap-5 bg-sand py-10 lg:px-9 lg:last:pe-0">
              <div className="flex flex-col gap-1">
                <span className="font-serif text-[44px] leading-none">{o.metric}</span>
                <span className="font-mono text-xs text-muted uppercase">{o.label}</span>
              </div>
              <blockquote className="text-base leading-relaxed text-ink-2">{o.quote}</blockquote>
              <figcaption className="flex flex-col gap-0.5 text-sm">
                <span className="font-medium">{o.name}</span>
                <span className="text-muted">{o.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}

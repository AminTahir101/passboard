import type { Dictionary } from "@/lib/dictionaries";
import { site } from "@/lib/site";
import { ArrowIcon, Container } from "./ui";

export function Cta({ t }: { t: Dictionary["cta"] }) {
  return (
    <section id="request-access" className="bg-ink py-20 text-paper lg:py-0">
      <Container className="grid items-center gap-10 lg:min-h-[460px] lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-24">
        <div className="flex flex-col gap-5">
          <span className="eyebrow !text-[#a9b4bf]">{t.eyebrow}</span>
          <h2 className="font-serif text-5xl leading-[1.02] font-normal tracking-[-0.025em] lg:text-[76px]">
            {t.titleA}
            <em className="text-gold">{t.titleEm}</em>
          </h2>
        </div>
        <div className="flex flex-col gap-7">
          <p className="text-lg leading-relaxed text-[#c9d1d9]">{t.sub}</p>
          <a
            href={site.requestAccessUrl}
            className="flex h-14 items-center gap-2.5 self-start rounded-full bg-gold px-7 text-base font-semibold text-[#1b1a17] transition-colors hover:bg-gold-deep"
          >
            {t.button}
            <ArrowIcon />
          </a>
        </div>
      </Container>
    </section>
  );
}

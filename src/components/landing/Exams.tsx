import type { Dictionary } from "@/lib/i18n";
import { Container } from "./ui";

export function Exams({ t }: { t: Dictionary["landing"]["exams"] }) {
  return (
    <section id="exams" className="scroll-mt-8 py-16 lg:py-20">
      <Container className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
        <div className="flex flex-col gap-3">
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 className="font-serif text-[32px] leading-[1.15] font-normal tracking-tight">{t.title}</h2>
        </div>
        <ul className="grid grid-cols-2 gap-px bg-lp-line sm:grid-cols-3 lg:grid-cols-5">
          {t.items.map((e) => (
            <li key={e.code} className="flex flex-col gap-2.5 bg-paper p-5 lg:px-6 lg:py-7">
              <span dir="ltr" className="font-serif text-4xl leading-none rtl:text-right">{e.code}</span>
              <span className="text-sm leading-normal text-lp-muted">{e.name}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

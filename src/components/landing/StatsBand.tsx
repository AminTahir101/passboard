import type { Dictionary } from "@/lib/i18n";
import { Container } from "./ui";

export function StatsBand({ stats }: { stats: Dictionary["landing"]["stats"] }) {
  return (
    <Container>
      <dl className="grid grid-cols-2 gap-px border-t border-b border-t-lp-ink border-b-lp-line bg-lp-line lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.t} className="flex flex-col-reverse gap-1.5 bg-paper px-4 py-8 first:ps-0 lg:px-8">
            <dt className="text-sm text-lp-muted">{s.t}</dt>
            <dd className={`font-serif text-[44px] leading-none tracking-tight lg:text-[52px] ${i === 3 ? "italic" : ""}`}>
              {s.n}
            </dd>
          </div>
        ))}
      </dl>
    </Container>
  );
}

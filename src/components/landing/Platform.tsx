import type { ReactNode } from "react";
import type { Dictionary } from "@/lib/i18n";
import { Container, SparkIcon } from "./ui";

type F = Dictionary["landing"]["platform"]["feats"];

// Sample product UI (question text, topic scores) is illustrative and kept in English.
const PROGRESS = [
  { topic: "Cardiology", v: 73, tone: "ink" },
  { topic: "Pharmacology", v: 64, tone: "ink" },
  { topic: "Anatomy", v: 58, tone: "ink" },
  { topic: "Renal", v: 49, tone: "rust" },
  { topic: "Neurology", v: 81, tone: "amber" },
] as const;

const MISTAKES = [
  { topic: "Nephrologic drugs", v: 38, improving: false },
  { topic: "Arrhythmias", v: 52, improving: false },
  { topic: "Renal mechanics", v: 67, improving: true },
];

export function Platform({ t }: { t: Dictionary["landing"]["platform"] }) {
  const f = t.feats;
  return (
    <section id="platform" className="scroll-mt-8 border-t border-lp-line bg-paper-2 py-20 lg:py-[120px]">
      <Container>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="flex flex-col gap-4">
            <span className="eyebrow">{t.eyebrow}</span>
            <h2 className="max-w-[640px] font-serif text-4xl leading-[1.05] font-normal tracking-[-0.02em] sm:text-5xl lg:text-6xl">
              {t.titleA}
              <em className="text-amber">{t.titleEm}</em>
              {t.titleB}
            </h2>
          </div>
          <p className="max-w-[360px] text-[17px] leading-relaxed text-lp-ink-2 lg:mb-2">{t.sub}</p>
        </div>

        <div className="mt-16 grid gap-px border-t border-lp-ink bg-lp-line md:grid-cols-2 lg:grid-cols-3">
          <Feature n="01" title={f.practice.title} desc={f.practice.desc}>
            <PracticeVisual t={f.practice} />
          </Feature>
          <Feature n="02" title={f.understand.title} desc={f.understand.desc}>
            <UnderstandVisual t={f.understand} />
          </Feature>
          <Feature n="03" title={f.ai.title} desc={f.ai.desc}>
            <AiVisual t={f.ai} />
          </Feature>
          <Feature n="04" title={f.progress.title} desc={f.progress.desc}>
            <ProgressVisual />
          </Feature>
          <Feature n="05" title={f.mock.title} desc={f.mock.desc}>
            <MockVisual t={f.mock} />
          </Feature>
          <Feature n="06" title={f.mistakes.title} desc={f.mistakes.desc}>
            <MistakesVisual t={f.mistakes} />
          </Feature>
        </div>
      </Container>
    </section>
  );
}

function Feature({ n, title, desc, children }: { n: string; title: string; desc: string; children: ReactNode }) {
  return (
    <article className="flex min-h-[500px] flex-col bg-paper-2 p-6 lg:p-9">
      <span className="font-mono text-[13px] text-amber">{n}</span>
      <h3 className="mt-[18px] font-serif text-[30px] leading-[1.15] font-normal">{title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-lp-ink-2">{desc}</p>
      <div className="mt-auto pt-8">{children}</div>
    </article>
  );
}

function PracticeVisual({ t }: { t: F["practice"] }) {
  return (
    <div dir="ltr" className="flex flex-col gap-2.5 rounded-xl border border-lp-line-2 bg-white p-[18px] text-left">
      <div className="flex justify-between font-mono text-[11px] text-lp-muted">
        <span>Q 12 / 40 · PHARMACOLOGY</span>
        <span>47:22</span>
      </div>
      <p className="text-sm leading-snug">Which drug inhibits the Na⁺/K⁺/2Cl⁻ cotransporter in the thick ascending loop of Henle?</p>
      <div className="flex flex-col gap-1.5 text-[13px]">
        <div className="rounded-lg border border-lp-line-2 px-3 py-2 text-lp-ink-2">Hydrochlorothiazide</div>
        <div className="flex justify-between rounded-lg border-[1.5px] border-gold-deep bg-gold-tint px-3 py-2 font-medium">
          <span>Furosemide</span>
          <span dir="auto" className="text-amber-ink">{t.correct}</span>
        </div>
        <div className="rounded-lg border border-lp-line-2 px-3 py-2 text-lp-ink-2">Spironolactone</div>
      </div>
    </div>
  );
}

function UnderstandVisual({ t }: { t: F["understand"] }) {
  return (
    <div className="flex flex-col gap-3.5">
      <span className="font-serif text-[88px] leading-[0.9] tracking-[-0.03em]">800+</span>
      <span className="text-sm text-lp-muted">{t.caption}</span>
      <div dir="ltr" className="flex flex-col gap-2 border-t border-lp-line pt-3.5 text-left text-[13px] leading-normal">
        <div className="grid grid-cols-[28px_minmax(0,1fr)] gap-2">
          <span className="font-mono text-rust">✕ B</span>
          <span className="text-lp-ink-2">Thiazides act on the distal convoluted tubule, not the loop.</span>
        </div>
        <div className="grid grid-cols-[28px_minmax(0,1fr)] gap-2">
          <span className="font-mono text-amber">✓ A</span>
          <span className="text-lp-ink-2">Loop diuretics block NKCC2 in the thick ascending limb.</span>
        </div>
      </div>
    </div>
  );
}

function AiVisual({ t }: { t: F["ai"] }) {
  return (
    <div className="flex flex-col gap-2.5 text-sm leading-normal">
      <div dir="ltr" className="max-w-[280px] self-end rounded-[14px_14px_4px_14px] bg-lp-ink px-4 py-3 text-left text-paper rtl:self-start">
        Why is furosemide preferred over thiazides in acute pulmonary edema?
      </div>
      <div dir="ltr" className="max-w-[320px] rounded-[14px_14px_14px_4px] border border-lp-line-2 bg-white px-4 py-3 text-left text-lp-ink-2 rtl:self-end">
        Furosemide acts on the thick ascending limb — much faster and more potent. Thiazides are too weak and slow for acute settings.
      </div>
      <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.04em] text-lp-muted uppercase">
        <span className="size-1.5 rounded-full bg-gold-deep" />
        {t.label}
      </div>
    </div>
  );
}

function ProgressVisual() {
  const fill = { ink: "bg-lp-ink", rust: "bg-rust", amber: "bg-amber" } as const;
  return (
    <ul dir="ltr" className="flex flex-col gap-3 text-[13px]">
      {PROGRESS.map((p) => (
        <li key={p.topic} className="grid grid-cols-[96px_minmax(0,1fr)_40px] items-center gap-3">
          <span>{p.topic}</span>
          <div
            className="h-2 rounded-full bg-lp-line-2"
            role="meter"
            aria-valuenow={p.v}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={p.topic}
          >
            <div className={`h-2 rounded-full ${fill[p.tone]}`} style={{ width: `${p.v}%` }} />
          </div>
          <span className={`text-right font-mono ${p.tone === "rust" ? "text-rust-ink" : ""}`}>{p.v}%</span>
        </li>
      ))}
    </ul>
  );
}

function MockVisual({ t }: { t: F["mock"] }) {
  const items = [
    { n: "100", l: t.questions },
    { n: "180", l: t.minutes },
    { n: "70%", l: t.pass },
  ];
  return (
    <dl className="grid grid-cols-3 gap-px border-t border-lp-ink bg-lp-line">
      {items.map((i) => (
        <div key={i.l} className="flex flex-col-reverse gap-1.5 bg-paper-2 px-3 pt-5 first:ps-0">
          <dt className="text-[13px] text-lp-muted">{i.l}</dt>
          <dd className="font-serif text-5xl leading-none">{i.n}</dd>
        </div>
      ))}
    </dl>
  );
}

function MistakesVisual({ t }: { t: F["mistakes"] }) {
  return (
    <ul className="text-sm">
      {MISTAKES.map((m) => (
        <li key={m.topic} className="flex items-center justify-between border-t border-lp-line py-3.5 last:border-b">
          <span dir="ltr">{m.topic}</span>
          <span
            className={`rounded-full px-2.5 py-1 font-mono text-xs ${
              m.improving ? "bg-amber-tint text-amber-ink" : "bg-rust-tint text-rust-ink"
            }`}
          >
            {m.v}% · {m.improving ? t.improving : t.review}
          </span>
        </li>
      ))}
    </ul>
  );
}

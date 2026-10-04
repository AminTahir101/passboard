import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { localePath } from "@/lib/i18n";
import { ArrowIcon, Container, SparkIcon, Sparkle } from "./ui";

const EXAM_TRACKS = ["SMLE", "SDLE", "SPLE", "USMLE", "PLAB"];

const ORBIT_POS = [
  "left-[20px] top-[190px] -rotate-[20deg]",
  "left-[-6px] top-[430px] -rotate-[30deg]",
  "left-[40px] top-[660px] rotate-[16deg]",
  "left-[526px] top-[190px] rotate-[18deg]",
  "left-[528px] top-[420px] rotate-[26deg]",
  "left-[520px] top-[560px] -rotate-[12deg]",
];

interface HeroProps {
  lang: string;
  t: Dictionary["landing"]["hero"];
}

export function Hero({ lang, t }: HeroProps) {
  return (
    <section
      className="overflow-hidden pb-16 pt-12 lg:pb-8 lg:pt-16"
      style={{
        background:
          "radial-gradient(ellipse 900px 620px at 76% 44%, #fbe7b0 0%, rgba(251,231,176,0.35) 45%, rgba(246,243,236,0) 75%), var(--color-paper)",
      }}
    >
      <Container className="grid items-start gap-14 lg:grid-cols-[minmax(0,600px)_640px] lg:justify-between lg:gap-8">
        {/* Copy */}
        <div className="relative flex flex-col items-center text-center">
          <Sparkle size={22} className="absolute start-10 top-[70px] hidden sm:block" />
          <Sparkle size={16} className="absolute start-0 top-[400px] hidden sm:block" />
          <svg
            className="absolute end-[18px] top-12 hidden sm:block"
            width="56"
            height="52"
            viewBox="0 0 56 52"
            fill="none"
            stroke="var(--color-gold-deep)"
            strokeWidth="3"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M8 4l6 20M28 8l-2 14M50 12L36 28M54 38l-14-2" />
          </svg>

          <div className="flex items-center gap-2 rounded-full bg-gold-soft px-4 py-2 text-[13px] font-medium text-amber-ink">
            <span className="size-[7px] rounded-full bg-gold-deep" />
            {t.badge}
          </div>

          <h1 className="mt-7 font-serif text-5xl leading-[1.04] font-normal tracking-[-0.025em] sm:text-6xl lg:text-[62px] xl:text-[70px]">
            {t.titleA}
            <em className="text-amber">{t.titleEm}</em>
            {t.titleB}
          </h1>

          <p className="mt-7 max-w-[480px] text-lg leading-relaxed text-lp-ink-2">{t.sub}</p>

          <div className="relative mt-9">
            <Link
              href={localePath(lang, "/request-access")}
              className="flex h-14 items-center rounded-full bg-gold px-8 text-base font-semibold text-[#1b1a17] shadow-[0_10px_24px_-12px_rgba(224,162,28,0.8)] transition-colors hover:bg-gold-deep"
            >
              {t.cta}
            </Link>
            <svg
              className="absolute start-[calc(100%+12px)] top-0.5 hidden rtl:-scale-x-100 sm:block"
              width="96"
              height="48"
              viewBox="0 0 96 48"
              fill="none"
              stroke="var(--color-gold-deep)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M92 6c-6 10-18 12-20 4s10-8 10 2c0 14-30 26-62 26" />
              <path d="M26 30l-8 8 10 4" />
            </svg>
          </div>

          <ul className="mt-12 flex flex-col items-center gap-2.5 text-[15px] sm:items-start sm:self-start sm:ps-9">
            {t.pills.map((p) => (
              <li key={p.t} className="rounded-full bg-gold-soft px-5 py-3">
                <strong className="font-semibold">{p.n}</strong> {p.t}
              </li>
            ))}
            <li>
              <a
                href="#exams"
                className="flex items-center gap-2.5 rounded-full bg-gold-soft px-5 py-3 transition-colors hover:bg-amber-tint"
              >
                <span>
                  <strong className="font-semibold">{t.examsPill.n}</strong> {t.examsPill.t}
                </span>
                <ArrowIcon />
              </a>
            </li>
          </ul>
        </div>

        {/* Orbit composition — kept LTR so the absolute layout never mirrors */}
        <div dir="ltr" className="relative mx-auto w-full max-w-[640px] lg:h-[740px]">
          <svg
            className="absolute inset-0 hidden lg:block"
            width="640"
            height="740"
            viewBox="0 0 640 740"
            fill="none"
            stroke="var(--color-gold-line)"
            strokeWidth="1.2"
            aria-hidden="true"
          >
            <ellipse cx="320" cy="400" rx="300" ry="200" transform="rotate(-18 320 400)" />
            <ellipse cx="320" cy="400" rx="250" ry="330" transform="rotate(24 320 400)" strokeDasharray="2 6" />
          </svg>

          {/* Exam track selector */}
          <div className="mb-6 flex flex-col items-center gap-2.5 lg:absolute lg:right-0 lg:top-0 lg:mb-0 lg:items-end">
            <span className="hidden text-right text-[13px] leading-tight text-lp-muted lg:block">{t.selectorLabel}</span>
            <div
              className="flex items-center rounded-xl border border-lp-line-2 bg-white p-1 font-mono text-xs font-medium"
              aria-label={t.selectorLabel}
            >
              {EXAM_TRACKS.map((code, i) => (
                <span
                  key={code}
                  className={
                    i === 0
                      ? "rounded-lg bg-gold px-2.5 py-2 text-[#1b1a17] shadow-[0_6px_14px_-8px_rgba(224,162,28,0.9)]"
                      : "px-2.5 py-2 text-lp-muted"
                  }
                >
                  {code}
                </span>
              ))}
            </div>
          </div>

          {t.orbit.map((label, i) => (
            <span
              key={label}
              dir="auto"
              className={`absolute hidden text-[13px] text-lp-ink-2 lg:block ${ORBIT_POS[i] ?? ""}`}
            >
              {label}
            </span>
          ))}

          <QuestionCard />

          {/* Accuracy chip */}
          <div className="absolute left-[70px] top-[560px] hidden items-center gap-2.5 rounded-2xl border border-lp-line-2 bg-white px-3.5 py-2.5 shadow-[0_16px_30px_-18px_rgba(107,71,0,0.4)] lg:flex">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gold-soft">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-amber-ink)"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M5 20V12M12 20V6M19 20v-9" />
              </svg>
            </span>
            <div dir="auto" className="flex flex-col">
              <span dir="ltr" className="text-[15px] font-semibold rtl:text-right">{t.chip.v}</span>
              <span className="text-xs text-lp-muted">{t.chip.t}</span>
            </div>
          </div>

          {/* Explore card */}
          <div
            dir="auto"
            className="mx-auto mt-6 flex max-w-[380px] flex-col gap-3 rounded-2xl border border-gold-line bg-gold-tint p-4 lg:absolute lg:left-[400px] lg:top-[620px] lg:mt-0 lg:w-[240px]"
          >
            <p className="text-[13px] leading-normal text-[#1b1a17]">{t.explore.text}</p>
            <a
              href="#platform"
              className="self-end rounded-full bg-gold px-4 py-2 text-[13px] font-semibold text-[#1b1a17] hover:bg-gold-deep"
            >
              {t.explore.cta}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}

function QuestionCard() {
  const options = ["Pneumothorax", "Acute myocardial infarction", "Aortic dissection"];
  return (
    <div className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-[20px] border border-lp-line-2 bg-white text-left shadow-[0_30px_60px_-30px_rgba(107,71,0,0.35)] lg:absolute lg:left-[130px] lg:top-[110px] lg:w-[380px]">
      <div className="flex h-[46px] items-center justify-between border-b border-lp-line-2 px-5 font-mono text-[11px] text-lp-muted">
        <span>SMLE · CARDIO-PULMONARY</span>
        <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[#1b1a17]">23:34</span>
      </div>
      <div className="flex flex-col gap-3.5 p-5">
        <p className="font-serif text-lg leading-snug">
          A 32-year-old man presents with sudden pleuritic chest pain and dyspnea after a long-haul flight. Most likely diagnosis?
        </p>
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex h-[42px] items-center gap-3 rounded-[10px] border-[1.5px] border-gold-deep bg-gold-tint px-3.5">
            <span className="font-mono text-xs font-medium text-amber-ink">A</span>
            <span className="grow font-medium">Pulmonary embolism</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-amber-ink)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="Correct answer"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M8 12.5l2.5 2.5L16 9.5" />
            </svg>
          </div>
          {options.map((o, i) => (
            <div key={o} className="flex h-[42px] items-center gap-3 rounded-[10px] border border-lp-line-2 px-3.5 text-lp-ink-2">
              <span className="font-mono text-xs text-lp-muted">{"BCD"[i]}</span>
              <span>{o}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5 rounded-xl bg-paper px-4 py-3.5">
          <div className="flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.06em] text-amber-ink uppercase">
            <SparkIcon size={13} />
            AI explanation
          </div>
          <p className="text-[13px] leading-normal text-lp-ink-2">
            Pleuritic pain + dyspnea + recent long flight point to PE (Virchow&apos;s triad). ECG may show S1Q3T3.
          </p>
        </div>
      </div>
    </div>
  );
}

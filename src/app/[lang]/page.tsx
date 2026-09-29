// src/app/[lang]/page.tsx
import Link from "next/link";
import { ArrowRight, BookOpen, Brain, BarChart3, ClipboardList, CheckCircle2, Target } from "lucide-react";
import { getDictionary, localePath } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";

const featureIcons = [BookOpen, CheckCircle2, Brain, BarChart3, ClipboardList, Target];

export default async function LandingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const d = dict.landing;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <header className="border-b sticky top-0 z-10" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-semibold text-lg tracking-tight">Moraje3</span>
          <div className="flex items-center gap-3">
            <LanguageToggle lang={lang} label={dict.lang.toggle} />
            <Link href={localePath(lang, "/login")} className="text-sm font-medium px-4 py-2 rounded-md transition-colors" style={{ color: "var(--muted-foreground)" }}>
              {d.login}
            </Link>
            <Link href={localePath(lang, "/request-access")} className="text-sm font-medium px-4 py-2 rounded-md transition-colors hover:opacity-90" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              {d.requestAccess}
            </Link>
          </div>
        </div>
      </header>

      <section className="flex flex-col items-center justify-center px-6 py-28 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-8" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
            {d.badge}
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6" style={{ lineHeight: "1.1" }}>Moraje3</h1>
          <p className="text-xl sm:text-2xl mb-4" style={{ color: "var(--foreground)", fontWeight: 500 }}>{d.tagline}</p>
          <p className="text-lg mb-10" style={{ color: "var(--muted-foreground)" }}>{d.description}</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href={localePath(lang, "/request-access")} className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-lg transition-all hover:opacity-90" style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}>
              {d.requestAccess} <ArrowRight size={16} className={lang === "ar" ? "flip-rtl" : ""} />
            </Link>
            <Link href={localePath(lang, "/login")} className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-lg border transition-all hover:opacity-80" style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--background)" }}>
              {d.login}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t py-20 px-6" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">{d.featuresTitle}</h2>
            <p style={{ color: "var(--muted-foreground)" }}>{d.featuresSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {d.features.map((f, i) => {
              const Icon = featureIcons[i];
              return (
                <div key={i} className="p-6 rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: "#eff6ff" }}>
                    <Icon size={20} style={{ color: "var(--brand)" }} />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-4">{d.ctaTitle}</h2>
          <p className="mb-8 text-lg" style={{ color: "var(--muted-foreground)" }}>{d.ctaDesc}</p>
          <Link href={localePath(lang, "/request-access")} className="inline-flex items-center gap-2 text-sm font-semibold px-8 py-3 rounded-lg transition-all hover:opacity-90" style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}>
            {d.requestAccess} <ArrowRight size={16} className={lang === "ar" ? "flip-rtl" : ""} />
          </Link>
        </div>
      </section>

      <footer className="border-t py-8 px-6" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-semibold">Moraje3</span>
          <p className="text-xs text-center" style={{ color: "var(--muted-foreground)", maxWidth: "520px" }}>{d.footerDisclaimer}</p>
          <div className="flex gap-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <Link href={localePath(lang, "/login")} className="hover:underline">{d.login}</Link>
            <Link href={localePath(lang, "/request-access")} className="hover:underline">{d.requestAccess}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

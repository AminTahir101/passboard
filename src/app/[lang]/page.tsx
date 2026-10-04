import { getDictionary } from "@/lib/i18n";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { StatsBand } from "@/components/landing/StatsBand";
import { Exams } from "@/components/landing/Exams";
import { Platform } from "@/components/landing/Platform";
import { Testimonials } from "@/components/landing/Testimonials";
import { Cta } from "@/components/landing/Cta";
import { Footer } from "@/components/landing/Footer";

export default async function LandingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const d = dict.landing;

  return (
    <div className="font-sans bg-paper text-lp-ink">
      <Nav
        lang={lang}
        navLinks={d.navLinks}
        login={d.login}
        requestAccess={d.requestAccess}
      />

      <main>
        <Hero lang={lang} t={d.hero} />
        <StatsBand stats={d.stats} />
        <Exams t={d.exams} />
        <Platform t={d.platform} />
        <Testimonials t={d.testimonials} />
        <Cta lang={lang} t={d.ctaSection} />
      </main>

      <Footer
        lang={lang}
        login={d.login}
        requestAccess={d.requestAccess}
        disclaimer={d.footerDisclaimer}
      />
    </div>
  );
}

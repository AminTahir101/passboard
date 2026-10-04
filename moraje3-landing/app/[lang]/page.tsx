import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale } from "@/lib/site";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { StatsBand } from "@/components/StatsBand";
import { Exams } from "@/components/Exams";
import { Platform } from "@/components/Platform";
import { Testimonials } from "@/components/Testimonials";
import { Cta } from "@/components/Cta";
import { Footer } from "@/components/Footer";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <Nav t={t.nav} />
      <main>
        <Hero t={t.hero} />
        <StatsBand stats={t.stats} />
        <Exams t={t.exams} />
        <Platform t={t.platform} />
        <Testimonials t={t.testimonials} />
        <Cta t={t.cta} />
      </main>
      <Footer t={t.footer} />
    </>
  );
}

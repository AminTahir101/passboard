import type { Dictionary } from "@/lib/dictionaries";
import { site } from "@/lib/site";
import { Container, Logo } from "./ui";

export function Nav({ t }: { t: Dictionary["nav"] }) {
  return (
    <header id="top" className="border-b border-line">
      <Container className="flex h-20 items-center justify-between gap-4">
        <a href="#top" aria-label={t.home} className="flex items-center gap-3">
          <Logo />
          <span className="font-serif text-2xl font-medium tracking-tight">{site.name}</span>
        </a>

        <nav className="hidden gap-10 text-[15px] md:flex">
          <a className="hover:text-amber" href="#platform">{t.platform}</a>
          <a className="hover:text-amber" href="#exams">{t.exams}</a>
          <a className="hover:text-amber" href="#results">{t.results}</a>
        </nav>

        <div className="flex items-center gap-3 text-[15px] sm:gap-6">
          <a
            href={t.langHref}
            hrefLang={t.langHref.slice(1)}
            className="rounded-full border border-line px-3 py-1.5 font-medium hover:border-gold-deep"
          >
            {t.langSwitch}
          </a>
          <a className="hidden hover:text-amber sm:inline" href={site.loginUrl}>{t.login}</a>
          <a
            href={site.requestAccessUrl}
            className="hidden h-11 items-center rounded-full border-[1.5px] border-gold-deep px-5 font-medium transition-colors hover:bg-gold-soft sm:flex"
          >
            {t.request}
          </a>
        </div>
      </Container>
    </header>
  );
}

import Link from "next/link";
import { localePath } from "@/lib/i18n";
import { Container, Logo } from "./ui";

interface NavProps {
  lang: string;
  navLinks: { platform: string; exams: string; results: string; langSwitch: string };
  login: string;
  requestAccess: string;
}

export function Nav({ lang, navLinks, login, requestAccess }: NavProps) {
  return (
    <header id="top" className="border-b border-lp-line">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Link href={localePath(lang, "/")} aria-label="Passboard home" className="flex items-center gap-3">
          <Logo />
          <span className="font-serif text-2xl font-medium tracking-tight text-lp-ink">Passboard</span>
        </Link>

        <nav className="hidden gap-10 text-[15px] text-lp-ink-2 md:flex">
          <a className="hover:text-amber" href="#platform">{navLinks.platform}</a>
          <a className="hover:text-amber" href="#exams">{navLinks.exams}</a>
          <a className="hover:text-amber" href="#results">{navLinks.results}</a>
        </nav>

        <div className="flex items-center gap-3 text-[15px] sm:gap-6">
          <Link
            href={lang === "ar" ? "/en" : "/ar"}
            hrefLang={lang === "ar" ? "en" : "ar"}
            className="rounded-full border border-lp-line px-3 py-1.5 text-sm font-medium text-lp-ink-2 hover:border-gold-deep"
          >
            {navLinks.langSwitch}
          </Link>
          <Link className="hidden text-lp-ink-2 hover:text-amber sm:inline" href={localePath(lang, "/login")}>
            {login}
          </Link>
          <Link
            href={localePath(lang, "/request-access")}
            className="hidden h-11 items-center rounded-full border-[1.5px] border-gold-deep px-5 text-[15px] font-medium text-lp-ink transition-colors hover:bg-gold-soft sm:flex"
          >
            {requestAccess}
          </Link>
        </div>
      </Container>
    </header>
  );
}

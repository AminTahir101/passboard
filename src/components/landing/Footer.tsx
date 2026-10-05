import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { localePath } from "@/lib/i18n";
import { Container, Logo } from "./ui";

interface FooterProps {
  lang: string;
  login: string;
  requestAccess: string;
  disclaimer: string;
}

export function Footer({ lang, login, requestAccess, disclaimer }: FooterProps) {
  const privacy = lang === "ar" ? "سياسة الخصوصية" : "Privacy policy";
  const terms = lang === "ar" ? "الشروط والأحكام" : "Terms of service";

  return (
    <footer className="py-14">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <Link href={localePath(lang, "/")} className="flex items-center gap-3" aria-label="Passboard home">
            <Logo size={34} />
            <span className="font-serif text-[22px] font-medium">Passboard</span>
          </Link>
          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <Link className="hover:text-amber" href={localePath(lang, "/login")}>{login}</Link>
            <Link className="hover:text-amber" href={localePath(lang, "/request-access")}>{requestAccess}</Link>
            <Link className="hover:text-amber" href={localePath(lang, "/privacy")}>{privacy}</Link>
            <Link className="hover:text-amber" href={localePath(lang, "/terms")}>{terms}</Link>
          </nav>
        </div>
        <div className="flex flex-col justify-between gap-4 border-t border-lp-line pt-6 text-[13px] leading-relaxed text-lp-muted sm:flex-row sm:gap-16">
          <p className="max-w-[620px]">{disclaimer}</p>
          <span dir="ltr">© {new Date().getFullYear()} Passboard</span>
        </div>
      </Container>
    </footer>
  );
}

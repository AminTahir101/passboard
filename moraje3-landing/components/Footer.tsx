import type { Dictionary } from "@/lib/dictionaries";
import { site } from "@/lib/site";
import { Container, Logo } from "./ui";

export function Footer({ t }: { t: Dictionary["footer"] }) {
  return (
    <footer className="py-14">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Logo size={34} />
            <span className="font-serif text-[22px] font-medium">{site.name}</span>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <a className="hover:text-amber" href={site.loginUrl}>{t.login}</a>
            <a className="hover:text-amber" href={site.requestAccessUrl}>{t.request}</a>
            <a className="hover:text-amber" href={site.privacyUrl}>{t.privacy}</a>
            <a className="hover:text-amber" href={site.termsUrl}>{t.terms}</a>
          </nav>
        </div>
        <div className="flex flex-col justify-between gap-4 border-t border-line pt-6 text-[13px] leading-relaxed text-muted sm:flex-row sm:gap-16">
          <p className="max-w-[620px]">{t.disclaimer}</p>
          <span dir="ltr">© {new Date().getFullYear()} {site.name}</span>
        </div>
      </Container>
    </footer>
  );
}

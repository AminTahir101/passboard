import { getDictionary, localePath } from "@/lib/i18n";
import UnauthorizedClient from "./UnauthorizedClient";

export default async function UnauthorizedPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <UnauthorizedClient
      lang={lang}
      loginPath={localePath(lang, "/login")}
      dashboardPath={localePath(lang, "/dashboard")}
      dict={dict.unauthorized}
    />
  );
}

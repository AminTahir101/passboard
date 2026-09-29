import { getDictionary, localePath } from "@/lib/i18n";
import LoginClient from "./LoginClient";

export default async function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <LoginClient
      lang={lang}
      homePath={localePath(lang, "/")}
      requestAccessPath={localePath(lang, "/request-access")}
      dashboardPath={localePath(lang, "/dashboard")}
      dict={dict.login}
    />
  );
}

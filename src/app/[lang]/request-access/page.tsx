import { getDictionary, localePath } from "@/lib/i18n";
import RequestAccessClient from "./RequestAccessClient";

export default async function RequestAccessPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <RequestAccessClient
      lang={lang}
      homePath={localePath(lang, "/")}
      loginPath={localePath(lang, "/login")}
      dict={dict.requestAccess}
    />
  );
}

import { getDictionary, localePath } from "@/lib/i18n";
import UnauthorizedClient from "./UnauthorizedClient";

export default async function UnauthorizedPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <UnauthorizedClient
      loginPath={localePath(lang, "/login")}
      dashboardPath="/dashboard"
      dict={dict.unauthorized}
    />
  );
}

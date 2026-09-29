import { getDictionary } from "@/lib/i18n";
import ImportClient from "./ImportClient";

export default async function ImportPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return <ImportClient dict={dict.admin.import} lang={lang} />;
}

import { getDictionary } from "@/lib/i18n";
import NewCaseWizard from "./NewCaseWizard";

export default async function NewCasePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return <NewCaseWizard dict={dict.caseLab} lang={lang} />;
}

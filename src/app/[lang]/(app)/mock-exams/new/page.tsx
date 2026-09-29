import { getDictionary } from "@/lib/i18n";
import NewMockExamClient from "./NewMockExamClient";

export default async function NewMockExamPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return <NewMockExamClient dict={dict.mockExamNew} lang={lang} />;
}

import { getDictionary } from "@/lib/i18n";
import MockExamSessionClient from "./MockExamSessionClient";

export default async function MockExamSessionPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const dict = await getDictionary(lang);
  return <MockExamSessionClient dict={dict.mockExamSession} lang={lang} id={id} />;
}

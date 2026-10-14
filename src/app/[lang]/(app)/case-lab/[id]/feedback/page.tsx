import { getDictionary, localePath } from "@/lib/i18n";
import FeedbackClient from "./FeedbackClient";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const dict = await getDictionary(lang);
  return <FeedbackClient caseId={id} dict={dict.caseLab} lang={lang} />;
}

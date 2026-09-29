import { getDictionary } from "@/lib/i18n";
import PracticeSessionClient from "./PracticeSessionClient";

export default async function PracticeSessionPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return <PracticeSessionClient dict={dict.practiceSession} lang={lang} />;
}

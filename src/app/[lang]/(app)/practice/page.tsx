import { getDictionary } from "@/lib/i18n";
import PracticeClient from "./PracticeClient";

export default async function PracticePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return <PracticeClient dict={dict.practice} lang={lang} />;
}

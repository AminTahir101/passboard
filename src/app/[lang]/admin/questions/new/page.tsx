import { QuestionForm } from "@/components/questions/QuestionForm";
import Link from "next/link";
import { getDictionary, localePath } from "@/lib/i18n";

export default async function NewQuestionPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Link href={localePath(lang, "/admin/questions")} className="text-sm hover:underline" style={{ color: "var(--muted-foreground)" }}>
          {dict.admin.questions.title}
        </Link>
        <span style={{ color: "var(--muted-foreground)" }}>/</span>
        <span className="text-sm">{dict.admin.questions.newQuestion}</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{dict.admin.questions.newQuestion}</h1>
      <QuestionForm dict={dict.admin.questionForm} lang={lang} />
    </div>
  );
}

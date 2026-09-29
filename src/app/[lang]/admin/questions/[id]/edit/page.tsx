import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { QuestionForm } from "@/components/questions/QuestionForm";
import Link from "next/link";
import { getDictionary, localePath } from "@/lib/i18n";

export default async function EditQuestionPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  const dict = await getDictionary(lang);
  const admin = createAdminClient();
  const { data: question } = await admin.from("questions").select("*").eq("id", id).single();
  if (!question) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Link href={localePath(lang, "/admin/questions")} className="text-sm hover:underline" style={{ color: "var(--muted-foreground)" }}>
          {dict.admin.questions.title}
        </Link>
        <span style={{ color: "var(--muted-foreground)" }}>/</span>
        <span className="text-sm truncate max-w-xs">{question.question_text.slice(0, 60)}…</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{dict.admin.questionForm.saveChanges}</h1>
      <QuestionForm initialData={question} questionId={id} dict={dict.admin.questionForm} lang={lang} />
    </div>
  );
}

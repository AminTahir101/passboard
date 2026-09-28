import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { QuestionForm } from "@/components/questions/QuestionForm";
import Link from "next/link";

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: question } = await admin.from("questions").select("*").eq("id", id).single();
  if (!question) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Link href="/admin/questions" className="text-sm hover:underline" style={{ color: "var(--muted-foreground)" }}>
          Questions
        </Link>
        <span style={{ color: "var(--muted-foreground)" }}>/</span>
        <span className="text-sm truncate max-w-xs">{question.question_text.slice(0, 60)}…</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Edit Question</h1>
      <QuestionForm initialData={question} questionId={id} />
    </div>
  );
}

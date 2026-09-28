import { QuestionForm } from "@/components/questions/QuestionForm";
import Link from "next/link";

export default function NewQuestionPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Link href="/admin/questions" className="text-sm hover:underline" style={{ color: "var(--muted-foreground)" }}>
          Questions
        </Link>
        <span style={{ color: "var(--muted-foreground)" }}>/</span>
        <span className="text-sm">New Question</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">New Question</h1>
      <QuestionForm />
    </div>
  );
}

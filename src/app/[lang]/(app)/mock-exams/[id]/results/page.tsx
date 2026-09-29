import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, localePath } from "@/lib/i18n";
import type { MockExam } from "@/types/database";
import {
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  BookOpen,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getScoreColor(pct: number): string {
  if (pct >= 70) return "var(--success)";
  if (pct >= 50) return "var(--warning)";
  return "var(--destructive)";
}

function getScoreLabel(pct: number, t: { passed: string; failed: string }): string {
  if (pct >= 70) return t.passed;
  return t.failed;
}

export default async function MockExamResultsPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const dict = await getDictionary(lang);
  const t = dict.mockExamResults;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(localePath(lang, "/login"));

  const { data: examRaw } = await supabase
    .from("mock_exams")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!examRaw) notFound();
  const exam = examRaw as MockExam;

  if (!exam.completed_at) {
    redirect(localePath(lang, `/mock-exams/${id}/session`));
  }

  type AnswerWithQuestion = {
    id: string;
    mock_exam_id: string;
    question_id: string;
    selected_answer: string | null;
    is_correct: boolean | null;
    questions: {
      id: string;
      category: string | null;
      topic: string | null;
      difficulty: string;
    } | null;
  };

  // Fetch answers with question data
  const { data: answersRaw } = await supabase
    .from("mock_answers")
    .select(
      `
      *,
      questions (
        id,
        category,
        topic,
        difficulty
      )
    `
    )
    .eq("mock_exam_id", id);

  const allAnswers = (answersRaw || []) as AnswerWithQuestion[];
  const correctAnswers = allAnswers.filter((a) => a.is_correct === true);
  const incorrectAnswers = allAnswers.filter((a) => a.is_correct === false);
  const skippedAnswers = allAnswers.filter((a) => a.selected_answer === null);

  // Accuracy by category
  const categoryMap = new Map<
    string,
    { correct: number; total: number }
  >();

  for (const answer of allAnswers) {
    const q = answer.questions;
    const cat = q?.category || "Uncategorized";
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, { correct: 0, total: 0 });
    }
    const entry = categoryMap.get(cat)!;
    entry.total++;
    if (answer.is_correct) entry.correct++;
  }

  const categoryStats = Array.from(categoryMap.entries())
    .map(([cat, stats]) => ({
      category: cat,
      ...stats,
      percentage:
        stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const strongest = categoryStats[0];
  const weakest = categoryStats[categoryStats.length - 1];

  const pct = exam.percentage ?? 0;
  const scoreColor = getScoreColor(pct);
  const scoreLabel = getScoreLabel(pct, t);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link
        href={localePath(lang, "/mock-exams")}
        className="inline-flex items-center gap-1.5 text-sm mb-6"
        style={{ color: "var(--muted-foreground)" }}
      >
        <ChevronLeft size={16} />
        {t.backToExams}
      </Link>

      {/* Score hero */}
      <div
        className="rounded-2xl border p-8 text-center mb-6"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <p
          className="text-sm font-medium mb-2"
          style={{ color: "var(--muted-foreground)" }}
        >
          {exam.exam_name || t.title}
        </p>
        <div
          className="text-7xl font-bold mb-2"
          style={{ color: scoreColor }}
        >
          {Math.round(pct)}%
        </div>
        <div
          className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4"
          style={{
            background: `color-mix(in srgb, ${scoreColor} 15%, transparent)`,
            color: scoreColor,
          }}
        >
          {scoreLabel}
        </div>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          {exam.score} {t.correct} / {exam.question_count} {t.totalQuestions}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div
          className="rounded-xl border p-4 text-center"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <CheckCircle2
            size={20}
            className="mx-auto mb-1"
            style={{ color: "var(--success)" }}
          />
          <p className="text-2xl font-bold" style={{ color: "var(--success)" }}>
            {correctAnswers.length}
          </p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {t.correct}
          </p>
        </div>
        <div
          className="rounded-xl border p-4 text-center"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <XCircle
            size={20}
            className="mx-auto mb-1"
            style={{ color: "var(--destructive)" }}
          />
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--destructive)" }}
          >
            {incorrectAnswers.length}
          </p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {t.incorrect}
          </p>
        </div>
        <div
          className="rounded-xl border p-4 text-center"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <BookOpen
            size={20}
            className="mx-auto mb-1"
            style={{ color: "var(--muted-foreground)" }}
          />
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--muted-foreground)" }}
          >
            {skippedAnswers.length}
          </p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {t.unanswered}
          </p>
        </div>
        <div
          className="rounded-xl border p-4 text-center"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <Clock
            size={20}
            className="mx-auto mb-1"
            style={{ color: "var(--muted-foreground)" }}
          />
          <p
            className="text-base font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {formatDuration(exam.duration_seconds)}
          </p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {t.timeTaken}
          </p>
        </div>
      </div>

      {/* Performance by category */}
      {categoryStats.length > 0 && (
        <div
          className="rounded-xl border p-5 mb-6"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} style={{ color: "var(--brand)" }} />
            <h3
              className="font-semibold text-sm"
              style={{ color: "var(--foreground)" }}
            >
              {t.accuracyByCategory}
            </h3>
          </div>

          {strongest && weakest && strongest.category !== weakest.category && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div
                className="rounded-lg px-3 py-2.5"
                style={{
                  background: "color-mix(in srgb, var(--success) 10%, transparent)",
                }}
              >
                <p
                  className="text-xs mb-0.5"
                  style={{ color: "var(--success)" }}
                >
                  {t.strongestTopics}
                </p>
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--foreground)" }}
                >
                  {strongest.category}
                </p>
                <p className="text-xs" style={{ color: "var(--success)" }}>
                  {strongest.percentage}%
                </p>
              </div>
              <div
                className="rounded-lg px-3 py-2.5"
                style={{
                  background:
                    "color-mix(in srgb, var(--destructive) 10%, transparent)",
                }}
              >
                <p
                  className="text-xs mb-0.5"
                  style={{ color: "var(--destructive)" }}
                >
                  {t.weakestTopics}
                </p>
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--foreground)" }}
                >
                  {weakest.category}
                </p>
                <p className="text-xs" style={{ color: "var(--destructive)" }}>
                  {weakest.percentage}%
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {categoryStats.map(({ category, correct, total, percentage }) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-xs truncate"
                    style={{ color: "var(--foreground)" }}
                  >
                    {category}
                  </span>
                  <span
                    className="text-xs shrink-0 ml-2"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {correct}/{total} ({percentage}%)
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--muted)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      background: getScoreColor(percentage),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href={localePath(lang, `/mock-exams/${id}/review`)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium"
          style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
        >
          {t.reviewAnswers}
          <ArrowRight size={16} />
        </Link>
        <Link
          href={localePath(lang, "/mock-exams/new")}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium border"
          style={{
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          {t.newExam}
        </Link>
      </div>
    </div>
  );
}

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, localePath } from "@/lib/i18n";
import type { MockExam } from "@/types/database";
import {
  CheckCircle2,
  XCircle,
  Flag,
  ChevronLeft,
  BookOpen,
  Brain,
} from "lucide-react";

const OPTION_KEYS = ["A", "B", "C", "D"] as const;

function getOptionText(
  q: {
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
  },
  key: string
): string {
  const map: Record<string, string> = {
    A: q.option_a,
    B: q.option_b,
    C: q.option_c,
    D: q.option_d,
  };
  return map[key] || "";
}

export default async function MockExamReviewPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const dict = await getDictionary(lang);
  const t = dict.mockExamReview;

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

  type ExamQuestionWithDetails = {
    position: number;
    flagged: boolean;
    question_id: string;
    questions: {
      id: string;
      question_text: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      correct_answer: string;
      justification: string | null;
      explanation_a: string | null;
      explanation_b: string | null;
      explanation_c: string | null;
      explanation_d: string | null;
      category: string | null;
      topic: string | null;
      difficulty: string;
    } | null;
  };

  // Fetch mock_exam_questions (for flagged state) joined with questions
  const { data: examQuestionsRaw } = await supabase
    .from("mock_exam_questions")
    .select(
      `
      position,
      flagged,
      question_id,
      questions (
        id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        justification,
        explanation_a,
        explanation_b,
        explanation_c,
        explanation_d,
        category,
        topic,
        difficulty
      )
    `
    )
    .eq("mock_exam_id", id)
    .order("position", { ascending: true });

  // Fetch answers for this exam
  const { data: answers } = await supabase
    .from("mock_answers")
    .select("question_id, selected_answer, is_correct")
    .eq("mock_exam_id", id);

  const answerMap = new Map(
    (answers || []).map((a) => [
      a.question_id,
      { selected: a.selected_answer, isCorrect: a.is_correct },
    ])
  );

  const questions = (examQuestionsRaw || []) as ExamQuestionWithDetails[];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href={localePath(lang, `/mock-exams/${id}/results`)}
            className="inline-flex items-center gap-1.5 text-sm mb-2"
            style={{ color: "var(--muted-foreground)" }}
          >
            <ChevronLeft size={16} />
            {t.backToResults}
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            {t.title}
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {exam.exam_name || t.title} · {questions.length} {dict.mockExams.questions}
          </p>
        </div>

        <div className="flex gap-2 text-sm">
          <span
            className="flex items-center gap-1 px-3 py-1.5 rounded-full"
            style={{
              background: "color-mix(in srgb, var(--success) 12%, transparent)",
              color: "var(--success)",
            }}
          >
            <CheckCircle2 size={13} />
            {exam.score} {t.correct}
          </span>
          <span
            className="flex items-center gap-1 px-3 py-1.5 rounded-full"
            style={{
              background:
                "color-mix(in srgb, var(--destructive) 12%, transparent)",
              color: "var(--destructive)",
            }}
          >
            <XCircle size={13} />
            {(exam.question_count || 0) - (exam.score || 0)} {t.incorrect}
          </span>
        </div>
      </div>

      {questions.length === 0 ? (
        <div
          className="rounded-xl border p-10 text-center"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <p style={{ color: "var(--muted-foreground)" }}>
            No questions found for this exam.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((examQ, idx) => {
            const q = examQ.questions;

            const answer = answerMap.get(examQ.question_id);
            const selectedAnswer = answer?.selected || null;
            const isCorrect = answer?.isCorrect;
            const isFlagged = examQ.flagged;
            const wasSkipped = selectedAnswer === null;

            return (
              <div
                key={examQ.question_id}
                className="rounded-xl border overflow-hidden"
                style={{
                  background: "var(--card)",
                  borderColor:
                    isCorrect === true
                      ? "var(--success)"
                      : isCorrect === false
                      ? "var(--destructive)"
                      : "var(--border)",
                  borderWidth: "1.5px",
                }}
              >
                {/* Question header */}
                <div
                  className="flex items-center justify-between px-5 py-3 border-b"
                  style={{
                    borderColor: "var(--border)",
                    background:
                      isCorrect === true
                        ? "color-mix(in srgb, var(--success) 6%, var(--card))"
                        : isCorrect === false
                        ? "color-mix(in srgb, var(--destructive) 6%, var(--card))"
                        : "var(--muted)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    {isCorrect === true ? (
                      <CheckCircle2 size={16} style={{ color: "var(--success)" }} />
                    ) : isCorrect === false ? (
                      <XCircle size={16} style={{ color: "var(--destructive)" }} />
                    ) : (
                      <BookOpen
                        size={16}
                        style={{ color: "var(--muted-foreground)" }}
                      />
                    )}
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color:
                          isCorrect === true
                            ? "var(--success)"
                            : isCorrect === false
                            ? "var(--destructive)"
                            : "var(--muted-foreground)",
                      }}
                    >
                      Q{idx + 1}
                      {wasSkipped
                        ? ` · ${t.unanswered}`
                        : isCorrect === true
                        ? ` · ${t.correct}`
                        : ` · ${t.incorrect}`}
                    </span>
                    {q?.category && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "var(--muted)",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {q.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isFlagged && (
                      <span
                        className="flex items-center gap-1 text-xs"
                        style={{ color: "var(--warning)" }}
                      >
                        <Flag size={12} />
                        {t.flagged}
                      </span>
                    )}
                    <Link
                      href={localePath(lang, `/tutor?questionId=${examQ.question_id}`)}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                      style={{
                        color: "var(--brand)",
                        background:
                          "color-mix(in srgb, var(--brand) 10%, transparent)",
                      }}
                    >
                      <Brain size={12} />
                      {dict.practiceSession.askAI}
                    </Link>
                  </div>
                </div>

                {/* Question content */}
                <div className="px-5 py-4">
                  <p
                    className="text-sm leading-relaxed mb-4"
                    style={{ color: "var(--foreground)" }}
                  >
                    {q?.question_text}
                  </p>

                  {/* Answer options */}
                  <div className="space-y-2 mb-4">
                    {OPTION_KEYS.map((key) => {
                      if (!q) return null;
                      const isCorrectOption = key === q.correct_answer;
                      const isSelectedOption = key === selectedAnswer;
                      const isWrongSelection =
                        isSelectedOption && !isCorrectOption;

                      let bg = "var(--background)";
                      let border = "var(--border)";
                      let color = "var(--muted-foreground)";

                      if (isCorrectOption) {
                        bg = "color-mix(in srgb, var(--success) 10%, var(--card))";
                        border = "var(--success)";
                        color = "var(--success)";
                      } else if (isWrongSelection) {
                        bg = "color-mix(in srgb, var(--destructive) 10%, var(--card))";
                        border = "var(--destructive)";
                        color = "var(--destructive)";
                      }

                      return (
                        <div
                          key={key}
                          className="flex items-start gap-3 px-4 py-3 rounded-lg border"
                          style={{ background: bg, borderColor: border }}
                        >
                          <span
                            className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                            style={{
                              background: isCorrectOption
                                ? "var(--success)"
                                : isWrongSelection
                                ? "var(--destructive)"
                                : "var(--muted)",
                              color: isCorrectOption
                                ? "var(--success-foreground)"
                                : isWrongSelection
                                ? "var(--destructive-foreground)"
                                : "var(--muted-foreground)",
                            }}
                          >
                            {key}
                          </span>
                          <span
                            className="text-sm leading-relaxed"
                            style={{ color }}
                          >
                            {getOptionText(q, key)}
                            {isCorrectOption && (
                              <span
                                className="ml-2 text-xs font-semibold"
                                style={{ color: "var(--success)" }}
                              >
                                ✓ {t.correctAnswer}
                              </span>
                            )}
                            {isWrongSelection && (
                              <span
                                className="ml-2 text-xs font-semibold"
                                style={{ color: "var(--destructive)" }}
                              >
                                ✗ {t.yourAnswer}
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Justification */}
                  {q?.justification && (
                    <div
                      className="rounded-lg p-4 border-l-4"
                      style={{
                        background: "var(--muted)",
                        borderLeftColor: "var(--brand)",
                      }}
                    >
                      <p
                        className="text-xs font-semibold mb-1"
                        style={{ color: "var(--brand)" }}
                      >
                        {t.justification}
                      </p>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--foreground)" }}
                      >
                        {q.justification}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex gap-3 mt-8">
        <Link
          href={localePath(lang, `/mock-exams/${id}/results`)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium border"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <ChevronLeft size={16} />
          {t.backToResults}
        </Link>
        <Link
          href={localePath(lang, "/mock-exams/new")}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium"
          style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
        >
          {dict.mockExamResults.newExam}
        </Link>
      </div>
    </div>
  );
}

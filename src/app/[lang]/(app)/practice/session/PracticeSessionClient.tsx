"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { localePath } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import {
  CheckCircle2,
  XCircle,
  Brain,
  ChevronRight,
  Loader2,
  Trophy,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import type { Question, CorrectAnswer } from "@/types/database";

type SessionQuestion = Pick<
  Question,
  | "id"
  | "question_text"
  | "option_a"
  | "option_b"
  | "option_c"
  | "option_d"
  | "correct_answer"
  | "justification"
  | "explanation_a"
  | "explanation_b"
  | "explanation_c"
  | "explanation_d"
  | "category"
  | "topic"
  | "difficulty"
>;

const OPTION_LABELS: CorrectAnswer[] = ["A", "B", "C", "D"];

function getOptionText(q: SessionQuestion, opt: CorrectAnswer): string {
  const map: Record<CorrectAnswer, string> = {
    A: q.option_a,
    B: q.option_b,
    C: q.option_c,
    D: q.option_d,
  };
  return map[opt];
}

function getOptionExplanation(q: SessionQuestion, opt: CorrectAnswer): string | null {
  const map: Record<CorrectAnswer, string | null> = {
    A: q.explanation_a,
    B: q.explanation_b,
    C: q.explanation_c,
    D: q.explanation_d,
  };
  return map[opt];
}

interface PracticeSessionClientProps {
  dict: Dictionary["practiceSession"];
  lang: string;
}

function PracticeSession({ dict, lang }: PracticeSessionClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = searchParams.get("mode") ?? "random";
  const count = parseInt(searchParams.get("count") ?? "20", 10);
  const category = searchParams.get("category");
  const topic = searchParams.get("topic");

  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<CorrectAnswer | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [results, setResults] = useState<{ correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qparams = new URLSearchParams({ mode, count: count.toString() });
      if (category) qparams.set("category", category);
      if (topic) qparams.set("topic", topic);

      const res = await fetch(`/api/practice/questions?${qparams}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to load questions");
      }
      const data = await res.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions found for this selection. Try a different mode.");
      }
      setQuestions(data.questions);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [mode, count, category, topic]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  async function handleSubmit() {
    if (!selectedAnswer || !questions[currentIndex]) return;
    setSubmitting(true);

    const q = questions[currentIndex];
    try {
      const res = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: q.id,
          selected_answer: selectedAnswer,
        }),
      });
      const data = await res.json();
      setIsCorrect(data.is_correct);
      setSubmitted(true);
      setResults((prev) => [...prev, { correct: data.is_correct }]);
    } catch {
      // Optimistically determine correctness client-side
      const correct = selectedAnswer === q.correct_answer;
      setIsCorrect(correct);
      setSubmitted(true);
      setResults((prev) => [...prev, { correct }]);
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (currentIndex >= questions.length - 1) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
      setIsCorrect(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--brand)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-4">
        <XCircle size={48} className="mx-auto" style={{ color: "var(--destructive)" }} />
        <p className="font-semibold" style={{ color: "var(--foreground)" }}>
          {error}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={fetchQuestions}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
          >
            {lang === "ar" ? "حاول مجدداً" : "Try Again"}
          </button>
          <Link
            href={localePath(lang, "/practice")}
            className="px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            {lang === "ar" ? "العودة للتدريب" : "Back to Practice"}
          </Link>
        </div>
      </div>
    );
  }

  if (finished) {
    const totalCorrect = results.filter((r) => r.correct).length;
    const totalIncorrect = results.length - totalCorrect;
    const accuracy = Math.round((totalCorrect / results.length) * 100);

    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ background: accuracy >= 70 ? "rgba(22,163,74,0.1)" : "rgba(239,68,68,0.1)" }}
        >
          <Trophy
            size={36}
            style={{ color: accuracy >= 70 ? "var(--success)" : "var(--destructive)" }}
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            {dict.sessionComplete}
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {lang === "ar" ? "إليك نتائجك" : "Here's how you did"}
          </p>
        </div>
        <div
          className="rounded-xl border p-6 space-y-3"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex justify-between text-sm">
            <span style={{ color: "var(--muted-foreground)" }}>{dict.totalQuestions}</span>
            <span className="font-semibold" style={{ color: "var(--foreground)" }}>
              {results.length}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: "var(--muted-foreground)" }}>{dict.correctAnswers}</span>
            <span className="font-semibold" style={{ color: "var(--success)" }}>
              {totalCorrect}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: "var(--muted-foreground)" }}>{lang === "ar" ? "خاطئ" : "Incorrect"}</span>
            <span className="font-semibold" style={{ color: "var(--destructive)" }}>
              {totalIncorrect}
            </span>
          </div>
          <div
            className="border-t pt-3 flex justify-between text-sm"
            style={{ borderColor: "var(--border)" }}
          >
            <span style={{ color: "var(--muted-foreground)" }}>{dict.accuracy}</span>
            <span
              className="font-bold text-lg"
              style={{
                color:
                  accuracy >= 70
                    ? "var(--success)"
                    : accuracy >= 50
                    ? "var(--warning)"
                    : "var(--destructive)",
              }}
            >
              {accuracy}%
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={localePath(lang, "/practice")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <ArrowLeft size={16} />
            {lang === "ar" ? "رجوع" : "Back"}
          </Link>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setSelectedAnswer(null);
              setSubmitted(false);
              setIsCorrect(null);
              setResults([]);
              setFinished(false);
              fetchQuestions();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
            style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
          >
            <RotateCcw size={16} />
            {dict.practiceAgain}
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  if (!question) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <Link
          href={localePath(lang, "/practice")}
          className="flex items-center gap-1 text-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          <ArrowLeft size={15} />
          {lang === "ar" ? "خروج" : "Exit"}
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full" style={{ background: "var(--border)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${((currentIndex + (submitted ? 1 : 0)) / questions.length) * 100}%`,
            background: "var(--brand)",
          }}
        />
      </div>

      {/* Question metadata */}
      <div className="flex items-center gap-2 flex-wrap">
        {question.category && (
          <span
            className="text-xs px-2.5 py-1 rounded-full border"
            style={{
              borderColor: "var(--border)",
              color: "var(--muted-foreground)",
              background: "var(--muted)",
            }}
          >
            {question.category}
          </span>
        )}
        {question.topic && (
          <span
            className="text-xs px-2.5 py-1 rounded-full border"
            style={{
              borderColor: "var(--border)",
              color: "var(--muted-foreground)",
              background: "var(--muted)",
            }}
          >
            {question.topic}
          </span>
        )}
        {question.difficulty && (
          <span
            className="text-xs px-2.5 py-1 rounded-full border font-medium"
            style={{
              borderColor: "var(--border)",
              background:
                question.difficulty === "easy"
                  ? "rgba(22,163,74,0.1)"
                  : question.difficulty === "medium"
                  ? "rgba(217,119,6,0.1)"
                  : "rgba(239,68,68,0.1)",
              color:
                question.difficulty === "easy"
                  ? "var(--success)"
                  : question.difficulty === "medium"
                  ? "var(--warning)"
                  : "var(--destructive)",
            }}
          >
            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
          </span>
        )}
      </div>

      {/* Question */}
      <div
        className="rounded-xl border p-6"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <p className="text-base leading-relaxed" style={{ color: "var(--foreground)" }}>
          {question.question_text}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {OPTION_LABELS.map((opt) => {
          const optText = getOptionText(question, opt);
          const isSelected = selectedAnswer === opt;
          const isCorrectOpt = opt === question.correct_answer;

          let borderColor = "var(--border)";
          let bgColor = "var(--card)";
          let textColor = "var(--foreground)";

          if (submitted) {
            if (isCorrectOpt) {
              borderColor = "var(--success)";
              bgColor = "rgba(22,163,74,0.08)";
              textColor = "var(--foreground)";
            } else if (isSelected && !isCorrectOpt) {
              borderColor = "var(--destructive)";
              bgColor = "rgba(239,68,68,0.08)";
            }
          } else if (isSelected) {
            borderColor = "var(--brand)";
            bgColor = "rgba(37,99,235,0.05)";
          }

          return (
            <button
              key={opt}
              disabled={submitted}
              onClick={() => !submitted && setSelectedAnswer(opt)}
              className="w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all disabled:cursor-default"
              style={{ borderColor, background: bgColor }}
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: isSelected || (submitted && isCorrectOpt) ? "var(--brand)" : "var(--muted)",
                  color:
                    isSelected || (submitted && isCorrectOpt)
                      ? "var(--brand-foreground)"
                      : "var(--muted-foreground)",
                }}
              >
                {opt}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm" style={{ color: textColor }}>
                  {optText}
                </span>
                {submitted && getOptionExplanation(question, opt) && (
                  <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>
                    {getOptionExplanation(question, opt)}
                  </p>
                )}
              </div>
              {submitted && isCorrectOpt && (
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
              )}
              {submitted && isSelected && !isCorrectOpt && (
                <XCircle size={18} className="shrink-0 mt-0.5" style={{ color: "var(--destructive)" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Result + justification */}
      {submitted && (
        <div
          className="rounded-xl border p-4 space-y-2"
          style={{
            borderColor: isCorrect ? "var(--success)" : "var(--destructive)",
            background: isCorrect ? "rgba(22,163,74,0.05)" : "rgba(239,68,68,0.05)",
          }}
        >
          <p
            className="font-semibold text-sm flex items-center gap-2"
            style={{ color: isCorrect ? "var(--success)" : "var(--destructive)" }}
          >
            {isCorrect ? (
              <CheckCircle2 size={16} />
            ) : (
              <XCircle size={16} />
            )}
            {isCorrect
              ? dict.correctBanner
              : `${dict.incorrectBanner} — ${lang === "ar" ? "الإجابة الصحيحة هي" : "Answer is"} ${question.correct_answer}`}
          </p>
          {question.justification && (
            <p className="text-sm" style={{ color: "var(--foreground)" }}>
              {question.justification}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!submitted ? (
          <button
            disabled={!selectedAnswer || submitting}
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : null}
            {dict.submitAnswer}
          </button>
        ) : (
          <>
            <Link
              href={localePath(lang, `/tutor?questionId=${question.id}`)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <Brain size={16} />
              {dict.askAI}
            </Link>
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
              style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
            >
              {currentIndex >= questions.length - 1 ? dict.finish : dict.next}
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PracticeSessionClient({ dict, lang }: PracticeSessionClientProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--brand)" }} />
        </div>
      }
    >
      <PracticeSession dict={dict} lang={lang} />
    </Suspense>
  );
}

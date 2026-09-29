"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Flag,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  AlertCircle,
  Grid3X3,
  X,
} from "lucide-react";
import { localePath } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

interface Props {
  dict: Dictionary["mockExamSession"];
  lang: string;
  id: string;
}

interface QuestionData {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  category: string | null;
  topic: string | null;
  difficulty: string;
}

interface ExamQuestion {
  id: string;
  position: number;
  flagged: boolean;
  question_id: string;
  questions: QuestionData;
}

interface ExamInfo {
  id: string;
  completed_at: string | null;
  question_count: number;
}

type AnswerMap = Record<string, string | null>;
type FlagMap = Record<string, boolean>;

const OPTION_KEYS = ["A", "B", "C", "D"] as const;

function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getOptionText(q: QuestionData, key: string): string {
  const map: Record<string, string> = {
    A: q.option_a,
    B: q.option_b,
    C: q.option_c,
    D: q.option_d,
  };
  return map[key] || "";
}

export default function MockExamSessionClient({ dict, lang, id }: Props) {
  const examId = id;
  const router = useRouter();

  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [flags, setFlags] = useState<FlagMap>({});
  const [timer, setTimer] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load questions
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/mock-exams/${examId}/questions`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to load exam");
          return;
        }
        const data = await res.json();

        if (data.exam?.completed_at) {
          router.replace(localePath(lang, `/mock-exams/${examId}/results`));
          return;
        }

        setExam(data.exam);
        setQuestions(data.questions || []);

        // Init flags from saved state
        const initialFlags: FlagMap = {};
        for (const q of data.questions || []) {
          initialFlags[q.question_id] = q.flagged;
        }
        setFlags(initialFlags);
      } catch {
        setError("Failed to load exam questions");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [examId, router, lang]);

  // Timer
  useEffect(() => {
    if (loading || error) return;
    timerRef.current = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, error]);

  const currentQuestion = questions[currentIndex];
  const currentQuestionId = currentQuestion?.question_id;

  function selectAnswer(key: string) {
    if (!currentQuestionId) return;
    setAnswers((prev) => ({ ...prev, [currentQuestionId]: key }));
  }

  function toggleFlag() {
    if (!currentQuestionId) return;
    setFlags((prev) => ({
      ...prev,
      [currentQuestionId]: !prev[currentQuestionId],
    }));
  }

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const answersPayload = questions.map((q) => ({
      questionId: q.question_id,
      selectedAnswer: answers[q.question_id] || null,
    }));

    try {
      const res = await fetch(`/api/mock-exams/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersPayload,
          durationSeconds: timer,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to submit exam");
        setSubmitting(false);
        return;
      }

      router.push(localePath(lang, `/mock-exams/${examId}/results`));
    } catch {
      alert("Failed to submit exam. Please try again.");
      setSubmitting(false);
    }
  }, [questions, answers, examId, router, timer, lang]);

  const answeredCount = Object.values(answers).filter(
    (a) => a !== null && a !== undefined
  ).length;
  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = Object.values(flags).filter(Boolean).length;

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-[60vh]"
        style={{ color: "var(--muted-foreground)" }}
      >
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <AlertCircle size={32} style={{ color: "var(--destructive)" }} />
        <p style={{ color: "var(--foreground)" }}>{error}</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <p style={{ color: "var(--muted-foreground)" }}>No questions found.</p>
      </div>
    );
  }

  const q = currentQuestion.questions;

  return (
    <div
      className="flex flex-col h-full -m-6"
      style={{ background: "var(--background)" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--foreground)" }}
          >
            {dict.questionOf.replace("{current}", String(currentIndex + 1)).replace("{total}", String(questions.length))}
          </span>
          {q.category && (
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

        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 text-sm font-mono"
            style={{ color: "var(--foreground)" }}
          >
            <Clock size={15} style={{ color: "var(--muted-foreground)" }} />
            {formatTimer(timer)}
          </div>

          <button
            onClick={() => setShowNavigator(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors"
            style={{
              borderColor: "var(--border)",
              color: "var(--muted-foreground)",
            }}
          >
            <Grid3X3 size={13} />
            Navigator
          </button>

          <button
            onClick={() => setShowSubmitDialog(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: "var(--brand)",
              color: "var(--brand-foreground)",
            }}
          >
            {dict.submit}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-1 shrink-0"
        style={{ background: "var(--muted)" }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            background: "var(--brand)",
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Question text */}
          <div
            className="rounded-xl border p-6 mb-6"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <p
              className="text-base leading-relaxed"
              style={{ color: "var(--foreground)" }}
            >
              {q.question_text}
            </p>
          </div>

          {/* Answer options */}
          <div className="space-y-3">
            {OPTION_KEYS.map((key) => {
              const isSelected = answers[currentQuestionId] === key;
              return (
                <button
                  key={key}
                  onClick={() => selectAnswer(key)}
                  className="w-full text-left flex items-start gap-3 px-5 py-4 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: isSelected ? "var(--brand)" : "var(--border)",
                    background: isSelected
                      ? "color-mix(in srgb, var(--brand) 8%, var(--card))"
                      : "var(--card)",
                    color: "var(--foreground)",
                  }}
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{
                      background: isSelected ? "var(--brand)" : "var(--muted)",
                      color: isSelected
                        ? "var(--brand-foreground)"
                        : "var(--muted-foreground)",
                    }}
                  >
                    {key}
                  </span>
                  <span className="text-sm leading-relaxed pt-0.5">
                    {getOptionText(q, key)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div
        className="shrink-0 px-4 py-3 border-t flex items-center justify-between"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-colors disabled:opacity-40"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <ChevronLeft size={16} />
          {dict.previous}
        </button>

        <button
          onClick={toggleFlag}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-colors"
          style={{
            borderColor: flags[currentQuestionId]
              ? "var(--warning)"
              : "var(--border)",
            background: flags[currentQuestionId]
              ? "color-mix(in srgb, var(--warning) 10%, transparent)"
              : "transparent",
            color: flags[currentQuestionId]
              ? "var(--warning)"
              : "var(--muted-foreground)",
          }}
        >
          <Flag size={15} />
          {flags[currentQuestionId] ? dict.flagged : dict.flag}
        </button>

        <button
          onClick={() =>
            setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
          }
          disabled={currentIndex === questions.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-colors disabled:opacity-40"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          {dict.next}
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Question Navigator Overlay */}
      {showNavigator && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setShowNavigator(false)}
          />
          <div
            className="fixed right-0 top-0 bottom-0 z-50 w-80 flex flex-col shadow-2xl"
            style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}
          >
            <div
              className="flex items-center justify-between px-4 py-4 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <h3
                className="font-semibold text-sm"
                style={{ color: "var(--foreground)" }}
              >
                Navigator
              </h3>
              <button
                onClick={() => setShowNavigator(false)}
                style={{ color: "var(--muted-foreground)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex gap-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
                <span>{answeredCount} answered</span>
                <span>{unansweredCount} {dict.unansweredWarning}</span>
                <span>{flaggedCount} {dict.flagged}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-5 gap-2">
                {questions.map((examQ, idx) => {
                  const qId = examQ.question_id;
                  const isAnswered = !!answers[qId];
                  const isFlagged = !!flags[qId];
                  const isCurrent = idx === currentIndex;

                  return (
                    <button
                      key={qId}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowNavigator(false);
                      }}
                      className="w-full aspect-square rounded-lg text-xs font-semibold flex items-center justify-center border-2 transition-all relative"
                      style={{
                        borderColor: isCurrent
                          ? "var(--brand)"
                          : isFlagged
                          ? "var(--warning)"
                          : "var(--border)",
                        background: isCurrent
                          ? "var(--brand)"
                          : isAnswered
                          ? "color-mix(in srgb, var(--success) 15%, var(--card))"
                          : "var(--card)",
                        color: isCurrent
                          ? "var(--brand-foreground)"
                          : isAnswered
                          ? "var(--success)"
                          : "var(--muted-foreground)",
                      }}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span
                          className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
                          style={{ background: "var(--warning)" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => {
                  setShowNavigator(false);
                  setShowSubmitDialog(true);
                }}
                className="w-full py-2.5 rounded-lg text-sm font-medium"
                style={{
                  background: "var(--brand)",
                  color: "var(--brand-foreground)",
                }}
              >
                {dict.submit}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Submit Confirmation Dialog */}
      {showSubmitDialog && (
        <>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div
              className="rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--foreground)" }}
              >
                {dict.confirmTitle}
              </h3>
              <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
                {dict.confirmMessage}
              </p>

              <div
                className="rounded-lg p-4 mb-5 space-y-1 text-sm"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
              >
                <div className="flex justify-between">
                  <span>Answered</span>
                  <span style={{ color: "var(--foreground)", fontWeight: 500 }}>
                    {answeredCount} / {questions.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{dict.unansweredWarning}</span>
                  <span
                    style={{
                      color:
                        unansweredCount > 0
                          ? "var(--destructive)"
                          : "var(--foreground)",
                      fontWeight: 500,
                    }}
                  >
                    {unansweredCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{dict.flagged}</span>
                  <span style={{ color: "var(--foreground)", fontWeight: 500 }}>
                    {flaggedCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{dict.timeRemaining}</span>
                  <span style={{ color: "var(--foreground)", fontWeight: 500 }}>
                    {formatTimer(timer)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitDialog(false)}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  {dict.cancel}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60"
                  style={{
                    background: "var(--brand)",
                    color: "var(--brand-foreground)",
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      {dict.submit}…
                    </>
                  ) : (
                    dict.submit
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

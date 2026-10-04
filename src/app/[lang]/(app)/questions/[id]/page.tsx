import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, localePath } from "@/lib/i18n";
import { CheckCircle2, XCircle, Brain, ArrowLeft, Clock } from "lucide-react";
import type { CorrectAnswer } from "@/types/database";
import QuestionAnswerClient from "./QuestionAnswerClient";

const OPTION_LABELS: CorrectAnswer[] = ["A", "B", "C", "D"];

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const dict = await getDictionary(lang);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(localePath(lang, "/login"));

  const { data: question } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (!question) notFound();

  // Fetch user's most recent attempt
  const { data: attempts } = await supabase
    .from("question_attempts")
    .select("selected_answer, is_correct, attempted_at")
    .eq("user_id", user.id)
    .eq("question_id", id)
    .order("attempted_at", { ascending: false })
    .limit(1);

  const lastAttempt = attempts?.[0] ?? null;

  const options: { label: CorrectAnswer; text: string; explanation: string | null }[] = [
    { label: "A", text: question.option_a, explanation: question.explanation_a },
    { label: "B", text: question.option_b, explanation: question.explanation_b },
    { label: "C", text: question.option_c, explanation: question.explanation_c },
    { label: "D", text: question.option_d, explanation: question.explanation_d },
  ];

  const diffColors: Record<string, { bg: string; color: string }> = {
    easy: { bg: "rgba(22,163,74,0.1)", color: "var(--success)" },
    medium: { bg: "rgba(217,119,6,0.1)", color: "var(--warning)" },
    hard: { bg: "rgba(239,68,68,0.1)", color: "var(--destructive)" },
  };
  const diffStyle = diffColors[question.difficulty] ?? diffColors.medium;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Back */}
      <Link
        href={localePath(lang, "/questions")}
        className="inline-flex items-center gap-1.5 text-sm"
        style={{ color: "var(--muted-foreground)" }}
      >
        <ArrowLeft size={15} />
        {dict.questionBank.title}
      </Link>

      {/* Metadata */}
      <div className="flex items-center gap-2 flex-wrap">
        {question.category && (
          <span
            className="text-xs px-2.5 py-1 rounded-full border"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", background: "var(--muted)" }}
          >
            {question.category}
          </span>
        )}
        {question.topic && (
          <span
            className="text-xs px-2.5 py-1 rounded-full border"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", background: "var(--muted)" }}
          >
            {question.topic}
          </span>
        )}
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: diffStyle.bg, color: diffStyle.color }}
        >
          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
        </span>
        {lastAttempt && (
          <span
            className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
            style={{
              background: lastAttempt.is_correct ? "rgba(22,163,74,0.1)" : "rgba(239,68,68,0.1)",
              color: lastAttempt.is_correct ? "var(--success)" : "var(--destructive)",
            }}
          >
            {lastAttempt.is_correct ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
            {lastAttempt.is_correct ? dict.common.correct : dict.common.incorrect}
          </span>
        )}
      </div>

      {/* Previous attempt notice */}
      {lastAttempt && (
        <div
          className="rounded-lg border p-3 flex items-center gap-2 text-sm"
          style={{
            borderColor: "var(--border)",
            background: "var(--muted)",
            color: "var(--muted-foreground)",
          }}
        >
          <Clock size={14} />
          {dict.questionBank.answeredOn} {new Date(lastAttempt.attempted_at).toLocaleDateString()} — {dict.questionBank.yourAnswer}{" "}
          <strong style={{ color: "var(--foreground)" }}>{lastAttempt.selected_answer}</strong>
        </div>
      )}

      {/* Question */}
      <div
        className="rounded-xl border p-6"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <p className="text-base leading-relaxed" style={{ color: "var(--foreground)" }}>
          {question.question_text}
        </p>
      </div>

      {/* Options — interactive if unanswered, static if already attempted */}
      {!lastAttempt ? (
        <QuestionAnswerClient
          questionId={question.id}
          options={options}
          correctAnswer={question.correct_answer}
          justification={question.justification}
          lang={lang}
        />
      ) : (
        <>
          <div className="space-y-2.5">
            {options.map(({ label, text, explanation }) => {
              const isCorrect = label === question.correct_answer;
              const isSelected = lastAttempt.selected_answer === label;
              let borderColor = "var(--border)";
              let bgColor = "var(--card)";
              if (isCorrect) { borderColor = "var(--success)"; bgColor = "rgba(22,163,74,0.06)"; }
              else if (isSelected) { borderColor = "var(--destructive)"; bgColor = "rgba(239,68,68,0.06)"; }
              return (
                <div key={label} className="flex items-start gap-4 p-4 rounded-xl border" style={{ borderColor, background: bgColor }}>
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: isCorrect ? "var(--success)" : "var(--muted)", color: isCorrect ? "white" : "var(--muted-foreground)" }}>
                    {label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm" style={{ color: "var(--foreground)" }}>{text}</span>
                    {explanation && <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>{explanation}</p>}
                  </div>
                  {isCorrect && <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: "var(--success)" }} />}
                  {isSelected && !isCorrect && <XCircle size={18} className="shrink-0 mt-0.5" style={{ color: "var(--destructive)" }} />}
                </div>
              );
            })}
          </div>

          {question.justification && (
            <div className="rounded-xl border p-4" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>
                {lang === "ar" ? "الشرح" : "Explanation"}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{question.justification}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href={localePath(lang, "/practice/session?mode=random&count=10")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              {lang === "ar" ? "تدرب على مشابه" : "Practice Similar"}
            </Link>
            <Link
              href={localePath(lang, `/tutor?questionId=${question.id}`)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
              style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
            >
              <Brain size={16} />
              {dict.practiceSession.askAI}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

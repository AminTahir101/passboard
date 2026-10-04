"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Brain } from "lucide-react";
import Link from "next/link";
import { localePath } from "@/lib/i18n";
import type { CorrectAnswer } from "@/types/database";

interface Option {
  label: CorrectAnswer;
  text: string;
  explanation: string | null;
}

interface Props {
  questionId: string;
  options: Option[];
  correctAnswer: CorrectAnswer;
  justification: string | null;
  lang: string;
}

export default function QuestionAnswerClient({ questionId, options, correctAnswer, justification, lang }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<CorrectAnswer | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: questionId, selected_answer: selected }),
      });
      const data = await res.json();
      setIsCorrect(data.is_correct ?? selected === correctAnswer);
    } catch {
      setIsCorrect(selected === correctAnswer);
    } finally {
      setSubmitted(true);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-2.5">
      {options.map(({ label, text, explanation }) => {
        const isCorrectOpt = label === correctAnswer;
        const isSelected = selected === label;

        let borderColor = "var(--border)";
        let bgColor = "var(--card)";

        if (submitted) {
          if (isCorrectOpt) { borderColor = "var(--success)"; bgColor = "rgba(22,163,74,0.06)"; }
          else if (isSelected) { borderColor = "var(--destructive)"; bgColor = "rgba(239,68,68,0.06)"; }
        } else if (isSelected) {
          borderColor = "var(--brand)";
          bgColor = "rgba(37,99,235,0.05)";
        }

        return (
          <button
            key={label}
            disabled={submitted}
            onClick={() => !submitted && setSelected(label)}
            className="w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all disabled:cursor-default"
            style={{ borderColor, background: bgColor }}
          >
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                background: submitted && isCorrectOpt ? "var(--success)" : isSelected && !submitted ? "var(--brand)" : "var(--muted)",
                color: (submitted && isCorrectOpt) || (isSelected && !submitted) ? "white" : "var(--muted-foreground)",
              }}
            >
              {label}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-sm" style={{ color: "var(--foreground)" }}>{text}</span>
              {submitted && explanation && (
                <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>{explanation}</p>
              )}
            </div>
            {submitted && isCorrectOpt && <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: "var(--success)" }} />}
            {submitted && isSelected && !isCorrectOpt && <XCircle size={18} className="shrink-0 mt-0.5" style={{ color: "var(--destructive)" }} />}
          </button>
        );
      })}

      {/* Result banner */}
      {submitted && (
        <div
          className="rounded-xl border p-4 space-y-1.5"
          style={{
            borderColor: isCorrect ? "var(--success)" : "var(--destructive)",
            background: isCorrect ? "rgba(22,163,74,0.05)" : "rgba(239,68,68,0.05)",
          }}
        >
          <p className="font-semibold text-sm flex items-center gap-2" style={{ color: isCorrect ? "var(--success)" : "var(--destructive)" }}>
            {isCorrect ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
            {isCorrect
              ? (lang === "ar" ? "إجابة صحيحة!" : "Correct!")
              : `${lang === "ar" ? "إجابة خاطئة" : "Incorrect"} — ${lang === "ar" ? "الصحيحة:" : "Answer:"} ${correctAnswer}`}
          </p>
          {justification && (
            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{justification}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        {!submitted ? (
          <button
            disabled={!selected || submitting}
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
            style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            {lang === "ar" ? "تأكيد الإجابة" : "Submit Answer"}
          </button>
        ) : (
          <>
            <Link
              href={localePath(lang, `/tutor?questionId=${questionId}`)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <Brain size={15} />
              {lang === "ar" ? "اسأل الذكاء الاصطناعي" : "Ask AI"}
            </Link>
            <button
              onClick={() => router.refresh()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              {lang === "ar" ? "تحديث" : "View Result"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

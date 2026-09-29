"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ClipboardList, Loader2 } from "lucide-react";
import { localePath } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

interface Props {
  dict: Dictionary["mockExamNew"];
  lang: string;
}

const EXAM_OPTIONS_VALUES = [
  "",
  "USMLE Step 1",
  "USMLE Step 2 CK",
  "USMLE Step 3",
  "MCCQE Part 1",
  "MCCQE Part 2",
  "PLAB 1",
  "PLAB 2",
  "AMC MCQ",
];

export default function NewMockExamClient({ dict, lang }: Props) {
  const router = useRouter();
  const [examName, setExamName] = useState("");
  const [questionCount, setQuestionCount] = useState<50 | 100>(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const examOptions = [
    { value: "", label: dict.allExams },
    { value: "USMLE Step 1", label: "USMLE Step 1" },
    { value: "USMLE Step 2 CK", label: "USMLE Step 2 CK" },
    { value: "USMLE Step 3", label: "USMLE Step 3" },
    { value: "MCCQE Part 1", label: "MCCQE Part 1" },
    { value: "MCCQE Part 2", label: "MCCQE Part 2" },
    { value: "PLAB 1", label: "PLAB 1" },
    { value: "PLAB 2", label: "PLAB 2" },
    { value: "AMC MCQ", label: "AMC MCQ" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/mock-exams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examName, questionCount }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create exam");
        return;
      }

      router.push(localePath(lang, `/mock-exams/${data.mockExamId}/session`));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Back */}
      <Link
        href={localePath(lang, "/mock-exams")}
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: "var(--muted-foreground)" }}
      >
        <ChevronLeft size={16} />
        {dict.title}
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--brand)" }}
        >
          <ClipboardList size={20} style={{ color: "var(--brand-foreground)" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            {dict.title}
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {dict.subtitle}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          className="rounded-xl border p-6 space-y-6"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Exam type */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--foreground)" }}
            >
              {dict.examType}
            </label>
            <select
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors"
              style={{
                borderColor: "var(--border)",
                background: "var(--background)",
                color: "var(--foreground)",
              }}
            >
              {examOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>
              {dict.selectExam}
            </p>
          </div>

          {/* Question count */}
          <div>
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: "var(--foreground)" }}
            >
              {dict.questionCount}
            </label>
            <div className="flex gap-3">
              {([50, 100] as const).map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className="flex-1 flex flex-col items-center gap-1 py-4 px-4 rounded-xl border-2 transition-colors"
                  style={{
                    borderColor:
                      questionCount === count
                        ? "var(--brand)"
                        : "var(--border)",
                    background:
                      questionCount === count
                        ? "color-mix(in srgb, var(--brand) 8%, transparent)"
                        : "var(--background)",
                    color:
                      questionCount === count
                        ? "var(--brand)"
                        : "var(--muted-foreground)",
                  }}
                >
                  <span className="text-2xl font-bold">{count}</span>
                  <span className="text-xs">{count === 50 ? dict.q50 : dict.q100}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm" style={{ color: "var(--destructive)" }}>
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors disabled:opacity-60"
          style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
        >
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              {dict.start}…
            </>
          ) : (
            <>
              <ClipboardList size={17} />
              {dict.start}
            </>
          )}
        </button>
      </form>
    </div>
  );
}

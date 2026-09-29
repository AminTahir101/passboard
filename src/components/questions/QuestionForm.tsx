"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Question } from "@/types/database";
import type { Dictionary } from "@/lib/i18n";
import { localePath } from "@/lib/i18n";

type QuestionFormData = Omit<Question, "id" | "created_at" | "updated_at">;

interface QuestionFormProps {
  initialData?: Partial<QuestionFormData>;
  questionId?: string;
  dict: Dictionary["admin"]["questionForm"];
  lang?: string;
}

const CORRECT_ANSWERS = ["A", "B", "C", "D"] as const;
const DIFFICULTIES = ["easy", "medium", "hard"] as const;
const STATUSES = ["draft", "published", "archived"] as const;

export function QuestionForm({ initialData, questionId, dict, lang }: QuestionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<QuestionFormData>>({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A",
    justification: "",
    explanation_a: "",
    explanation_b: "",
    explanation_c: "",
    explanation_d: "",
    exam: "",
    category: "",
    topic: "",
    subtopic: "",
    difficulty: "medium",
    year: undefined,
    source: "",
    status: "draft",
    ...initialData,
  });

  function set(key: keyof QuestionFormData, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = questionId ? `/api/admin/questions/${questionId}` : "/api/admin/questions";
      const method = questionId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save question");
        return;
      }

      const questionsPath = lang ? localePath(lang, "/admin/questions") : "/admin/questions";
      router.push(questionsPath);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: "var(--background)",
    borderColor: "var(--border)",
    color: "var(--foreground)",
  };

  const labelClass = "block text-sm font-medium mb-1.5";
  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border outline-none";
  const textareaClass = "w-full px-3 py-2 text-sm rounded-lg border outline-none resize-none";

  const questionsPath = lang ? localePath(lang, "/admin/questions") : "/admin/questions";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
        >
          {error}
        </div>
      )}

      {/* Main question */}
      <div className="rounded-xl border p-6 space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <h2 className="font-semibold">{dict.questionText}</h2>
        <div>
          <label className={labelClass}>{dict.questionText} *</label>
          <textarea
            value={form.question_text ?? ""}
            onChange={(e) => set("question_text", e.target.value)}
            required
            rows={4}
            className={textareaClass}
            style={inputStyle}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {([
            { opt: "a" as const, label: dict.optionA },
            { opt: "b" as const, label: dict.optionB },
            { opt: "c" as const, label: dict.optionC },
            { opt: "d" as const, label: dict.optionD },
          ]).map(({ opt, label }) => (
            <div key={opt}>
              <label className={labelClass}>{label} *</label>
              <input
                type="text"
                value={(form[`option_${opt}` as keyof QuestionFormData] as string) ?? ""}
                onChange={(e) => set(`option_${opt}` as keyof QuestionFormData, e.target.value)}
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{dict.correctAnswer} *</label>
            <select
              value={form.correct_answer ?? "A"}
              onChange={(e) => set("correct_answer", e.target.value)}
              className={inputClass}
              style={inputStyle}
            >
              {CORRECT_ANSWERS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Justification */}
      <div className="rounded-xl border p-6 space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <h2 className="font-semibold">{dict.justification}</h2>
        <div>
          <label className={labelClass}>{dict.justification}</label>
          <textarea
            value={form.justification ?? ""}
            onChange={(e) => set("justification", e.target.value)}
            rows={4}
            className={textareaClass}
            style={inputStyle}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {([
            { opt: "a" as const, label: dict.explanationA },
            { opt: "b" as const, label: dict.explanationB },
            { opt: "c" as const, label: dict.explanationC },
            { opt: "d" as const, label: dict.explanationD },
          ]).map(({ opt, label }) => (
            <div key={opt}>
              <label className={labelClass}>{label}</label>
              <textarea
                value={(form[`explanation_${opt}` as keyof QuestionFormData] as string) ?? ""}
                onChange={(e) => set(`explanation_${opt}` as keyof QuestionFormData, e.target.value)}
                rows={2}
                className={textareaClass}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="rounded-xl border p-6 space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <h2 className="font-semibold">{dict.category}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{dict.exam}</label>
            <input type="text" value={form.exam ?? ""} onChange={(e) => set("exam", e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass}>{dict.category}</label>
            <input type="text" value={form.category ?? ""} onChange={(e) => set("category", e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass}>{dict.topic}</label>
            <input type="text" value={form.topic ?? ""} onChange={(e) => set("topic", e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass}>{dict.subtopic}</label>
            <input type="text" value={form.subtopic ?? ""} onChange={(e) => set("subtopic", e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass}>{dict.difficulty}</label>
            <select value={form.difficulty ?? "medium"} onChange={(e) => set("difficulty", e.target.value)} className={inputClass} style={inputStyle}>
              {DIFFICULTIES.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>{dict.year}</label>
            <input
              type="number"
              value={form.year ?? ""}
              onChange={(e) => set("year", e.target.value ? parseInt(e.target.value) : null)}
              className={inputClass}
              style={inputStyle}
              placeholder="e.g. 2023"
            />
          </div>
          <div>
            <label className={labelClass}>{dict.source}</label>
            <input type="text" value={form.source ?? ""} onChange={(e) => set("source", e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass}>{dict.status}</label>
            <select value={form.status ?? "draft"} onChange={(e) => set("status", e.target.value)} className={inputClass} style={inputStyle}>
              {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {loading ? "..." : questionId ? dict.saveChanges : dict.saveAsDraft}
        </button>
        <button
          type="button"
          onClick={() => router.push(questionsPath)}
          className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

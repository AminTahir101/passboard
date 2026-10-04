"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/lib/i18n";

interface RequestAccessClientProps {
  lang: string;
  homePath: string;
  loginPath: string;
  dict: Dictionary["requestAccess"];
}

export default function RequestAccessClient({ lang, homePath, loginPath, dict }: RequestAccessClientProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    target_exam: "",
    expected_exam_date: "",
    notes: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("access_requests").insert({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        target_exam: form.target_exam || null,
        expected_exam_date: form.expected_exam_date || null,
        notes: form.notes || null,
        status: "new",
      });

      if (insertError) {
        console.error(insertError);
        setError(lang === "ar" ? "حدث خطأ. يرجى المحاولة مجددًا." : "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: "var(--secondary)" }}
      >
        <Link href={homePath} className="mb-8 font-semibold text-xl tracking-tight">
          Passboard
        </Link>
        <div
          className="w-full max-w-md rounded-xl border p-8 shadow-sm text-center"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--success-muted)" }}
          >
            <span style={{ fontSize: "1.5rem" }}>✓</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">{dict.successTitle}</h2>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {dict.successMessage}
          </p>
          <Link
            href={homePath}
            className="inline-block mt-6 text-sm font-medium hover:underline"
            style={{ color: "var(--muted-foreground)" }}
          >
            {lang === "ar" ? "العودة إلى الرئيسية" : "Back to home"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--secondary)" }}
    >
      <Link href={homePath} className="mb-8 font-semibold text-xl tracking-tight">
        Passboard
      </Link>

      <div
        className="w-full max-w-md rounded-xl border p-8 shadow-sm"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h1 className="text-xl font-semibold mb-1">{dict.title}</h1>
        <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
          {dict.subtitle}
        </p>

        {error && (
          <div
            className="text-sm p-3 rounded-lg mb-4"
            style={{ background: "var(--destructive-muted)", color: "var(--destructive)", border: "1px solid var(--destructive-muted-border)" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{dict.fullName} *</label>
            <input
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleChange}
              required
              placeholder={lang === "ar" ? "اسمك الكامل" : "Your full name"}
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
              style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{dict.email} *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
              style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{dict.phone}</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+966 5X XXX XXXX"
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
              style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{dict.targetExam}</label>
            <select
              name="target_exam"
              value={form.target_exam}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
              style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <option value="">{lang === "ar" ? "اختر الامتحان…" : "Select exam…"}</option>
              {dict.examOptions.map((exam) => (
                <option key={exam} value={exam}>{exam}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{dict.examDate}</label>
            <input
              name="expected_exam_date"
              type="date"
              value={form.expected_exam_date}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
              style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              {dict.notes}{" "}
              <span style={{ color: "var(--muted-foreground)" }}>({lang === "ar" ? "اختياري" : "optional"})</span>
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder={lang === "ar" ? "أي معلومات إضافية..." : "Any additional information..."}
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none resize-none"
              style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {loading ? (lang === "ar" ? "جاري الإرسال…" : "Submitting…") : dict.submit}
          </button>
        </form>
      </div>

      <p className="mt-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
        {lang === "ar" ? "لديك وصول بالفعل؟" : "Already have access?"}{" "}
        <Link href={loginPath} className="font-medium hover:underline" style={{ color: "var(--foreground)" }}>
          {lang === "ar" ? "تسجيل الدخول" : "Login"}
        </Link>
      </p>
    </div>
  );
}

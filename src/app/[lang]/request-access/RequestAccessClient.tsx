"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/lib/i18n";
import { Logo } from "@/components/landing/ui";
import { CheckCircle2 } from "lucide-react";

interface RequestAccessClientProps {
  lang: string;
  homePath: string;
  loginPath: string;
  dict: Dictionary["requestAccess"];
}

const PERKS = [
  { en: "10,000+ exam-style MCQs across 20+ specialties", ar: "أكثر من 10,000 سؤال عبر أكثر من 20 تخصصاً" },
  { en: "Detailed clinical rationale for every answer", ar: "شرح سريري مفصّل لكل إجابة" },
  { en: "AI tutor available for every question", ar: "مدرّس ذكي متاح لكل سؤال" },
  { en: "Timed mock exams filterable by specialty", ar: "اختبارات تجريبية مؤقتة قابلة للتصفية حسب التخصص" },
  { en: "Progress tracking by category and topic", ar: "تتبّع التقدّم حسب الفئة والموضوع" },
];

export default function RequestAccessClient({ lang, homePath, loginPath, dict }: RequestAccessClientProps) {
  const isAr = lang === "ar";
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
        setError(isAr ? "حدث خطأ. يرجى المحاولة مجددًا." : "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4">
        <Link href={homePath} className="mb-10 flex items-center gap-2.5">
          <Logo size={34} />
          <span className="font-serif text-[22px] font-medium text-lp-ink">Passboard</span>
        </Link>
        <div className="w-full max-w-md rounded-2xl border border-lp-line bg-paper-2 p-10 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-gold-tint flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={26} className="text-amber-ink" />
          </div>
          <h2 className="font-serif text-2xl font-normal mb-3">{dict.successTitle}</h2>
          <p className="text-[15px] leading-relaxed text-lp-ink-2">{dict.successMessage}</p>
          <Link
            href={homePath}
            className="inline-block mt-8 text-sm text-lp-muted hover:text-lp-ink transition-colors"
          >
            {isAr ? "← العودة إلى الرئيسية" : "← Back to home"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper" dir={isAr ? "rtl" : "ltr"}>
      {/* Top bar */}
      <div className="border-b border-lp-line px-6 py-4 flex items-center justify-between">
        <Link href={homePath} className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="font-serif text-[20px] font-medium text-lp-ink">Passboard</span>
        </Link>
        <Link href={loginPath} className="text-sm text-lp-muted hover:text-lp-ink transition-colors">
          {isAr ? "تسجيل الدخول" : "Login"}
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-[1fr_480px] gap-16 lg:gap-24 items-start">

        {/* Left — value prop */}
        <div className="lg:pt-4">
          <p className="eyebrow mb-5">{isAr ? "وصول خاص" : "Private access"}</p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] leading-[1.05] font-normal tracking-[-0.02em] text-lp-ink mb-6">
            {isAr
              ? <>آلاف الأسئلة.<br />مدرّس ذكي.<br />نجاح حقيقي.</>
              : <>Thousands of questions.<br />One AI tutor.<br />One goal.</>}
          </h1>
          <p className="text-[17px] leading-relaxed text-lp-ink-2 mb-10 max-w-[420px]">
            {isAr
              ? "Passboard منصة تحضير خاصة لاختبارات الترخيص الطبي. اطلب وصولك واستعد باحترافية."
              : "Passboard is a private preparation platform for medical licensing exams. Request your place and start preparing the right way."}
          </p>

          <ul className="space-y-4">
            {PERKS.map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-gold-tint flex items-center justify-center">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="#6b4700" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-[15px] text-lp-ink-2">{isAr ? p.ar : p.en}</span>
              </li>
            ))}
          </ul>

          {/* Exam badges */}
          <div className="mt-12 pt-8 border-t border-lp-line">
            <p className="text-xs font-mono tracking-[0.08em] text-lp-muted uppercase mb-4">
              {isAr ? "الاختبارات المدعومة" : "Supported exams"}
            </p>
            <div className="flex flex-wrap gap-2">
              {["SMLE", "SDLE", "SPLE", "USMLE", "PLAB", "MCCQE", "AMC MCQ"].map((exam) => (
                <span
                  key={exam}
                  className="px-3 py-1.5 rounded-lg border border-lp-line-2 bg-paper-2 text-xs font-mono text-lp-ink-2"
                >
                  {exam}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="rounded-2xl border border-lp-line bg-paper-2 p-8 shadow-sm">
          <h2 className="font-serif text-2xl font-normal mb-1 text-lp-ink">{dict.title}</h2>
          <p className="text-[14px] text-lp-muted mb-7">{dict.subtitle}</p>

          {error && (
            <div className="text-sm p-3 rounded-xl mb-5 bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field label={`${dict.fullName} *`}>
              <input
                name="full_name"
                type="text"
                value={form.full_name}
                onChange={handleChange}
                required
                placeholder={isAr ? "اسمك الكامل" : "Your full name"}
                className="input-lp"
              />
            </Field>

            <Field label={`${dict.email} *`}>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="input-lp"
                dir="ltr"
              />
            </Field>

            <Field label={dict.phone}>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+966 5X XXX XXXX"
                className="input-lp"
                dir="ltr"
              />
            </Field>

            <Field label={dict.targetExam}>
              <select
                name="target_exam"
                value={form.target_exam}
                onChange={handleChange}
                className="input-lp"
              >
                <option value="">{isAr ? "اختر الامتحان…" : "Select exam…"}</option>
                {dict.examOptions.map((exam) => (
                  <option key={exam} value={exam}>{exam}</option>
                ))}
              </select>
            </Field>

            <Field label={dict.examDate}>
              <input
                name="expected_exam_date"
                type="date"
                value={form.expected_exam_date}
                onChange={handleChange}
                className="input-lp"
                dir="ltr"
              />
            </Field>

            <Field label={`${dict.notes} ${isAr ? "(اختياري)" : "(optional)"}`}>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder={isAr ? "أي معلومات إضافية..." : "Anything else we should know?"}
                className="input-lp resize-none"
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 mt-1"
              style={{ background: "var(--color-gold-deep)", color: "var(--color-paper)" }}
            >
              {loading ? (isAr ? "جاري الإرسال…" : "Submitting…") : dict.submit}
            </button>

            <p className="text-center text-[13px] text-lp-muted">
              {isAr ? "لديك وصول بالفعل؟" : "Already have access?"}{" "}
              <Link href={loginPath} className="text-lp-ink font-medium hover:underline">
                {isAr ? "تسجيل الدخول" : "Login"}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-lp-ink">{label}</label>
      {children}
    </div>
  );
}

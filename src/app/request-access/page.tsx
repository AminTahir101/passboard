"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const TARGET_EXAMS = [
  "Saudi Medical Licensing Exam (SMLE)",
  "Saudi Dentistry Licensing Exam (SDLE)",
  "Saudi Pharmacy Licensing Exam (SPLE)",
  "Saudi Nursing Licensing Exam (SNLE)",
  "Other",
];

export default function RequestAccessPage() {
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
        setError("Something went wrong. Please try again.");
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
        <Link href="/" className="mb-8 font-semibold text-xl tracking-tight">
          Moraje3
        </Link>
        <div
          className="w-full max-w-md rounded-xl border p-8 shadow-sm text-center"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "#f0fdf4" }}
          >
            <span style={{ fontSize: "1.5rem" }}>✓</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Request Received</h2>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Your access request has been received. We will contact you with the next steps.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 text-sm font-medium hover:underline"
            style={{ color: "var(--muted-foreground)" }}
          >
            Back to home
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
      <Link href="/" className="mb-8 font-semibold text-xl tracking-tight">
        Moraje3
      </Link>

      <div
        className="w-full max-w-md rounded-xl border p-8 shadow-sm"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h1 className="text-xl font-semibold mb-1">Request Access</h1>
        <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
          Fill in your details and we will get back to you shortly.
        </p>

        {error && (
          <div
            className="text-sm p-3 rounded-lg mb-4"
            style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name *</label>
            <input
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleChange}
              required
              placeholder="Your full name"
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
              style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Email Address *</label>
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
            <label className="block text-sm font-medium mb-1.5">Mobile Number</label>
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
            <label className="block text-sm font-medium mb-1.5">Target Exam</label>
            <select
              name="target_exam"
              value={form.target_exam}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
              style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <option value="">Select exam…</option>
              {TARGET_EXAMS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Expected Exam Date</label>
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
            <label className="block text-sm font-medium mb-1.5">Notes <span style={{ color: "var(--muted-foreground)" }}>(optional)</span></label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any additional information..."
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
            {loading ? "Submitting…" : "Request Access"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
        Already have access?{" "}
        <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--foreground)" }}>
          Login
        </Link>
      </p>
    </div>
  );
}

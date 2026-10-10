"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2 } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import type { StudyPlan } from "@/types/database";
import { computePlanSummary } from "@/lib/study-plan/generate";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LABELS_AR = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

const EXAMS = ["SMLE", "SDLE", "SPLE", "USMLE Step 1", "USMLE Step 2", "PLAB", "Other"];

interface Props {
  lang: string;
  dict: Dictionary["studyPlan"];
  existingPlan: StudyPlan | null;
  profileExam: string | null;
  profileExamDate: string | null;
  allSpecialties: string[];
  planPath: string;
}

export default function StudyPlanSetupClient({
  lang,
  dict,
  existingPlan,
  profileExam,
  profileExamDate,
  allSpecialties,
  planPath,
}: Props) {
  const router = useRouter();
  const isEdit = !!existingPlan;

  const [exam, setExam] = useState(
    existingPlan?.exam ?? profileExam ?? EXAMS[0]
  );
  const [examDate, setExamDate] = useState(
    existingPlan?.exam_date ?? profileExamDate ?? ""
  );
  const [studyDays, setStudyDays] = useState<number[]>(
    existingPlan?.study_days ?? [0, 1, 2, 3, 4]
  );
  const [questionsPerDay, setQuestionsPerDay] = useState(
    existingPlan?.questions_per_day ?? 20
  );
  const [mockEnabled, setMockEnabled] = useState(
    existingPlan ? existingPlan.mock_day !== null : false
  );
  const [mockDay, setMockDay] = useState(existingPlan?.mock_day ?? 5);
  const [mockSize, setMockSize] = useState<50 | 100>(
    (existingPlan?.mock_size as 50 | 100) ?? 50
  );
  const [focusSpecialties, setFocusSpecialties] = useState<string[]>(
    existingPlan?.focus_specialties ?? []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    if (!examDate || studyDays.length === 0) return null;
    return computePlanSummary({
      examDate,
      studyDays,
      questionsPerDay,
      mockDay: mockEnabled ? mockDay : null,
      mockSize: mockEnabled ? mockSize : null,
    });
  }, [examDate, studyDays, questionsPerDay, mockEnabled, mockDay, mockSize]);

  function toggleDay(d: number) {
    setStudyDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    );
  }

  function toggleSpecialty(s: string) {
    setFocusSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  async function handleSave() {
    if (!examDate || studyDays.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam,
          exam_date: examDate,
          study_days: studyDays,
          questions_per_day: questionsPerDay,
          mock_day: mockEnabled ? mockDay : null,
          mock_size: mockEnabled ? mockSize : null,
          focus_specialties: focusSpecialties,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save plan");
      }
      router.push(planPath);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save plan");
      setSaving(false);
    }
  }

  const dayLabels = lang === "ar" ? DAY_LABELS_AR : DAY_LABELS;
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          {isEdit ? dict.editTitle : dict.setupTitle}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          {dict.setupSubtitle}
        </p>
      </div>

      {error && (
        <div
          className="text-sm p-3 rounded-lg"
          style={{
            background: "var(--destructive-muted)",
            color: "var(--destructive)",
            border: "1px solid var(--destructive-muted-border)",
          }}
        >
          {error}
        </div>
      )}

      {/* Exam */}
      <section className="space-y-2">
        <label className="block text-sm font-semibold">{dict.examLabel}</label>
        <select
          value={exam}
          onChange={(e) => setExam(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
          style={{
            background: "var(--background)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          {EXAMS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </section>

      {/* Exam date */}
      <section className="space-y-2">
        <label className="block text-sm font-semibold">{dict.examDateLabel}</label>
        <input
          type="date"
          value={examDate}
          min={minDateStr}
          onChange={(e) => setExamDate(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
          style={{
            background: "var(--background)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        />
      </section>

      {/* Study days */}
      <section className="space-y-3">
        <label className="block text-sm font-semibold">{dict.studyDaysLabel}</label>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4, 5, 6].map((d) => {
            const active = studyDays.includes(d);
            return (
              <button
                key={d}
                onClick={() => toggleDay(d)}
                className="px-4 py-2 rounded-lg border text-sm font-medium transition-all"
                style={{
                  borderColor: active ? "var(--brand)" : "var(--border)",
                  background: active ? "var(--brand)" : "var(--card)",
                  color: active ? "var(--brand-foreground)" : "var(--foreground)",
                }}
              >
                {dayLabels[d]}
              </button>
            );
          })}
        </div>
      </section>

      {/* Questions per day */}
      <section className="space-y-3">
        <label className="block text-sm font-semibold">
          {dict.questionsPerDayLabel}{" "}
          <span
            className="font-bold text-base"
            style={{ color: "var(--brand)" }}
          >
            {questionsPerDay}
          </span>
        </label>
        <input
          type="range"
          min={5}
          max={100}
          step={5}
          value={questionsPerDay}
          onChange={(e) => setQuestionsPerDay(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: "var(--brand)" }}
        />
        <div className="flex justify-between text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span>5</span>
          <span>50</span>
          <span>100</span>
        </div>
      </section>

      {/* Weekly mock exam */}
      <section className="space-y-3">
        <label className="block text-sm font-semibold">{dict.mockExamLabel}</label>
        <div className="flex flex-wrap gap-2">
          {([false, 50, 100] as const).map((v) => {
            const active = v === false ? !mockEnabled : mockEnabled && mockSize === v;
            const label = v === false ? dict.noMock : v === 50 ? dict.mock50 : dict.mock100;
            return (
              <button
                key={String(v)}
                onClick={() => {
                  if (v === false) {
                    setMockEnabled(false);
                  } else {
                    setMockEnabled(true);
                    setMockSize(v);
                  }
                }}
                className="px-4 py-2 rounded-lg border text-sm font-medium transition-all"
                style={{
                  borderColor: active ? "var(--brand)" : "var(--border)",
                  background: active ? "var(--brand)" : "var(--card)",
                  color: active ? "var(--brand-foreground)" : "var(--foreground)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {mockEnabled && (
          <div className="space-y-2 pt-1">
            <label className="block text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
              {dict.mockDayLabel}
            </label>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                const active = mockDay === d;
                return (
                  <button
                    key={d}
                    onClick={() => setMockDay(d)}
                    className="px-3 py-1.5 rounded-lg border text-sm transition-all"
                    style={{
                      borderColor: active ? "var(--brand)" : "var(--border)",
                      background: active ? "var(--brand)" : "var(--card)",
                      color: active ? "var(--brand-foreground)" : "var(--foreground)",
                    }}
                  >
                    {dayLabels[d]}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Focus specialties */}
      {allSpecialties.length > 0 && (
        <section className="space-y-3">
          <div>
            <label className="block text-sm font-semibold">
              {dict.focusSpecialtiesLabel}{" "}
              <span className="text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>
                ({lang === "ar" ? "اختياري" : "optional"})
              </span>
            </label>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {dict.focusSpecialtiesHint}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {allSpecialties.map((s) => {
              const active = focusSpecialties.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSpecialty(s)}
                  className="px-3 py-1.5 rounded-full border text-xs font-medium transition-all"
                  style={{
                    borderColor: active ? "var(--brand)" : "var(--border)",
                    background: active ? "var(--brand)" : "var(--card)",
                    color: active ? "var(--brand-foreground)" : "var(--foreground)",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Plan summary */}
      {summary && summary.totalStudyDays > 0 && (
        <div
          className="rounded-xl border p-5 space-y-3"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <h2 className="text-sm font-semibold">{dict.summaryTitle}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: dict.summaryWeeks, value: summary.totalWeeks },
              { label: dict.summarySessions, value: summary.practiceSessions },
              { label: dict.summaryQuestions, value: summary.totalPracticeQuestions.toLocaleString() },
              { label: dict.summaryMocks, value: summary.mockExams },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {label}
                </p>
                <p className="text-xl font-bold mt-0.5" style={{ color: "var(--brand)" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving || !examDate || studyDays.length === 0}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40"
        style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
      >
        {saving ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {dict.saving}
          </>
        ) : (
          <>
            {dict.savePlan}
            <ChevronRight size={16} />
          </>
        )}
      </button>
    </div>
  );
}

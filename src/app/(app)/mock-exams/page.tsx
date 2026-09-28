import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, ClipboardList, CheckCircle2, Clock, Percent } from "lucide-react";
import type { MockExam } from "@/types/database";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function MockExamsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: examsRaw } = await supabase
    .from("mock_exams")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  const exams = (examsRaw ?? []) as MockExam[];
  const completedExams = exams.filter((e) => e.completed_at);
  const inProgressExams = exams.filter((e) => !e.completed_at);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Mock Exams
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Simulate real exam conditions and track your performance
          </p>
        </div>
        <Link
          href="/mock-exams/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
        >
          <Plus size={16} />
          Start New Exam
        </Link>
      </div>

      {/* Stats summary */}
      {completedExams.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div
            className="rounded-xl p-4 border"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
              Total Exams
            </p>
            <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              {completedExams.length}
            </p>
          </div>
          <div
            className="rounded-xl p-4 border"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
              Avg Score
            </p>
            <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              {Math.round(
                completedExams.reduce((sum, e) => sum + (e.percentage || 0), 0) /
                  completedExams.length
              )}
              %
            </p>
          </div>
          <div
            className="rounded-xl p-4 border"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
              Best Score
            </p>
            <p className="text-2xl font-bold" style={{ color: "var(--success)" }}>
              {Math.max(...completedExams.map((e) => e.percentage || 0))}%
            </p>
          </div>
        </div>
      )}

      {/* In-progress exams */}
      {inProgressExams.length > 0 && (
        <div className="mb-8">
          <h2
            className="text-sm font-semibold mb-3"
            style={{ color: "var(--muted-foreground)" }}
          >
            IN PROGRESS
          </h2>
          <div className="space-y-3">
            {inProgressExams.map((exam) => (
              <div
                key={exam.id}
                className="rounded-xl border p-4 flex items-center justify-between"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--muted)" }}
                  >
                    <ClipboardList size={18} style={{ color: "var(--brand)" }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>
                      {exam.exam_name || "Mock Exam"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      Started {formatDate(exam.started_at)} · {exam.question_count} questions
                    </p>
                  </div>
                </div>
                <Link
                  href={`/mock-exams/${exam.id}/session`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
                >
                  Continue
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed exams */}
      <div>
        <h2
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--muted-foreground)" }}
        >
          COMPLETED EXAMS
        </h2>

        {completedExams.length === 0 ? (
          <div
            className="rounded-xl border p-12 text-center"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <ClipboardList
              size={40}
              className="mx-auto mb-3"
              style={{ color: "var(--muted-foreground)" }}
            />
            <p className="font-medium mb-1" style={{ color: "var(--foreground)" }}>
              No completed exams yet
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
              Take your first mock exam to simulate real exam conditions
            </p>
            <Link
              href="/mock-exams/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
            >
              <Plus size={15} />
              Start Your First Exam
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {completedExams.map((exam) => {
              const pct = exam.percentage ?? 0;
              const scoreColor =
                pct >= 70 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--destructive)";

              return (
                <div
                  key={exam.id}
                  className="rounded-xl border p-4"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--muted)" }}
                      >
                        <ClipboardList size={18} style={{ color: "var(--brand)" }} />
                      </div>
                      <div>
                        <p
                          className="font-medium text-sm"
                          style={{ color: "var(--foreground)" }}
                        >
                          {exam.exam_name || "Mock Exam"}
                        </p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {formatDate(exam.started_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mr-4">
                      <div className="flex items-center gap-1.5 text-sm">
                        <CheckCircle2 size={14} style={{ color: "var(--success)" }} />
                        <span style={{ color: "var(--foreground)", fontWeight: 500 }}>
                          {exam.score}/{exam.question_count}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Percent size={14} style={{ color: scoreColor }} />
                        <span style={{ color: scoreColor, fontWeight: 600 }}>
                          {Math.round(pct)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm hidden sm:flex">
                        <Clock size={14} style={{ color: "var(--muted-foreground)" }} />
                        <span style={{ color: "var(--muted-foreground)" }}>
                          {formatDuration(exam.duration_seconds)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/mock-exams/${exam.id}/results`}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                        style={{
                          borderColor: "var(--border)",
                          color: "var(--foreground)",
                        }}
                      >
                        Results
                      </Link>
                      <Link
                        href={`/mock-exams/${exam.id}/review`}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{
                          background: "var(--brand)",
                          color: "var(--brand-foreground)",
                        }}
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

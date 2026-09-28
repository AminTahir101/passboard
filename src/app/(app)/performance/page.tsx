import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Play, TrendingUp, TrendingDown, Calendar, BookOpen, Target } from "lucide-react";

function AccuracyBar({ value }: { value: number }) {
  const color =
    value >= 70 ? "var(--success)" : value >= 50 ? "var(--warning)" : "var(--destructive)";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full" style={{ background: "var(--muted)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-sm font-semibold w-10 text-right" style={{ color }}>
        {value}%
      </span>
    </div>
  );
}

export default async function PerformancePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  type AttemptRow = { id: string; question_id: string; is_correct: boolean; attempted_at: string };
  type MockExamRow = { id: string; exam_name: string | null; started_at: string; completed_at: string | null; question_count: number; score: number | null; percentage: number | null };

  // Fetch all attempts
  const { data: attemptsRaw } = await supabase
    .from("question_attempts")
    .select("id, question_id, is_correct, attempted_at")
    .eq("user_id", user.id)
    .order("attempted_at", { ascending: false });

  const attempts = (attemptsRaw ?? []) as AttemptRow[];

  const total = attempts.length;
  const correct = attempts.filter((a) => a.is_correct).length;
  const incorrect = total - correct;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Questions this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeekAttempts = attempts.filter(
    (a) => new Date(a.attempted_at) >= weekAgo
  );
  const thisWeekCorrect = thisWeekAttempts.filter((a) => a.is_correct).length;
  const thisWeekAccuracy =
    thisWeekAttempts.length > 0
      ? Math.round((thisWeekCorrect / thisWeekAttempts.length) * 100)
      : 0;

  // Category stats
  type TopicStats = { correct: number; total: number };
  const categoryStats: Record<string, TopicStats> = {};
  const topicStats: Record<string, TopicStats> = {};

  type QRow = { id: string; category: string | null; topic: string | null };

  if (total > 0) {
    const allQIds = [...new Set(attempts.map((a) => a.question_id))];
    const { data: questionsRaw } = await supabase
      .from("questions")
      .select("id, category, topic")
      .in("id", allQIds);

    const questions = (questionsRaw ?? []) as QRow[];
    const qMap = new Map(questions.map((q) => [q.id, q]));

    for (const attempt of attempts) {
      const q = qMap.get(attempt.question_id);
      if (!q) continue;

      const cat = q.category ?? "Uncategorized";
      const topic = q.topic ?? "Uncategorized";

      if (!categoryStats[cat]) categoryStats[cat] = { correct: 0, total: 0 };
      categoryStats[cat].total++;
      if (attempt.is_correct) categoryStats[cat].correct++;

      if (!topicStats[topic]) topicStats[topic] = { correct: 0, total: 0 };
      topicStats[topic].total++;
      if (attempt.is_correct) topicStats[topic].correct++;
    }
  }

  const categoryEntries = Object.entries(categoryStats)
    .map(([cat, s]) => ({
      name: cat,
      accuracy: Math.round((s.correct / s.total) * 100),
      total: s.total,
      correct: s.correct,
    }))
    .sort((a, b) => b.total - a.total);

  const topicEntries = Object.entries(topicStats)
    .filter(([, s]) => s.total >= 3)
    .map(([topic, s]) => ({
      name: topic,
      accuracy: Math.round((s.correct / s.total) * 100),
      total: s.total,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  const strongest = topicEntries.slice(0, 3);
  const weakest = topicEntries.slice(-3).reverse();

  // Mock exam scores
  const { data: mockExamsRaw } = await supabase
    .from("mock_exams")
    .select("id, exam_name, started_at, completed_at, question_count, score, percentage")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(5);

  const mockExams = (mockExamsRaw ?? []) as MockExamRow[];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Performance
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Track your progress and identify areas for improvement
        </p>
      </div>

      {total === 0 ? (
        <div className="text-center py-16">
          <TrendingUp size={48} className="mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
          <p className="font-semibold" style={{ color: "var(--foreground)" }}>
            No data yet
          </p>
          <p className="text-sm mt-1 mb-4" style={{ color: "var(--muted-foreground)" }}>
            Start practicing to see your performance statistics
          </p>
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
          >
            <Play size={14} />
            Start Practice
          </Link>
        </div>
      ) : (
        <>
          {/* Overview stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Answered",
                value: total.toLocaleString(),
                icon: BookOpen,
                color: "var(--brand)",
              },
              {
                label: "Overall Accuracy",
                value: `${accuracy}%`,
                icon: Target,
                color:
                  accuracy >= 70
                    ? "var(--success)"
                    : accuracy >= 50
                    ? "var(--warning)"
                    : "var(--destructive)",
              },
              {
                label: "This Week",
                value: thisWeekAttempts.length.toLocaleString(),
                icon: Calendar,
                color: "var(--brand)",
              },
              {
                label: "Weekly Accuracy",
                value: thisWeekAttempts.length > 0 ? `${thisWeekAccuracy}%` : "—",
                icon: TrendingUp,
                color:
                  thisWeekAccuracy >= 70
                    ? "var(--success)"
                    : thisWeekAccuracy >= 50
                    ? "var(--warning)"
                    : "var(--destructive)",
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="rounded-xl border p-4"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {label}
                  </p>
                  <Icon size={15} style={{ color }} />
                </div>
                <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accuracy by Category */}
            {categoryEntries.length > 0 && (
              <div
                className="rounded-xl border"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                  <h2 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                    Accuracy by Category
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  {categoryEntries.map(({ name, accuracy: acc, total: tot, correct: cor }) => (
                    <div key={name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                          {name}
                        </span>
                        <span className="text-xs ml-2 shrink-0" style={{ color: "var(--muted-foreground)" }}>
                          {cor}/{tot}
                        </span>
                      </div>
                      <AccuracyBar value={acc} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strongest / Weakest Topics */}
            <div className="space-y-4">
              {strongest.length > 0 && (
                <div
                  className="rounded-xl border"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                  <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                    <h2 className="font-semibold text-sm flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                      <TrendingUp size={15} style={{ color: "var(--success)" }} />
                      Strongest Topics
                    </h2>
                  </div>
                  <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                    {strongest.map((t) => (
                      <div key={t.name} className="px-5 py-3 flex items-center justify-between">
                        <span className="text-sm truncate" style={{ color: "var(--foreground)" }}>
                          {t.name}
                        </span>
                        <span
                          className="text-sm font-semibold ml-3 shrink-0"
                          style={{ color: "var(--success)" }}
                        >
                          {t.accuracy}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {weakest.length > 0 && weakest[0]?.name !== strongest[strongest.length - 1]?.name && (
                <div
                  className="rounded-xl border"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                  <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                    <h2 className="font-semibold text-sm flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                      <TrendingDown size={15} style={{ color: "var(--destructive)" }} />
                      Needs Improvement
                    </h2>
                  </div>
                  <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                    {weakest.map((t) => (
                      <div key={t.name} className="px-5 py-3 flex items-center justify-between">
                        <span className="text-sm truncate" style={{ color: "var(--foreground)" }}>
                          {t.name}
                        </span>
                        <span
                          className="text-sm font-semibold ml-3 shrink-0"
                          style={{ color: "var(--destructive)" }}
                        >
                          {t.accuracy}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mock exam scores */}
          {(mockExams?.length ?? 0) > 0 && (
            <div
              className="rounded-xl border"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <h2 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                  Recent Mock Exams
                </h2>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {mockExams.map((exam) => (
                  <div key={exam.id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {exam.exam_name ?? "Mock Exam"}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {new Date(exam.started_at).toLocaleDateString()} · {exam.question_count} questions
                      </p>
                    </div>
                    {exam.percentage !== null && (
                      <span
                        className="text-lg font-bold"
                        style={{
                          color:
                            exam.percentage >= 70
                              ? "var(--success)"
                              : exam.percentage >= 50
                              ? "var(--warning)"
                              : "var(--destructive)",
                        }}
                      >
                        {exam.percentage}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

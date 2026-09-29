import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, localePath } from "@/lib/i18n";
import type { Profile, QuestionAttempt } from "@/types/database";
import {
  Play,
  ClipboardList,
  Brain,
  XCircle,
  Target,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>
            {label}
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            {value}
          </p>
          {sub && (
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              {sub}
            </p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: color + "15" }}
        >
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(localePath(lang, "/login"));

  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name, target_exam, exam_date, access_expires_at")
    .eq("id", user.id)
    .single();

  const profile = profileData as Pick<Profile, "full_name" | "target_exam" | "exam_date" | "access_expires_at"> | null;

  const { data: attemptsData } = await supabase
    .from("question_attempts")
    .select("id, is_correct, attempted_at, question_id, selected_answer")
    .eq("user_id", user.id)
    .order("attempted_at", { ascending: false });

  const attempts = (attemptsData ?? []) as Pick<QuestionAttempt, "id" | "is_correct" | "attempted_at" | "question_id" | "selected_answer">[];

  const totalAttempted = attempts.length;
  const correct = attempts.filter((a) => a.is_correct).length;
  const incorrect = totalAttempted - correct;
  const accuracy = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 0;

  let daysToExam: number | null = null;
  if (profile?.exam_date) {
    const examDate = new Date(profile.exam_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    daysToExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  const recentAttemptIds = attempts.slice(0, 5).map((a) => a.question_id);
  const { data: recentQuestionsData } = recentAttemptIds.length
    ? await supabase.from("questions").select("id, question_text, category, topic").in("id", recentAttemptIds)
    : { data: [] };

  const recentQuestions = (recentQuestionsData ?? []) as { id: string; question_text: string; category: string | null; topic: string | null }[];

  const recentActivity = attempts.slice(0, 5).map((attempt) => {
    const q = recentQuestions.find((q) => q.id === attempt.question_id);
    return { ...attempt, question: q };
  });

  type TopicStat = { correct: number; total: number };
  const topicStats: Record<string, TopicStat> = {};

  if (attempts.length > 0) {
    const allQIds = [...new Set(attempts.map((a) => a.question_id))];
    const { data: allQuestionsData } = await supabase
      .from("questions")
      .select("id, topic, category")
      .in("id", allQIds);

    const allQuestions = (allQuestionsData ?? []) as { id: string; topic: string | null; category: string | null }[];
    const qMap = new Map(allQuestions.map((q) => [q.id, q]));

    for (const attempt of attempts) {
      const q = qMap.get(attempt.question_id);
      const key = q?.topic || q?.category || "Uncategorized";
      if (!topicStats[key]) topicStats[key] = { correct: 0, total: 0 };
      topicStats[key].total++;
      if (attempt.is_correct) topicStats[key].correct++;
    }
  }

  const topicEntries = Object.entries(topicStats)
    .filter(([, s]) => s.total >= 3)
    .map(([topic, s]) => ({ topic, accuracy: Math.round((s.correct / s.total) * 100), total: s.total }));

  topicEntries.sort((a, b) => b.accuracy - a.accuracy);
  const strongestTopic = topicEntries[0] ?? null;
  const weakestTopic = topicEntries[topicEntries.length - 1] ?? null;

  const daysToExamValue = daysToExam === null
    ? dict.dashboard.na
    : daysToExam < 0
    ? "Past"
    : daysToExam === 0
    ? "Today!"
    : `${daysToExam}d`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {dict.dashboard.title}, {profile?.full_name?.split(" ")[0] ?? "Student"}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          {profile?.target_exam
            ? `${dict.dashboard.targetExam}: ${profile.target_exam}`
            : dict.dashboard.noActivity}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label={dict.dashboard.targetExam} value={profile?.target_exam ?? dict.dashboard.notSet} icon={Target} color="var(--brand)" />
        <StatCard
          label={dict.dashboard.daysToExam}
          value={daysToExamValue}
          icon={Calendar}
          color="var(--warning)"
          sub={profile?.exam_date ? new Date(profile.exam_date).toLocaleDateString() : undefined}
        />
        <StatCard label={dict.dashboard.totalAnswered} value={totalAttempted.toLocaleString()} icon={BookOpen} color="var(--brand)" />
        <StatCard
          label={dict.dashboard.accuracy}
          value={`${accuracy}%`}
          icon={TrendingUp}
          color={accuracy >= 70 ? "var(--success)" : accuracy >= 50 ? "var(--warning)" : "var(--destructive)"}
        />
        <StatCard label={dict.dashboard.correct} value={correct.toLocaleString()} icon={CheckCircle2} color="var(--success)" />
        <StatCard label={dict.dashboard.incorrect} value={incorrect.toLocaleString()} icon={AlertCircle} color="var(--destructive)" />
      </div>

      {(strongestTopic || weakestTopic) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {strongestTopic && (
            <div className="rounded-xl border p-5 flex items-start gap-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(22,163,74,0.1)" }}>
                <TrendingUp size={20} style={{ color: "var(--success)" }} />
              </div>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--muted-foreground)" }}>{dict.dashboard.strongestTopic}</p>
                <p className="font-semibold">{strongestTopic.topic}</p>
                <p className="text-sm" style={{ color: "var(--success)" }}>{strongestTopic.accuracy}% accuracy ({strongestTopic.total} questions)</p>
              </div>
            </div>
          )}
          {weakestTopic && weakestTopic.topic !== strongestTopic?.topic && (
            <div className="rounded-xl border p-5 flex items-start gap-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.1)" }}>
                <TrendingDown size={20} style={{ color: "var(--destructive)" }} />
              </div>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--muted-foreground)" }}>{dict.dashboard.weakestTopic}</p>
                <p className="font-semibold">{weakestTopic.topic}</p>
                <p className="text-sm" style={{ color: "var(--destructive)" }}>{weakestTopic.accuracy}% accuracy ({weakestTopic.total} questions)</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-semibold text-sm">{dict.dashboard.recentActivity}</h2>
          </div>
          {recentActivity.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <BookOpen size={32} className="mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{dict.dashboard.noActivity}</p>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
              {recentActivity.map((a) => (
                <li key={a.id} className="px-5 py-3 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: a.is_correct ? "rgba(22,163,74,0.1)" : "rgba(239,68,68,0.1)" }}>
                    {a.is_correct
                      ? <CheckCircle2 size={12} style={{ color: "var(--success)" }} />
                      : <AlertCircle size={12} style={{ color: "var(--destructive)" }} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">
                      {a.question?.question_text?.slice(0, 80) ?? "Question"}
                      {(a.question?.question_text?.length ?? 0) > 80 ? "…" : ""}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {a.question?.category ?? "General"} · {new Date(a.attempted_at).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-semibold text-sm">{dict.dashboard.quickActions}</h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {[
              { label: dict.dashboard.startPractice, href: localePath(lang, "/practice"), icon: Play, bg: "var(--brand)", fg: "var(--brand-foreground)" },
              { label: dict.dashboard.startMockExam, href: localePath(lang, "/mock-exams"), icon: ClipboardList, bg: "var(--secondary)", fg: "var(--secondary-foreground)" },
              { label: dict.dashboard.askAITutor, href: localePath(lang, "/tutor"), icon: Brain, bg: "var(--secondary)", fg: "var(--secondary-foreground)" },
              { label: dict.dashboard.reviewMistakes, href: localePath(lang, "/mistakes"), icon: XCircle, bg: "var(--secondary)", fg: "var(--secondary-foreground)" },
            ].map(({ label, href, icon: Icon, bg, fg }) => (
              <Link key={href} href={href}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
                style={{ background: bg, color: fg }}>
                <Icon size={20} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

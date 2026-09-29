import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, localePath } from "@/lib/i18n";
import { CheckCircle2, Brain, Play, BookOpen, Filter } from "lucide-react";

type AttemptRow = { id: string; question_id: string; selected_answer: string; is_correct: boolean; attempted_at: string };

export default async function MistakesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ category?: string; topic?: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const sp = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(localePath(lang, "/login"));

  // Get all attempts, ordered by most recent
  const { data: attemptsRaw } = await supabase
    .from("question_attempts")
    .select("id, question_id, selected_answer, is_correct, attempted_at")
    .eq("user_id", user.id)
    .order("attempted_at", { ascending: false });

  const attempts = (attemptsRaw ?? []) as AttemptRow[];

  // Get latest attempt per question, keep incorrect ones
  const latestByQuestion = new Map<
    string,
    { selected_answer: string; is_correct: boolean; attempted_at: string }
  >();
  for (const a of attempts) {
    if (!latestByQuestion.has(a.question_id)) {
      latestByQuestion.set(a.question_id, {
        selected_answer: a.selected_answer,
        is_correct: a.is_correct,
        attempted_at: a.attempted_at,
      });
    }
  }

  const incorrectIds = Array.from(latestByQuestion.entries())
    .filter(([, a]) => !a.is_correct)
    .map(([id]) => id);

  let questions: Array<{
    id: string;
    question_text: string;
    category: string | null;
    topic: string | null;
    correct_answer: string;
  }> = [];

  if (incorrectIds.length > 0) {
    let q = supabase
      .from("questions")
      .select("id, question_text, category, topic, correct_answer")
      .in("id", incorrectIds)
      .eq("status", "published");

    if (sp.category) q = q.eq("category", sp.category);
    if (sp.topic) q = q.eq("topic", sp.topic);

    const { data } = await q;
    questions = data ?? [];
  }

  // Sort by most recently attempted
  questions.sort((a, b) => {
    const aTime = latestByQuestion.get(a.id)?.attempted_at ?? "";
    const bTime = latestByQuestion.get(b.id)?.attempted_at ?? "";
    return bTime.localeCompare(aTime);
  });

  // Distinct categories and topics for filters
  const allCategories = [...new Set(questions.map((q) => q.category).filter((x): x is string => Boolean(x)))];
  const allTopics = [...new Set(questions.map((q) => q.topic).filter((x): x is string => Boolean(x)))];

  const mistakesBase = localePath(lang, "/mistakes");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          {dict.mistakes.title}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          {dict.mistakes.subtitle}
        </p>
      </div>

      {/* Stats summary */}
      <div
        className="rounded-xl border p-4 flex items-center gap-4"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.1)" }}
        >
          <BookOpen size={20} style={{ color: "var(--destructive)" }} />
        </div>
        <div>
          <p className="font-semibold" style={{ color: "var(--foreground)" }}>
            {incorrectIds.length} incorrect question{incorrectIds.length !== 1 ? "s" : ""}
          </p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Based on your most recent attempt at each question
          </p>
        </div>
        {incorrectIds.length > 0 && (
          <Link
            href={localePath(lang, `/practice/session?mode=incorrect&count=${Math.min(incorrectIds.length, 50)}`)}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
          >
            <Play size={14} />
            {dict.mistakes.practiceAll}
          </Link>
        )}
      </div>

      {/* Filters */}
      {(allCategories.length > 0 || allTopics.length > 0) && (
        <div
          className="rounded-xl border p-4 space-y-3"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <Filter size={14} style={{ color: "var(--muted-foreground)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
              {dict.common.filter}
            </span>
          </div>
          {allCategories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {dict.common.category}:
              </span>
              {[undefined, ...allCategories].map((cat) => (
                <Link
                  key={cat ?? "all"}
                  href={buildUrl(mistakesBase, { ...sp, category: cat, topic: undefined })}
                  className="text-xs px-2.5 py-1 rounded-full border"
                  style={{
                    borderColor: sp.category === cat ? "var(--brand)" : "var(--border)",
                    background: sp.category === cat ? "var(--brand)" : "transparent",
                    color: sp.category === cat ? "var(--brand-foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {cat ?? dict.common.all}
                </Link>
              ))}
            </div>
          )}
          {allTopics.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {dict.common.topic}:
              </span>
              {[undefined, ...allTopics].map((topic) => (
                <Link
                  key={topic ?? "all"}
                  href={buildUrl(mistakesBase, { ...sp, topic })}
                  className="text-xs px-2.5 py-1 rounded-full border"
                  style={{
                    borderColor: sp.topic === topic ? "var(--brand)" : "var(--border)",
                    background: sp.topic === topic ? "var(--brand)" : "transparent",
                    color: sp.topic === topic ? "var(--brand-foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {topic ?? dict.common.all}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Questions list */}
      {questions.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle2 size={48} className="mx-auto mb-3" style={{ color: "var(--success)" }} />
          <p className="font-semibold" style={{ color: "var(--foreground)" }}>
            {incorrectIds.length === 0 ? dict.mistakes.noMistakes : "No mistakes match your filters"}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {incorrectIds.length === 0
              ? dict.mistakes.noMistakesDesc
              : "Try clearing your filters"}
          </p>
          {incorrectIds.length === 0 && (
            <Link
              href={localePath(lang, "/practice")}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
            >
              <Play size={14} />
              {dict.dashboard.startPractice}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => {
            const attempt = latestByQuestion.get(q.id)!;
            return (
              <div
                key={q.id}
                className="rounded-xl border p-4 space-y-3"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <p className="text-sm font-medium leading-snug" style={{ color: "var(--foreground)" }}>
                  {q.question_text.length > 200
                    ? q.question_text.slice(0, 200) + "…"
                    : q.question_text}
                </p>

                <div className="flex items-center gap-3 text-xs flex-wrap">
                  {q.category && (
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                    >
                      {q.category}
                    </span>
                  )}
                  {q.topic && (
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                    >
                      {q.topic}
                    </span>
                  )}
                  <span style={{ color: "var(--muted-foreground)" }}>
                    {new Date(attempt.attempted_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span
                    className="flex items-center gap-1 px-2 py-1 rounded-lg"
                    style={{ background: "rgba(239,68,68,0.1)", color: "var(--destructive)" }}
                  >
                    {dict.mistakes.yourAnswer}: <strong>{attempt.selected_answer}</strong>
                  </span>
                  <span
                    className="flex items-center gap-1 px-2 py-1 rounded-lg"
                    style={{ background: "rgba(22,163,74,0.1)", color: "var(--success)" }}
                  >
                    {dict.mistakes.correctAnswer}: <strong>{q.correct_answer}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={localePath(lang, `/questions/${q.id}`)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                  >
                    Review
                  </Link>
                  <Link
                    href={localePath(lang, "/practice/session?mode=incorrect&count=10")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                    style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}
                  >
                    <Play size={11} />
                    Practice Again
                  </Link>
                  <Link
                    href={localePath(lang, `/tutor?questionId=${q.id}`)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                    style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}
                  >
                    <Brain size={11} />
                    Ask AI
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function buildUrl(base: string, params: Record<string, string | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) p.set(k, v);
  }
  const qs = p.toString();
  return `${base}${qs ? "?" + qs : ""}`;
}

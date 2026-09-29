import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, localePath } from "@/lib/i18n";
import { BookOpen, ChevronRight } from "lucide-react";

const DIFFICULTY_COLORS: Record<string, { bg: string; color: string }> = {
  easy: { bg: "rgba(22,163,74,0.1)", color: "var(--success)" },
  medium: { bg: "rgba(217,119,6,0.1)", color: "var(--warning)" },
  hard: { bg: "rgba(239,68,68,0.1)", color: "var(--destructive)" },
};

type StatusFilter = "all" | "unanswered" | "correct" | "incorrect";

export default async function QuestionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ exam?: string; category?: string; topic?: string; difficulty?: string; status?: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const sp = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(localePath(lang, "/login"));

  const statusFilter: StatusFilter = (sp.status as StatusFilter) || "all";

  // Build questions query
  let query = supabase
    .from("questions")
    .select("id, question_text, category, topic, difficulty, exam, status")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(100);

  if (sp.exam) query = query.eq("exam", sp.exam);
  if (sp.category) query = query.eq("category", sp.category);
  if (sp.topic) query = query.eq("topic", sp.topic);
  if (sp.difficulty) query = query.eq("difficulty", sp.difficulty as import("@/types/database").Difficulty);

  const { data: questions } = await query;

  // Fetch user attempts
  const { data: attempts } = await supabase
    .from("question_attempts")
    .select("question_id, is_correct, attempted_at")
    .eq("user_id", user.id)
    .order("attempted_at", { ascending: false });

  // Build a map of latest attempt per question
  const latestAttempt = new Map<string, { is_correct: boolean }>();
  for (const a of attempts ?? []) {
    if (!latestAttempt.has(a.question_id)) {
      latestAttempt.set(a.question_id, { is_correct: a.is_correct });
    }
  }

  // Filter by status
  const filteredQuestions = (questions ?? []).filter((q) => {
    if (statusFilter === "all") return true;
    const attempt = latestAttempt.get(q.id);
    if (statusFilter === "unanswered") return !attempt;
    if (statusFilter === "correct") return attempt?.is_correct === true;
    if (statusFilter === "incorrect") return attempt?.is_correct === false;
    return true;
  });

  // Get distinct filter options
  const allQuestions = questions ?? [];
  const exams = [...new Set(allQuestions.map((q) => q.exam).filter(Boolean))];
  const categories = [...new Set(allQuestions.map((q) => q.category).filter(Boolean))];

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: dict.common.all },
    { key: "unanswered", label: dict.common.unanswered },
    { key: "correct", label: dict.common.correct },
    { key: "incorrect", label: dict.common.incorrect },
  ];

  const questionsBase = localePath(lang, "/questions");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          {dict.questionBank.title}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          {dict.questionBank.allExams}
        </p>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl border p-4 space-y-3"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex flex-wrap gap-3">
          {/* Exam filter */}
          {exams.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                {lang === "ar" ? "الامتحان:" : "Exam:"}
              </label>
              <div className="flex gap-1.5 flex-wrap">
                <Link
                  href={buildFilterUrl(questionsBase, sp, { exam: undefined })}
                  className="text-xs px-2.5 py-1 rounded-full border transition-colors"
                  style={{
                    borderColor: !sp.exam ? "var(--brand)" : "var(--border)",
                    background: !sp.exam ? "var(--brand)" : "transparent",
                    color: !sp.exam ? "var(--brand-foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {dict.common.all}
                </Link>
                {exams.map((exam) => (
                  <Link
                    key={exam}
                    href={buildFilterUrl(questionsBase, sp, { exam: exam! })}
                    className="text-xs px-2.5 py-1 rounded-full border transition-colors"
                    style={{
                      borderColor: sp.exam === exam ? "var(--brand)" : "var(--border)",
                      background: sp.exam === exam ? "var(--brand)" : "transparent",
                      color: sp.exam === exam ? "var(--brand-foreground)" : "var(--muted-foreground)",
                    }}
                  >
                    {exam}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                {dict.common.category}:
              </label>
              <div className="flex gap-1.5 flex-wrap">
                <Link
                  href={buildFilterUrl(questionsBase, sp, { category: undefined })}
                  className="text-xs px-2.5 py-1 rounded-full border"
                  style={{
                    borderColor: !sp.category ? "var(--brand)" : "var(--border)",
                    background: !sp.category ? "var(--brand)" : "transparent",
                    color: !sp.category ? "var(--brand-foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {dict.common.all}
                </Link>
                {categories.slice(0, 8).map((cat) => (
                  <Link
                    key={cat}
                    href={buildFilterUrl(questionsBase, sp, { category: cat! })}
                    className="text-xs px-2.5 py-1 rounded-full border"
                    style={{
                      borderColor: sp.category === cat ? "var(--brand)" : "var(--border)",
                      background: sp.category === cat ? "var(--brand)" : "transparent",
                      color: sp.category === cat ? "var(--brand-foreground)" : "var(--muted-foreground)",
                    }}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
              {dict.common.difficulty}:
            </label>
            <div className="flex gap-1.5">
              {[undefined, "easy", "medium", "hard"].map((d) => (
                <Link
                  key={d ?? "all"}
                  href={buildFilterUrl(questionsBase, sp, { difficulty: d })}
                  className="text-xs px-2.5 py-1 rounded-full border"
                  style={{
                    borderColor: sp.difficulty === d ? "var(--brand)" : "var(--border)",
                    background: sp.difficulty === d ? "var(--brand)" : "transparent",
                    color: sp.difficulty === d ? "var(--brand-foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {d ? d.charAt(0).toUpperCase() + d.slice(1) : dict.common.all}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: "var(--border)" }}>
        {statusTabs.map(({ key, label }) => (
          <Link
            key={key}
            href={buildFilterUrl(questionsBase, sp, { status: key === "all" ? undefined : key })}
            className="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderBottomColor: statusFilter === key ? "var(--brand)" : "transparent",
              color: statusFilter === key ? "var(--brand)" : "var(--muted-foreground)",
            }}
          >
            {label}
          </Link>
        ))}
        <span
          className="ml-auto self-center text-xs px-2"
          style={{ color: "var(--muted-foreground)" }}
        >
          {filteredQuestions.length} {dict.common.questions}
        </span>
      </div>

      {/* Questions list */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={40} className="mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
          <p className="font-medium" style={{ color: "var(--foreground)" }}>
            {dict.questionBank.noQuestions}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {dict.common.filter}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredQuestions.map((q) => {
            const attempt = latestAttempt.get(q.id);
            const diffStyle = DIFFICULTY_COLORS[q.difficulty] ?? DIFFICULTY_COLORS.medium;

            return (
              <Link
                key={q.id}
                href={localePath(lang, `/questions/${q.id}`)}
                className="flex items-center gap-4 p-4 rounded-xl border transition-colors hover:border-gray-300"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                {/* Status indicator */}
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    background: !attempt
                      ? "var(--border)"
                      : attempt.is_correct
                      ? "var(--success)"
                      : "var(--destructive)",
                  }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--foreground)" }}
                  >
                    {q.question_text}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {q.category && (
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {q.category}
                      </span>
                    )}
                    {q.topic && (
                      <>
                        <span style={{ color: "var(--border)" }}>·</span>
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {q.topic}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Difficulty badge */}
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                  style={{ background: diffStyle.bg, color: diffStyle.color }}
                >
                  {q.difficulty}
                </span>

                <ChevronRight size={16} style={{ color: "var(--muted-foreground)" }} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function buildFilterUrl(
  base: string,
  current: Record<string, string | undefined>,
  updates: Record<string, string | undefined>
): string {
  const merged = { ...current, ...updates };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return `${base}${qs ? "?" + qs : ""}`;
}

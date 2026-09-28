import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

const diffColors: Record<string, { bg: string; text: string }> = {
  easy: { bg: "#f0fdf4", text: "#16a34a" },
  medium: { bg: "#fffbeb", text: "#d97706" },
  hard: { bg: "#fef2f2", text: "#dc2626" },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: "#f9fafb", text: "#6b7280" },
  published: { bg: "#f0fdf4", text: "#16a34a" },
  archived: { bg: "#fef2f2", text: "#dc2626" },
};

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; difficulty?: string; q?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();

  let query = admin.from("questions").select("id,question_text,category,topic,difficulty,status,created_at").order("created_at", { ascending: false });

  if (params.status && params.status !== "all") query = query.eq("status", params.status as import("@/types/database").QuestionStatus);
  if (params.difficulty) query = query.eq("difficulty", params.difficulty as import("@/types/database").Difficulty);
  if (params.q) query = query.ilike("question_text", `%${params.q}%`);

  const { data: questions } = await query.limit(100);

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const merged = { status: params.status, difficulty: params.difficulty, q: params.q, ...overrides };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "all" && v !== "") sp.set(k, v);
    }
    const s = sp.toString();
    return `/admin/questions${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Questions</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {questions?.length ?? 0} question{questions?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/questions/import"
            className="text-sm px-3 py-2 rounded-lg font-medium border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--background)" }}
          >
            Import CSV
          </Link>
          <Link
            href="/admin/questions/new"
            className="text-sm px-3 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            + New Question
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "draft", "published", "archived"].map((s) => (
          <a key={s} href={buildUrl({ status: s })}
            className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize"
            style={{
              background: (params.status ?? "all") === s ? "var(--primary)" : "var(--secondary)",
              color: (params.status ?? "all") === s ? "var(--primary-foreground)" : "var(--muted-foreground)",
            }}
          >{s}</a>
        ))}
        <span className="w-px mx-1" style={{ background: "var(--border)" }} />
        {["all", "easy", "medium", "hard"].map((d) => (
          <a key={d} href={buildUrl({ difficulty: d === "all" ? undefined : d })}
            className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize"
            style={{
              background: (params.difficulty ?? "all") === d ? "var(--primary)" : "var(--secondary)",
              color: (params.difficulty ?? "all") === d ? "var(--primary-foreground)" : "var(--muted-foreground)",
            }}
          >{d}</a>
        ))}
        <form className="ml-auto" method="get" action="/admin/questions">
          {params.status && <input type="hidden" name="status" value={params.status} />}
          {params.difficulty && <input type="hidden" name="difficulty" value={params.difficulty} />}
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search questions…"
            className="px-3 py-1.5 text-sm rounded-lg border outline-none"
            style={{ background: "var(--background)", borderColor: "var(--border)", minWidth: "200px" }}
          />
        </form>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        {questions?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--secondary)", borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Question</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell" style={{ color: "var(--muted-foreground)" }}>Category</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Difficulty</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Status</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ background: "var(--card)" }}>
                {questions.map((q) => {
                  const dc = diffColors[q.difficulty] ?? diffColors.medium;
                  const sc = statusColors[q.status] ?? statusColors.draft;
                  return (
                    <tr key={q.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="truncate text-sm">{q.question_text}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{q.topic ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-sm" style={{ color: "var(--muted-foreground)" }}>
                        {q.category ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                          style={{ background: dc.bg, color: dc.text }}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                          style={{ background: sc.bg, color: sc.text }}>
                          {q.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/questions/${q.id}/edit`}
                          className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors hover:opacity-80"
                          style={{ background: "var(--secondary)", color: "var(--foreground)" }}
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center" style={{ background: "var(--card)" }}>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No questions found</p>
            <Link href="/admin/questions/new" className="inline-block mt-3 text-sm font-medium hover:underline" style={{ color: "var(--brand)" }}>
              Create your first question
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

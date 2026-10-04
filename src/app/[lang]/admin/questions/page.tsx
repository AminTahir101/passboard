import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { getDictionary, localePath } from "@/lib/i18n";

const diffColors: Record<string, { bg: string; text: string }> = {
  easy:   { bg: "var(--success-muted)",     text: "var(--success)" },
  medium: { bg: "var(--warning-muted)",     text: "var(--warning)" },
  hard:   { bg: "var(--destructive-muted)", text: "var(--destructive)" },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  draft:     { bg: "var(--secondary)",         text: "var(--muted-foreground)" },
  published: { bg: "var(--success-muted)",     text: "var(--success)" },
  archived:  { bg: "var(--destructive-muted)", text: "var(--destructive)" },
};

export default async function QuestionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ status?: string; difficulty?: string; q?: string }>;
}) {
  const { lang } = await params;
  const sp = await searchParams;
  const dict = await getDictionary(lang);
  const d = dict.admin.questions;
  const admin = createAdminClient();

  let query = admin.from("questions").select("id,question_text,category,topic,difficulty,status,created_at").order("created_at", { ascending: false });

  if (sp.status && sp.status !== "all") query = query.eq("status", sp.status as import("@/types/database").QuestionStatus);
  if (sp.difficulty) query = query.eq("difficulty", sp.difficulty as import("@/types/database").Difficulty);
  if (sp.q) query = query.ilike("question_text", `%${sp.q}%`);

  const { data: questions } = await query.limit(100);

  const baseUrl = localePath(lang, "/admin/questions");

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const merged = { status: sp.status, difficulty: sp.difficulty, q: sp.q, ...overrides };
    const urlParams = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "all" && v !== "") urlParams.set(k, v);
    }
    const s = urlParams.toString();
    return `${baseUrl}${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{d.title}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {questions?.length ?? 0}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={localePath(lang, "/admin/questions/import")}
            className="text-sm px-3 py-2 rounded-lg font-medium border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--background)" }}
          >
            {d.importCsv}
          </Link>
          <Link
            href={localePath(lang, "/admin/questions/new")}
            className="text-sm px-3 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            + {d.newQuestion}
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "draft", "published", "archived"].map((s) => (
          <a key={s} href={buildUrl({ status: s })}
            className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize"
            style={{
              background: (sp.status ?? "all") === s ? "var(--primary)" : "var(--secondary)",
              color: (sp.status ?? "all") === s ? "var(--primary-foreground)" : "var(--muted-foreground)",
            }}
          >{s}</a>
        ))}
        <span className="w-px mx-1" style={{ background: "var(--border)" }} />
        {["all", "easy", "medium", "hard"].map((diff) => (
          <a key={diff} href={buildUrl({ difficulty: diff === "all" ? undefined : diff })}
            className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize"
            style={{
              background: (sp.difficulty ?? "all") === diff ? "var(--primary)" : "var(--secondary)",
              color: (sp.difficulty ?? "all") === diff ? "var(--primary-foreground)" : "var(--muted-foreground)",
            }}
          >{diff}</a>
        ))}
        <form className="ml-auto" method="get" action={baseUrl}>
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          {sp.difficulty && <input type="hidden" name="difficulty" value={sp.difficulty} />}
          <input
            name="q"
            defaultValue={sp.q}
            placeholder={dict.common.search}
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
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>{dict.common.questions}</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell" style={{ color: "var(--muted-foreground)" }}>{dict.common.category}</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>{dict.common.difficulty}</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>{dict.common.status}</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>{dict.common.actions}</th>
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
                          href={localePath(lang, `/admin/questions/${q.id}/edit`)}
                          className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors hover:opacity-80"
                          style={{ background: "var(--secondary)", color: "var(--foreground)" }}
                        >
                          {dict.common.edit}
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
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{d.noQuestions}</p>
            <Link href={localePath(lang, "/admin/questions/new")} className="inline-block mt-3 text-sm font-medium hover:underline" style={{ color: "var(--brand)" }}>
              {d.createFirst}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

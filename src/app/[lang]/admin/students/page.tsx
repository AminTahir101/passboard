import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { getDictionary, localePath } from "@/lib/i18n";

const accessColors: Record<string, { bg: string; text: string }> = {
  active: { bg: "#f0fdf4", text: "#16a34a" },
  pending: { bg: "#fffbeb", text: "#d97706" },
  suspended: { bg: "#fef2f2", text: "#dc2626" },
  expired: { bg: "#f9fafb", text: "#6b7280" },
};

export default async function StudentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { lang } = await params;
  const sp = await searchParams;
  const dict = await getDictionary(lang);
  const d = dict.admin.students;
  const admin = createAdminClient();

  let query = admin
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  if (sp.status && sp.status !== "all") {
    query = query.eq("access_status", sp.status as import("@/types/database").AccessStatus);
  }

  const { data: students } = await query;

  const filtered = sp.q
    ? students?.filter(
        (s) =>
          s.full_name?.toLowerCase().includes(sp.q!.toLowerCase()) ||
          s.email.toLowerCase().includes(sp.q!.toLowerCase())
      )
    : students;

  const baseUrl = localePath(lang, "/admin/students");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{d.title}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {filtered?.length ?? 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "active", "pending", "suspended", "expired"].map((s) => (
          <a
            key={s}
            href={`${baseUrl}${s !== "all" ? `?status=${s}` : ""}${sp.q ? `${s !== "all" ? "&" : "?"}q=${sp.q}` : ""}`}
            className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors"
            style={{
              background: (sp.status ?? "all") === s ? "var(--primary)" : "var(--secondary)",
              color: (sp.status ?? "all") === s ? "var(--primary-foreground)" : "var(--muted-foreground)",
            }}
          >
            {s}
          </a>
        ))}
        <form className="ml-auto">
          <input
            name="q"
            defaultValue={sp.q}
            placeholder={dict.common.search}
            className="px-3 py-1.5 text-sm rounded-lg border outline-none"
            style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)", minWidth: "200px" }}
          />
        </form>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        {filtered?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--secondary)", borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>{dict.common.name}</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell" style={{ color: "var(--muted-foreground)" }}>{d.targetExam}</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell" style={{ color: "var(--muted-foreground)" }}>{d.examDate}</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>{d.status}</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell" style={{ color: "var(--muted-foreground)" }}>{d.expires}</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>{dict.common.actions}</th>
                </tr>
              </thead>
              <tbody style={{ background: "var(--card)" }}>
                {filtered.map((s) => {
                  const sc = accessColors[s.access_status] ?? accessColors.pending;
                  return (
                    <tr key={s.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                      <td className="px-4 py-3">
                        <p className="font-medium">{s.full_name ?? "—"}</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.email}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-sm" style={{ color: "var(--muted-foreground)" }}>
                        {s.target_exam ?? "—"}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm" style={{ color: "var(--muted-foreground)" }}>
                        {s.exam_date ? formatDate(s.exam_date) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                          style={{ background: sc.bg, color: sc.text }}
                        >
                          {s.access_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-sm" style={{ color: "var(--muted-foreground)" }}>
                        {s.access_expires_at ? formatDate(s.access_expires_at) : dict.common.never}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={localePath(lang, `/admin/students/${s.id}`)}
                          className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                          style={{ background: "var(--secondary)", color: "var(--foreground)" }}
                        >
                          {d.manage}
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
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{d.noStudents}</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { AccessRequestActions } from "./AccessRequestActions";
import { getDictionary, localePath } from "@/lib/i18n";

const STATUS_OPTIONS = ["all", "new", "contacted", "paid", "approved", "rejected"] as const;

const statusColors: Record<string, { bg: string; text: string }> = {
  new: { bg: "#eff6ff", text: "#2563eb" },
  contacted: { bg: "#fffbeb", text: "#d97706" },
  paid: { bg: "#f5f3ff", text: "#7c3aed" },
  approved: { bg: "#f0fdf4", text: "#16a34a" },
  rejected: { bg: "#fef2f2", text: "#dc2626" },
};

export default async function AccessRequestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { lang } = await params;
  const sp = await searchParams;
  const statusFilter = sp.status ?? "all";
  const dict = await getDictionary(lang);
  const d = dict.admin.accessRequests;
  const admin = createAdminClient();

  let query = admin.from("access_requests").select("*").order("created_at", { ascending: false });
  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter as import("@/types/database").AccessRequestStatus);
  }

  const { data: requests } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{d.title}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          {requests?.length ?? 0}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 flex-wrap">
        {STATUS_OPTIONS.map((s) => (
          <a
            key={s}
            href={`${localePath(lang, "/admin/access-requests")}${s !== "all" ? `?status=${s}` : ""}`}
            className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors"
            style={{
              background: statusFilter === s ? "var(--primary)" : "var(--secondary)",
              color: statusFilter === s ? "var(--primary-foreground)" : "var(--muted-foreground)",
            }}
          >
            {s}
          </a>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        {requests?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--secondary)", borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>{dict.common.name}</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>{dict.common.email}</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell" style={{ color: "var(--muted-foreground)" }}>{d.targetExam}</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell" style={{ color: "var(--muted-foreground)" }}>{dict.common.date}</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>{dict.common.status}</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>{dict.common.actions}</th>
                </tr>
              </thead>
              <tbody style={{ background: "var(--card)" }}>
                {requests.map((r) => {
                  const sc = statusColors[r.status] ?? statusColors.new;
                  return (
                    <tr key={r.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                      <td className="px-4 py-3 font-medium">{r.full_name}</td>
                      <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>{r.email}</td>
                      <td className="px-4 py-3 hidden sm:table-cell" style={{ color: "var(--muted-foreground)" }}>
                        {r.target_exam ?? "—"}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell" style={{ color: "var(--muted-foreground)" }}>
                        {formatDate(r.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                          style={{ background: sc.bg, color: sc.text }}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <AccessRequestActions request={r} dict={d} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center" style={{ background: "var(--card)" }}>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{d.noRequests}</p>
          </div>
        )}
      </div>
    </div>
  );
}

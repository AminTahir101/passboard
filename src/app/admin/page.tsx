import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const admin = createAdminClient();

  // Counts
  const [
    { count: totalStudents },
    { count: activeStudents },
    { count: expiredStudents },
    { count: pendingRequests },
    { count: totalQuestions },
    { count: publishedQuestions },
    { count: totalAttempts },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student").eq("access_status", "active"),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student").eq("access_status", "expired"),
    admin.from("access_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
    admin.from("questions").select("*", { count: "exact", head: true }),
    admin.from("questions").select("*", { count: "exact", head: true }).eq("status", "published"),
    admin.from("question_attempts").select("*", { count: "exact", head: true }),
  ]);

  const { data: recentRequests } = await admin
    .from("access_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentStudents } = await admin
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Total Students", value: totalStudents ?? 0 },
    { label: "Active Students", value: activeStudents ?? 0, color: "var(--success)" },
    { label: "Expired", value: expiredStudents ?? 0, color: "var(--warning)" },
    { label: "Pending Requests", value: pendingRequests ?? 0, color: pendingRequests ? "var(--brand)" : undefined },
    { label: "Total Questions", value: totalQuestions ?? 0 },
    { label: "Published", value: publishedQuestions ?? 0, color: "var(--success)" },
    { label: "Total Attempts", value: totalAttempts ?? 0 },
  ];

  const statusColors: Record<string, string> = {
    new: "#2563eb",
    contacted: "#d97706",
    paid: "#7c3aed",
    approved: "#16a34a",
    rejected: "#dc2626",
  };

  const accessColors: Record<string, string> = {
    active: "#16a34a",
    pending: "#d97706",
    suspended: "#dc2626",
    expired: "#6b7280",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border p-5"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color ?? "var(--foreground)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-semibold text-sm">Recent Access Requests</h2>
            <Link href="/admin/access-requests" className="text-xs hover:underline" style={{ color: "var(--muted-foreground)" }}>View all</Link>
          </div>
          {recentRequests?.length ? (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {recentRequests.map((r) => (
                <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.full_name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{r.email}</p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ background: `${statusColors[r.status]}18`, color: statusColors[r.status] }}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-sm text-center" style={{ color: "var(--muted-foreground)" }}>No access requests</p>
          )}
        </div>

        {/* Recent Students */}
        <div className="rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-semibold text-sm">Recent Students</h2>
            <Link href="/admin/students" className="text-xs hover:underline" style={{ color: "var(--muted-foreground)" }}>View all</Link>
          </div>
          {recentStudents?.length ? (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {recentStudents.map((s) => (
                <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.full_name ?? s.email}</p>
                    <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{s.target_exam ?? "—"}</p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ background: `${accessColors[s.access_status]}18`, color: accessColors[s.access_status] }}
                  >
                    {s.access_status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-sm text-center" style={{ color: "var(--muted-foreground)" }}>No students yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

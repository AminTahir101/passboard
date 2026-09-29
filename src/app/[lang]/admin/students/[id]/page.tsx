import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { StudentActions } from "./StudentActions";
import Link from "next/link";
import { getDictionary, localePath } from "@/lib/i18n";

export default async function StudentDetailPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  const dict = await getDictionary(lang);
  const d = dict.admin.students;
  const admin = createAdminClient();

  const { data: student } = await admin.from("profiles").select("*").eq("id", id).single();
  if (!student || student.role !== "student") notFound();

  const [
    { count: totalAttempts },
    { count: correctAttempts },
    { data: mockExams },
  ] = await Promise.all([
    admin.from("question_attempts").select("*", { count: "exact", head: true }).eq("user_id", id),
    admin.from("question_attempts").select("*", { count: "exact", head: true }).eq("user_id", id).eq("is_correct", true),
    admin.from("mock_exams").select("*").eq("user_id", id).not("completed_at", "is", null).order("started_at", { ascending: false }).limit(5),
  ]);

  const accuracy = totalAttempts ? Math.round(((correctAttempts ?? 0) / totalAttempts) * 100) : 0;

  const accessColors: Record<string, { bg: string; text: string }> = {
    active: { bg: "#f0fdf4", text: "#16a34a" },
    pending: { bg: "#fffbeb", text: "#d97706" },
    suspended: { bg: "#fef2f2", text: "#dc2626" },
    expired: { bg: "#f9fafb", text: "#6b7280" },
  };
  const sc = accessColors[student.access_status] ?? accessColors.pending;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Link href={localePath(lang, "/admin/students")} className="text-sm hover:underline" style={{ color: "var(--muted-foreground)" }}>
          {d.title}
        </Link>
        <span style={{ color: "var(--muted-foreground)" }}>/</span>
        <span className="text-sm">{student.full_name ?? student.email}</span>
      </div>

      {/* Profile */}
      <div className="rounded-xl border p-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold">{student.full_name ?? "—"}</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>{student.email}</p>
          </div>
          <span
            className="px-2 py-1 rounded-full text-xs font-medium capitalize"
            style={{ background: sc.bg, color: sc.text }}
          >
            {student.access_status}
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium mb-0.5">{dict.common.phone}</p>
            <p style={{ color: "var(--muted-foreground)" }}>{student.phone ?? "—"}</p>
          </div>
          <div>
            <p className="font-medium mb-0.5">{d.targetExam}</p>
            <p style={{ color: "var(--muted-foreground)" }}>{student.target_exam ?? "—"}</p>
          </div>
          <div>
            <p className="font-medium mb-0.5">{d.examDate}</p>
            <p style={{ color: "var(--muted-foreground)" }}>{student.exam_date ? formatDate(student.exam_date) : "—"}</p>
          </div>
          <div>
            <p className="font-medium mb-0.5">{d.expires}</p>
            <p style={{ color: "var(--muted-foreground)" }}>
              {student.access_expires_at ? formatDate(student.access_expires_at) : dict.common.never}
            </p>
          </div>
          <div>
            <p className="font-medium mb-0.5">{dict.common.date}</p>
            <p style={{ color: "var(--muted-foreground)" }}>{formatDate(student.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: d.totalAnswered, value: totalAttempts ?? 0 },
          { label: d.correct, value: correctAttempts ?? 0 },
          { label: d.accuracy, value: `${accuracy}%` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border p-4 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="rounded-xl border p-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <h2 className="font-semibold mb-4">{d.performanceStats}</h2>
        <StudentActions student={student} dict={d} lang={lang} />
      </div>

      {/* Recent Mock Exams */}
      {mockExams && mockExams.length > 0 && (
        <div className="rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-semibold text-sm">{d.mockExamHistory}</h2>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {mockExams.map((exam) => (
              <div key={exam.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{exam.exam_name ?? "Mock Exam"}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {formatDate(exam.started_at)} · {exam.question_count} {dict.common.questions}
                  </p>
                </div>
                {exam.percentage !== null && (
                  <span className="font-semibold">{exam.percentage}%</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

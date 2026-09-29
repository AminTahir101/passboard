import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, localePath } from "@/lib/i18n";
import ProfileForm from "@/components/layout/ProfileForm";
import { User, Mail, Shield, Calendar, Clock } from "lucide-react";

function getAccessStatusLabels(dict: { active: string; pending: string; suspended: string; expired: string }): Record<string, { label: string; color: string; bg: string }> {
  return {
    active: { label: dict.active, color: "var(--success)", bg: "rgba(22,163,74,0.1)" },
    pending: { label: dict.pending, color: "var(--warning)", bg: "rgba(217,119,6,0.1)" },
    suspended: { label: dict.suspended, color: "var(--destructive)", bg: "rgba(239,68,68,0.1)" },
    expired: { label: dict.expired, color: "var(--muted-foreground)", bg: "var(--muted)" },
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(localePath(lang, "/login"));

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect(localePath(lang, "/login"));

  const ACCESS_STATUS_LABELS = getAccessStatusLabels({
    active: dict.common.active,
    pending: dict.common.pending,
    suspended: dict.common.suspended,
    expired: dict.common.expired,
  });
  const statusStyle =
    ACCESS_STATUS_LABELS[profile.access_status] ?? ACCESS_STATUS_LABELS.pending;

  // Count total attempts
  const { count: totalAttempts } = await supabase
    .from("question_attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          {dict.profile.title}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          {dict.profile.accountInfo}
        </p>
      </div>

      {/* Account info card */}
      <div
        className="rounded-xl border p-5 space-y-4"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
            style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
          >
            {(profile.full_name || profile.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-lg" style={{ color: "var(--foreground)" }}>
              {profile.full_name ?? "Student"}
            </p>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {profile.email}
            </p>
          </div>
        </div>

        <div className="border-t pt-4 grid grid-cols-2 gap-4" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <Mail size={15} style={{ color: "var(--muted-foreground)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {dict.profile.email}
              </p>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {profile.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <User size={15} style={{ color: "var(--muted-foreground)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {lang === "ar" ? "الدور" : "Role"}
              </p>
              <p className="text-sm font-medium capitalize" style={{ color: "var(--foreground)" }}>
                {profile.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield size={15} style={{ color: "var(--muted-foreground)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {dict.profile.accessStatus}
              </p>
              <span
                className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: statusStyle.bg, color: statusStyle.color }}
              >
                {statusStyle.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock size={15} style={{ color: "var(--muted-foreground)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {dict.profile.accessExpires}
              </p>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {profile.access_expires_at
                  ? new Date(profile.access_expires_at).toLocaleDateString()
                  : dict.profile.never}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar size={15} style={{ color: "var(--muted-foreground)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {lang === "ar" ? "عضو منذ" : "Member Since"}
              </p>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: "var(--muted)" }}
            >
              <span className="text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>
                Q
              </span>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {lang === "ar" ? "الأسئلة المحاولة" : "Questions Attempted"}
              </p>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {(totalAttempts ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div
        className="rounded-xl border p-5"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h2 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>
          {dict.profile.editProfile}
        </h2>
        <ProfileForm profile={profile} dict={dict.profile} lang={lang} />
      </div>
    </div>
  );
}

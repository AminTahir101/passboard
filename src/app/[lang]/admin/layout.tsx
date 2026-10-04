import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { getDictionary, localePath } from "@/lib/i18n";
import { getDevProfile } from "@/lib/dev-user";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  let profile: { role: string; full_name: string | null; email: string } | null = getDevProfile();

  if (!profile) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect(localePath(lang, "/login"));

    const { data } = await supabase
      .from("profiles")
      .select("role, full_name, email")
      .eq("id", user.id)
      .single();

    profile = data;
  }

  if (!profile || profile.role !== "admin") redirect(localePath(lang, "/dashboard"));

  return (
    <div className="flex rtl:flex-row-reverse h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <AdminSidebar
        adminName={profile.full_name ?? profile.email}
        lang={lang}
        nav={dict.nav}
        langToggleLabel={dict.lang.toggle}
      />
      <div className="flex-1 flex flex-col overflow-auto">
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}

// src/app/[lang]/(app)/layout.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppSidebar from "@/components/layout/AppSidebar";
import type { Profile } from "@/types/database";
import { getDictionary, localePath } from "@/lib/i18n";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(localePath(lang, "/login"));

  const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const profile = profileData as Profile | null;
  if (!profile) redirect(localePath(lang, "/login"));

  if (profile.access_status === "suspended") redirect(localePath(lang, "/unauthorized") + "?reason=suspended");
  if (profile.access_status === "expired") redirect(localePath(lang, "/unauthorized") + "?reason=expired");
  if (profile.access_status === "active" && profile.access_expires_at) {
    if (new Date(profile.access_expires_at) < new Date()) {
      redirect(localePath(lang, "/unauthorized") + "?reason=expired");
    }
  }
  if (profile.access_status !== "active") redirect(localePath(lang, "/unauthorized") + "?reason=pending");

  return (
    <>
      <AppSidebar
        userName={profile.full_name}
        userEmail={profile.email}
        lang={lang}
        nav={dict.nav}
        langToggleLabel={dict.lang.toggle}
      />
      <div className="min-h-screen lg:pl-60 pt-[57px] lg:pt-0" style={{ background: "var(--background)" }}>
        <main className="p-6">{children}</main>
      </div>
    </>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppSidebar from "@/components/layout/AppSidebar";
import type { Profile } from "@/types/database";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  if (!profile) {
    redirect("/login");
  }

  if (profile.access_status === "suspended") {
    redirect("/unauthorized?reason=suspended");
  }

  if (profile.access_status === "expired") {
    redirect("/unauthorized?reason=expired");
  }

  if (profile.access_status === "active" && profile.access_expires_at) {
    const expiresAt = new Date(profile.access_expires_at);
    if (expiresAt < new Date()) {
      redirect("/unauthorized?reason=expired");
    }
  }

  if (profile.access_status !== "active") {
    redirect("/unauthorized?reason=pending");
  }

  return (
    <>
      <AppSidebar
        userName={profile.full_name}
        userEmail={profile.email}
      />
      <div
        className="min-h-screen lg:pl-60 pt-[57px] lg:pt-0"
        style={{ background: "var(--background)" }}
      >
        <main className="p-6">
          {children}
        </main>
      </div>
    </>
  );
}

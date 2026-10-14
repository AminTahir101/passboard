import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, localePath } from "@/lib/i18n";
import CaseLabClient from "./CaseLabClient";

export default async function CaseLabPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(localePath(lang, "/login"));

  const { data: cases } = await supabase
    .from("cases")
    .select("id, status, chief_complaint, created_at, updated_at")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  return (
    <CaseLabClient
      cases={cases ?? []}
      dict={dict.caseLab}
      lang={lang}
    />
  );
}

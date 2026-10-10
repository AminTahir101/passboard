import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, localePath } from "@/lib/i18n";
import type { StudyPlan, StudyTask } from "@/types/database";
import StudyPlanClient from "./StudyPlanClient";

export default async function StudyPlanPage({
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

  const { data: plan } = await supabase
    .from("study_plans")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!plan) redirect(localePath(lang, "/study-plan/setup"));

  const { data: tasks } = await supabase
    .from("study_tasks")
    .select("*")
    .eq("plan_id", plan.id)
    .order("scheduled_date", { ascending: true })
    .order("position", { ascending: true });

  return (
    <StudyPlanClient
      plan={plan as StudyPlan}
      tasks={(tasks ?? []) as StudyTask[]}
      lang={lang}
      dict={dict.studyPlan}
      setupPath={localePath(lang, "/study-plan/setup")}
    />
  );
}

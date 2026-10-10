import { createClient } from "@/lib/supabase/server";
import { getDictionary, localePath } from "@/lib/i18n";
import type { StudyPlan } from "@/types/database";
import StudyPlanSetupClient from "./StudyPlanSetupClient";

export default async function StudyPlanSetupPage({
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

  // Fetch profile for pre-fill
  const userId = user?.id;
  const { data: profileData } = userId
    ? await supabase
        .from("profiles")
        .select("target_exam, exam_date")
        .eq("id", userId)
        .single()
    : { data: null };

  // Fetch existing plan for edit mode
  const { data: existingPlan } = userId
    ? await supabase
        .from("study_plans")
        .select("*")
        .eq("user_id", userId)
        .single()
    : { data: null };

  // Fetch available specialties
  const { data: catData } = await supabase
    .from("questions")
    .select("category")
    .eq("status", "published")
    .not("category", "is", null);

  const allSpecialties: string[] = [
    ...new Set(
      (catData ?? [])
        .map((q: { category: string | null }) => q.category)
        .filter((c): c is string => !!c)
    ),
  ].sort();

  return (
    <StudyPlanSetupClient
      lang={lang}
      dict={dict.studyPlan}
      existingPlan={existingPlan as StudyPlan | null}
      profileExam={(profileData as { target_exam: string | null } | null)?.target_exam ?? null}
      profileExamDate={(profileData as { exam_date: string | null } | null)?.exam_date ?? null}
      allSpecialties={allSpecialties}
      planPath={localePath(lang, "/study-plan")}
    />
  );
}

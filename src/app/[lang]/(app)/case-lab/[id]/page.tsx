import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, localePath } from "@/lib/i18n";
import ReportView from "./ReportView";
import type { AnalysisResult } from "../new/NewCaseWizard";

export default async function CaseReportPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const dict = await getDictionary(lang);
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(localePath(lang, "/login"));

  const { data: c } = await supabase
    .from("cases")
    .select("id, status, chief_complaint, owner_id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!c) notFound();

  if (c.status !== "done") {
    redirect(localePath(lang, "/case-lab"));
  }

  const { data: analysis } = await supabase
    .from("case_analyses")
    .select("findings_json, differential_json, urgency, agreement, abstained, prompt_version")
    .eq("case_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const result: AnalysisResult = {
    urgency: { level: analysis?.urgency ?? "routine", triggers: [] },
    image_quality: { pass: true, issues: [] },
    findings: analysis?.findings_json as Record<string, string> ?? {},
    problem_representation: "",
    differential: (analysis?.differential_json as AnalysisResult["differential"]) ?? [],
    cant_miss: [],
    missing_information: [],
    workup: [],
    management_direction: [],
    referral: { specialty: null, timeframe: null },
    learning: { discriminating_features: [], exam_tips: [], linked_question_categories: [] },
    abstain: analysis?.abstained ?? false,
    agreement: analysis?.agreement ?? 0,
    prompt_version: analysis?.prompt_version ?? "caselab-v1.0",
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
        {c.chief_complaint ?? dict.caseLab.title}
      </h1>
      <ReportView
        analysis={result}
        caseId={id}
        dict={dict.caseLab}
        lang={lang}
      />
    </div>
  );
}

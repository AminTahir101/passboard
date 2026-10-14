import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

// GET /api/case-lab/cases/:id — fetch case + latest analysis
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: c, error } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (error || !c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: analysis } = await supabase
    .from("case_analyses")
    .select("findings_json, differential_json, urgency, agreement, abstained, prompt_version")
    .eq("case_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!analysis) return NextResponse.json({ case: c, analysis: null });

  // Build the AnalysisResult shape the client expects
  const result = {
    urgency: { level: analysis.urgency ?? "routine", triggers: [] },
    image_quality: { pass: true, issues: [] },
    findings: analysis.findings_json ?? {},
    problem_representation: (analysis.findings_json as Record<string, string>)?.problem_representation ?? "",
    differential: analysis.differential_json ?? [],
    cant_miss: [],
    missing_information: [],
    workup: [],
    management_direction: [],
    referral: { specialty: null, timeframe: null },
    learning: { discriminating_features: [], exam_tips: [], linked_question_categories: [] },
    abstain: analysis.abstained ?? false,
    agreement: analysis.agreement ?? 0,
    prompt_version: analysis.prompt_version ?? "caselab-v1.0",
    ...(analysis.findings_json as object),   // full JSON spread for any extra fields stored
  };

  return NextResponse.json({ case: c, analysis: result });
}

// PATCH /api/case-lab/cases/:id — update chief_complaint, history_json, status
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  type CaseUpdate = { chief_complaint?: string | null; history_json?: Record<string, unknown> | null; status?: string };
  const patch: CaseUpdate = {};
  if ("chief_complaint" in body) patch.chief_complaint = body.chief_complaint as string | null;
  if ("history_json" in body) patch.history_json = body.history_json as Record<string, unknown>;
  if ("status" in body) patch.status = body.status as string;

  const { error } = await supabase
    .from("cases")
    .update(patch)
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { verdict, finalDiagnosis, notes } = await request.json();

  if (!["correct", "partial", "wrong"].includes(verdict)) {
    return NextResponse.json({ error: "Invalid verdict" }, { status: 400 });
  }

  // Verify ownership
  const { data: c } = await supabase
    .from("cases")
    .select("id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error } = await supabase.from("case_feedback").insert({
    case_id: id,
    verdict,
    final_diagnosis_icd: finalDiagnosis || null,
    notes: notes || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("case_audit_log").insert({
    case_id: id,
    actor_id: user.id,
    action: "feedback_submitted",
  });

  return NextResponse.json({ ok: true });
}

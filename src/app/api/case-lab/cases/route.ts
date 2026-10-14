import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/case-lab/cases — list caller's cases
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("cases")
    .select("id, status, chief_complaint, created_at, updated_at")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cases: data });
}

// POST /api/case-lab/cases — create a new case
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { consent_at } = await request.json();

  const { data, error } = await supabase
    .from("cases")
    .insert({
      owner_id: user.id,
      status: "draft",
      consent_at: consent_at ?? new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("case_audit_log").insert({
    case_id: data.id,
    actor_id: user.id,
    action: "created",
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}

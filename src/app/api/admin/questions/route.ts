import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

export async function PATCH(request: Request) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, ids } = await request.json();
  if (action !== "publish" && action !== "archive" && action !== "draft") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const admin = createAdminClient();
  let query = admin.from("questions").update({ status: action, updated_at: new Date().toISOString() } as import("@/types/database").Database["public"]["Tables"]["questions"]["Update"]);

  if (ids && Array.isArray(ids) && ids.length > 0) {
    query = query.in("id", ids);
  } else if (action === "publish") {
    // Bulk-publish all drafts when no IDs provided
    query = query.eq("status", "draft");
  } else {
    return NextResponse.json({ error: "ids required for this action" }, { status: 400 });
  }

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const admin = createAdminClient();

  if (!body.question_text || !body.option_a || !body.option_b || !body.option_c || !body.option_d || !body.correct_answer) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await admin.from("questions").insert({
    question_text: body.question_text,
    option_a: body.option_a,
    option_b: body.option_b,
    option_c: body.option_c,
    option_d: body.option_d,
    correct_answer: body.correct_answer,
    justification: body.justification || null,
    explanation_a: body.explanation_a || null,
    explanation_b: body.explanation_b || null,
    explanation_c: body.explanation_c || null,
    explanation_d: body.explanation_d || null,
    exam: body.exam || null,
    category: body.category || null,
    topic: body.topic || null,
    subtopic: body.subtopic || null,
    difficulty: body.difficulty || "medium",
    year: body.year || null,
    source: body.source || null,
    status: body.status || "draft",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

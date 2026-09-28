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

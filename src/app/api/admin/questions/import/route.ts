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

  const { questions, publish } = await request.json();
  if (!Array.isArray(questions)) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const admin = createAdminClient();
  const status = (publish ? "published" : "draft") as import("@/types/database").QuestionStatus;

  const rows = questions.map((q: Record<string, string>) => ({
    question_text: q.question_text?.trim(),
    option_a: q.option_a?.trim(),
    option_b: q.option_b?.trim(),
    option_c: q.option_c?.trim(),
    option_d: q.option_d?.trim(),
    correct_answer: (q.correct_answer?.trim().toUpperCase()) as import("@/types/database").CorrectAnswer,
    justification: q.justification?.trim() || null,
    explanation_a: q.explanation_a?.trim() || null,
    explanation_b: q.explanation_b?.trim() || null,
    explanation_c: q.explanation_c?.trim() || null,
    explanation_d: q.explanation_d?.trim() || null,
    exam: q.exam?.trim() || null,
    category: q.category?.trim() || null,
    topic: q.topic?.trim() || null,
    subtopic: q.subtopic?.trim() || null,
    difficulty: (q.difficulty?.trim().toLowerCase() || "medium") as import("@/types/database").Difficulty,
    year: q.year ? parseInt(q.year) : null,
    source: q.source?.trim() || null,
    status,
  }));

  // Insert in batches of 50
  let imported = 0;
  let failed = 0;
  const batchSize = 50;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await admin.from("questions").insert(batch);
    if (error) {
      failed += batch.length;
    } else {
      imported += batch.length;
    }
  }

  return NextResponse.json({ imported, failed });
}

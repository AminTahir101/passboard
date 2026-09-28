import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CorrectAnswer } from "@/types/database";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check active access
  const { data: profile } = await supabase
    .from("profiles")
    .select("access_status, access_expires_at")
    .eq("id", user.id)
    .single();

  if (!profile || profile.access_status !== "active") {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  let body: { question_id: string; selected_answer: CorrectAnswer };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { question_id, selected_answer } = body;

  if (!question_id || !selected_answer) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Fetch the question to determine correctness
  const { data: question, error: qError } = await supabase
    .from("questions")
    .select("correct_answer")
    .eq("id", question_id)
    .eq("status", "published")
    .single();

  if (qError || !question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const is_correct = selected_answer === question.correct_answer;

  // Save the attempt
  const { error: insertError } = await supabase.from("question_attempts").insert({
    user_id: user.id,
    question_id,
    selected_answer,
    is_correct,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ is_correct });
}

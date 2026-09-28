import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
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

  if (profile.access_expires_at && new Date(profile.access_expires_at) < new Date()) {
    return NextResponse.json({ error: "Access expired" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "random";
  const count = Math.min(parseInt(searchParams.get("count") ?? "20", 10), 100);
  const category = searchParams.get("category");
  const topic = searchParams.get("topic");

  let questions;

  if (mode === "incorrect") {
    // Fetch questions the user got wrong (latest attempt per question was incorrect)
    const { data: incorrectAttempts } = await supabase
      .from("question_attempts")
      .select("question_id, is_correct, attempted_at")
      .eq("user_id", user.id)
      .order("attempted_at", { ascending: false });

    // Get the latest attempt per question
    const latestByQuestion = new Map<string, boolean>();
    for (const a of incorrectAttempts ?? []) {
      if (!latestByQuestion.has(a.question_id)) {
        latestByQuestion.set(a.question_id, a.is_correct);
      }
    }

    const incorrectIds = Array.from(latestByQuestion.entries())
      .filter(([, correct]) => !correct)
      .map(([id]) => id)
      .slice(0, count);

    if (incorrectIds.length === 0) {
      return NextResponse.json({ questions: [] });
    }

    let query = supabase
      .from("questions")
      .select(
        "id, question_text, option_a, option_b, option_c, option_d, correct_answer, justification, explanation_a, explanation_b, explanation_c, explanation_d, category, topic, difficulty"
      )
      .eq("status", "published")
      .in("id", incorrectIds);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    questions = data;
  } else if (mode === "unanswered") {
    // Fetch questions the user hasn't attempted
    const { data: attemptedData } = await supabase
      .from("question_attempts")
      .select("question_id")
      .eq("user_id", user.id);

    const attemptedIds = [...new Set(attemptedData?.map((a) => a.question_id) ?? [])];

    let query = supabase
      .from("questions")
      .select(
        "id, question_text, option_a, option_b, option_c, option_d, correct_answer, justification, explanation_a, explanation_b, explanation_c, explanation_d, category, topic, difficulty"
      )
      .eq("status", "published")
      .limit(count);

    if (attemptedIds.length > 0) {
      query = query.not("id", "in", `(${attemptedIds.join(",")})`);
    }

    if (category) query = query.eq("category", category);
    if (topic) query = query.eq("topic", topic);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    questions = data;
  } else {
    // random, category, topic modes
    let query = supabase
      .from("questions")
      .select(
        "id, question_text, option_a, option_b, option_c, option_d, correct_answer, justification, explanation_a, explanation_b, explanation_c, explanation_d, category, topic, difficulty"
      )
      .eq("status", "published")
      .limit(count);

    if (mode === "category" && category) {
      query = query.eq("category", category);
    } else if (mode === "topic" && topic) {
      query = query.eq("topic", topic);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Shuffle for random mode
    questions = data ?? [];
    if (mode === "random" || !category) {
      questions = questions.sort(() => Math.random() - 0.5).slice(0, count);
    }
  }

  return NextResponse.json({ questions: questions ?? [] });
}

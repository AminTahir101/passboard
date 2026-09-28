import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify exam belongs to user
    const { data: exam } = await supabase
      .from("mock_exams")
      .select("id, completed_at, question_count")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Fetch exam questions with question data
    const { data: examQuestions, error } = await supabase
      .from("mock_exam_questions")
      .select(
        `
        id,
        position,
        flagged,
        question_id,
        questions (
          id,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          category,
          topic,
          difficulty
        )
      `
      )
      .eq("mock_exam_id", id)
      .order("position", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      exam,
      questions: examQuestions || [],
    });
  } catch (err) {
    console.error("[Mock Exam Questions Error]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

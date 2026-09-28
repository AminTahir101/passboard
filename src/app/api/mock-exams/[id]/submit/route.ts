import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
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

    // Verify exam belongs to user and is not already completed
    const { data: exam } = await supabase
      .from("mock_exams")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (exam.completed_at) {
      return NextResponse.json(
        { error: "Exam already submitted" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { answers, durationSeconds } = body as {
      answers: { questionId: string; selectedAnswer: string | null }[];
      durationSeconds?: number;
    };

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "answers array is required" },
        { status: 400 }
      );
    }

    // Fetch correct answers for all questions in this exam
    const { data: examQuestions } = await supabase
      .from("mock_exam_questions")
      .select("question_id")
      .eq("mock_exam_id", id);

    const questionIds = (examQuestions || []).map((q) => q.question_id);

    const { data: questions } = await supabase
      .from("questions")
      .select("id, correct_answer")
      .in("id", questionIds);

    const correctAnswerMap = new Map(
      (questions || []).map((q) => [q.id, q.correct_answer])
    );

    // Calculate scores
    let score = 0;
    const mockAnswerInserts = answers.map((answer) => {
      const correctAnswer = correctAnswerMap.get(answer.questionId);
      const isCorrect =
        answer.selectedAnswer !== null &&
        answer.selectedAnswer === correctAnswer;
      if (isCorrect) score++;

      return {
        mock_exam_id: id,
        question_id: answer.questionId,
        selected_answer: answer.selectedAnswer as
          | "A"
          | "B"
          | "C"
          | "D"
          | null,
        is_correct: answer.selectedAnswer !== null ? isCorrect : null,
      };
    });

    const total = answers.length;
    const percentage = total > 0 ? (score / total) * 100 : 0;

    // Upsert mock_answers
    if (mockAnswerInserts.length > 0) {
      const { error: answersError } = await supabase
        .from("mock_answers")
        .upsert(mockAnswerInserts, {
          onConflict: "mock_exam_id,question_id",
        });

      if (answersError) {
        // Try insert instead if upsert not supported
        await supabase.from("mock_answers").insert(mockAnswerInserts);
      }
    }

    // Update mock_exam
    const startedAt = new Date(exam.started_at);
    const now = new Date();
    const calculatedDuration = durationSeconds
      ? durationSeconds
      : Math.round((now.getTime() - startedAt.getTime()) / 1000);

    await supabase
      .from("mock_exams")
      .update({
        completed_at: now.toISOString(),
        score,
        percentage,
        duration_seconds: calculatedDuration,
      })
      .eq("id", id);

    return NextResponse.json({ score, percentage, total });
  } catch (err) {
    console.error("[Mock Exam Submit Error]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

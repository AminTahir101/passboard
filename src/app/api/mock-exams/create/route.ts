import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
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

    if (
      profile.access_expires_at &&
      new Date(profile.access_expires_at) < new Date()
    ) {
      return NextResponse.json({ error: "Access expired" }, { status: 403 });
    }

    const body = await request.json();
    const { examName, questionCount, category } = body as {
      examName?: string;
      questionCount: number;
      category?: string;
    };

    if (!questionCount || ![50, 100].includes(questionCount)) {
      return NextResponse.json(
        { error: "questionCount must be 50 or 100" },
        { status: 400 }
      );
    }

    // Randomly select published questions (optionally filtered by exam)
    let query = supabase
      .from("questions")
      .select("id")
      .eq("status", "published");

    if (examName && examName.trim() !== "") {
      query = query.eq("exam", examName.trim());
    }
    if (category && category.trim() !== "") {
      query = query.eq("category", category.trim());
    }

    const { data: allQuestions, error: qError } = await query;

    if (qError) {
      return NextResponse.json(
        { error: "Failed to fetch questions" },
        { status: 500 }
      );
    }

    if (!allQuestions || allQuestions.length === 0) {
      return NextResponse.json(
        {
          error:
            "No published questions available for the selected exam type. Try selecting 'All Exams'.",
        },
        { status: 400 }
      );
    }

    // Shuffle and pick questionCount
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    if (selected.length === 0) {
      return NextResponse.json(
        { error: "Not enough questions available" },
        { status: 400 }
      );
    }

    // Create mock_exam row
    const { data: mockExam, error: examError } = await supabase
      .from("mock_exams")
      .insert({
        user_id: user.id,
        exam_name: examName || null,
        question_count: selected.length,
      })
      .select()
      .single();

    if (examError || !mockExam) {
      return NextResponse.json(
        { error: "Failed to create mock exam" },
        { status: 500 }
      );
    }

    // Create mock_exam_questions rows
    const mockExamQuestions = selected.map((q, index) => ({
      mock_exam_id: mockExam.id,
      question_id: q.id,
      position: index + 1,
      flagged: false,
    }));

    const { error: mqError } = await supabase
      .from("mock_exam_questions")
      .insert(mockExamQuestions);

    if (mqError) {
      // Clean up the mock exam if questions insertion failed
      await supabase.from("mock_exams").delete().eq("id", mockExam.id);
      return NextResponse.json(
        { error: "Failed to create exam questions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ mockExamId: mockExam.id });
  } catch (err) {
    console.error("[Mock Exam Create Error]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

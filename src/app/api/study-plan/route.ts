import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateTasks } from "@/lib/study-plan/generate";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: plan } = await supabase
    .from("study_plans")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!plan) return NextResponse.json({ plan: null, tasks: [] });

  const { data: tasks } = await supabase
    .from("study_tasks")
    .select("*")
    .eq("plan_id", plan.id)
    .order("scheduled_date", { ascending: true })
    .order("position", { ascending: true });

  return NextResponse.json({ plan, tasks: tasks ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: {
    exam: string;
    exam_date: string;
    study_days: number[];
    questions_per_day: number;
    mock_day: number | null;
    mock_size: number | null;
    focus_specialties: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  // Fetch all published categories for plan generation
  const { data: catData } = await supabase
    .from("questions")
    .select("category")
    .eq("status", "published")
    .not("category", "is", null);

  const allSpecialties: string[] = [
    ...new Set(
      (catData ?? [])
        .map((q: { category: string | null }) => q.category)
        .filter((c): c is string => !!c)
    ),
  ];

  // Derive weak specialties from this student's performance
  const { data: attemptsData } = await supabase
    .from("question_attempts")
    .select("question_id, is_correct")
    .eq("user_id", user.id);

  let weakSpecialties: string[] = [];
  if (attemptsData && attemptsData.length > 0) {
    const qIds = [...new Set(attemptsData.map((a: { question_id: string }) => a.question_id))];
    const { data: questionsData } = await supabase
      .from("questions")
      .select("id, category")
      .in("id", qIds);

    const qMap = new Map(
      (questionsData ?? []).map((q: { id: string; category: string | null }) => [q.id, q.category])
    );

    type CatStat = { correct: number; total: number };
    const catStats: Record<string, CatStat> = {};
    for (const a of attemptsData as { question_id: string; is_correct: boolean }[]) {
      const cat = qMap.get(a.question_id);
      if (!cat) continue;
      if (!catStats[cat]) catStats[cat] = { correct: 0, total: 0 };
      catStats[cat].total++;
      if (a.is_correct) catStats[cat].correct++;
    }

    weakSpecialties = Object.entries(catStats)
      .filter(([, s]) => s.total >= 5)
      .map(([cat, s]) => ({ cat, acc: s.correct / s.total }))
      .sort((a, b) => a.acc - b.acc)
      .slice(0, Math.max(1, Math.ceil(allSpecialties.length * 0.3)))
      .map((x) => x.cat);
  }

  // Upsert the plan record
  const { data: existing } = await supabase
    .from("study_plans")
    .select("id")
    .eq("user_id", user.id)
    .single();

  let planId: string;
  if (existing?.id) {
    await supabase
      .from("study_plans")
      .update({
        exam: body.exam,
        exam_date: body.exam_date,
        study_days: body.study_days,
        questions_per_day: body.questions_per_day,
        mock_day: body.mock_day,
        mock_size: body.mock_size,
        focus_specialties: body.focus_specialties,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    planId = existing.id;
  } else {
    const { data: newPlan } = await supabase
      .from("study_plans")
      .insert({
        user_id: user.id,
        exam: body.exam,
        exam_date: body.exam_date,
        study_days: body.study_days,
        questions_per_day: body.questions_per_day,
        mock_day: body.mock_day,
        mock_size: body.mock_size,
        focus_specialties: body.focus_specialties,
      })
      .select("id")
      .single();
    if (!newPlan?.id)
      return NextResponse.json({ error: "failed_to_create_plan" }, { status: 500 });
    planId = newPlan.id;
  }

  // Delete all incomplete tasks from today onwards
  const todayStr = new Date().toISOString().split("T")[0];
  await supabase
    .from("study_tasks")
    .delete()
    .eq("plan_id", planId)
    .eq("completed", false)
    .gte("scheduled_date", todayStr);

  // Find dates that already have completed tasks (don't overwrite them)
  const { data: completedTasks } = await supabase
    .from("study_tasks")
    .select("scheduled_date")
    .eq("plan_id", planId)
    .eq("completed", true);

  const completedDateSet = new Set(
    (completedTasks ?? []).map((t: { scheduled_date: string }) => t.scheduled_date)
  );

  // Generate new tasks from today
  const fromDate = new Date();
  fromDate.setHours(0, 0, 0, 0);

  const generated = generateTasks(
    {
      examDate: body.exam_date,
      studyDays: body.study_days,
      questionsPerDay: body.questions_per_day,
      mockDay: body.mock_day,
      mockSize: body.mock_size,
      focusSpecialties: body.focus_specialties,
      weakSpecialties,
      allSpecialties,
    },
    fromDate
  );

  const toInsert = generated
    .filter((t) => !completedDateSet.has(t.scheduled_date))
    .map((t) => ({ plan_id: planId, user_id: user.id, ...t }));

  if (toInsert.length > 0) {
    await supabase.from("study_tasks").insert(toInsert);
  }

  return NextResponse.json({ success: true });
}

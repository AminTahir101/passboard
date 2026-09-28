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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const admin = createAdminClient();

  const allowed = [
    "question_text", "option_a", "option_b", "option_c", "option_d",
    "correct_answer", "justification", "explanation_a", "explanation_b",
    "explanation_c", "explanation_d", "exam", "category", "topic",
    "subtopic", "difficulty", "year", "source", "status",
  ];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) updates[key] = body[key] === "" ? null : body[key];
  }

  const { error } = await admin.from("questions").update(updates as import("@/types/database").Database["public"]["Tables"]["questions"]["Update"]).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  // Check for attempts
  const { count } = await admin
    .from("question_attempts")
    .select("*", { count: "exact", head: true })
    .eq("question_id", id);

  if (count && count > 0) {
    return NextResponse.json(
      { error: "Cannot delete a question with existing student attempts. Archive it instead." },
      { status: 409 }
    );
  }

  const { error } = await admin.from("questions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

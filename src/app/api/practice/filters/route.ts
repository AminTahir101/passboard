import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("questions")
    .select("category, topic")
    .eq("status", "published");

  const categories = [...new Set((data ?? []).map((q) => q.category).filter(Boolean))].sort() as string[];
  const topics = [...new Set((data ?? []).map((q) => q.topic).filter(Boolean))].sort() as string[];

  return NextResponse.json({ categories, topics });
}

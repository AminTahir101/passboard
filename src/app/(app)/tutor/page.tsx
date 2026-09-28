import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TutorChat from "@/components/tutor/TutorChat";
import type { AiConversation, Question } from "@/types/database";

interface TutorPageProps {
  searchParams: Promise<{ questionId?: string }>;
}

export default async function TutorPage({ searchParams }: TutorPageProps) {
  const { questionId } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: conversations } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(10);

  let initialQuestion: Question | null = null;
  if (questionId) {
    const { data: q } = await supabase
      .from("questions")
      .select("*")
      .eq("id", questionId)
      .single();
    initialQuestion = q as Question | null;
  }

  return (
    <div className="h-full flex flex-col -m-6">
      <TutorChat
        conversations={(conversations as AiConversation[]) || []}
        userId={user.id}
        questionId={questionId}
        initialQuestion={initialQuestion}
      />
    </div>
  );
}

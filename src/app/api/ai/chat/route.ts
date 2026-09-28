import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateChatResponse } from "@/lib/ai";
import type { Question } from "@/types/database";

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
    const {
      conversationId: incomingConversationId,
      message,
      questionId,
    } = body as {
      conversationId?: string;
      message: string;
      questionId?: string;
    };

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    let conversationId = incomingConversationId;

    // Create new conversation if needed
    if (!conversationId) {
      const title = message.slice(0, 60).trim();
      const { data: conv, error: convError } = await supabase
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          title,
          question_id: questionId || null,
        })
        .select()
        .single();

      if (convError || !conv) {
        return NextResponse.json(
          { error: "Failed to create conversation" },
          { status: 500 }
        );
      }
      conversationId = conv.id;
    } else {
      // Verify conversation belongs to user
      const { data: conv } = await supabase
        .from("ai_conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .single();

      if (!conv) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
    }

    // Fetch last 10 messages for context
    const { data: history } = await supabase
      .from("ai_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(10);

    const recentMessages = (history || [])
      .reverse()
      .filter((m) => m.role === "user" || m.role === "assistant") as Array<{
      role: "user" | "assistant";
      content: string;
    }>;

    // Fetch question context if provided
    let question: Question | null = null;
    if (questionId) {
      const { data: q } = await supabase
        .from("questions")
        .select("*")
        .eq("id", questionId)
        .single();
      question = q as Question | null;
    }

    // Build messages array for OpenAI
    const messages: Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }> = [
      ...recentMessages,
      { role: "user", content: message },
    ];

    // Call OpenAI via the shared helper
    const assistantContent = await generateChatResponse(messages, question);

    // Save user message
    await supabase.from("ai_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: message,
    });

    // Save assistant response
    await supabase.from("ai_messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: assistantContent,
    });

    // Update conversation updated_at
    await supabase
      .from("ai_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return NextResponse.json({
      conversationId,
      message: assistantContent,
      role: "assistant",
    });
  } catch (err: unknown) {
    console.error("[AI Chat Error]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const SYSTEM_PROMPT = `You are an expert medical exam tutor with access to up-to-date medical literature, helping students prepare for medical licensing exams (USMLE, Saudi medical boards, and similar).

Your role:
- Explain medical concepts clearly and accurately
- Help students understand why an answer is correct or incorrect
- Use clinical reasoning to reinforce learning
- Be concise but thorough — exam candidates are short on time
- When a question is provided as context, focus your explanation on that specific question
- When referencing specific guidelines, statistics, or clinical facts, cite the source

Guidelines:
- Use standard medical terminology
- If asked about a practice question, explain the key teaching point, not just the answer
- Encourage pattern recognition for exam success
- Respond in the same language the student uses (English or Arabic)
- Only cite real, verifiable sources — never fabricate references`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  // Authenticate user from JWT
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const jwt = authHeader.slice(7);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });

  // Verify JWT and get user
  const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Check user has active access
  const { data: profile } = await supabase
    .from("profiles")
    .select("access_status, access_expires_at")
    .eq("id", user.id)
    .single();

  if (!profile || profile.access_status !== "active") {
    return new Response(JSON.stringify({ error: "Access denied" }), { status: 403 });
  }
  if (profile.access_expires_at && new Date(profile.access_expires_at) < new Date()) {
    return new Response(JSON.stringify({ error: "Access expired" }), { status: 403 });
  }

  // Parse request body
  let body: { conversationId?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { conversationId, message } = body;
  if (!conversationId || !message?.trim()) {
    return new Response(JSON.stringify({ error: "conversationId and message are required" }), { status: 400 });
  }

  // Verify conversation belongs to this user
  const { data: conversation } = await supabase
    .from("ai_conversations")
    .select("id, question_id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (!conversation) {
    return new Response(JSON.stringify({ error: "Conversation not found" }), { status: 404 });
  }

  // Fetch last 12 messages for context
  const { data: recentMessages } = await supabase
    .from("ai_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(12);

  const history = (recentMessages ?? []).reverse();

  // If conversation has a linked question, fetch it for context
  let questionContext = "";
  if (conversation.question_id) {
    const { data: question } = await supabase
      .from("questions")
      .select("question_text, option_a, option_b, option_c, option_d, correct_answer, justification, category, topic")
      .eq("id", conversation.question_id)
      .single();

    if (question) {
      questionContext = `
## Linked Practice Question
Category: ${question.category ?? "General Medicine"} — ${question.topic ?? ""}

${question.question_text}

A) ${question.option_a}
B) ${question.option_b}
C) ${question.option_c}
D) ${question.option_d}

Correct answer: ${question.correct_answer}
${question.justification ? `\nExplanation: ${question.justification}` : ""}`;
    }
  }

  // Build OpenAI messages
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: SYSTEM_PROMPT },
  ];
  if (questionContext) {
    messages.push({ role: "system", content: questionContext });
  }
  for (const msg of history) {
    if (msg.role === "user" || msg.role === "assistant") {
      messages.push({ role: msg.role as "user" | "assistant", content: msg.content });
    }
  }
  messages.push({ role: "user", content: message });

  // Call OpenAI streaming
  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-search-preview",
      messages,
      max_tokens: 1000,
      stream: true,
    }),
  });

  if (!openaiRes.ok) {
    const err = await openaiRes.text();
    console.error("OpenAI error:", err);
    return new Response(JSON.stringify({ error: "AI service unavailable" }), { status: 502 });
  }

  // Stream SSE back to the iOS client and collect full response
  const encoder = new TextEncoder();
  let fullContent = "";

  type UrlCitation = { url: string; title?: string };
  const citations: UrlCitation[] = [];
  const seenUrls = new Set<string>();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = openaiRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") {
              // Emit references block before closing if any citations were collected
              if (citations.length > 0) {
                const refs = citations
                  .map((c, i) => `[${i + 1}] ${c.title ? `${c.title} — ` : ""}${c.url}`)
                  .join("\n");
                const refsBlock = `\n\n---\n**References**\n${refs}`;
                fullContent += refsBlock;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content: refsBlock })}\n\n`)
                );
              }
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              continue;
            }
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta ?? {};

              // Collect citation annotations emitted as delta events
              if (Array.isArray(delta.annotations)) {
                for (const a of delta.annotations) {
                  if (a.type === "url_citation" && !seenUrls.has(a.url_citation?.url)) {
                    seenUrls.add(a.url_citation.url);
                    citations.push({ url: a.url_citation.url, title: a.url_citation.title });
                  }
                }
              }

              const token = delta.content ?? "";
              if (token) {
                fullContent += token;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content: token })}\n\n`)
                );
              }
            } catch {
              // malformed chunk — skip
            }
          }
        }
      } finally {
        reader.releaseLock();
        controller.close();

        // Save complete assistant message to DB (best-effort)
        if (fullContent) {
          await supabase.from("ai_messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: fullContent,
          });
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
});

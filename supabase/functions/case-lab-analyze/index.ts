import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are a clinical AI assistant helping medical students learn from real cases.
Given a case (chief complaint, clinical history, uploaded images), produce a structured educational analysis.

You MUST respond with valid JSON matching this exact structure:
{
  "findings": [
    { "label": "string", "detail": "string", "confidence": 0.0-1.0 }
  ],
  "differential": [
    { "diagnosis": "string", "probability": 0.0-1.0, "reasoning": "string" }
  ],
  "urgency": "emergency" | "urgent" | "routine",
  "summary": "string (2-3 sentence educational summary)",
  "teaching_points": ["string", "string"]
}

Rules:
- findings: up to 6 key clinical findings from the images/history
- differential: top 3-5 diagnoses ranked by probability
- urgency: emergency (life-threatening), urgent (same-day), routine (outpatient)
- teaching_points: 2-3 concise exam-relevant takeaways
- Never fabricate patient details; use only what is provided
- This is for educational purposes only`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
  const userToken = authHeader.replace("Bearer ", "");

  // Use service role client for everything; verify JWT via auth.getUser(token)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);
  if (authError || !user) {
    console.error("Auth error:", authError);
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const body = await req.json().catch(() => ({}));
  const { caseId } = body;
  if (!caseId) {
    return new Response(JSON.stringify({ error: "caseId required" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  // Fetch case — manually enforce ownership (service role bypasses RLS)
  const { data: medCase, error: caseError } = await supabase
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .eq("owner_id", user.id)
    .single();

  if (caseError || !medCase) {
    console.error("Case fetch error:", caseError);
    return new Response(JSON.stringify({ error: "Case not found" }), {
      status: 404,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  // Mark as analyzing
  await supabase.from("cases").update({ status: "analyzing" }).eq("id", caseId);

  // Fetch images
  const { data: images } = await supabase
    .from("case_images")
    .select("storage_path")
    .eq("case_id", caseId);

  // Build signed URLs
  const imageUrls: string[] = [];
  for (const img of images ?? []) {
    const { data: signed } = await supabase.storage
      .from("case-media")
      .createSignedUrl(img.storage_path, 300);
    if (signed?.signedUrl) imageUrls.push(signed.signedUrl);
  }

  console.log(`Case ${caseId}: ${imageUrls.length} images, complaint="${medCase.chief_complaint}"`);

  // Build message content
  const userContent: unknown[] = [
    {
      type: "text",
      text: [
        `Chief complaint: ${medCase.chief_complaint ?? "Not specified"}`,
        medCase.history_json ? `History: ${JSON.stringify(medCase.history_json)}` : null,
        imageUrls.length > 0
          ? `${imageUrls.length} clinical image(s) attached.`
          : "No images uploaded — analyze based on chief complaint only.",
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];

  for (const url of imageUrls) {
    userContent.push({ type: "image_url", image_url: { url, detail: "high" } });
  }

  const start = Date.now();
  let analysisJson: Record<string, unknown>;

  try {
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: imageUrls.length > 0 ? "gpt-4o" : "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        max_tokens: 1200,
        temperature: 0.2,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("OpenAI error:", aiRes.status, errText);
      throw new Error(`OpenAI ${aiRes.status}: ${errText}`);
    }

    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content ?? "{}";
    console.log("OpenAI raw response:", raw.substring(0, 200));
    analysisJson = JSON.parse(raw);
  } catch (e) {
    console.error("AI call failed:", e);
    await supabase.from("cases").update({ status: "failed" }).eq("id", caseId);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const latencyMs = Date.now() - start;
  const urgency = (analysisJson.urgency as string) ?? "routine";

  // Store analysis
  const { data: analysis, error: analysisError } = await supabase
    .from("case_analyses")
    .insert({
      case_id: caseId,
      findings_json: analysisJson.findings ?? [],
      differential_json: analysisJson.differential ?? [],
      urgency,
      abstained: false,
      prompt_version: "caselab-v1.0",
      latency_ms: latencyMs,
    })
    .select()
    .single();

  if (analysisError || !analysis) {
    console.error("Analysis insert error:", analysisError);
    await supabase.from("cases").update({ status: "failed" }).eq("id", caseId);
    return new Response(JSON.stringify({ error: "Failed to store analysis" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const reportContent = {
    summary: analysisJson.summary ?? "",
    teaching_points: analysisJson.teaching_points ?? [],
    findings: analysisJson.findings ?? [],
    differential: analysisJson.differential ?? [],
    urgency,
    disclaimer:
      "This analysis is for educational purposes only and does not constitute medical advice.",
  };

  await supabase.from("case_reports").insert({
    analysis_id: analysis.id,
    lang: "en",
    audience: "student",
    content_json: reportContent,
    released_at: new Date().toISOString(),
  });

  await supabase.from("cases").update({ status: "done" }).eq("id", caseId);

  console.log(`Case ${caseId} analysis complete in ${latencyMs}ms`);
  return new Response(JSON.stringify({ success: true, analysisId: analysis.id }), {
    status: 200,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});

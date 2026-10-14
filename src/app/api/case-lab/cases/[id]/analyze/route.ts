import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runCaseAnalysis } from "@/lib/case-lab/analyze";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership and get history
  const { data: c } = await supabase
    .from("cases")
    .select("id, history_json, status")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get image signed URLs (5-minute TTL — enough for the analysis call)
  const { data: images } = await supabase
    .from("case_images")
    .select("storage_path")
    .eq("case_id", id);

  if (!images || images.length === 0) {
    return NextResponse.json({ error: "No images found" }, { status: 400 });
  }

  const signedUrlResults = await Promise.all(
    images.map((img) =>
      supabase.storage
        .from("case-media")
        .createSignedUrl(img.storage_path, 300) // 5 min
    )
  );

  const signedImageUrls = signedUrlResults
    .map((r) => r.data?.signedUrl)
    .filter((url): url is string => !!url);

  // Get confirmed lab values (plain text)
  const { data: extractedValues } = await supabase
    .from("case_extracted_values")
    .select("name, value, unit, flag, observed_at")
    .in(
      "document_id",
      (
        await supabase
          .from("case_documents")
          .select("id")
          .eq("case_id", id)
      ).data?.map((d) => d.id) ?? []
    )
    .eq("confirmed_by", user.id);

  const confirmedLabValues = (extractedValues ?? [])
    .map((v) => `${v.name}: ${v.value}${v.unit ? " " + v.unit : ""}${v.flag ? " [" + v.flag + "]" : ""}`)
    .join("\n");

  // Mark as analyzing
  await supabase
    .from("cases")
    .update({ status: "analyzing" })
    .eq("id", id);

  await supabase.from("case_audit_log").insert({
    case_id: id,
    actor_id: user.id,
    action: "analysis_started",
  });

  let result;
  const startedAt = Date.now();

  try {
    result = await runCaseAnalysis({
      signedImageUrls,
      history: (c.history_json as Record<string, string>) ?? {},
      confirmedLabValues,
    });
  } catch (err) {
    await supabase.from("cases").update({ status: "failed" }).eq("id", id);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }

  const latencyMs = Date.now() - startedAt;

  // Persist analysis
  const { data: analysis, error: analysisError } = await supabase
    .from("case_analyses")
    .insert({
      case_id: id,
      findings_json: result as unknown as Record<string, unknown>,  // store full result for easy retrieval
      differential_json: result.differential as Record<string, unknown>[],
      urgency: result.urgency.level,
      agreement: result.agreement,
      abstained: result.abstain,
      prompt_version: result.prompt_version,
      latency_ms: latencyMs,
    })
    .select("id")
    .single();

  if (analysisError) {
    await supabase.from("cases").update({ status: "failed" }).eq("id", id);
    return NextResponse.json({ error: analysisError.message }, { status: 500 });
  }

  // Store report JSON
  await supabase.from("case_reports").insert({
    analysis_id: analysis.id,
    lang: "en",
    audience: "student",
    content_json: result as unknown as Record<string, unknown>,
  });

  await supabase.from("cases").update({ status: "done" }).eq("id", id);
  await supabase.from("case_audit_log").insert({
    case_id: id,
    actor_id: user.id,
    action: "analysis_done",
  });

  return NextResponse.json({ analysis: result });
}

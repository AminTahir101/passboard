import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };
type DocFileInfo = { name: string; type: string };

// POST /api/case-lab/cases/:id/extract
// 1. Returns signed PUT URLs for each document
// 2. Records case_documents rows
// 3. Queues case_jobs rows (status: pending) for the OCR worker
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: c } = await supabase
    .from("cases")
    .select("id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { files }: { files: DocFileInfo[] } = await request.json();
  if (!Array.isArray(files) || files.length === 0 || files.length > 20) {
    return NextResponse.json({ error: "1–20 files required" }, { status: 400 });
  }

  const uploads = await Promise.all(
    files.map(async (f) => {
      const ext = f.name.split(".").pop() ?? "bin";
      const path = `${user.id}/${id}/docs/${crypto.randomUUID()}.${ext}`;

      const { data: signedData, error: urlError } = await supabase.storage
        .from("case-media")
        .createSignedUploadUrl(path);

      if (urlError || !signedData) throw new Error(urlError?.message ?? "Signed URL failed");

      // Record document row
      const { data: doc, error: docError } = await supabase
        .from("case_documents")
        .insert({
          case_id: id,
          storage_path: path,
          doc_type: f.type,
        })
        .select("id")
        .single();

      if (docError || !doc) throw new Error(docError?.message ?? "Failed to record document");

      // Queue OCR job
      await supabase.from("case_jobs").insert({
        case_id: id,
        document_id: doc.id,
        status: "pending",
      });

      return { signedUrl: signedData.signedUrl, path, documentId: doc.id };
    })
  );

  await supabase.from("cases").update({ status: "ocr_pending" }).eq("id", id);
  await supabase.from("case_audit_log").insert({
    case_id: id,
    actor_id: user.id,
    action: "ocr_queued",
  });

  return NextResponse.json({ uploads });
}

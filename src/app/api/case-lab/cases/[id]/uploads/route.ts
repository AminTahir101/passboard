import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };
type FileInfo = { name: string; type: string; bodySite: string; view: string };

// POST /api/case-lab/cases/:id/uploads
// Returns signed PUT URLs for each file, and records case_images rows
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify case ownership
  const { data: c } = await supabase
    .from("cases")
    .select("id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { files }: { files: FileInfo[] } = await request.json();
  if (!Array.isArray(files) || files.length === 0 || files.length > 6) {
    return NextResponse.json({ error: "1–6 files required" }, { status: 400 });
  }

  const uploads = await Promise.all(
    files.map(async (f) => {
      const ext = f.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${id}/${crypto.randomUUID()}.${ext}`;

      const { data: signedData, error } = await supabase.storage
        .from("case-media")
        .createSignedUploadUrl(path);

      if (error || !signedData) throw new Error(error?.message ?? "Signed URL failed");

      // Record image row (quality_json filled after upload by client)
      await supabase.from("case_images").insert({
        case_id: id,
        storage_path: path,
        body_site: f.bodySite,
        view: f.view,
      });

      return { signedUrl: signedData.signedUrl, path };
    })
  );

  await supabase.from("cases").update({ status: "images_uploaded" }).eq("id", id);

  return NextResponse.json({ uploads });
}

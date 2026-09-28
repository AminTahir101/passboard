import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (adminProfile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const admin = createAdminClient();

  // Fetch the access request
  const { data: req, error: reqError } = await admin
    .from("access_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (reqError || !req) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  const tempPassword = generatePassword();

  // Create auth user
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email: req.email,
    password: tempPassword,
    email_confirm: true,
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  // Create profile
  const { error: profileError } = await admin.from("profiles").upsert({
    id: newUser.user.id,
    email: req.email,
    full_name: req.full_name,
    phone: req.phone,
    role: "student",
    access_status: "active",
    target_exam: req.target_exam,
    exam_date: req.expected_exam_date,
  });

  if (profileError) {
    // Cleanup: delete auth user
    await admin.auth.admin.deleteUser(newUser.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Update request status to approved
  await admin.from("access_requests").update({ status: "approved", updated_at: new Date().toISOString() }).eq("id", id);

  return NextResponse.json({ email: req.email, tempPassword });
}

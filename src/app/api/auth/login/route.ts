import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, recordFailure, clearAttempts } from "@/lib/rate-limit";

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const ip = getIp(request);

  // Check if this IP is currently locked out
  const { allowed, retryAfterSec } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "too_many_attempts", retryAfterSec },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
    );
  }

  let email: string, password: string;
  try {
    ({ email, password } = await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    recordFailure(ip);
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  // Fetch profile for role / access check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, access_status, access_expires_at")
    .eq("id", data.user.id)
    .single();

  const isExpired =
    profile?.access_status === "expired" ||
    (profile?.access_expires_at && new Date(profile.access_expires_at) < new Date());

  if (
    !profile ||
    profile.access_status === "suspended" ||
    isExpired ||
    (profile.access_status !== "active" && profile.role !== "admin")
  ) {
    await supabase.auth.signOut();
    // Don't count access denials as brute-force attempts
    return NextResponse.json({ error: "access_denied" }, { status: 403 });
  }

  // Successful login — clear any accumulated failures
  clearAttempts(ip);

  return NextResponse.json({ role: profile.role });
}

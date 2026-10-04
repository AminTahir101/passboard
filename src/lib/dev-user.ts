import type { Profile } from "@/types/database";

export const DEV_STUDENT_PROFILE: Profile = {
  id: "dev-student-00000000-0000-0000-0000-000000000001",
  full_name: "Dev Student",
  email: "dev-student@localhost",
  phone: null,
  role: "student",
  target_exam: "USMLE Step 1",
  exam_date: null,
  access_status: "active",
  access_expires_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEV_ADMIN_PROFILE: Profile = {
  id: "dev-admin-000000-0000-0000-0000-000000000002",
  full_name: "Dev Admin",
  email: "dev-admin@localhost",
  phone: null,
  role: "admin",
  target_exam: null,
  exam_date: null,
  access_status: "active",
  access_expires_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function getDevProfile(): Profile | null {
  const bypass = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH;
  if (bypass === "student") return DEV_STUDENT_PROFILE;
  if (bypass === "admin") return DEV_ADMIN_PROFILE;
  return null;
}

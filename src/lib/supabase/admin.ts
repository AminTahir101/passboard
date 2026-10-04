import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createMockClient } from "@/lib/supabase/mock";

export function createAdminClient(): SupabaseClient<Database> {
  if (process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH) {
    return createMockClient() as unknown as SupabaseClient<Database>;
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createMockClient } from "@/lib/supabase/mock";

export function createAdminClient() {
  if (process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createMockClient() as any;
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

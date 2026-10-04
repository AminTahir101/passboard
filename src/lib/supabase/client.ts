import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createMockClient } from "@/lib/supabase/mock";

export function createClient(): SupabaseClient<Database> {
  if (process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH) {
    return createMockClient() as unknown as SupabaseClient<Database>;
  }
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

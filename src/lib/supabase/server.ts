import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { createMockClient } from "@/lib/supabase/mock";

export async function createClient() {
  if (process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createMockClient() as any;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component — cookies will be set by middleware
          }
        },
      },
    }
  );
}

import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/** Service-role REST client — bypasses RLS. Omit `SUPABASE_SERVICE_ROLE_KEY` in dev to soften rate-limiting only. */
export function tryCreateSupabaseServiceRoleClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    return null;
  }
  const { url } = getSupabasePublicEnv();
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

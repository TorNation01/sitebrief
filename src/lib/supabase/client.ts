import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Browser Supabase client for Client Components. Uses the anon key;
 * enforce authorization with RLS policies in Supabase.
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createBrowserClient<Database>(url, anonKey);
}

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { resolveAdminContinuation } from "@/lib/admin/next-path";
import { getSupabasePublicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Supabase Auth PKCE / OAuth return handler. Add this URL to Supabase Dashboard →
 * Authentication → URL Configuration → Redirect URLs.
 */
export async function GET(request: NextRequest) {
  let env: { url: string; anonKey: string };
  try {
    env = getSupabasePublicEnv();
  } catch {
    return NextResponse.redirect(new URL("/admin/login?error=config", request.url));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = resolveAdminContinuation(url.searchParams.get("next"));

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(env.url, env.anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(nextPath, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/admin/login?error=oauth", request.url));
}

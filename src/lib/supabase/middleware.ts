import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { resolveAdminContinuation } from "@/lib/admin/next-path";
import { isSiteBriefAdminUser } from "@/lib/auth/sitebrief-admin";
import { hasSupabaseBrowserConfig } from "@/lib/env";
import type { Database } from "@/types/database";

function forwardCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value, ...options }) => {
    to.cookies.set(name, value, options);
  });
}

/**
 * Refreshes auth cookies and shields `/admin` behind Supabase Authentication + SiteBrief admin role claims.
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const visitingAdminLogin = pathname.startsWith("/admin/login");

  if (!hasSupabaseBrowserConfig()) {
    if (pathname.startsWith("/admin") && !visitingAdminLogin) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";
      redirectUrl.search = "";
      redirectUrl.searchParams.set("error", "config");
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname.startsWith("/admin")) {
    if (!visitingAdminLogin) {
      if (!user || !isSiteBriefAdminUser(user)) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/admin/login";
        redirectUrl.search = "";
        if (!user) {
          redirectUrl.searchParams.set(
            "next",
            resolveAdminContinuation(`${pathname}${request.nextUrl.search}`),
          );
        } else {
          redirectUrl.searchParams.set("error", "forbidden");
        }

        const redirectResponse = NextResponse.redirect(redirectUrl);
        forwardCookies(supabaseResponse, redirectResponse);
        return redirectResponse;
      }

      return supabaseResponse;
    }

    if (user && isSiteBriefAdminUser(user)) {
      const target = resolveAdminContinuation(
        request.nextUrl.searchParams.get("next"),
      );
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = target;
      redirectUrl.search = "";

      const redirectResponse = NextResponse.redirect(redirectUrl);
      forwardCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }
  }

  return supabaseResponse;
}

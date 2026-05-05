"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { resolveAdminContinuation } from "@/lib/admin/next-path";
import { BrandLogoMark } from "@/components/brand/brand-logo-mark";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPublicBrand } from "@/lib/sitebrief/brand";

const LOGIN_BRAND = getPublicBrand();

export function AdminLoginExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const nextDestination = resolveAdminContinuation(searchParams.get("next"));
  const policyError = searchParams.get("error");

  async function handleSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email and password both need to be populated.");
      return;
    }

    setPending(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const response = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (response.error) {
        const raw = response.error.message.trim();
        const lc = raw.toLowerCase();
        if (
          lc.includes("invalid login credentials") ||
          lc.includes("invalid email or password") ||
          lc.includes("email not confirmed")
        ) {
          setError("That email/password pair was not recognized, or email confirmation may still be required.");
          return;
        }
        setError(raw || "Unable to sign in.");
        return;
      }

      router.replace(nextDestination);
      router.refresh();
    } catch {
      setError("Unexpected authentication interruption. Retry once you confirm connectivity.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,_0.9fr)_minmax(0,_1.1fr)] lg:items-start">
        <div className="space-y-8 text-white">
          <div>
            <div className="flex items-start gap-3">
              <BrandLogoMark logoHeightPx={32} className="mt-1 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
                  {LOGIN_BRAND.appName}
                </p>
                <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-[2.9rem]">
                  Sign in · {LOGIN_BRAND.studioDisplayName}
                </h1>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/72 sm:text-base">
              This surface is locked to Supabase-authenticated operators who carry the `admin` role inside
              JWT app or user metadata—the same signal your database RLS policies honour.
            </p>
          </div>
          <div className="space-y-6 rounded-[32px] border border-white/[0.08] bg-white/[0.02] px-6 py-6 text-sm leading-relaxed text-white/70 shadow-2xl shadow-black/50">
            <p>
              Protect your keys. Never broadcast service roles. If you need onboarding, raise a pull request
              to provision an admin via `auth.users.raw_app_meta_data`.
            </p>
            <Link
              href="/"
              className="inline-flex rounded-full border border-white/12 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:border-white/30"
            >
              Return to marketing spine
            </Link>
          </div>
        </div>

        <form
          className="space-y-6 rounded-[32px] border border-white/[0.12] bg-[#08080f]/80 p-10 shadow-2xl shadow-black/70 backdrop-blur"
          onSubmit={(evt) => void handleSubmit(evt)}
        >
          <div>
            <h2 className="text-2xl font-semibold text-white">Operator entry</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              MFA is not bundled here—pair this with Supabase Auth policies or external IdP as you graduate
              into production.
            </p>
          </div>

          {policyError === "forbidden" ? (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-950/50 px-5 py-4 text-sm leading-relaxed text-amber-50">
              Authenticated, but your profile is missing the elevated `admin` role. Ask a super-admin to
              append{" "}
              <code className="rounded bg-black/30 px-2 py-1 text-xs">role:&nbsp;&quot;admin&quot;</code> to your
              metadata and refresh—or sign out to try a different credential.
            </div>
          ) : null}

          {error ? (
            <div
              className="rounded-2xl border border-red-500/40 bg-red-950/45 px-5 py-4 text-sm leading-relaxed text-red-50"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <div className="space-y-5">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-[0.32em] text-white/53" htmlFor="email">
                Studio email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(evt) => setEmail(evt.target.value)}
                className="w-full rounded-2xl border border-white/[0.12] bg-black/30 px-4 py-3 text-sm text-white outline-none ring-2 ring-transparent transition focus-visible:ring-[var(--color-accent)]"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-[0.32em] text-white/53" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(evt) => setPassword(evt.target.value)}
                className="w-full rounded-2xl border border-white/[0.12] bg-black/30 px-4 py-3 text-sm text-white outline-none ring-2 ring-transparent transition focus-visible:ring-[var(--color-accent)]"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full px-8 py-3 text-sm font-semibold"
            disabled={pending}
          >
            {pending ? "Authenticating…" : "Unlock console"}
          </Button>
        </form>
      </div>
    </div>
  );
}

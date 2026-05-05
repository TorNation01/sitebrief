"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { BrandLogoMark } from "@/components/brand/brand-logo-mark";
import { Button } from "@/components/ui/button";
import { hasSupabaseBrowserConfig } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPublicBrand } from "@/lib/sitebrief/brand";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Brief queue" },
  { href: "/intake", label: "Client intake portal" },
  { href: "/", label: "Marketing site" },
];

const BRAND_SIDEBAR = getPublicBrand();

type AdminChromeProps = {
  identity: string;
  children: React.ReactNode;
};

export function AdminChrome({ identity, children }: AdminChromeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  function isActive(entry: NavItem) {
    if (entry.href === "/") {
      return pathname === "/";
    }

    return pathname === entry.href || pathname.startsWith(`${entry.href}/`);
  }

  async function logout() {
    setSigningOut(true);
    try {
      if (hasSupabaseBrowserConfig()) {
        const client = createSupabaseBrowserClient();
        await client.auth.signOut({ scope: "local" });
      }
    } catch {
      // Still route away from authenticated shell even if Supabase threw.
    } finally {
      setSigningOut(false);
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_20%_20%,color-mix(in_srgb,var(--color-accent)_14%,transparent),transparent)] text-white">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Collapse navigation drawer"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        id="admin-shell-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-[min(280px,calc(100vw-72px))] border-r border-white/[0.08] bg-gradient-to-b from-[#09090f] via-[#08080f] to-[#050508] backdrop-blur-2xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col gap-10 px-6 pb-10 pt-8">
          <div className="flex items-start gap-3">
            <BrandLogoMark logoHeightPx={30} className="mt-0.5" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                {BRAND_SIDEBAR.appName}
              </p>
              <p className="mt-3 text-xl font-semibold tracking-tight text-white">
                {BRAND_SIDEBAR.studioDisplayName}
              </p>
              <p className="mt-2 max-w-[16rem] text-xs leading-relaxed text-white/62">
                Anakatech console for incoming website briefs—review submissions, notes, and next steps in one place.
              </p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-8 text-sm" aria-label="Workspace">
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-white/41">
                Navigation
              </p>
              {NAV_ITEMS.map((entry) => {
                const matched = isActive(entry);
                return (
                  <Link
                    key={entry.href}
                    prefetch
                    href={entry.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={matched ? "page" : undefined}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition-colors ${
                      matched
                        ? "bg-white/10 text-white ring-1 ring-white/14"
                        : "text-white/65 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <span>{entry.label}</span>
                    {matched ? (
                      <span className="h-1 w-12 rounded-full bg-[var(--color-accent)]" aria-hidden />
                    ) : (
                      <span className="h-2 w-2 rounded-full border border-white/20" aria-hidden />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="space-y-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-xs leading-relaxed text-white/72">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/52">
                  Session identity
                </p>
                <p className="mt-3 break-all font-mono text-[13px] text-white">{identity}</p>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                disabled={signingOut}
                className="flex w-full items-center justify-between rounded-lg border border-white/[0.1] px-3 py-2 text-left text-[13px] font-semibold text-white transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>{signingOut ? "Signing out…" : "Sign out"}</span>
                <span aria-hidden>{signingOut ? "…" : "↗"}</span>
              </button>
              <div className="text-[11px] text-white/48">
                <p>Signed-in session; access limited to approved {BRAND_SIDEBAR.studioDisplayName} operators.</p>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex flex-col gap-3 border-b border-white/[0.08] bg-[#050608]/92 px-4 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:gap-10 md:py-6 lg:hidden">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
              Operational layer
            </p>
            <p className="mt-3 text-xl font-semibold text-white">Operational snapshot</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="self-start rounded-xl border border-white/15 px-5 text-white"
            aria-expanded={mobileOpen}
            aria-controls="admin-shell-sidebar"
            onClick={() => setMobileOpen(true)}
          >
            Menu & directory
          </Button>
        </header>

        <main className="relative flex flex-1 flex-col overflow-hidden bg-gradient-to-br from-transparent via-transparent to-black/65">
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

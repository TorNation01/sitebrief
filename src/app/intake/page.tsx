import type { Metadata } from "next";

import { IntakeWizard } from "@/components/intake/intake-wizard";
import { ButtonLink } from "@/components/ui/button";
import { hasSupabaseBrowserConfig } from "@/lib/env";
import { getPublicBrand } from "@/lib/sitebrief/brand";

const brand = getPublicBrand();

export const metadata: Metadata = {
  title: "Submit your brief",
  description: `Guided ${brand.appName} intake: validated steps, server-side persistence to Supabase, and spam-resistant submission handling.`,
  openGraph: {
    title: `Submit your brief · ${brand.appName}`,
    description: "Multi-step website project intake with server validation and Supabase storage.",
  },
};

export default function IntakePage() {
  const supabaseConfigured = hasSupabaseBrowserConfig();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
              Guided intake
            </p>
            <h1 className="mt-4 text-balance text-4xl font-semibold text-white sm:text-5xl">
              Shape your website project with intention.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/70 sm:text-base">
              Eleven focused chapters capture the decision trail your build team needs—contact
              guardrails, strategic goals, UI guardrails, technical dependencies, and commercial
              constraints. Each step validates before you continue, and the finale writes directly to
              Supabase with RLS-aware inserts.
            </p>
          </div>
          <ButtonLink href="/" variant="secondary" className="self-start px-5">
            ← Back home
          </ButtonLink>
        </div>
      </header>

      <IntakeWizard supabaseConfigured={supabaseConfigured} />
    </div>
  );
}

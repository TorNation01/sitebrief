import type { Metadata } from "next";

import { IntakeWizard } from "@/components/intake/intake-wizard";
import { ButtonLink } from "@/components/ui/button";
import { hasSupabaseBrowserConfig } from "@/lib/env";
import { getPublicBrand } from "@/lib/sitebrief/brand";

const brand = getPublicBrand();

export const metadata: Metadata = {
  alternates: {
    canonical: "/intake",
  },
  title: "Tell us what to build—in one guided brief",
  description: `Open the ${brand.appName} questionnaire: plain-language or technical wording, same smart questions, and a faster path from goals to a build-ready plan with ${brand.studioDisplayName}.`,
  openGraph: {
    title: `Your website brief is 10 minutes away · ${brand.appName}`,
    description: `Switch between friendly and industry wording anytime. Capture goals, pages, brand, and budget so ${brand.studioDisplayName} can respond with clarity—not guesswork.`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Start your brief · ${brand.appName}`,
    description: `One guided flow. Zero fluff. Line up your next site build with ${brand.studioDisplayName}.`,
  },
};

export default function IntakePage() {
  const supabaseConfigured = hasSupabaseBrowserConfig();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
              Guided intake
            </p>
            <h1 className="mt-4 text-balance text-4xl font-semibold text-white sm:text-5xl">
              Shape your website project with intention.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/75 sm:text-lg">
              Eleven focused chapters capture what your delivery team actually needs—from contact and goals
              to design direction, integrations, timelines, and budget guardrails. Use{" "}
              <strong className="font-semibold text-white/90">plain language or technical wording</strong> anytime
              without losing your place. Each step confirms the essentials before you continue, then saves your answers
              securely so nothing gets lost along the way.
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

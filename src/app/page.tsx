import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublicBrand } from "@/lib/sitebrief/brand";

const brand = getPublicBrand();

export const metadata: Metadata = {
  title: "Website intake & build briefs",
  description: `${brand.appName} captures structured website project details from clients and gives your studio an admin queue plus exportable Cursor prompt packs.`,
};

const features = [
  {
    title: "Structured briefs",
    body: "Goals, audiences, information architecture, integrations, compliance hints, and timelines in one submission.",
  },
  {
    title: "Admin queue",
    body: "Authenticated reviewers with the admin role see every intake under Supabase Row Level Security.",
  },
  {
    title: "Prompt pack export",
    body: "Generate a markdown Cursor pack from intake answers, preview it, copy it, or download as a .md file.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="relative isolate flex flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-48 left-1/2 h-[28rem] w-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--color-accent)_22%,transparent),transparent_70%)] blur-3xl opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:100%_48px] opacity-40" />
      </div>

      <section className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 pb-24 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Client intake · Website builds
          </p>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.35rem] lg:leading-[1.1]">
            Turn scattered notes into Cursor-ready briefs—in minutes.
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/65 sm:text-lg">
            {brand.appName} collects the details your team needs to scope a bespoke site, routes submissions through a
            validated server action plus honeypot, and keeps review inside a Supabase-backed admin workspace.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink href="/intake" variant="primary" className="min-h-[48px] justify-center px-6 py-3 text-center">
              Submit a brief
            </ButtonLink>
            <ButtonLink
              href="/admin"
              variant="secondary"
              className="min-h-[48px] justify-center px-6 py-3 text-center"
            >
              Open admin workspace
            </ButtonLink>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card
              key={f.title}
              title={f.title}
              description={f.body}
              className="backdrop-blur-sm"
            >
              <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/35 to-transparent" />
            </Card>
          ))}
        </div>

        <Card
          tone="dark"
          title="Operational notes"
          description={`Deploy ${brand.appName} with NEXT_PUBLIC_* Supabase keys, run bundled SQL migrations so RLS matches the code, assign the admin JWT role metadata, then wire NEXT_PUBLIC_SITE_URL for canonical/Open Graph URLs.`}
          className="border-[var(--color-accent)]/25 lg:flex lg:flex-row lg:items-center lg:justify-between lg:gap-10"
        >
          <ButtonLink href="/intake" variant="primary" className="mt-6 min-h-[48px] shrink-0 justify-center px-6 lg:mt-0">
            Start the intake
          </ButtonLink>
        </Card>
      </section>
    </div>
  );
}

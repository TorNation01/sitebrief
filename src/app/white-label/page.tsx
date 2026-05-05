import type { Metadata } from "next";
import Link from "next/link";

import { WhiteLabelRequestForm } from "@/components/white-label/white-label-request-form";
import { ButtonLink } from "@/components/ui/button";
import { getPublicBrand } from "@/lib/sitebrief/brand";
import { hasSupabaseBrowserConfig } from "@/lib/env";

export const metadata: Metadata = {
  title: "White-label SiteBrief",
  description:
    "Deploy SiteBrief under your own branding as a guided website briefing tool for your agency or studio.",
  robots: { index: false, follow: false },
};

export default function WhiteLabelPage() {
  const brand = getPublicBrand();
  const supabaseConfigured = hasSupabaseBrowserConfig();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <header className="space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
          {brand.appName} · {brand.studioDisplayName}
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-[2.6rem]">
          Your own briefing system
        </h1>
        <div className="space-y-4 text-base leading-relaxed text-white/75">
          <p>
            This system can be fully customised: your product name, logos, colours, and copy—so it feels native to
            your studio, not ours.
          </p>
          <p>
            Agencies use it as <strong className="font-semibold text-white/90">their own client intake tool</strong>
            : one consistent brief, less back-and-forth, and a clearer handoff to build teams.
          </p>
          <p>
            Want to replace {brand.studioDisplayName} branding with yours? We can white-label the flow and host it
            on your domain.
          </p>
        </div>
        <ButtonLink href="/" variant="ghost" className="mt-2 border border-white/15 px-5 text-white/85">
          ← Back to overview
        </ButtonLink>
      </header>

      <WhiteLabelRequestForm supabaseConfigured={supabaseConfigured} />

      <p className="text-center text-[13px] leading-relaxed text-white/45">
        Already submitted a client brief?{" "}
        <Link href="/intake" className="text-[var(--color-accent-hover)] underline-offset-4 hover:underline">
          Open the public intake form
        </Link>
        .
      </p>
    </div>
  );
}

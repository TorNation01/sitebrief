import Link from "next/link";

import { LandingSection } from "@/components/landing/landing-section";
import { ButtonLink } from "@/components/ui/button";
import { getPublicBrand } from "@/lib/sitebrief/brand";

export function LandingHero() {
  const brand = getPublicBrand();

  return (
    <LandingSection className="pb-10 pt-14 sm:pb-14 sm:pt-[4.75rem] lg:pb-16 lg:pt-[5.5rem]">
      <div className="mx-auto max-w-4xl text-center lg:max-w-5xl">
        <p className="sb-landing-rise text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          {brand.appName} · {brand.studioDisplayName}
        </p>
        <h1 className="sb-landing-rise sb-landing-delay-1 mt-5 text-balance text-[2rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
          A premium briefing for your next website
        </h1>
        <p className="sb-landing-rise sb-landing-delay-2 mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/72 sm:text-lg">
          Clean, fast, and client-friendly—share what you do, what you need, and how you want the experience to
          feel. No jargon; just the signal your build team uses to plan with confidence.
        </p>
        <div className="sb-landing-rise sb-landing-delay-3 mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
          <ButtonLink
            href="/intake"
            variant="primary"
            className="min-h-[52px] justify-center px-10 py-3.5 text-[15px] font-semibold"
          >
            Start Website Brief
          </ButtonLink>
          <Link
            href="#brief-preview"
            className="inline-flex min-h-[52px] items-center justify-center rounded-lg border border-white/14 bg-transparent px-8 py-3.5 text-[15px] font-medium text-white/88 transition-colors hover:border-[var(--color-accent)]/40 hover:bg-white/[0.04] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            See What We&apos;ll Ask
          </Link>
        </div>
      </div>
    </LandingSection>
  );
}

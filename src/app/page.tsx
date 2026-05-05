import type { Metadata } from "next";

import { LandingShell } from "@/components/landing/landing-shell";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingBriefPreview } from "@/components/landing/landing-brief-preview";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingScopeTypes } from "@/components/landing/landing-scope-types";
import { LandingExampleScopes } from "@/components/landing/landing-example-scopes";
import { LandingAfterSubmit } from "@/components/landing/landing-after-submit";
import { LandingFinalCta } from "@/components/landing/landing-final-cta";
import { getPublicBrand } from "@/lib/sitebrief/brand";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  title: "Premium website briefing for your next build",
  description: getPublicBrand().metaDescription,
};

export default function HomePage() {
  return (
    <LandingShell>
      <LandingHero />
      <LandingBriefPreview />
      <LandingHowItWorks />
      <LandingScopeTypes />
      <LandingExampleScopes />
      <LandingAfterSubmit />
      <LandingFinalCta />
    </LandingShell>
  );
}

import type { Metadata } from "next";

import { LandingVisitBeacon } from "@/components/analytics/vercel-tracking";
import { LandingShell } from "@/components/landing/landing-shell";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingBriefPreview } from "@/components/landing/landing-brief-preview";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingScopeTypes } from "@/components/landing/landing-scope-types";
import { LandingExampleScopes } from "@/components/landing/landing-example-scopes";
import { LandingAfterSubmit } from "@/components/landing/landing-after-submit";
import { LandingFinalCta } from "@/components/landing/landing-final-cta";
import { getPublicBrand } from "@/lib/sitebrief/brand";

const brand = getPublicBrand();

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  title: "Shape your next website in one focused brief",
  description: brand.metaDescription,
  openGraph: {
    title: `Stop guessing scope—${brand.appName} lines up your build`,
    description: brand.metaDescription,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.appName} · ${brand.studioDisplayName}`,
    description: brand.metaDescription,
  },
};

export default function HomePage() {
  return (
    <LandingShell>
      <LandingVisitBeacon />
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

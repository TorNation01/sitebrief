"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IntakeUxModeToggle } from "@/components/intake/intake-ux-mode-toggle";
import { getPublicBrand } from "@/lib/sitebrief/brand";

type IntakeWalkthroughIntroProps = {
  onStart: () => void;
};

export function IntakeWalkthroughIntro({ onStart }: IntakeWalkthroughIntroProps) {
  const brand = getPublicBrand();

  return (
    <Card tone="light" className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-accent)]">
          {brand.appName} · {brand.studioDisplayName}
        </p>
        <h2 className="mt-3 text-balance text-2xl font-semibold text-zinc-900 sm:text-3xl">
          Your website brief
        </h2>
        <p className="mt-4 text-base leading-relaxed text-zinc-600">
          A calm walkthrough so we can understand your business and what to build. You can switch wording below at any
          time—your answers stay put until you submit.
        </p>
      </div>

      <IntakeUxModeToggle variant="intro" />

      <ul className="list-disc space-y-3 pl-5 text-base leading-relaxed text-zinc-700">
        <li>This form helps us understand your business and what your website needs.</li>
        <li>No technical background required—use plain language wherever you like.</li>
        <li>Answer as best you can; skip or write &quot;not sure&quot; when needed.</li>
        <li>Most people finish in about 10–15 minutes.</li>
      </ul>

      <p className="text-sm leading-relaxed text-zinc-600">
        By continuing you agree to our{" "}
        <Link href="/legal/terms" className="font-semibold text-[var(--color-accent)] underline-offset-4 hover:underline">
          Terms &amp; Conditions
        </Link>{" "}
        and acknowledge our{" "}
        <Link href="/legal/privacy" className="font-semibold text-[var(--color-accent)] underline-offset-4 hover:underline">
          Privacy notice
        </Link>
        .
      </p>

      <Button
        type="button"
        variant="primary"
        className="w-full justify-center px-8 text-base sm:w-auto"
        onClick={onStart}
      >
        Start my website brief
      </Button>
    </Card>
  );
}

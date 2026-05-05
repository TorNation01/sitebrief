"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
          Website brief walkthrough
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-zinc-600">
          Quick orientation—plain language, paced for busy teams, no technical homework required.
        </p>
      </div>

      <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-zinc-700">
        <li>This form helps us understand your business and what your website needs.</li>
        <li>You do not need technical knowledge.</li>
        <li>Answer as best you can.</li>
        <li>If you are unsure, choose “Not sure” or write a short note.</li>
        <li>The form should take around 5–10 minutes.</li>
      </ul>

      <Button
        type="button"
        variant="primary"
        className="w-full justify-center px-8 sm:w-auto"
        onClick={onStart}
      >
        Start My Website Brief
      </Button>
    </Card>
  );
}

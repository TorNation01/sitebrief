import { LandingSection } from "@/components/landing/landing-section";
import { LandingWhiteCard } from "@/components/landing/landing-white-card";

const STEPS = [
  {
    step: "1",
    title: "Tell us about your business",
    body: "Share who you are, who you serve, and what problem your site needs to solve.",
  },
  {
    step: "2",
    title: "Choose what your website needs",
    body: "Highlight pages, features, integrations, and the experience that matters.",
  },
  {
    step: "3",
    title: "We create a clear build plan",
    body: "Your answers guide structure, prioritization, and how we propose next moves.",
  },
] as const;

export function LandingHowItWorks() {
  return (
    <LandingSection className="py-16 sm:py-20 lg:py-[5.75rem]">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          How it works
        </p>
        <h2 className="mt-4 text-balance text-2xl font-semibold text-white sm:text-3xl lg:text-[2rem]">
          Three simple steps
        </h2>
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3">
        {STEPS.map((item) => (
          <LandingWhiteCard
            key={item.step}
            className="transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_64px_-26px_rgba(0,0,0,0.6)] motion-reduce:hover:translate-y-0 motion-reduce:transition-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-accent)_16%,transparent)] text-sm font-semibold tabular-nums text-[color-mix(in_srgb,var(--color-accent-hover)_94%,black)] ring-1 ring-[var(--color-accent)]/30">
              {item.step}
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-zinc-900">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">{item.body}</p>
          </LandingWhiteCard>
        ))}
      </div>
    </LandingSection>
  );
}

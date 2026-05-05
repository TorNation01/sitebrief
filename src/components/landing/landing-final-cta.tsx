import { LandingSection } from "@/components/landing/landing-section";
import { ButtonLink } from "@/components/ui/button";

export function LandingFinalCta() {
  return (
    <LandingSection className="pb-24 pt-12 sm:pb-28 sm:pt-14 lg:pb-32 lg:pt-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center rounded-[1.375rem] border border-[var(--color-accent)]/22 bg-[color-mix(in_srgb,var(--color-accent)_6%,transparent)] px-8 py-14 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color] duration-300 hover:border-[var(--color-accent)]/35 sm:px-14 sm:py-16 motion-reduce:transition-none">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
          Next step
        </p>
        <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">
          Ready to start?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/68 sm:text-base">
          The briefing takes thoughtful minutes—not hours—and keeps your priorities in one place.
        </p>
        <ButtonLink
          href="/intake"
          variant="primary"
          className="mt-10 min-h-[54px] min-w-[16rem] justify-center px-12 py-4 text-[15px] font-semibold"
        >
          Start Website Brief
        </ButtonLink>
      </div>
    </LandingSection>
  );
}

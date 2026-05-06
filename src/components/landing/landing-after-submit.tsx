import { LandingSection } from "@/components/landing/landing-section";

const PHASES = [
  {
    title: "We review your answers",
    body: "We read your briefing end-to-end and note anything we should clarify before we commit to a build plan.",
  },
  {
    title: "We map structure and scope",
    body: "We translate your goals into a sensible page map, priorities, and flows so the website build stays aligned.",
  },
  {
    title: "We align on the build plan",
    body: "You receive a clear view of what we will design and build, milestones, assumptions, and what delivery looks like—including how the site will be launched when it is ready.",
  },
  {
    title: "We move into delivery when you are ready",
    body: "Once you approve the plan and commercials, our team progresses through design, build, QA, and go-live support—keeping you in the loop at each stage.",
  },
] as const;

export function LandingAfterSubmit() {
  return (
    <LandingSection className="border-y border-white/[0.05] bg-black/[0.18] py-16 sm:py-20 lg:py-[5.75rem]">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          After you submit
        </p>
        <h2 className="mt-4 text-balance text-2xl font-semibold text-white sm:text-3xl lg:text-[2rem]">
          What happens next
        </h2>
      </div>
      <ol className="mx-auto mt-12 grid max-w-3xl gap-6 sm:gap-8">
        {PHASES.map((phase, idx) => (
          <li
            key={phase.title}
            className="group flex gap-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-5 sm:gap-7 sm:px-7 sm:py-6 transition-colors hover:border-[var(--color-accent)]/25 hover:bg-white/[0.045]"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-accent)]/35 bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] text-sm font-semibold text-[var(--color-accent-hover)] ring-4 ring-transparent group-hover:border-[var(--color-accent)]/45"
              aria-hidden
            >
              {idx + 1}
            </span>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold tracking-tight text-white">{phase.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-white/70">{phase.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </LandingSection>
  );
}

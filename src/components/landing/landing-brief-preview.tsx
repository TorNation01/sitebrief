import { LandingWhiteCard } from "@/components/landing/landing-white-card";

const PREVIEW_GROUPS = [
  {
    title: "You & your business",
    bullets: ["Contact details", "Who you serve", "What sets you apart"],
  },
  {
    title: "Goals & website direction",
    bullets: ["What the site should achieve", "Key actions visitors take", "How you measure success"],
  },
  {
    title: "Design & tech preferences",
    bullets: ["Look and feel references", "Features you need", "Hosting, domain, integrations"],
  },
] as const;

export function LandingBriefPreview() {
  return (
    <section
      id="brief-preview"
      className="scroll-mt-[5.25rem] border-y border-white/[0.06] bg-black/25 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-full max-w-[72rem] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
            Transparency
          </p>
          <h2 className="mt-4 text-balance text-2xl font-semibold text-white sm:text-3xl">
            Here&apos;s what we&apos;ll ask
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/65 sm:text-base">
            Nothing tricky—just thoughtful questions grouped into calm steps. Review this before you start, or dive
            straight in whenever you&apos;re ready.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PREVIEW_GROUPS.map((group, i) => (
            <LandingWhiteCard
              key={group.title}
              className={`transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                Part {i + 1}
              </p>
              <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900">{group.title}</h3>
              <ul className="mt-4 space-y-2.5 text-sm leading-snug text-zinc-600">
                {group.bullets.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-[var(--color-accent)]/80" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </LandingWhiteCard>
          ))}
        </div>
      </div>
    </section>
  );
}

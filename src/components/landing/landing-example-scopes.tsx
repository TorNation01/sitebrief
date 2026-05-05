import { LandingSection } from "@/components/landing/landing-section";
import { LandingWhiteCard } from "@/components/landing/landing-white-card";

const EXAMPLES = [
  {
    title: "Simple Business Website",
    bullets: ["Home", "About", "Services", "Contact"],
  },
  {
    title: "Growth Website",
    bullets: ["Lead capture", "Blog", "Booking", "SEO pages"],
  },
  {
    title: "Advanced Website",
    bullets: ["Dashboards", "Accounts", "Payments", "Integrations"],
  },
] as const;

export function LandingExampleScopes() {
  return (
    <LandingSection className="py-16 sm:py-20 lg:py-[5.75rem]">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          Example scopes
        </p>
        <h2 className="mt-4 text-balance text-2xl font-semibold text-white sm:text-3xl lg:text-[2rem]">
          Starting points—we tailor every plan
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/62 sm:text-base">
          These are illustrative bundles. Your briefing fine-tunes what ships first vs. later.
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3">
        {EXAMPLES.map((ex) => (
          <LandingWhiteCard
            key={ex.title}
            className="flex flex-col transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900">{ex.title}</h3>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Includes
            </p>
            <ul className="mt-3 flex flex-1 flex-col gap-2.5 border-t border-zinc-100 pt-4">
              {ex.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-sm text-zinc-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          </LandingWhiteCard>
        ))}
      </div>
    </LandingSection>
  );
}

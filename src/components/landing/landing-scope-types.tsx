import { LandingSection } from "@/components/landing/landing-section";
import { LandingWhiteCard } from "@/components/landing/landing-white-card";

const TYPES = [
  { title: "Business website", copy: "A credible home for services, credibility, and contact." },
  { title: "Landing page", copy: "Focused story, one hero offer, frictionless conversions." },
  { title: "Booking website", copy: "Appointments or reservations with calendars and reminders." },
  { title: "Online store", copy: "Product catalog, checkout, fulfillment logic, and merchandising." },
  { title: "Service business website", copy: "Trust, proof, and clear paths to enquire or hire." },
  { title: "Membership or portal", copy: "Gated resources, dashboards, and returning visitors." },
] as const;

export function LandingScopeTypes() {
  return (
    <LandingSection className="bg-black/[0.18] py-16 sm:py-20 lg:py-[5.75rem]">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          What we help plan
        </p>
        <h2 className="mt-4 text-balance text-2xl font-semibold text-white sm:text-3xl lg:text-[2rem]">
          Website types & directions
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/62 sm:text-base">
          Tick what fits—we use your answers to frame scope, phases, and what to prioritize first.
        </p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TYPES.map((t) => (
          <LandingWhiteCard
            key={t.title}
            className="transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <div className="flex items-start gap-3">
              <span
                className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]"
                aria-hidden
              />
              <div>
                <h3 className="text-base font-semibold tracking-tight text-zinc-900">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{t.copy}</p>
              </div>
            </div>
          </LandingWhiteCard>
        ))}
      </div>
    </LandingSection>
  );
}

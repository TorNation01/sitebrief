import {
  computeIntakeDecisionPanel,
  type RecommendedAction,
  type RiskIndicator,
  type SuggestedNextStep,
} from "@/lib/sitebrief/intake-decision-heuristics";
import type { WebsiteIntakeRow } from "@/types/database";
import { parseStoredPriceEstimate } from "@/types/price-estimate";

const ACTION_COPY: Record<RecommendedAction, { label: string; hint: string; ring: string }> = {
  reject: {
    label: "Reject",
    hint: "Decline or insist on rewrite before committing studio time.",
    ring: "border-rose-500/45 bg-rose-500/[0.08]",
  },
  follow_up: {
    label: "Follow up",
    hint: "Keep warm but park quoting until blanks close.",
    ring: "border-amber-400/40 bg-amber-400/[0.07]",
  },
  quote: {
    label: "Quote",
    hint: "Formally respond with commercials + timeline.",
    ring: "border-emerald-500/35 bg-emerald-500/[0.08]",
  },
  fast_track: {
    label: "Fast-track",
    hint: "Prioritise sequencing—scope + economics look aligned.",
    ring: "border-[var(--color-accent)]/45 bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]",
  },
};

const NEXT_STEP_COPY: Record<SuggestedNextStep, string> = {
  ask_clarifying: "Ask clarifying questions",
  send_proposal: "Send proposal",
  jump_on_call: "Jump on call",
  start_build: "Start build",
};

const RISK_COPY: Record<
  RiskIndicator,
  {
    label: string;
    description: string;
  }
> = {
  budget_too_low: {
    label: "Budget too low",
    description: "Stated band vs heuristic scope collide.",
  },
  scope_unclear: {
    label: "Scope unclear",
    description: "Text is exploratory or contradictory.",
  },
  missing_info: {
    label: "Missing info",
    description: "Core narrative sections need more fidelity.",
  },
};

type IntakeDecisionPanelProps = {
  intake: WebsiteIntakeRow;
};

export function IntakeDecisionPanel({ intake }: IntakeDecisionPanelProps) {
  const estimate = parseStoredPriceEstimate(intake.internal_price_estimate);
  const decision = computeIntakeDecisionPanel(intake, estimate);
  const action = ACTION_COPY[decision.recommendedAction];

  return (
    <section className="rounded-[32px] border border-white/[0.09] bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent p-7 shadow-xl shadow-black/40 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-white/[0.07] pb-6">
        <div className="max-w-3xl space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
            Decision assist
          </p>
          <h2 className="text-2xl font-semibold text-white">Heuristic reviewer panel</h2>
          <p className="text-sm leading-relaxed text-white/65">
            Auto-generated from intake text and the stored AUD estimate—advisory only, not saved to Postgres.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={`rounded-2xl border px-5 py-5 ${action.ring}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/54">Recommended action</p>
            <p className="mt-4 text-xl font-semibold text-white">{action.label}</p>
            <p className="mt-3 text-sm leading-relaxed text-white/72">{action.hint}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.1] bg-white/[0.03] px-5 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/54">Suggested next step</p>
            <p className="mt-4 text-xl font-semibold text-white">{NEXT_STEP_COPY[decision.suggestedNextStep]}</p>
            <p className="mt-3 text-sm leading-relaxed text-white/68">
              Pairs best with whichever stage you logged in lifecycle controls.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-black/25 px-5 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/52">Risk indicators</p>
          {decision.risks.length === 0 ? (
            <p className="mt-5 text-sm text-white/60">None flagged—the intake reads internally consistent.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {decision.risks.map((risk) => {
                const cfg = RISK_COPY[risk];
                return (
                  <li key={risk} className="border-l-2 border-amber-400/70 pl-4">
                    <p className="text-sm font-semibold text-white">{cfg.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/60">{cfg.description}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {decision.signals.length > 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/[0.015] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/46">Signals</p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/72">
            {decision.signals.map((signal, idx) => (
              <li key={`signal-${idx}`}>{signal}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

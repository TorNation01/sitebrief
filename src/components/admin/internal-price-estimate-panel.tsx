"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { regenerateInternalPriceEstimateAction } from "@/actions/admin-dashboard";
import { Button } from "@/components/ui/button";
import {
  formatEstimateAud,
  formatStoredInternalPriceEstimateForCopy,
} from "@/lib/sitebrief/build-internal-price-estimate";
import { isInternalPriceEstimateV2, parseStoredPriceEstimate } from "@/types/price-estimate";

type InternalPriceEstimatePanelProps = {
  intakeId: string;
  businessName: string;
  /** Raw JSON from Supabase — parsed client-side */
  stored: unknown;
  pricingEngineEnabled: boolean;
};

const FACTOR_ORDER = [
  { key: "pages" as const, title: "Pages" },
  { key: "features" as const, title: "Features" },
  { key: "content" as const, title: "Content" },
  { key: "branding" as const, title: "Branding" },
  { key: "integrations" as const, title: "Integrations" },
];

export function InternalPriceEstimatePanel({
  intakeId,
  businessName,
  stored,
  pricingEngineEnabled,
}: InternalPriceEstimatePanelProps) {
  const router = useRouter();
  const estimate = parseStoredPriceEstimate(stored);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [pending, run] = useTransition();

  function handleRegenerate() {
    if (!pricingEngineEnabled) {
      return;
    }
    setError(null);
    setCopyMessage(null);
    run(async () => {
      const result = await regenerateInternalPriceEstimateAction(intakeId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  async function handleCopy() {
    if (!pricingEngineEnabled) {
      return;
    }
    if (!estimate) {
      return;
    }
    const text = formatStoredInternalPriceEstimateForCopy(estimate, businessName);
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("Copied to clipboard.");
    } catch {
      setCopyMessage("Clipboard blocked — copy manually from the breakdown below.");
    }
  }

  return (
    <section className="rounded-[32px] border border-amber-400/30 bg-gradient-to-br from-amber-500/[0.12] via-white/[0.03] to-transparent p-8 shadow-xl shadow-black/40">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
              Price estimate
            </p>
            <span className="rounded-full border border-amber-300/55 bg-amber-400/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-100">
              Internal only
            </span>
          </div>
          <h2 className="text-2xl font-semibold text-white">Tiered AUD estimate (grading model)</h2>
          <p className="max-w-xl text-sm leading-relaxed text-white/70">
            Studio-only: five factors (1–3 points each) map to Starter / Business / Professional / Custom. Never expose
            to applicants. Regenerate after intake edits.
          </p>
          {!pricingEngineEnabled ? (
            <p className="max-w-xl text-sm leading-relaxed text-amber-200/90">
              Not available on Basic.{" "}
              <Link href="/admin/billing" className="font-semibold text-[var(--color-accent)] underline-offset-4 hover:underline">
                Upgrade under Plan & billing
              </Link>
              .
            </p>
          ) : null}
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row lg:w-auto">
          <Button
            type="button"
            variant="secondary"
            className="justify-center border border-white/[0.16] px-5 text-white hover:bg-white/10"
            disabled={pending || !estimate || !pricingEngineEnabled}
            onClick={() => void handleCopy()}
          >
            Copy estimate
          </Button>
          <Button
            type="button"
            variant="primary"
            className="justify-center px-5"
            disabled={pending || !pricingEngineEnabled}
            onClick={() => handleRegenerate()}
          >
            {pending ? "Saving…" : estimate ? "Regenerate estimate" : "Generate estimate"}
          </Button>
        </div>
      </div>

      {error ? (
        <div
          className="mt-6 rounded-2xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-50"
          role="alert"
        >
          {error}
        </div>
      ) : null}
      {copyMessage ? <p className="mt-4 text-xs font-semibold text-amber-200/90">{copyMessage}</p> : null}

      {!estimate ? (
        <p className="mt-8 rounded-2xl border border-dashed border-white/[0.12] px-5 py-8 text-center text-sm text-white/62">
          {pricingEngineEnabled
            ? "No estimate stored yet — generate once to baseline this submission."
            : "Upgrade to Professional to generate heuristic studio estimates."}
        </p>
      ) : isInternalPriceEstimateV2(estimate) ? (
        <div className="mt-10 space-y-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Tier" value={estimate.tier.name} emphasize />
            <Metric
              label="Total score"
              value={`${estimate.totalScore} / 15 (band ${estimate.tier.scoreRange.min}–${estimate.tier.scoreRange.max})`}
            />
            <Metric
              label="Price range (AUD)"
              value={`${formatEstimateAud(estimate.tier.priceMinAud)} – ${formatEstimateAud(estimate.tier.priceMaxAud)}${
                estimate.tier.priceMaxIsOpenEnded ? "+" : ""
              }`}
            />
            <Metric label="Delivery estimate" value={estimate.tier.deliveryEstimate} />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
              Per-factor breakdown (1–3 each)
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/80">
              {FACTOR_ORDER.map(({ key, title }) => {
                const row = estimate.scoreBreakdown[key];
                return (
                  <li
                    key={key}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-semibold text-white">
                        {title}{" "}
                        <span className="font-mono text-amber-200/90">({row.points} pt)</span>
                      </p>
                      <p className="text-xs uppercase tracking-wide text-white/45">{row.label}</p>
                    </div>
                    <p className="mt-2 text-white/72">{row.rationale}</p>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-rose-500/25 bg-rose-950/20 p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rose-200/85">
              Red flags / discovery prompts
            </p>
            {estimate.redFlags.length === 0 ? (
              <p className="mt-4 text-sm text-white/72">Nothing auto-flagged — still validate in-call.</p>
            ) : (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-rose-50/92">
                {estimate.redFlags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-[11px] text-white/45">
            Snapshot generated {new Date(estimate.generatedAt).toLocaleString("en-AU")} · {estimate.currency} · model
            v{estimate.version}
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-8">
          <p className="rounded-2xl border border-amber-400/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-100/90">
            This submission uses a <strong>legacy estimate (v1)</strong>. Regenerate to switch to the current tiered
            grading model (v2).
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Suggested tier" value={estimate.suggestedTier} />
            <Metric
              label="Estimated range"
              value={`${formatEstimateAud(estimate.priceRangeAud.min)} – ${formatEstimateAud(estimate.priceRangeAud.max)}`}
            />
            <Metric label="Scope complexity" value={estimate.complexity} emphasize />
            <Metric label="Timeline" value={estimate.timeline} />
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-black/25 p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Deposit guidance</p>
            {estimate.deposit.mode === "percent" ? (
              <div className="mt-4 space-y-2 text-sm text-white/82">
                <p>
                  <span className="font-semibold text-white">{estimate.deposit.percent}%</span>{" "}
                  {estimate.deposit.note}
                </p>
                {estimate.deposit.audRangeAppliedToMinMax ? (
                  <p className="font-mono text-xs text-emerald-200/90">
                    Indicative hold:{" "}
                    {formatEstimateAud(estimate.deposit.audRangeAppliedToMinMax.depositMinAud)} –{" "}
                    {formatEstimateAud(estimate.deposit.audRangeAppliedToMinMax.depositMaxAud)}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-white/82">{estimate.deposit.note}</p>
            )}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Reasoning breakdown</p>
            <ul className="mt-4 space-y-4 text-sm leading-relaxed text-white/80">
              {estimate.reasoning.map((row) => (
                <li
                  key={`${row.label}-${row.detail.slice(0, 24)}`}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4"
                >
                  <p className="font-semibold text-white">{row.label}</p>
                  <p className="mt-2 text-white/75">{row.detail}</p>
                  {row.audMinAddon != null && row.audMaxAddon != null ? (
                    <p className="mt-2 text-xs font-mono text-amber-200/85">
                      Heuristic add: {formatEstimateAud(row.audMinAddon)} – {formatEstimateAud(row.audMaxAddon)}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-rose-500/25 bg-rose-950/20 p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rose-200/85">
              Red flags / discovery prompts
            </p>
            {estimate.redFlags.length === 0 ? (
              <p className="mt-4 text-sm text-white/72">Nothing auto-flagged — still validate in-call.</p>
            ) : (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-rose-50/92">
                {estimate.redFlags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-[11px] text-white/45">
            Snapshot generated {new Date(estimate.generatedAt).toLocaleString("en-AU")} · {estimate.currency} · legacy
            v{estimate.version}
          </p>
        </div>
      )}
    </section>
  );
}

function Metric(props: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/52">{props.label}</p>
      <p
        className={`mt-3 text-sm leading-snug ${props.emphasize ? "text-lg font-semibold text-emerald-200" : "text-white/88"}`}
      >
        {props.value}
      </p>
    </div>
  );
}

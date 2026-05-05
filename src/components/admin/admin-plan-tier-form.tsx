"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateStudioSubscriptionTierAction } from "@/actions/studio-subscription";
import { Button } from "@/components/ui/button";
import {
  BASIC_PLAN_MONTHLY_INTAKE_CAP,
  SUBSCRIPTION_TIERS,
  subscriptionTierLabel,
  type SubscriptionTier,
} from "@/types/subscription";

type AdminPlanTierFormProps = {
  currentTier: SubscriptionTier;
};

const TIER_HINTS: Record<SubscriptionTier, string> = {
  basic:
    `Public intake limit ${BASIC_PLAN_MONTHLY_INTAKE_CAP} submissions per UTC month. Full-pack export and the internal pricing engine are not enabled.`,
  professional:
    "Unlimited intakes plus full client pack export and the internal heuristic pricing engine.",
};

export function AdminPlanTierForm({ currentTier }: AdminPlanTierFormProps) {
  const router = useRouter();
  const [tier, setTier] = useState<SubscriptionTier>(currentTier);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [pending, run] = useTransition();

  const dirty = tier !== currentTier;

  function handleSave() {
    setError(null);
    setBanner(null);
    run(async () => {
      const result = await updateStudioSubscriptionTierAction(tier);
      if (result.error) {
        setError(result.error);
        return;
      }
      setBanner("Plan updated.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-white">Active plan</legend>
        <div className="flex flex-col gap-3">
          {SUBSCRIPTION_TIERS.map((value) => {
            const checked = tier === value;
            return (
              <label
                key={value}
                className={`flex cursor-pointer flex-col gap-2 rounded-2xl border px-5 py-4 transition-colors sm:flex-row sm:items-start sm:justify-between ${
                  checked
                    ? "border-[var(--color-accent)] bg-white/[0.06] ring-1 ring-[var(--color-accent)]/35"
                    : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="subscription_tier"
                    value={value}
                    checked={checked}
                    disabled={pending}
                    onChange={() => setTier(value)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
                  />
                  <span>
                    <span className="text-base font-semibold text-white">{subscriptionTierLabel(value)}</span>
                    <span className="mt-2 block text-sm leading-relaxed text-white/62">{TIER_HINTS[value]}</span>
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="primary"
          className="px-6"
          disabled={pending || !dirty}
          onClick={() => handleSave()}
        >
          {pending ? "Saving…" : "Apply plan"}
        </Button>
        <Button type="button" variant="ghost" className="text-white/80" disabled={pending} onClick={() => setTier(currentTier)}>
          Reset
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-50" role="alert">
          {error}
        </div>
      ) : null}
      {banner && !error ? (
        <p className="text-sm font-semibold text-emerald-200/95" role="status">
          {banner}
        </p>
      ) : null}
    </div>
  );
}

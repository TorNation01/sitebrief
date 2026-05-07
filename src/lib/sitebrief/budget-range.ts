/** Stored `website_intakes.budget_range` values — all amounts are AUD. */

import { INTERNAL_PRICE_TIER_DEFINITIONS } from "@/types/price-estimate";

export const BUDGET_RANGE_SLUGS = [
  "under-1500-aud",
  "1500-3500-aud",
  "3500-7000-aud",
  "7000-15000-aud",
  "not-sure-yet",
] as const;

export type BudgetRangeSlug = (typeof BUDGET_RANGE_SLUGS)[number];

const BUDGET_RANGE_SLUG_SET = new Set<string>(BUDGET_RANGE_SLUGS);

/** Maps each budget slug to the internal tier row used for display copy (same AUD bands). */
const BUDGET_SLUG_TO_TIER_INDEX: Record<Exclude<BudgetRangeSlug, "not-sure-yet">, number> = {
  "under-1500-aud": 0,
  "1500-3500-aud": 1,
  "3500-7000-aud": 2,
  "7000-15000-aud": 3,
};

function formatAud(n: number): string {
  return n.toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

/** Short scope hints aligned with how we scope Starter → Custom builds (public-facing, not internal scoring). */
const BUDGET_SCOPE_HINTS: Record<Exclude<BudgetRangeSlug, "not-sure-yet">, string> = {
  "under-1500-aud": "Small site — landing, a few pages, light features",
  "1500-3500-aud": "Brochure or marketing site — CMS, forms, standard integrations",
  "3500-7000-aud": "Richer build — more pages, auth/payments, or custom workflows",
  "7000-15000-aud": "Larger or custom program — deep IA, integrations, or phased delivery",
};

function technicalLabelForSlug(slug: Exclude<BudgetRangeSlug, "not-sure-yet">): string {
  const tier = INTERNAL_PRICE_TIER_DEFINITIONS[BUDGET_SLUG_TO_TIER_INDEX[slug]];
  const band = `$${formatAud(tier.priceMinAud)}–$${formatAud(tier.priceMaxAud)} AUD`;
  return `${tier.name} (${band}) — ${BUDGET_SCOPE_HINTS[slug]}`;
}

function simpleLabelForSlug(slug: Exclude<BudgetRangeSlug, "not-sure-yet">): string {
  const tier = INTERNAL_PRICE_TIER_DEFINITIONS[BUDGET_SLUG_TO_TIER_INDEX[slug]];
  const band = `~$${formatAud(tier.priceMinAud)}–$${formatAud(tier.priceMaxAud)} AUD`;
  return `${tier.name}: ${band} — ${BUDGET_SCOPE_HINTS[slug]}`;
}

/** Default (technical) select labels — tied to internal tier AUD bands so the brief matches the quote model. */
export const BUDGET_RANGE_LABELS: Record<BudgetRangeSlug, string> = {
  "under-1500-aud": technicalLabelForSlug("under-1500-aud"),
  "1500-3500-aud": technicalLabelForSlug("1500-3500-aud"),
  "3500-7000-aud": technicalLabelForSlug("3500-7000-aud"),
  "7000-15000-aud": technicalLabelForSlug("7000-15000-aud"),
  "not-sure-yet": "Not sure yet — we’ll align budget after a short discovery call",
};

/** Friendlier one-line labels for “simple” wording mode (same tiers and amounts). */
export const BUDGET_RANGE_SIMPLE_LABELS: Record<BudgetRangeSlug, string> = {
  "under-1500-aud": simpleLabelForSlug("under-1500-aud"),
  "1500-3500-aud": simpleLabelForSlug("1500-3500-aud"),
  "3500-7000-aud": simpleLabelForSlug("3500-7000-aud"),
  "7000-15000-aud": simpleLabelForSlug("7000-15000-aud"),
  "not-sure-yet": "Not sure — help me pick once you’ve seen the scope",
};

export function isBudgetRangeSlug(value: string): value is BudgetRangeSlug {
  return BUDGET_RANGE_SLUG_SET.has(value);
}

/** Upper bound the client signalled (AUD), or null when unknown / not applicable. */
export function budgetCeilingAudFromSlug(slug: string | null | undefined): number | null {
  const s = slug?.trim() ?? "";
  if (!s || s === "not-sure-yet") {
    return null;
  }
  if (s === "under-1500-aud") {
    return 1_500;
  }
  if (s === "1500-3500-aud") {
    return 3_500;
  }
  if (s === "3500-7000-aud") {
    return 7_000;
  }
  if (s === "7000-15000-aud") {
    return 15_000;
  }
  return null;
}

export function labelForBudgetRangeSlug(slug: string | null | undefined): string {
  const s = slug?.trim() ?? "";
  if (isBudgetRangeSlug(s)) {
    return BUDGET_RANGE_LABELS[s];
  }
  return s || "—";
}

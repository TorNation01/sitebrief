/** Stored `website_intakes.budget_range` values — all amounts are AUD. */

export const BUDGET_RANGE_SLUGS = [
  "under-1500-aud",
  "1500-3500-aud",
  "3500-7000-aud",
  "7000-15000-aud",
  "not-sure-yet",
] as const;

export type BudgetRangeSlug = (typeof BUDGET_RANGE_SLUGS)[number];

const BUDGET_RANGE_SLUG_SET = new Set<string>(BUDGET_RANGE_SLUGS);

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

export const BUDGET_RANGE_LABELS: Record<BudgetRangeSlug, string> = {
  "under-1500-aud": "Under $1,500 AUD",
  "1500-3500-aud": "$1,500 – $3,500 AUD",
  "3500-7000-aud": "$3,500 – $7,000 AUD",
  "7000-15000-aud": "$7,000 – $15,000 AUD",
  "not-sure-yet": "Not sure yet — help me figure it out",
};

export function labelForBudgetRangeSlug(slug: string | null | undefined): string {
  const s = slug?.trim() ?? "";
  if (isBudgetRangeSlug(s)) {
    return BUDGET_RANGE_LABELS[s];
  }
  return s || "—";
}

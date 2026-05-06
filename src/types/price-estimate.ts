import { z } from "zod";

/** Canonical tier names for the internal AUD grading model. */
export const PRICE_TIER_NAMES = ["Starter", "Business", "Professional", "Custom"] as const;
export type PriceTierName = (typeof PRICE_TIER_NAMES)[number];

/** Single source of truth: score band, AUD range, delivery copy (all AUD, admin-only). */
export const INTERNAL_PRICE_TIER_DEFINITIONS = [
  {
    name: "Starter" as const,
    scoreRange: { min: 5, max: 7 },
    priceMinAud: 500,
    priceMaxAud: 1_500,
    deliveryEstimate: "2–5 days",
  },
  {
    name: "Business" as const,
    scoreRange: { min: 8, max: 10 },
    priceMinAud: 1_500,
    priceMaxAud: 3_500,
    deliveryEstimate: "1–2 weeks",
  },
  {
    name: "Professional" as const,
    scoreRange: { min: 11, max: 13 },
    priceMinAud: 3_500,
    priceMaxAud: 7_000,
    deliveryEstimate: "2–3 weeks",
  },
  {
    name: "Custom" as const,
    scoreRange: { min: 14, max: 15 },
    priceMinAud: 7_000,
    priceMaxAud: 15_000,
    deliveryEstimate: "3–6 weeks (scope may exceed $15,000 AUD)",
  },
] as const satisfies ReadonlyArray<{
  name: PriceTierName;
  scoreRange: { min: number; max: number };
  priceMinAud: number;
  priceMaxAud: number;
  deliveryEstimate: string;
}>;

export type InternalPriceTierDefinition = (typeof INTERNAL_PRICE_TIER_DEFINITIONS)[number];

/** Stored in `website_intakes.internal_price_estimate` (admin-only JSON). Legacy v1. */
export const internalPriceEstimateV1Schema = z.object({
  version: z.literal(1),
  currency: z.literal("AUD"),
  generatedAt: z.string(),
  suggestedTier: z.string(),
  priceRangeAud: z.object({
    min: z.number(),
    max: z.number(),
  }),
  complexity: z.enum(["Low", "Medium", "High", "Enterprise"]),
  reasoning: z.array(
    z.object({
      label: z.string(),
      detail: z.string(),
      audMinAddon: z.number().optional(),
      audMaxAddon: z.number().optional(),
    }),
  ),
  deposit: z.object({
    mode: z.enum(["percent", "milestones"]),
    percent: z.number().optional(),
    note: z.string(),
    audRangeAppliedToMinMax: z
      .object({
        depositMinAud: z.number(),
        depositMaxAud: z.number(),
      })
      .optional(),
  }),
  timeline: z.string(),
  redFlags: z.array(z.string()),
});

export type InternalPriceEstimateV1 = z.infer<typeof internalPriceEstimateV1Schema>;

const factorPointsSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

const factorScoreSchema = z.object({
  /** Which of the five grading axes this row describes. */
  factorKey: z.enum(["pages", "features", "content", "branding", "integrations"]),
  points: factorPointsSchema,
  /** Human-readable band for this score (e.g. "1–3 pages", "Static / forms only"). */
  label: z.string(),
  rationale: z.string(),
});

const priceTierSnapshotSchema = z.object({
  name: z.enum(["Starter", "Business", "Professional", "Custom"]),
  scoreRange: z.object({
    min: z.number().int(),
    max: z.number().int(),
  }),
  priceMinAud: z.number(),
  priceMaxAud: z.number(),
  /** When true, UI may show "$15,000+" style copy (Custom tier ceiling is indicative). */
  priceMaxIsOpenEnded: z.boolean().optional(),
  deliveryEstimate: z.string(),
});

const scoreBreakdownSchema = z.object({
  pages: factorScoreSchema,
  features: factorScoreSchema,
  content: factorScoreSchema,
  branding: factorScoreSchema,
  integrations: factorScoreSchema,
});

/** Current tiered grading model — stored in `website_intakes.internal_price_estimate`. */
export const internalPriceEstimateV2Schema = z.object({
  version: z.literal(2),
  currency: z.literal("AUD"),
  generatedAt: z.string(),
  /** Resolved tier row (name, score band, AUD range, delivery). */
  tier: priceTierSnapshotSchema,
  totalScore: z.number().int().min(5).max(15),
  scoreBreakdown: scoreBreakdownSchema,
  /** Kept for quick min/max access; mirrors tier price fields. */
  priceRangeAud: z.object({
    min: z.number(),
    max: z.number(),
  }),
  redFlags: z.array(z.string()),
});

export type InternalPriceEstimateV2 = z.infer<typeof internalPriceEstimateV2Schema>;
export type InternalPriceFactorScore = InternalPriceEstimateV2["scoreBreakdown"]["pages"];
export type InternalPriceTierSnapshot = InternalPriceEstimateV2["tier"];

export type StoredInternalPriceEstimate = InternalPriceEstimateV1 | InternalPriceEstimateV2;

/** Legacy v2 rows used `bandLabel` instead of `label` on factors — normalize before strict parse. */
function migrateV2FactorShape(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") {
    return payload;
  }
  const ver = (payload as { version?: unknown }).version;
  if (ver !== 2 && ver !== "2") {
    return payload;
  }
  const row: Record<string, unknown> = {
    ...(payload as Record<string, unknown>),
    version: 2,
  };
  const breakdown = row.scoreBreakdown;
  if (!breakdown || typeof breakdown !== "object") {
    return payload;
  }
  const keys = ["pages", "features", "content", "branding", "integrations"] as const;
  const nextBreakdown: Record<string, unknown> = { ...((breakdown as Record<string, unknown>) ?? {}) };
  for (const k of keys) {
    const cell = nextBreakdown[k];
    if (!cell || typeof cell !== "object") {
      continue;
    }
    const c = cell as Record<string, unknown>;
    if ("bandLabel" in c && typeof c.bandLabel === "string" && !("label" in c)) {
      nextBreakdown[k] = { ...c, label: c.bandLabel };
    }
    if (!("factorKey" in (nextBreakdown[k] as object))) {
      nextBreakdown[k] = { ...(nextBreakdown[k] as object), factorKey: k };
    }
  }
  const tierMissing = !("tier" in row) || row.tier == null;
  if (tierMissing && typeof row.tierName === "string" && row.priceRangeAud && typeof row.priceRangeAud === "object") {
    const total = typeof row.totalScore === "number" ? row.totalScore : 5;
    const defByName = INTERNAL_PRICE_TIER_DEFINITIONS.find((t) => t.name === row.tierName);
    const defByScore = INTERNAL_PRICE_TIER_DEFINITIONS.find(
      (t) => total >= t.scoreRange.min && total <= t.scoreRange.max,
    );
    const def = defByName ?? defByScore ?? INTERNAL_PRICE_TIER_DEFINITIONS[0];
    const pr = row.priceRangeAud as { min?: unknown; max?: unknown };
    const min = typeof pr.min === "number" ? pr.min : def.priceMinAud;
    const max = typeof pr.max === "number" ? pr.max : def.priceMaxAud;
    const scoreRange = def.scoreRange;
    const delivery =
      typeof row.estimatedDelivery === "string"
        ? row.estimatedDelivery
        : def.deliveryEstimate;
    const tierNameResolved = defByName?.name ?? def.name;
    return {
      ...row,
      scoreBreakdown: nextBreakdown,
      tier: {
        name: tierNameResolved,
        scoreRange,
        priceMinAud: min,
        priceMaxAud: max,
        priceMaxIsOpenEnded: tierNameResolved === "Custom",
        deliveryEstimate: delivery,
      },
    };
  }
  return { ...row, scoreBreakdown: nextBreakdown };
}

export const storedInternalPriceEstimateSchema = z.preprocess(
  migrateV2FactorShape,
  z.discriminatedUnion("version", [internalPriceEstimateV2Schema, internalPriceEstimateV1Schema]),
);

export function parseStoredPriceEstimate(payload: unknown): StoredInternalPriceEstimate | null {
  const parsed = storedInternalPriceEstimateSchema.safeParse(payload);
  return parsed.success ? parsed.data : null;
}

export function isInternalPriceEstimateV2(
  e: StoredInternalPriceEstimate | null,
): e is InternalPriceEstimateV2 {
  return e != null && e.version === 2;
}

/** Minimum AUD range for decision heuristics (v1 or v2). */
export function estimatePriceMinAud(e: StoredInternalPriceEstimate): number {
  if (e.version === 2) {
    return e.tier.priceMinAud;
  }
  return e.priceRangeAud.min;
}

/** Maximum AUD (v2 uses tier snapshot). */
export function estimatePriceMaxAud(e: StoredInternalPriceEstimate): number {
  if (e.version === 2) {
    return e.tier.priceMaxAud;
  }
  return e.priceRangeAud.max;
}

/** Timeline / delivery text for heuristics and copy. */
export function estimateTimelineLabel(e: StoredInternalPriceEstimate): string {
  return e.version === 2 ? e.tier.deliveryEstimate : e.timeline;
}

/** Tier display name for heuristics copy (v2 only). */
export function estimateTierName(e: StoredInternalPriceEstimate): string | null {
  return e.version === 2 ? e.tier.name : e.version === 1 ? e.suggestedTier : null;
}

import { z } from "zod";

/** Stored in `website_intakes.internal_price_estimate` (admin-only JSON). */
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

export function parseStoredPriceEstimate(payload: unknown): InternalPriceEstimateV1 | null {
  const parsed = internalPriceEstimateV1Schema.safeParse(payload);
  return parsed.success ? parsed.data : null;
}

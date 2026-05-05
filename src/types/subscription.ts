export const SUBSCRIPTION_TIERS = ["basic", "professional"] as const;

export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

/** Public intakes (website_intakes) allowed per UTC month on Basic. Professional is unlimited. */
export const BASIC_PLAN_MONTHLY_INTAKE_CAP = 10;

export function parseSubscriptionTier(value: unknown): SubscriptionTier {
  if (value === "professional") {
    return "professional";
  }
  return "basic";
}

export function isProfessionalTier(tier: SubscriptionTier): boolean {
  return tier === "professional";
}

export function canExportFullClientPack(tier: SubscriptionTier): boolean {
  return isProfessionalTier(tier);
}

export function canUseInternalPricingEngine(tier: SubscriptionTier): boolean {
  return isProfessionalTier(tier);
}

export function subscriptionTierLabel(tier: SubscriptionTier): string {
  return tier === "basic" ? "Basic" : "Professional";
}

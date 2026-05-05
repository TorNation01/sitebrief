import { tryCreateSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import {
  BASIC_PLAN_MONTHLY_INTAKE_CAP,
  parseSubscriptionTier,
  type SubscriptionTier,
} from "@/types/subscription";

export const SITE_BRIEF_BASIC_MONTHLY_LIMIT_MESSAGE =
  "This workspace has reached its monthly intake limit on the Basic plan. Upgrade in Plan & billing, or try again next calendar month.";

function startOfUtcMonthIso(): string {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  return start.toISOString();
}

/**
 * Enforces Basic monthly intake cap using the service-role client (anon cannot read `studio_subscription`).
 * Without `SUPABASE_SERVICE_ROLE_KEY`, returns ok — same pattern as DB-backed rate limits.
 */
export async function peekStudioMonthlyIntakeAllowance(): Promise<
  { ok: true } | { ok: false; message: string }
> {
  const svc = tryCreateSupabaseServiceRoleClient();
  if (!svc) {
    return { ok: true };
  }

  const { data: sub, error: subErr } = await svc
    .from("studio_subscription")
    .select("subscription_tier")
    .eq("id", 1)
    .maybeSingle();

  if (subErr) {
    console.error("[sitebrief] studio subscription peek failed:", subErr.message);
    return { ok: true };
  }

  const tier: SubscriptionTier = parseSubscriptionTier(sub?.subscription_tier);
  if (tier === "professional") {
    return { ok: true };
  }

  const sinceIso = startOfUtcMonthIso();
  const { count, error: countErr } = await svc
    .from("website_intakes")
    .select("id", { count: "exact", head: true })
    .gte("created_at", sinceIso);

  if (countErr) {
    console.error("[sitebrief] monthly intake count failed:", countErr.message);
    return { ok: true };
  }

  if ((count ?? 0) >= BASIC_PLAN_MONTHLY_INTAKE_CAP) {
    return { ok: false, message: SITE_BRIEF_BASIC_MONTHLY_LIMIT_MESSAGE };
  }

  return { ok: true };
}

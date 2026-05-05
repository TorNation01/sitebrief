"use server";

import { revalidatePath } from "next/cache";

import { isSiteBriefAdminUser } from "@/lib/auth/sitebrief-admin";
import { updateStudioSubscriptionSingleton } from "@/lib/sitebrief/mutations";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from "@/types/subscription";

function isSubscriptionTier(value: unknown): value is SubscriptionTier {
  return typeof value === "string" && (SUBSCRIPTION_TIERS as readonly string[]).includes(value);
}

export async function updateStudioSubscriptionTierAction(
  tier: string,
): Promise<{ error?: string; ok?: true }> {
  if (!isSubscriptionTier(tier)) {
    return { error: "Unrecognized subscription plan." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSiteBriefAdminUser(user)) {
    return { error: "You must be authenticated with an elevated studio administrator role." };
  }

  try {
    await updateStudioSubscriptionSingleton(supabase, { subscription_tier: tier });
  } catch (cause) {
    const message =
      cause && typeof cause === "object" && "message" in cause
        ? String((cause as { message?: unknown }).message)
        : "Unable to persist the subscription tier.";
    return { error: message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/billing");

  return { ok: true };
}

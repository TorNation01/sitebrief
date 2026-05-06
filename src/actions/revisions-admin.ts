"use server";

import { revalidatePath } from "next/cache";

import { isSiteBriefAdminUser } from "@/lib/auth/sitebrief-admin";
import { buildRevisionCursorPromptMarkdown } from "@/lib/sitebrief/build-revision-cursor-prompt";
import { computeRevisionAllowance } from "@/lib/sitebrief/revision-allowance";
import { fetchRevisionRoundsBundleForIntakeAdmin, fetchWebsiteIntakeWithClientById } from "@/lib/sitebrief/queries";
import { updateWebsiteIntakeAdminFields } from "@/lib/sitebrief/mutations";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseStoredPriceEstimate } from "@/types/price-estimate";
import { z } from "zod";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertUuid(id: string, label: string): string | null {
  const t = id.trim();
  if (!t || !UUID_RE.test(t)) {
    return `Invalid ${label}.`;
  }
  return null;
}

type Guard = { error: string } | { supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> };

async function requireAdminSupabase(): Promise<Guard> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isSiteBriefAdminUser(user)) {
    return { error: "Administrator session required." };
  }
  return { supabase };
}

export async function createRevisionRoundAdminAction(intakeId: string): Promise<
  | { ok: true; sharePath: string; token: string; roundNumber: number }
  | { ok: false; error: string }
> {
  const bad = assertUuid(intakeId, "intake id");
  if (bad) {
    return { ok: false, error: bad };
  }

  const guard = await requireAdminSupabase();
  if ("error" in guard) {
    return { ok: false, error: guard.error };
  }

  const dossier = await fetchWebsiteIntakeWithClientById(guard.supabase, intakeId);
  if (!dossier?.clients) {
    return { ok: false, error: "Intake not found." };
  }

  const rounds = await fetchRevisionRoundsBundleForIntakeAdmin(guard.supabase, intakeId);
  const estimate = parseStoredPriceEstimate(dossier.internal_price_estimate);
  const allowance = computeRevisionAllowance({
    estimate,
    extraRevisionRoundsPurchased: dossier.extra_revision_rounds_purchased ?? 0,
    roundsCreated: rounds.length,
  });

  if (allowance.remainingCreates <= 0) {
    return {
      ok: false,
      error: `No revision rounds left (${allowance.roundsCreated} of ${allowance.totalSlots} used). Register a paid extra round (${allowance.extraRoundPriceAud.toLocaleString("en-AU")} AUD each) first.`,
    };
  }

  const nextNumber = rounds.reduce((max, r) => Math.max(max, r.round_number), 0) + 1;

  const { data: created, error } = await guard.supabase
    .from("revision_rounds")
    .insert({
      intake_id: intakeId,
      round_number: nextNumber,
      status: "pending",
    })
    .select("id, customer_access_token, round_number")
    .single();

  if (error || !created) {
    return { ok: false, error: error?.message ?? "Could not create revision round." };
  }

  revalidatePath(`/admin/intakes/${intakeId}`);
  return {
    ok: true,
    sharePath: `/revisions/${intakeId}/${created.customer_access_token}`,
    token: created.customer_access_token,
    roundNumber: created.round_number,
  };
}

export async function registerPaidExtraRevisionRoundAction(intakeId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const bad = assertUuid(intakeId, "intake id");
  if (bad) {
    return { ok: false, error: bad };
  }

  const guard = await requireAdminSupabase();
  if ("error" in guard) {
    return { ok: false, error: guard.error };
  }

  const dossier = await fetchWebsiteIntakeWithClientById(guard.supabase, intakeId);
  if (!dossier) {
    return { ok: false, error: "Intake not found." };
  }

  const next = (dossier.extra_revision_rounds_purchased ?? 0) + 1;
  await updateWebsiteIntakeAdminFields(guard.supabase, intakeId, {
    extra_revision_rounds_purchased: next,
  });

  revalidatePath(`/admin/intakes/${intakeId}`);
  return { ok: true };
}

const itemStatusSchema = z.enum(["pending", "accepted", "rejected", "completed"]);

export async function updateRevisionItemAdminAction(input: {
  itemId: string;
  status: z.infer<typeof itemStatusSchema>;
  admin_response?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const bad = assertUuid(input.itemId, "item id");
  if (bad) {
    return { ok: false, error: bad };
  }
  const statusParsed = itemStatusSchema.safeParse(input.status);
  if (!statusParsed.success) {
    return { ok: false, error: "Invalid status." };
  }

  const guard = await requireAdminSupabase();
  if ("error" in guard) {
    return { ok: false, error: guard.error };
  }

  const note = (input.admin_response ?? "").trim().slice(0, 8_000);

  const { data: itemRow } = await guard.supabase.from("revision_items").select("round_id").eq("id", input.itemId).maybeSingle();
  if (!itemRow) {
    return { ok: false, error: "Item not found." };
  }

  const { data: roundRow } = await guard.supabase
    .from("revision_rounds")
    .select("intake_id")
    .eq("id", itemRow.round_id)
    .maybeSingle();

  const { error } = await guard.supabase
    .from("revision_items")
    .update({
      status: statusParsed.data,
      admin_response: note.length ? note : null,
    })
    .eq("id", input.itemId);

  if (error) {
    return { ok: false, error: error.message };
  }

  if (roundRow?.intake_id) {
    revalidatePath(`/admin/intakes/${roundRow.intake_id}`);
  }
  return { ok: true };
}

export async function generateRevisionCursorPromptAdminAction(input: {
  intakeId: string;
  roundId: string;
}): Promise<{ ok: true; markdown: string } | { ok: false; error: string }> {
  const e1 = assertUuid(input.intakeId, "intake id");
  const e2 = assertUuid(input.roundId, "round id");
  if (e1) {
    return { ok: false, error: e1 };
  }
  if (e2) {
    return { ok: false, error: e2 };
  }

  const guard = await requireAdminSupabase();
  if ("error" in guard) {
    return { ok: false, error: guard.error };
  }

  const dossier = await fetchWebsiteIntakeWithClientById(guard.supabase, input.intakeId);
  if (!dossier?.clients) {
    return { ok: false, error: "Intake not found." };
  }

  const bundle = await fetchRevisionRoundsBundleForIntakeAdmin(guard.supabase, input.intakeId);
  const round = bundle.find((r) => r.id === input.roundId);
  if (!round) {
    return { ok: false, error: "Revision round not found." };
  }

  const markdown = buildRevisionCursorPromptMarkdown({
    businessName: dossier.clients.business_name,
    intake: dossier,
    client: dossier.clients,
    roundNumber: round.round_number,
    items: round.revision_items,
  });

  const { error } = await guard.supabase.from("revision_prompts").insert({
    round_id: round.id,
    prompt_text: markdown,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/admin/intakes/${input.intakeId}`);
  return { ok: true, markdown };
}

export async function revokeRevisionRoundTokenAdminAction(roundId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const bad = assertUuid(roundId, "round id");
  if (bad) {
    return { ok: false, error: bad };
  }

  const guard = await requireAdminSupabase();
  if ("error" in guard) {
    return { ok: false, error: guard.error };
  }

  const { data: row } = await guard.supabase.from("revision_rounds").select("intake_id").eq("id", roundId).maybeSingle();
  if (!row) {
    return { ok: false, error: "Round not found." };
  }

  const { error } = await guard.supabase
    .from("revision_rounds")
    .update({ token_revoked_at: new Date().toISOString() })
    .eq("id", roundId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/admin/intakes/${row.intake_id}`);
  return { ok: true };
}

export async function markRevisionRoundCompletedAdminAction(roundId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const bad = assertUuid(roundId, "round id");
  if (bad) {
    return { ok: false, error: bad };
  }

  const guard = await requireAdminSupabase();
  if ("error" in guard) {
    return { ok: false, error: guard.error };
  }

  const { data: row } = await guard.supabase.from("revision_rounds").select("intake_id").eq("id", roundId).maybeSingle();
  if (!row) {
    return { ok: false, error: "Round not found." };
  }

  const { error } = await guard.supabase
    .from("revision_rounds")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", roundId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/admin/intakes/${row.intake_id}`);
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";

import { isSiteBriefAdminUser } from "@/lib/auth/sitebrief-admin";
import { buildInternalPriceEstimate } from "@/lib/sitebrief/build-internal-price-estimate";
import { buildCursorPromptPackMarkdown } from "@/lib/sitebrief/build-cursor-prompt-pack";
import { insertAdminNote, updateWebsiteIntakeAdminFields } from "@/lib/sitebrief/mutations";
import { fetchWebsiteIntakeWithClientById } from "@/lib/sitebrief/queries";
import type { SiteBriefClient } from "@/lib/sitebrief/supabase-brand";
import { isWorkflowStatus } from "@/lib/sitebrief/workflow-status";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { internalPriceEstimateV1Schema, type InternalPriceEstimateV1 } from "@/types/price-estimate";

type StudioGuardResult =
  | { error: string }
  | { supabase: SiteBriefClient };

async function requireStudioSupabase(): Promise<StudioGuardResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSiteBriefAdminUser(user)) {
    return { error: "You must be authenticated with an elevated studio administrator role." };
  }

  return { supabase };
}

function formatActionError(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error &&
    "message" in error &&
    typeof (error as { message?: string }).message === "string"
  ) {
    return (error as { message?: string }).message ?? fallback;
  }
  return fallback;
}

/** Basic UUID v4-shape guard — matches Supabase-generated keys */
const INTAKE_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertValidIntakeId(intakeId: string): string | null {
  const trimmed = intakeId.trim();
  if (!trimmed || !INTAKE_ID_RE.test(trimmed)) {
    return "Malformed submission identifier.";
  }
  return null;
}

export async function updateSubmissionStatusAction(
  intakeId: string,
  status: string,
): Promise<{ error?: string }> {
  if (!intakeId) {
    return { error: "Missing submission identifier." };
  }
  const malformed = assertValidIntakeId(intakeId);
  if (malformed) {
    return { error: malformed };
  }

  const candidate = status.trim();
  if (!isWorkflowStatus(candidate)) {
    return { error: "That status is outside the sanctioned workflow taxonomy." };
  }

  const guard = await requireStudioSupabase();
  if ("error" in guard) {
    return { error: guard.error };
  }

  try {
    await updateWebsiteIntakeAdminFields(guard.supabase, intakeId, {
      status: candidate,
    });
  } catch (error) {
    return { error: formatActionError(error, "Unable to update the lifecycle status.") };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/intakes/${intakeId}`);

  return {};
}

export async function regenerateCursorPromptPackAction(
  intakeId: string,
): Promise<{ error?: string; markdown?: string }> {
  if (!intakeId) {
    return { error: "Submission reference missing." };
  }
  const malformed = assertValidIntakeId(intakeId);
  if (malformed) {
    return { error: malformed };
  }

  const guard = await requireStudioSupabase();

  if ("error" in guard) {
    return { error: guard.error };
  }

  try {
    const dossier = await fetchWebsiteIntakeWithClientById(guard.supabase, intakeId);

    if (!dossier?.clients) {
      return { error: "That submission no longer exists." };
    }

    const markdown = buildCursorPromptPackMarkdown(dossier.clients, dossier);

    await updateWebsiteIntakeAdminFields(guard.supabase, intakeId, {
      generated_prompt_pack: markdown,
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/intakes/${intakeId}`);

    return { markdown };
  } catch (error) {
    return { error: formatActionError(error, "Unable to persist the prompt pack.") };
  }
}

export async function regenerateInternalPriceEstimateAction(
  intakeId: string,
): Promise<{ error?: string; estimate?: InternalPriceEstimateV1 }> {
  if (!intakeId) {
    return { error: "Submission reference missing." };
  }
  const malformed = assertValidIntakeId(intakeId);
  if (malformed) {
    return { error: malformed };
  }

  const guard = await requireStudioSupabase();
  if ("error" in guard) {
    return { error: guard.error };
  }

  try {
    const dossier = await fetchWebsiteIntakeWithClientById(guard.supabase, intakeId);
    if (!dossier?.clients) {
      return { error: "That submission no longer exists." };
    }

    const estimate = buildInternalPriceEstimate(dossier);
    const parsed = internalPriceEstimateV1Schema.safeParse(estimate);
    if (!parsed.success) {
      return { error: "Generated estimate failed validation — contact engineering." };
    }

    await updateWebsiteIntakeAdminFields(guard.supabase, intakeId, {
      internal_price_estimate: parsed.data,
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/intakes/${intakeId}`);

    return { estimate: parsed.data };
  } catch (error) {
    return { error: formatActionError(error, "Unable to persist the price estimate.") };
  }
}

export async function addSubmissionNoteAction(
  intakeId: string,
  payload: FormData,
): Promise<{ error?: string }> {
  const note = `${payload.get("note") ?? ""}`.trim();

  if (!intakeId) {
    return { error: "Submission reference missing." };
  }
  const malformed = assertValidIntakeId(intakeId);
  if (malformed) {
    return { error: malformed };
  }

  if (!note.length) {
    return { error: "Reviewer notes cannot be empty." };
  }

  if (note.length > 12000) {
    return { error: "Notes are capped at twelve thousand characters to keep payloads lean." };
  }

  const guard = await requireStudioSupabase();

  if ("error" in guard) {
    return { error: guard.error };
  }

  try {
    await insertAdminNote(guard.supabase, {
      intake_id: intakeId,
      note,
    });
  } catch (error) {
    return { error: formatActionError(error, "Unable to save the reviewer note.") };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/intakes/${intakeId}`);

  return {};
}

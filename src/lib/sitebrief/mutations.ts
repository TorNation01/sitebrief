import type {
  AdminNoteInsert,
  AdminNoteRow,
  StudioSubscriptionUpdate,
  SubmitWebsiteIntakePayload,
  WebsiteIntakeAdminUpdate,
} from "@/types/database";

import type { SiteBriefClient } from "./supabase-brand";
import { WHITE_LABEL_SUBMISSION_TYPE } from "./white-label-request";

type SupabasePostgrestError = { message?: string };

function throwIfPresent(error: SupabasePostgrestError | null): void {
  if (error) {
    throw error;
  }
}

/**
 * Persist a new client + website intake in order. Intended for anon / authenticated
 * visitors using the public anon key — RLS allows inserts only on these tables.
 */
export async function insertWebsiteIntakeSubmission(
  supabase: SiteBriefClient,
  payload: SubmitWebsiteIntakePayload,
) {
  const { data: insertedClient, error: clientError } = await supabase
    .from("clients")
    .insert(payload.client)
    .select("id")
    .single();

  if (clientError) {
    throw clientError;
  }
  if (!insertedClient) {
    throw new Error("SiteBrief: insert client returned no row");
  }

  const { data: insertedIntake, error: intakeError } = await supabase
    .from("website_intakes")
    .insert({
      ...payload.intake,
      client_id: insertedClient.id,
      status: "New",
    })
    .select("id")
    .single();

  if (intakeError) {
    throw intakeError;
  }
  if (!insertedIntake) {
    throw new Error("SiteBrief: insert intake returned no row");
  }

  return {
    clientId: insertedClient.id,
    intakeId: insertedIntake.id,
  };
}

function emptyToNull(value: string | undefined): string | null {
  const t = value?.trim();
  return t?.length ? t : null;
}

/** Public white-label inquiry insert (anon key + RLS). */
export async function insertWhiteLabelRequest(
  supabase: SiteBriefClient,
  values: {
    contact_name: string;
    email: string;
    organization?: string;
    message?: string;
  },
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("white_label_requests")
    .insert({
      submission_type: WHITE_LABEL_SUBMISSION_TYPE,
      contact_name: values.contact_name.trim(),
      email: values.email.trim(),
      organization: emptyToNull(values.organization),
      message: emptyToNull(values.message),
    })
    .select("id")
    .single();

  throwIfPresent(error);
  if (!data) {
    throw new Error("SiteBrief: insert white_label_requests returned no row");
  }
  return { id: data.id };
}

/** Update workspace fields managed by admins (status + generated prompt artifact). Requires admin JWT. */
export async function updateWebsiteIntakeAdminFields(
  admin: SiteBriefClient,
  intakeId: string,
  patch: Partial<WebsiteIntakeAdminUpdate>,
) {
  if (Object.keys(patch).length === 0) {
    return;
  }

  const { error } = await admin
    .from("website_intakes")
    .update(patch as WebsiteIntakeAdminUpdate)
    .eq("id", intakeId);

  throwIfPresent(error);
}

/** Append internal commentary tied to an intake. Requires admin JWT. */
export async function insertAdminNote(
  admin: SiteBriefClient,
  payload: AdminNoteInsert,
): Promise<AdminNoteRow> {
  const { data, error } = await admin
    .from("admin_notes")
    .insert(payload)
    .select("*")
    .single();

  throwIfPresent(error);
  if (!data) {
    throw new Error("SiteBrief: insert admin note returned no row");
  }
  return data;
}

/** Rewrite an existing admin note while keeping audit-friendly updated content. Requires admin JWT. */
export async function updateAdminNoteForIntakeAdmin(
  admin: SiteBriefClient,
  params: Pick<AdminNoteRow, "id" | "intake_id">,
  patch: Partial<Pick<AdminNoteInsert, "note">>,
): Promise<void> {
  const { error } = await admin
    .from("admin_notes")
    .update(patch)
    .eq("id", params.id)
    .eq("intake_id", params.intake_id);

  throwIfPresent(error);
}

/** Update the singleton SaaS tier row (and optional Stripe ids). Admin JWT only. */
export async function updateStudioSubscriptionSingleton(
  admin: SiteBriefClient,
  patch: Pick<
    StudioSubscriptionUpdate,
    "subscription_tier" | "stripe_customer_id" | "stripe_subscription_id"
  >,
): Promise<void> {
  const trimmed: StudioSubscriptionUpdate = {
    updated_at: new Date().toISOString(),
    ...patch,
  };

  const { error } = await admin.from("studio_subscription").update(trimmed).eq("id", 1);

  throwIfPresent(error);
}

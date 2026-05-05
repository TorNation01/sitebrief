import type {
  AdminNoteInsert,
  AdminNoteRow,
  SubmitWebsiteIntakePayload,
  WebsiteIntakeAdminUpdate,
} from "@/types/database";

import type { SiteBriefClient } from "./supabase-brand";

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

import type { SiteBriefClient } from "@/lib/sitebrief/supabase-brand";
import type {
  AdminNoteRow,
  ClientRow,
  WebsiteIntakeRow,
  WebsiteIntakeWithClientRow,
} from "@/types/database";

type SupabasePostgrestError = { message?: string };

function throwIfPresent(error: SupabasePostgrestError | null): void {
  if (error) {
    throw error;
  }
}

/** Ordered list plus embedded client rows for queue views. Requires admin JWT. */
export async function fetchWebsiteIntakesWithClients(
  admin: SiteBriefClient,
): Promise<WebsiteIntakeWithClientRow[]> {
  const { data, error } = await admin
    .from("website_intakes")
    .select("*, clients (*)")
    .order("created_at", { ascending: false });

  throwIfPresent(error);
  return (data ?? []) as WebsiteIntakeWithClientRow[];
}

/** Single intake with client. Requires admin JWT. */
export async function fetchWebsiteIntakeWithClientById(
  admin: SiteBriefClient,
  intakeId: string,
): Promise<WebsiteIntakeWithClientRow | null> {
  const { data, error } = await admin
    .from("website_intakes")
    .select("*, clients (*)")
    .eq("id", intakeId)
    .maybeSingle();

  throwIfPresent(error);
  return (data as WebsiteIntakeWithClientRow | null) ?? null;
}

/** Lightweight lookup when only `client_id` is known on the intake row. Requires admin JWT. */
export async function fetchClientForIntakeAdmin(
  admin: SiteBriefClient,
  intake: Pick<WebsiteIntakeRow, "client_id">,
): Promise<ClientRow | null> {
  const { data, error } = await admin
    .from("clients")
    .select("*")
    .eq("id", intake.client_id)
    .maybeSingle();

  throwIfPresent(error);
  return data ?? null;
}

/** Internal reviewer notes pinned to one intake row. Requires admin JWT. */
export async function fetchAdminNotesForIntake(
  admin: SiteBriefClient,
  intakeId: string,
): Promise<AdminNoteRow[]> {
  const { data, error } = await admin
    .from("admin_notes")
    .select("*")
    .eq("intake_id", intakeId)
    .order("created_at", { ascending: true });

  throwIfPresent(error);
  return data ?? [];
}

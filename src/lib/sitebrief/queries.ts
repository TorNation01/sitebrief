import type { SiteBriefClient } from "@/lib/sitebrief/supabase-brand";
import type {
  AdminNoteRow,
  ClientRow,
  StudioSubscriptionRow,
  WebsiteIntakeRow,
  WebsiteIntakeWithClientRow,
  WhiteLabelRequestRow,
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

/** White-label / partner inquiries. Admin JWT only. */
export async function fetchWhiteLabelRequestsAdmin(
  admin: SiteBriefClient,
): Promise<WhiteLabelRequestRow[]> {
  const { data, error } = await admin
    .from("white_label_requests")
    .select("*")
    .order("created_at", { ascending: false });

  throwIfPresent(error);
  return (data ?? []) as WhiteLabelRequestRow[];
}

export async function fetchWhiteLabelRequestByIdAdmin(
  admin: SiteBriefClient,
  id: string,
): Promise<WhiteLabelRequestRow | null> {
  const { data, error } = await admin
    .from("white_label_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  throwIfPresent(error);
  return (data as WhiteLabelRequestRow | null) ?? null;
}

/** Singleton studio SaaS tier. Admin JWT only. */
export async function fetchStudioSubscription(
  admin: SiteBriefClient,
): Promise<StudioSubscriptionRow | null> {
  const { data, error } = await admin.from("studio_subscription").select("*").eq("id", 1).maybeSingle();

  throwIfPresent(error);
  return data ?? null;
}

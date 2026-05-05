import { NextResponse } from "next/server";

import { guardIntakeApiRequest } from "@/lib/api/intake-api-auth";
import { getIntakeApiSupabase, intakeApiServiceRoleMissingResponse } from "@/lib/api/intake-api-db";
import { serializeIntakeForApi } from "@/lib/api/intake-api-serialize";
import { fetchAdminNotesForIntake, fetchWebsiteIntakeWithClientById } from "@/lib/sitebrief/queries";

const INTAKE_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/intakes/:id — one intake plus reviewer notes */
export async function GET(request: Request, context: RouteContext) {
  const denied = guardIntakeApiRequest(request.headers);
  if (denied) {
    return denied;
  }

  const { id } = await context.params;
  const trimmed = id?.trim();
  if (!trimmed || !INTAKE_UUID_RE.test(trimmed)) {
    return NextResponse.json(
      { error: { code: "invalid_id", message: "A valid UUID intake id is required." } },
      { status: 400 },
    );
  }

  const supabase = getIntakeApiSupabase();
  if (!supabase) {
    return intakeApiServiceRoleMissingResponse();
  }

  try {
    const row = await fetchWebsiteIntakeWithClientById(supabase, trimmed);
    if (!row) {
      return NextResponse.json(
        { error: { code: "not_found", message: "No intake exists for this id." } },
        { status: 404 },
      );
    }

    const notes = await fetchAdminNotesForIntake(supabase, trimmed);
    return NextResponse.json(serializeIntakeForApi(row, { admin_notes: notes }));
  } catch (cause) {
    const message =
      cause && typeof cause === "object" && "message" in cause
        ? String((cause as { message: unknown }).message)
        : "Unable to load intake.";
    return NextResponse.json({ error: { code: "intake_read_failed", message } }, { status: 500 });
  }
}

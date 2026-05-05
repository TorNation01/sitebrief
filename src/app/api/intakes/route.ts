import { NextResponse } from "next/server";

import {
  buildIntakePayload,
  intakeFormSchema,
  sanitizeIntakeSelections,
} from "@/components/intake/intake-schema";
import { guardIntakeApiRequest } from "@/lib/api/intake-api-auth";
import { getIntakeApiSupabase, intakeApiServiceRoleMissingResponse } from "@/lib/api/intake-api-db";
import { serializeIntakeForApi } from "@/lib/api/intake-api-serialize";
import { notifyIntakeSubmissionEmails } from "@/lib/email/intake-submission-mail";
import { insertWebsiteIntakeSubmission } from "@/lib/sitebrief/mutations";
import { fetchWebsiteIntakeWithClientById, fetchWebsiteIntakesWithClients } from "@/lib/sitebrief/queries";
import { peekStudioMonthlyIntakeAllowance } from "@/lib/sitebrief/studio-subscription";

function jsonError(code: string, message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { code, message, ...extra } }, { status });
}

/** GET /api/intakes — list intakes with client, prompt pack, and internal price estimate. */
export async function GET(request: Request) {
  const denied = guardIntakeApiRequest(request.headers);
  if (denied) {
    return denied;
  }

  const supabase = getIntakeApiSupabase();
  if (!supabase) {
    return intakeApiServiceRoleMissingResponse();
  }

  try {
    const rows = await fetchWebsiteIntakesWithClients(supabase);
    return NextResponse.json({
      intakes: rows.map((row) => serializeIntakeForApi(row)),
    });
  } catch (cause) {
    const message =
      cause && typeof cause === "object" && "message" in cause
        ? String((cause as { message: unknown }).message)
        : "Unable to load intakes.";
    return jsonError("intake_list_failed", message, 500);
  }
}

/**
 * POST /api/intakes — programmatic intake submission (trusted API key; no honeypots / bot heuristics).
 * Still enforces studio monthly quota for Basic tier.
 */
export async function POST(request: Request) {
  const denied = guardIntakeApiRequest(request.headers);
  if (denied) {
    return denied;
  }

  const supabase = getIntakeApiSupabase();
  if (!supabase) {
    return intakeApiServiceRoleMissingResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("invalid_json", "Request body must be valid JSON.", 400);
  }

  const parsed = intakeFormSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_failed", "Payload does not match the intake schema.", 422, {
      details: parsed.error.flatten(),
    });
  }

  const sanitized = sanitizeIntakeSelections(parsed.data);
  const rechecked = intakeFormSchema.safeParse(sanitized);
  if (!rechecked.success) {
    return jsonError("validation_failed", "Sanitized payload failed validation.", 422);
  }

  const monthly = await peekStudioMonthlyIntakeAllowance();
  if (!monthly.ok) {
    return jsonError("monthly_quota_exceeded", monthly.message, 429);
  }

  const dbPayload = buildIntakePayload(rechecked.data);

  try {
    const { intakeId } = await insertWebsiteIntakeSubmission(supabase, dbPayload);

    void notifyIntakeSubmissionEmails({
      intakeId,
      businessName: dbPayload.client.business_name,
      contactName: dbPayload.client.contact_name,
      contactEmail: dbPayload.client.email,
      websiteGoal: dbPayload.intake.website_goal ?? "",
      budgetRange: dbPayload.intake.budget_range ?? "",
    });

    const single = await fetchWebsiteIntakeWithClientById(supabase, intakeId);
    if (!single) {
      return NextResponse.json(
        {
          id: intakeId,
          message: "Created successfully; reload this id via GET /api/intakes/:id for the full snapshot.",
        },
        { status: 201 },
      );
    }

    return NextResponse.json(serializeIntakeForApi(single), { status: 201 });
  } catch (cause) {
    const message =
      cause && typeof cause === "object" && "message" in cause
        ? String((cause as { message: unknown }).message)
        : "Unable to persist intake.";
    return jsonError("intake_create_failed", message, 500);
  }
}

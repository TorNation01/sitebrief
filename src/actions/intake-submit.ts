"use server";

import { revalidatePath } from "next/cache";

import {
  buildIntakePayload,
  intakeFormSchemaWithHoneypot,
  sanitizeIntakeSelections,
  stripIntakeFormHoneypot,
} from "@/components/intake/intake-schema";
import { getSupabasePublicEnv } from "@/lib/env";
import { insertWebsiteIntakeSubmission } from "@/lib/sitebrief/mutations";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SPAM_RESPONSE =
  "This submission could not be verified. Reload the page, avoid autofill extensions on optional fields, and try again.";

const GENERIC_FAILURE =
  "We could not save your brief. Check highlighted fields, wait a moment, and try again.";

function isHoneypotIssue(
  issues: readonly { readonly path?: readonly PropertyKey[] }[],
): boolean {
  return issues.some((issue) => issue.path?.[0] === "hp_company_url");
}

export async function submitWebsiteIntakeAction(
  payload: unknown,
): Promise<{ ok: true; intakeId: string } | { ok: false; error: string }> {
  try {
    getSupabasePublicEnv();
  } catch {
    return {
      ok: false,
      error: "Submissions are paused: Supabase environment variables are not configured on the server.",
    };
  }

  const parsed = intakeFormSchemaWithHoneypot.safeParse(payload);
  if (!parsed.success) {
    if (isHoneypotIssue(parsed.error.issues)) {
      return { ok: false, error: SPAM_RESPONSE };
    }
    return {
      ok: false,
      error:
        "Some answers are invalid, too long, or incomplete. Review the form and correct any highlighted fields.",
    };
  }

  const sanitized = sanitizeIntakeSelections(parsed.data);
  const rechecked = intakeFormSchemaWithHoneypot.safeParse(sanitized);
  if (!rechecked.success) {
    if (isHoneypotIssue(rechecked.error.issues)) {
      return { ok: false, error: SPAM_RESPONSE };
    }
    return { ok: false, error: GENERIC_FAILURE };
  }

  const dbPayload = buildIntakePayload(stripIntakeFormHoneypot(rechecked.data));

  try {
    const supabase = await createSupabaseServerClient();
    const { intakeId } = await insertWebsiteIntakeSubmission(supabase, dbPayload);
    revalidatePath("/admin");
    return { ok: true, intakeId };
  } catch (cause) {
    const message =
      cause && typeof cause === "object" && "message" in cause
        ? String((cause as { message: unknown }).message)
        : "";

    if (
      /row level security|permission denied|policy|JWT|not authorized|invalid api key/i.test(
        message,
      )
    ) {
      return {
        ok: false,
        error:
          "The database refused this write. Confirm Supabase RLS policies allow public inserts for clients and website_intakes.",
      };
    }

    return {
      ok: false,
      error: message.length > 0 && message.length < 220 ? message : GENERIC_FAILURE,
    };
  }
}

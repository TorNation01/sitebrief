"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  buildIntakePayload,
  intakeFormHoneypotWasTriggered,
  intakeFormSchemaWithHoneypot,
  sanitizeIntakeSelections,
  stripIntakeFormHoneypot,
} from "@/components/intake/intake-schema";
import { notifyIntakeSubmissionEmails } from "@/lib/email/intake-submission-mail";
import { getSupabasePublicEnv } from "@/lib/env";
import { insertWebsiteIntakeSubmission } from "@/lib/sitebrief/mutations";
import { peekStudioMonthlyIntakeAllowance } from "@/lib/sitebrief/studio-subscription";
import {
  extractClientIp,
  hashClientIpSalted,
  peekPublicSubmissionQuota,
  recordPublicSubmissionQuota,
  SITE_BRIEF_RATE_LIMIT_MESSAGE,
  SITE_BRIEF_SUBMISSION_BLOCKED,
  submissionsLooksLikeBot,
} from "@/lib/sitebrief/submission-protection";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SPAM_RESPONSE = SITE_BRIEF_SUBMISSION_BLOCKED;

const GENERIC_FAILURE =
  "We could not save your brief. Check highlighted fields, wait a moment, and try again.";

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

  const headerList = await headers();
  const ipHash = hashClientIpSalted(extractClientIp(headerList));
  const quota = await peekPublicSubmissionQuota(ipHash, "intake");
  if (!quota.ok) {
    return { ok: false, error: SITE_BRIEF_RATE_LIMIT_MESSAGE };
  }

  const monthly = await peekStudioMonthlyIntakeAllowance();
  if (!monthly.ok) {
    return { ok: false, error: monthly.message };
  }

  const parsed = intakeFormSchemaWithHoneypot.safeParse(payload);
  if (!parsed.success) {
    console.error("[sitebrief] intake submit Zod (initial parse)", parsed.error.flatten());
    console.error("[sitebrief] intake submit Zod issues (initial)", parsed.error.issues);
    if (intakeFormHoneypotWasTriggered(parsed.error.issues)) {
      return { ok: false, error: SPAM_RESPONSE };
    }
    return {
      ok: false,
      error:
        "Some answers are invalid, too long, or incomplete. See the list at the top of the review step (or scroll up) for details.",
    };
  }

  const sanitized = sanitizeIntakeSelections(parsed.data);
  const rechecked = intakeFormSchemaWithHoneypot.safeParse(sanitized);
  if (!rechecked.success) {
    console.error("[sitebrief] intake submit Zod (post-sanitize)", rechecked.error.flatten());
    console.error("[sitebrief] intake submit Zod issues (post-sanitize)", rechecked.error.issues);
    if (intakeFormHoneypotWasTriggered(rechecked.error.issues)) {
      return { ok: false, error: SPAM_RESPONSE };
    }
    return { ok: false, error: GENERIC_FAILURE };
  }

  const clean = stripIntakeFormHoneypot(rechecked.data);
  if (
    submissionsLooksLikeBot(headerList, {
      email: clean.email,
      contactOrName: clean.contact_name,
      organization: clean.business_name,
    })
  ) {
    return { ok: false, error: SPAM_RESPONSE };
  }

  const dbPayload = buildIntakePayload(clean);

  try {
    const supabase = await createSupabaseServerClient();
    const { intakeId } = await insertWebsiteIntakeSubmission(supabase, dbPayload);
    revalidatePath("/admin");

    void recordPublicSubmissionQuota(ipHash, "intake");

    void notifyIntakeSubmissionEmails({
      intakeId,
      businessName: dbPayload.client.business_name,
      contactName: dbPayload.client.contact_name,
      contactEmail: dbPayload.client.email,
      websiteGoal: dbPayload.intake.website_goal ?? "",
      budgetRange: dbPayload.intake.budget_range ?? "",
    });

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

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { getSupabasePublicEnv } from "@/lib/env";
import { insertWhiteLabelRequest } from "@/lib/sitebrief/mutations";
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

const GENERIC_BLOCKED = SITE_BRIEF_SUBMISSION_BLOCKED;

function whiteLabelHoneypotTriggered(
  issues: ReadonlyArray<{ path?: ReadonlyArray<PropertyKey> }>,
): boolean {
  return issues.some((i) => {
    const head = i.path?.[0];
    return head === "hp_company_url" || head === "hp_agency_size";
  });
}

const whiteLabelRequestFormSchema = z
  .object({
    contact_name: z.string().trim().min(1, "Name is required").max(200),
    email: z.string().trim().min(1, "Email is required").max(254).email("Enter a valid email"),
    organization: z.string().max(240).default(""),
    message: z.string().max(4000).default(""),
    hp_company_url: z.string().max(280).default(""),
    hp_agency_size: z.string().max(200).default(""),
  })
  .superRefine((data, ctx) => {
    if (data.hp_company_url.trim().length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "blocked",
        path: ["hp_company_url"],
      });
    }
    if (data.hp_agency_size.trim().length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "blocked",
        path: ["hp_agency_size"],
      });
    }
  });

const GENERIC_FAILURE = "We could not send your request. Please try again in a moment.";

function normalizePayload(payload: unknown): Record<string, string> {
  if (!payload || typeof payload !== "object") {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(payload as Record<string, unknown>)) {
    out[k] = typeof v === "string" ? v : "";
  }
  return out;
}

export async function submitWhiteLabelRequestAction(
  payload: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    getSupabasePublicEnv();
  } catch {
    return {
      ok: false,
      error: "Requests are paused: database configuration is not available on this deployment.",
    };
  }

  const headerList = await headers();
  const ipHash = hashClientIpSalted(extractClientIp(headerList));
  const quota = await peekPublicSubmissionQuota(ipHash, "white_label");
  if (!quota.ok) {
    return { ok: false, error: SITE_BRIEF_RATE_LIMIT_MESSAGE };
  }

  const parsed = whiteLabelRequestFormSchema.safeParse(normalizePayload(payload));
  if (!parsed.success) {
    if (whiteLabelHoneypotTriggered(parsed.error.issues)) {
      return {
        ok: false,
        error: GENERIC_BLOCKED,
      };
    }
    const msg = parsed.error.issues[0]?.message ?? "Check the highlighted fields.";
    return { ok: false, error: msg };
  }

  const data = parsed.data;

  if (
    submissionsLooksLikeBot(headerList, {
      email: data.email,
      contactOrName: data.contact_name,
      organization: data.organization,
    })
  ) {
    return { ok: false, error: GENERIC_BLOCKED };
  }

  try {
    const supabase = await createSupabaseServerClient();
    await insertWhiteLabelRequest(supabase, {
      contact_name: data.contact_name,
      email: data.email,
      organization: data.organization.trim() ? data.organization : undefined,
      message: data.message.trim() ? data.message : undefined,
    });
    void recordPublicSubmissionQuota(ipHash, "white_label");
    revalidatePath("/admin");
    return { ok: true };
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
          "The submission was blocked by security rules. Confirm `white_label_requests` has a public INSERT policy applied in Supabase.",
      };
    }

    return {
      ok: false,
      error: message.length > 0 && message.length < 220 ? message : GENERIC_FAILURE,
    };
  }
}

"use server";

import { z } from "zod";

import { tryCreateSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const categorySchema = z.enum(["content", "design", "layout", "functionality", "branding", "other"]);
const prioritySchema = z.enum(["must_have", "nice_to_have"]);

const submitCustomerRevisionSchema = z.object({
  intakeId: z.string().regex(UUID_RE, "Invalid link"),
  token: z.string().regex(UUID_RE, "Invalid link"),
  overall_impression: z.string().max(8_000).optional().default(""),
  final_comments: z.string().max(8_000).optional().default(""),
  items: z
    .array(
      z.object({
        category: categorySchema,
        page_reference: z.string().max(500).optional().default(""),
        description: z.string().trim().min(1, "Describe each change").max(8_000),
        priority: prioritySchema,
      }),
    )
    .min(1, "Add at least one change request"),
});

export type SubmitCustomerRevisionResult = { ok: true } | { ok: false; error: string };

export async function submitCustomerRevisionRoundAction(
  raw: z.infer<typeof submitCustomerRevisionSchema>,
): Promise<SubmitCustomerRevisionResult> {
  const parsed = submitCustomerRevisionSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] ?? parsed.error.issues[0]?.message ?? "Invalid submission.";
    return { ok: false, error: msg };
  }

  const svc = tryCreateSupabaseServiceRoleClient();
  if (!svc) {
    return {
      ok: false,
      error: "This environment cannot accept revision submissions yet (missing service role configuration).",
    };
  }

  const { data: round, error: roundErr } = await svc
    .from("revision_rounds")
    .select("id, status, token_revoked_at")
    .eq("intake_id", parsed.data.intakeId)
    .eq("customer_access_token", parsed.data.token)
    .maybeSingle();

  if (roundErr || !round) {
    return { ok: false, error: "This revision link is not valid." };
  }
  if (round.token_revoked_at) {
    return { ok: false, error: "This link has been revoked. Contact the studio for a new review round." };
  }
  if (round.status !== "pending") {
    return { ok: false, error: "This round was already submitted." };
  }

  const { error: delErr } = await svc.from("revision_items").delete().eq("round_id", round.id);
  if (delErr) {
    return { ok: false, error: delErr.message };
  }

  const rows = parsed.data.items.map((item) => ({
    round_id: round.id,
    category: item.category,
    page_reference: item.page_reference.trim().length ? item.page_reference.trim() : null,
    description: item.description.trim(),
    priority: item.priority,
    status: "pending" as const,
  }));

  const { error: insErr } = await svc.from("revision_items").insert(rows);
  if (insErr) {
    return { ok: false, error: insErr.message };
  }

  const overall = parsed.data.overall_impression.trim();
  const final = parsed.data.final_comments.trim();
  const combined = [overall, final].filter(Boolean).join("\n\n---\n\n");

  const { error: upErr } = await svc
    .from("revision_rounds")
    .update({
      overall_impression: overall.length ? overall : null,
      final_comments: final.length ? final : null,
      review_notes: combined.length ? combined : null,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", round.id);

  if (upErr) {
    return { ok: false, error: upErr.message };
  }

  return { ok: true };
}

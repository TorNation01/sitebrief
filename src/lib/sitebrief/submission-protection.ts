import { createHash } from "node:crypto";

import { tryCreateSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";

export const SITE_BRIEF_SUBMISSION_BLOCKED =
  "This submission could not be verified. Reload the page, avoid autofill extensions on optional fields, and try again.";

export const SITE_BRIEF_RATE_LIMIT_MESSAGE =
  "Too many submissions from this network. Wait up to an hour, then try again.";

export type PublicSubmissionKind = "intake" | "white_label";

const WINDOW_MS = 3_600_000;
const MAX_PER_WINDOW = 3;

type MemBuckets = Map<string, number[]>;

function memBuckets(): MemBuckets {
  const g = globalThis as typeof globalThis & { __sitebriefRateMem?: MemBuckets };
  if (!g.__sitebriefRateMem) {
    g.__sitebriefRateMem = new Map();
  }
  return g.__sitebriefRateMem;
}

export function extractClientIp(headerList: Headers): string | null {
  const xff = headerList.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  const realIp = headerList.get("x-real-ip") ?? headerList.get("cf-connecting-ip");
  return realIp?.trim() ?? null;
}

export function hashClientIpSalted(ip: string | null): string {
  const salt = process.env.SITEBRIEF_RATE_IP_SALT?.trim() || "sitebrief-rate-v1";
  return createHash("sha256").update(`${salt}:${ip ?? "missing"}`).digest("hex").slice(0, 40);
}

function memoryCountRecent(ipHash: string, kind: PublicSubmissionKind): number {
  const key = `${ipHash}:${kind}`;
  const now = Date.now();
  const bucket = memBuckets();
  const stamps = bucket.get(key)?.filter((t) => now - t < WINDOW_MS) ?? [];
  bucket.set(key, stamps);
  return stamps.length;
}

function memoryCommit(ipHash: string, kind: PublicSubmissionKind): void {
  const key = `${ipHash}:${kind}`;
  const bucket = memBuckets();
  const now = Date.now();
  const stamps = bucket.get(key)?.filter((t) => now - t < WINDOW_MS) ?? [];
  stamps.push(now);
  bucket.set(key, stamps);
}

/**
 * Best-effort: returns false when quota exceeded. Uses Postgres when service role exists,
 * otherwise a process-local approximation (okay for single-node preview).
 */
export async function peekPublicSubmissionQuota(
  ipHash: string,
  kind: PublicSubmissionKind,
): Promise<{ ok: true } | { ok: false }> {
  const svc = tryCreateSupabaseServiceRoleClient();
  if (!svc) {
    return memoryCountRecent(ipHash, kind) < MAX_PER_WINDOW ? { ok: true } : { ok: false };
  }

  const sinceIso = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count, error } = await svc
    .from("sitebrief_submission_rate_events")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .eq("kind", kind)
    .gte("created_at", sinceIso);

  if (error) {
    console.error("[sitebrief] rate limit peek failed:", error.message);
    return { ok: true };
  }

  return (count ?? 0) < MAX_PER_WINDOW ? { ok: true } : { ok: false };
}

/** Append one slot after successful write. Swallows errors — primary submission already succeeded. */
export async function recordPublicSubmissionQuota(ipHash: string, kind: PublicSubmissionKind): Promise<void> {
  const svc = tryCreateSupabaseServiceRoleClient();
  if (!svc) {
    memoryCommit(ipHash, kind);
    return;
  }

  const { error } = await svc.from("sitebrief_submission_rate_events").insert({ ip_hash: ipHash, kind });
  if (error) {
    console.warn("[sitebrief] rate telemetry insert skipped:", error.message);
  }
}

type BotSignals = {
  email: string;
  contactOrName?: string;
  organization?: string;
};

/** Cheap heuristics only — complements honeypots, not replaces human review. */
export function submissionsLooksLikeBot(headerList: Headers, ctx: BotSignals): boolean {
  const uaRaw = headerList.get("user-agent");
  const ua = uaRaw?.toLowerCase() ?? "";

  if (
    ua &&
    /curl\/|wget\/|python-requests|scrapy|^axios\/|java\/|^go-http|postman|^httpclient\/|libwww/i.test(
      ua,
    )
  ) {
    return true;
  }

  const local = ctx.email.split("@")[1]?.toLowerCase() ?? "";

  if (
    /^(test\.com|example\.com|example\.net|localhost|invalid)$/i.test(local) ||
    /^test@/i.test(ctx.email.trim())
  ) {
    return true;
  }

  if (/@(?:mailinator|guerrillamail|tempmail|10minutemail|trashmail|yopmail|dispostable)\./i.test(ctx.email)) {
    return true;
  }

  const localPart = ctx.email.split("@")[0]?.toLowerCase() ?? "";
  if (localPart.length >= 12 && /^(.)\1{11,}$/.test(localPart)) {
    return true;
  }

  const lump = `${ctx.contactOrName ?? ""} ${ctx.organization ?? ""}`.toLowerCase();
  if (/\b(?:viagra|cialis|seo service|guest post crypto|bitcoin investment)\b/.test(lump)) {
    return true;
  }

  const name = ctx.contactOrName?.trim() ?? "";
  const condensed = name.replace(/\s/g, "").toLowerCase();
  if (condensed.length >= 4 && /^(.)\1+$/.test(condensed)) {
    return true;
  }

  return false;
}

import { createHash, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

function digestKeyMaterial(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/**
 * Constant-time compare of API keys (length-invariant at digest level).
 * Returns false when either side is empty.
 */
export function intakeApiKeysMatch(provided: string, expected: string): boolean {
  if (!provided.length || !expected.length) {
    return false;
  }
  try {
    return timingSafeEqual(digestKeyMaterial(provided), digestKeyMaterial(expected));
  } catch {
    return false;
  }
}

function extractProvidedApiKey(headers: Headers): string | null {
  const rawAuth = headers.get("authorization")?.trim();
  if (rawAuth) {
    const bearer = /^Bearer\s+(.+)$/i.exec(rawAuth);
    const token = bearer?.[1]?.trim();
    if (token) {
      return token;
    }
  }
  const headerKey = headers.get("x-api-key")?.trim();
  return headerKey?.length ? headerKey : null;
}

/**
 * Server-only env: long random secret. Never `NEXT_PUBLIC_*`.
 * If unset, all intake API routes respond 503.
 */
export function getExpectedIntakeApiKey(): string | null {
  const key = process.env.SITEBRIEF_API_KEY?.trim();
  return key?.length ? key : null;
}

export function intakeApiKeyUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: { code: "unauthorized", message: "Invalid or missing API key." } },
    { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="SiteBrief Intake API"' } },
  );
}

export function intakeApiKeyMissingConfigResponse(): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "service_unavailable",
        message: "Intake API is not configured (SITEBRIEF_API_KEY missing on server).",
      },
    },
    { status: 503 },
  );
}

/**
 * @returns `null` when the caller is authorized; otherwise a ready `NextResponse` to return.
 */
export function guardIntakeApiRequest(headers: Headers): NextResponse | null {
  const expected = getExpectedIntakeApiKey();
  if (!expected) {
    return intakeApiKeyMissingConfigResponse();
  }
  const provided = extractProvidedApiKey(headers);
  if (!provided || !intakeApiKeysMatch(provided, expected)) {
    return intakeApiKeyUnauthorizedResponse();
  }
  return null;
}

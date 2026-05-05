import { NextResponse } from "next/server";

/**
 * Stripe webhooks — not implemented. Validates route exists for future `stripe listen` / production endpoint.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Stripe webhooks are not wired yet.",
      hint: "See src/lib/billing/stripe.ts for the intended integration path.",
    },
    { status: 501 },
  );
}

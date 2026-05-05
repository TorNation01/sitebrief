/**
 * Stripe integration — placeholder scaffolding only.
 *
 * Next steps when you enable billing:
 * 1. Add server routes: Checkout Session creation, Customer Portal return URL, webhook handler.
 * 2. On `checkout.session.completed` / `customer.subscription.updated`, upsert `studio_subscription`
 *    (`subscription_tier`, `stripe_customer_id`, `stripe_subscription_id`) via service role or admin RPC.
 * 3. Keep the admin Plan page as override / grandfathering OR hide it once Stripe owns tier.
 *
 * Environment (add to `.env.local` — never `NEXT_PUBLIC_` for secrets):
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET
 * - Optional: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (Elements / Payment Element)
 */

export type StripeEnvSnapshot = {
  secretKeyConfigured: boolean;
  webhookSecretConfigured: boolean;
};

export function readStripeEnvPlaceholder(): StripeEnvSnapshot {
  return {
    secretKeyConfigured: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
    webhookSecretConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim()),
  };
}

/** Reserved shape for a future Checkout redirect implementation. */
export type StripeCheckoutSessionDescriptor = {
  url: string;
  sessionId: string;
};

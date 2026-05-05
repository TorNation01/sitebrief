import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminPlanTierForm } from "@/components/admin/admin-plan-tier-form";
import { isSiteBriefAdminUser } from "@/lib/auth/sitebrief-admin";
import { readStripeEnvPlaceholder } from "@/lib/billing/stripe";
import { fetchStudioSubscription } from "@/lib/sitebrief/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseSubscriptionTier, subscriptionTierLabel } from "@/types/subscription";

export const metadata: Metadata = {
  title: "Plan & billing",
  robots: { index: false, follow: false },
};

export default async function AdminBillingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSiteBriefAdminUser(user)) {
    redirect("/admin/login");
  }

  const subRow = await fetchStudioSubscription(supabase);
  const tier = parseSubscriptionTier(subRow?.subscription_tier);
  const stripe = readStripeEnvPlaceholder();

  return (
    <div className="space-y-14 text-white">
      <header className="space-y-5">
        <Link
          href="/admin"
          className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]"
        >
          ← Brief queue
        </Link>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
            SaaS readiness
          </p>
          <h1 className="text-pretty text-4xl font-semibold tracking-tight">Plan & billing</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/70">
            Workspace is on <strong className="text-white">{subscriptionTierLabel(tier)}</strong>.
            Stripe checkout is not connected yet — this selector is manual for now while you wire payments.
          </p>
        </div>
      </header>

      <section className="rounded-[28px] border border-white/[0.08] bg-white/[0.02] p-8 shadow-xl shadow-black/40">
        <h2 className="text-xl font-semibold text-white">Plan selector</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/65">
          Feature gates apply immediately after saving. Stripe will eventually own this tier from subscription webhooks
          (<code className="rounded bg-black/35 px-1.5 py-0.5 text-xs text-emerald-200/90">
            POST /api/billing/stripe-webhook
          </code>{" "}
          placeholder returns 501).
        </p>
        <div className="mt-8 max-w-xl">
          <AdminPlanTierForm currentTier={tier} />
        </div>
      </section>

      {(subRow?.stripe_customer_id ?? subRow?.stripe_subscription_id) ? (
        <section className="rounded-[28px] border border-white/[0.06] bg-black/25 px-6 py-5 text-xs text-white/62">
          <p className="font-semibold uppercase tracking-[0.28em] text-white/48">Stripe ids (reserved)</p>
          <dl className="mt-4 space-y-2 font-mono text-[13px] text-white/80">
            <div>
              <dt className="text-white/48">stripe_customer_id</dt>
              <dd>{subRow.stripe_customer_id ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-white/48">stripe_subscription_id</dt>
              <dd>{subRow.stripe_subscription_id ?? "—"}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-dashed border-white/[0.12] bg-black/20 px-6 py-6 text-sm text-white/72">
        <h2 className="text-lg font-semibold text-white">Stripe placeholder</h2>
        <p className="mt-2 leading-relaxed">
          Secret key{" "}
          {stripe.secretKeyConfigured ? (
            <span className="text-emerald-200/95">detected</span>
          ) : (
            <span className="text-amber-200/95">not set</span>
          )}
          ; webhook signing secret{" "}
          {stripe.webhookSecretConfigured ? (
            <span className="text-emerald-200/95">detected</span>
          ) : (
            <span className="text-amber-200/95">not set</span>
          )}
          . See comments in{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-xs text-white">src/lib/billing/stripe.ts</code>.
        </p>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CustomerRevisionForm } from "@/components/revisions/customer-revision-form";
import { computeRevisionAllowance } from "@/lib/sitebrief/revision-allowance";
import { tryCreateSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import { parseStoredPriceEstimate } from "@/types/price-estimate";

type RevisionPageProps = {
  params: Promise<{ intake_id: string; token: string }>;
};

export const metadata: Metadata = {
  title: "Revision review",
  robots: { index: false, follow: false },
};

export default async function CustomerRevisionPage({ params }: RevisionPageProps) {
  const { intake_id, token } = await params;
  const svc = tryCreateSupabaseServiceRoleClient();
  if (!svc) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-sm text-white/75">
        Revision links are not available in this environment (missing Supabase service role key).
      </div>
    );
  }

  const { data: intake, error: intakeErr } = await svc
    .from("website_intakes")
    .select("id, internal_price_estimate, extra_revision_rounds_purchased, clients ( business_name )")
    .eq("id", intake_id)
    .maybeSingle();

  if (intakeErr || !intake) {
    notFound();
  }

  const { data: round, error: roundErr } = await svc
    .from("revision_rounds")
    .select("id, status, round_number, token_revoked_at, customer_access_token")
    .eq("intake_id", intake_id)
    .eq("customer_access_token", token)
    .maybeSingle();

  if (roundErr || !round) {
    notFound();
  }

  const { count: roundCount } = await svc
    .from("revision_rounds")
    .select("*", { count: "exact", head: true })
    .eq("intake_id", intake_id);

  const estimate = parseStoredPriceEstimate(intake.internal_price_estimate);
  const allowance = computeRevisionAllowance({
    estimate,
    extraRevisionRoundsPurchased: intake.extra_revision_rounds_purchased ?? 0,
    roundsCreated: roundCount ?? 0,
  });

  const client = intake.clients as { business_name: string } | null;
  const businessName = client?.business_name?.trim() || "your project";

  return (
    <CustomerRevisionForm
      intakeId={intake_id}
      token={token}
      businessName={businessName}
      round={{
        id: round.id,
        status: round.status,
        round_number: round.round_number,
        token_revoked_at: round.token_revoked_at,
      }}
      allowanceSummary={{
        totalSlots: allowance.totalSlots,
        includedRounds: allowance.includedRounds,
        extraPurchased: allowance.extraPurchased,
        extraRoundPriceAud: allowance.extraRoundPriceAud,
      }}
    />
  );
}

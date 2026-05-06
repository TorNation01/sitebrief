import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SubmissionStudioDetail } from "@/components/admin/submission-studio-detail";
import { computeRevisionAllowance } from "@/lib/sitebrief/revision-allowance";
import {
  fetchAdminNotesForIntake,
  fetchRevisionRoundsBundleForIntakeAdmin,
  fetchStudioSubscription,
  fetchWebsiteIntakeWithClientById,
} from "@/lib/sitebrief/queries";
import { parseStoredPriceEstimate } from "@/types/price-estimate";
import { parseSubscriptionTier } from "@/types/subscription";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type IntakeStudioPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: IntakeStudioPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const dossier = await fetchWebsiteIntakeWithClientById(supabase, id);

  if (!dossier?.clients?.business_name) {
    return { title: "Missing submission", robots: { index: false, follow: false } };
  }

  return {
    title: `${dossier.clients.business_name} · Intake dossier`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminSubmissionDetailRoute({ params }: IntakeStudioPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const dossier = await fetchWebsiteIntakeWithClientById(supabase, id);

  if (!dossier?.clients) {
    notFound();
  }

  const notes = await fetchAdminNotesForIntake(supabase, dossier.id);

  const sub = await fetchStudioSubscription(supabase);
  const subscriptionTier = parseSubscriptionTier(sub?.subscription_tier);

  const revisionRounds = await fetchRevisionRoundsBundleForIntakeAdmin(supabase, dossier.id);
  const estimate = parseStoredPriceEstimate(dossier.internal_price_estimate);
  const revisionAllowance = computeRevisionAllowance({
    estimate,
    extraRevisionRoundsPurchased: dossier.extra_revision_rounds_purchased ?? 0,
    roundsCreated: revisionRounds.length,
  });

  return (
    <SubmissionStudioDetail
      record={dossier}
      notes={notes}
      subscriptionTier={subscriptionTier}
      revisionRounds={revisionRounds}
      revisionAllowance={revisionAllowance}
    />
  );
}

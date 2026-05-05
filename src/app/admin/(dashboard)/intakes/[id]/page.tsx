import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SubmissionStudioDetail } from "@/components/admin/submission-studio-detail";
import { fetchAdminNotesForIntake, fetchWebsiteIntakeWithClientById } from "@/lib/sitebrief/queries";
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

  return <SubmissionStudioDetail record={dossier} notes={notes} />;
}

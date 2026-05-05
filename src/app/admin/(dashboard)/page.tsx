import type { Metadata } from "next";

import { IntakeSubmissionBoard } from "@/components/admin/intake-submission-board";
import { fetchWebsiteIntakesWithClients } from "@/lib/sitebrief/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Submissions overview",
};

export default async function AdminDashboardHomePage() {
  const supabase = await createSupabaseServerClient();
  const queue = await fetchWebsiteIntakesWithClients(supabase);

  return (
    <>
      <IntakeSubmissionBoard
        submissions={queue.map((row) => ({
          id: row.id,
          created_at: row.created_at,
          status: row.status,
          clients: row.clients,
        }))}
      />
    </>
  );
}

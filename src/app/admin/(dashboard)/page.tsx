import type { Metadata } from "next";

import { IntakeSubmissionBoard } from "@/components/admin/intake-submission-board";
import { WhiteLabelRequestsBoard } from "@/components/admin/white-label-requests-board";
import {
  fetchWebsiteIntakesWithClients,
  fetchWhiteLabelRequestsAdmin,
} from "@/lib/sitebrief/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Submissions overview",
};

export default async function AdminDashboardHomePage() {
  const supabase = await createSupabaseServerClient();
  const [queue, whiteLabelRequests] = await Promise.all([
    fetchWebsiteIntakesWithClients(supabase),
    fetchWhiteLabelRequestsAdmin(supabase),
  ]);

  return (
    <div className="space-y-20">
      <IntakeSubmissionBoard
        submissions={queue.map((row) => ({
          id: row.id,
          created_at: row.created_at,
          status: row.status,
          clients: row.clients,
        }))}
      />
      <WhiteLabelRequestsBoard requests={whiteLabelRequests} />
    </div>
  );
}

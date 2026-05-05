import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminChrome } from "@/components/admin/admin-chrome";
import { isSiteBriefAdminUser } from "@/lib/auth/sitebrief-admin";
import { fetchStudioSubscription } from "@/lib/sitebrief/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseSubscriptionTier } from "@/types/subscription";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardBoundaryLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSiteBriefAdminUser(user)) {
    redirect("/admin/login");
  }

  const identityLabel = user.email ?? "Studio steward";

  const subRow = await fetchStudioSubscription(supabase);
  const subscriptionTier = parseSubscriptionTier(subRow?.subscription_tier);

  return (
    <AdminChrome identity={identityLabel} subscriptionTier={subscriptionTier}>
      {children}
    </AdminChrome>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminChrome } from "@/components/admin/admin-chrome";
import { isSiteBriefAdminUser } from "@/lib/auth/sitebrief-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  return <AdminChrome identity={identityLabel}>{children}</AdminChrome>;
}

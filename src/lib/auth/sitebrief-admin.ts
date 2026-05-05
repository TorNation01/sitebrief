import type { User } from "@supabase/supabase-js";

/** Matches RLS helper `sitebrief_is_admin()` – role must equal `admin` on JWT claims. */
export function isSiteBriefAdminUser(user: User | null | undefined): boolean {
  if (!user) {
    return false;
  }

  const appRole =
    typeof user.app_metadata?.role === "string" ? user.app_metadata.role : "";
  const userRole =
    typeof user.user_metadata?.role === "string" ? user.user_metadata.role : "";

  return appRole === "admin" || userRole === "admin";
}

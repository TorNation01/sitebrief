import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminLoginExperience } from "@/components/admin/admin-login-experience";
import { getPublicBrand } from "@/lib/sitebrief/brand";

const brand = getPublicBrand();

export const metadata: Metadata = {
  title: `${brand.appName} · Admin sign-in`,
  description: `Sign in to ${brand.studioDisplayName}. Requires Supabase Authentication with administrator role claims.`,
  robots: { index: false, follow: false },
};

function SuspenseBackdrop() {
  return (
    <div
      className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-5 px-6 py-24"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-6 w-2/5 animate-pulse rounded-full bg-white/10" />
      <div className="h-44 animate-pulse rounded-[32px] border border-white/[0.06] bg-white/[0.04]" />
      <p className="text-center text-xs text-white/50">Initializing sign-in…</p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<SuspenseBackdrop />}>
      <AdminLoginExperience />
    </Suspense>
  );
}

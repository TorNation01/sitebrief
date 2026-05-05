import type { Metadata } from "next";
import { Suspense } from "react";

import { IntakeSuccessView } from "@/components/intake/intake-success-view";

export const metadata: Metadata = {
  title: "Brief submitted",
  robots: { index: false, follow: false },
};

function SuccessFallback() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-16 text-white/70 sm:px-6">
      <p className="text-sm">Finalizing confirmation…</p>
    </div>
  );
}

export default function IntakeSuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <IntakeSuccessView />
    </Suspense>
  );
}

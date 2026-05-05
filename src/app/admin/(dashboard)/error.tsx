"use client";

import { Button } from "@/components/ui/button";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  return (
    <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-red-400/35 bg-red-950/35 px-8 py-10 text-white shadow-2xl shadow-black/60">
      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-red-200/85">Operational fault</p>
      <h2 className="mt-4 text-2xl font-semibold text-white">We could not load this workspace view</h2>
      <p className="mt-4 text-sm leading-relaxed text-white/75">
        The database request failed or your session no longer satisfies row-level policies. Try again after
        refreshing your session—or confirm Supabase is reachable and env keys match the deployed project.
      </p>
      {error.message ? (
        <pre className="mt-6 max-h-40 overflow-auto rounded-xl border border-white/10 bg-black/40 p-4 text-[12px] text-white/80">
          {error.message}
        </pre>
      ) : null}
      <Button type="button" variant="primary" className="mt-8 px-8" onClick={() => reset()}>
        Retry
      </Button>
    </div>
  );
}

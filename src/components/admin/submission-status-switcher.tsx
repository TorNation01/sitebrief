"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateSubmissionStatusAction } from "@/actions/admin-dashboard";
import type { IntakeWorkflowStatus } from "@/lib/sitebrief/workflow-status";
import { INTAKE_WORKFLOW_STATUSES } from "@/lib/sitebrief/workflow-status";

type SubmissionStatusSwitcherProps = {
  intakeId: string;
  initialStatus: IntakeWorkflowStatus | string;
};

export function SubmissionStatusSwitcher({ intakeId, initialStatus }: SubmissionStatusSwitcherProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [pending, run] = useTransition();

  function synchronize(next: string) {
    setError(null);
    setValue(next);

    run(async () => {
      const response = await updateSubmissionStatusAction(intakeId, next);
      if (response.error) {
        setError(response.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-[0.32em] text-white/55" htmlFor="status">
          Orchestration stage
        </label>
        <select
          id="status"
          value={value}
          disabled={pending}
          onChange={(evt) => synchronize(evt.target.value)}
          className="w-full rounded-2xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm font-medium text-white outline-none ring-2 ring-transparent transition hover:border-[var(--color-accent)]/40 focus-visible:ring-[var(--color-accent)]"
        >
          {INTAKE_WORKFLOW_STATUSES.map((status) => (
            <option key={status} value={status} className="bg-neutral-950 text-white">
              {status}
            </option>
          ))}
        </select>
        <p className="text-[12px] leading-relaxed text-white/60">
          Committing a change revalidates dashboards for the whole studio roster. Only these five canonical
          checkpoints are admissible downstream of RLS tightening.
        </p>
      </div>
      {pending ? (
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
          Synchronizing stage…
        </p>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-100" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}

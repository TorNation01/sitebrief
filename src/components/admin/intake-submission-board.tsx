"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import type { WebsiteIntakeWithClientRow } from "@/types/database";
import { INTAKE_WORKFLOW_STATUSES, coerceWorkflowStatus } from "@/lib/sitebrief/workflow-status";

export type SerializedSubmissionOverview = Pick<
  WebsiteIntakeWithClientRow,
  "id" | "status" | "created_at"
> & {
  clients: Pick<
    NonNullable<WebsiteIntakeWithClientRow["clients"]>,
    "business_name" | "contact_name" | "email"
  > | null;
};

type IntakeSubmissionBoardProps = {
  submissions: SerializedSubmissionOverview[];
};

function needleMatches(candidate: string, needle: string) {
  const normalizedNeedle = needle.trim().toLowerCase();
  if (!normalizedNeedle.length) {
    return true;
  }
  return candidate.toLowerCase().includes(normalizedNeedle);
}

function formatTimestamp(timestamp: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(timestamp));
  } catch {
    return timestamp;
  }
}

export function IntakeSubmissionBoard({ submissions }: IntakeSubmissionBoardProps) {
  const [needle, setNeedle] = useState("");
  const [lifecycle, setLifecycle] = useState("");

  const rows = submissions.filter((row) => Boolean(row.clients));

  const refined = useMemo(() => {
    return rows.filter((row) => {
      const canonical = coerceWorkflowStatus(row.status);
      const searchable = `${row.clients?.business_name ?? ""}${row.clients?.contact_name ?? ""}${row.clients?.email ?? ""}${canonical}`;
      const matchesNeedle =
        needleMatches(searchable, needle) ||
        needleMatches(String(row.status ?? ""), needle);

      let matchesLifecycle = true;
      if (lifecycle === "__legacy_submitted__") {
        matchesLifecycle = String(row.status).toLowerCase() === "submitted";
      } else if (lifecycle) {
        const target = coerceWorkflowStatus(lifecycle);
        matchesLifecycle =
          canonical.toLowerCase() === String(target).toLowerCase();
      }

      return matchesNeedle && matchesLifecycle;
    });
  }, [rows, needle, lifecycle]);

  const queueEmpty = rows.length === 0;
  const filterEmpty = !queueEmpty && refined.length === 0;

  const summary = queueEmpty
    ? "Awaiting inbound briefs"
    : refined.length === rows.length
      ? `${rows.length} total`
      : `${refined.length} visible · ${rows.length} authoritative`;

  return (
    <div className="space-y-10 text-white">
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
              Studio radar
            </p>
            <h1 className="text-pretty text-4xl font-semibold text-white lg:text-[2.95rem]">
              Govern every brief end-to-end
            </h1>
            <p className="text-base leading-relaxed text-white/70">
              Submissions hydrate directly from Postgres with hardened row visibility. Probe by account
              stakeholder, escalate workflow status filters, drill into artefacts with one click without
              tab thrash.
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.32em] text-white/50">Throughput</p>
            <p className="mt-3 text-lg font-semibold text-white">{summary}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,_0.42fr)]">
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-white/53" htmlFor="search">
              Search by business · contact · email · lifecycle
            </label>
            <input
              id="search"
              value={needle}
              onChange={(evt) => setNeedle(evt.target.value)}
              placeholder="Eg. Meridian Labs, Ava Chen, invoicing@"
              className="w-full rounded-2xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/41 shadow-inner shadow-black/40 outline-none ring-2 ring-transparent transition focus:border-transparent focus:bg-white/[0.09] focus:ring-[var(--color-accent)]"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-white/53" htmlFor="lifecycle">
              Filter by orchestration milestone
            </label>
            <select
              id="lifecycle"
              value={lifecycle}
              onChange={(evt) => setLifecycle(evt.target.value)}
              className="w-full rounded-2xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none ring-2 ring-transparent transition focus:border-transparent focus:bg-white/[0.09] focus:ring-[var(--color-accent)]"
            >
              <option value="" className="bg-neutral-950 text-white">
                All lifecycle stages
              </option>
              {INTAKE_WORKFLOW_STATUSES.map((status) => (
                <option key={status} value={status} className="bg-neutral-950 text-white">
                  {status}
                </option>
              ))}
              <option value="__legacy_submitted__" className="bg-neutral-950 text-white">
                Legacy inbound (submitted)
              </option>
            </select>
          </div>
        </div>
      </header>

      {queueEmpty ? (
        <div className="rounded-3xl border border-dashed border-white/18 px-6 py-16 text-center sm:px-10">
          <p className="text-lg font-semibold text-white">No submissions captured yet</p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70">
            Publish the intake route and smoke-test a brief; successful writes land here instantly for every admin
            with the JWT role pinned in metadata.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <ButtonLink href="/intake" variant="primary" className="w-full px-8 sm:w-auto">
              Open client intake preview
            </ButtonLink>
            <Link
              href="/"
              className="rounded-2xl border border-white/[0.12] px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.3em] text-white/82 transition-colors hover:bg-white/[0.06]"
            >
              Share marketing entry
            </Link>
          </div>
        </div>
      ) : filterEmpty ? (
        <div className="rounded-3xl border border-dashed border-white/15 px-6 py-14 text-center sm:px-10">
          <p className="text-lg font-semibold text-white">No briefs match this filter</p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/72">
            Try another keyword fragment or reset the milestone filter—you still carry {rows.length} submission
            {rows.length === 1 ? "" : "s"} in the authoritative queue.
          </p>
          <Button
            type="button"
            variant="ghost"
            className="mx-auto mt-8 border border-white/15 px-7 text-xs font-semibold uppercase tracking-[0.24em]"
            onClick={() => {
              setNeedle("");
              setLifecycle("");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop tableau */}
          <div className="hidden overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] lg:block">
            <table className="min-w-full table-fixed border-collapse text-left text-[13px]">
              <thead className="bg-white/[0.04] uppercase tracking-[0.14em] text-[10px] text-white/53">
                <tr>
                  <th className="px-6 py-3 font-semibold">Business</th>
                  <th className="px-6 py-3 font-semibold">Contact</th>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold">Lifecycle</th>
                  <th className="px-6 py-3 font-semibold">Captured</th>
                  <th className="px-6 py-3 font-semibold text-right">Depth</th>
                </tr>
              </thead>
              <tbody>
                {refined.map((row) => {
                  const canonical = coerceWorkflowStatus(row.status);
                  return (
                    <tr key={row.id} className="border-t border-white/[0.05] hover:bg-white/[0.035] transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{row.clients?.business_name}</td>
                      <td className="px-6 py-4 text-white/78">{row.clients?.contact_name}</td>
                      <td className="px-6 py-4 text-[13px] text-[var(--color-accent-hover)]">{row.clients?.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full border border-[var(--color-accent)]/40 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--color-accent-hover)_94%,black)]">
                          {canonical}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[12px] text-white/72">{formatTimestamp(row.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/intakes/${row.id}`}
                          className="inline-flex rounded-full border border-transparent px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)] underline-offset-[6px] transition-colors hover:border-white/22 hover:bg-white/[0.05]"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile dossier cards */}
          <div className="grid gap-4 lg:hidden">
            {refined.map((row) => {
              const canonical = coerceWorkflowStatus(row.status);

              return (
                <article
                  key={`${row.id}-mobile`}
                  className="space-y-4 rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-[#101018] via-[#0f0f17] to-[#050609] px-5 py-5 shadow-xl shadow-black/40"
                >
                  <header className="flex items-start justify-between gap-6">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/53">
                        {formatTimestamp(row.created_at)}
                      </p>
                      <h2 className="mt-4 text-xl font-semibold text-white">{row.clients?.business_name}</h2>
                      <p className="text-sm text-white/66">{row.clients?.contact_name}</p>
                      <p className="mt-3 text-sm font-mono text-[var(--color-accent-hover)]">{row.clients?.email}</p>
                    </div>

                    <span className="whitespace-nowrap rounded-full border border-[var(--color-accent)]/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                      {canonical}
                    </span>
                  </header>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                    <p className="text-[11px] uppercase tracking-[0.34em] text-white/53">Transmission id</p>
                    <span className="truncate font-mono text-[11px] text-white/65">{row.id}</span>
                  </div>

                  <Link
                    href={`/admin/intakes/${row.id}`}
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-white/[0.12] py-3 text-center text-[12px] font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-white/[0.08]"
                  >
                    Open dossier · {row.clients?.business_name}
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";

import type { WhiteLabelRequestRow } from "@/types/database";
import { WHITE_LABEL_SUBMISSION_TYPE } from "@/lib/sitebrief/white-label-request";

type WhiteLabelRequestsBoardProps = {
  requests: WhiteLabelRequestRow[];
};

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

function previewMessage(message: string | null, max = 90) {
  if (!message?.trim()) {
    return "—";
  }
  const t = message.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

export function WhiteLabelRequestsBoard({ requests }: WhiteLabelRequestsBoardProps) {
  return (
    <section className="space-y-8 text-white">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.07] pb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
            Partner inquiries
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">White-label requests</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/68">
            Separate from client website briefs—these are agencies asking for a branded deployment. Each row is stored
            as type <code className="text-[13px] text-[var(--color-accent-hover)]">{WHITE_LABEL_SUBMISSION_TYPE}</code>.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">Inbox</p>
          <p className="mt-2 text-lg font-semibold text-white">{requests.length}</p>
        </div>
      </header>

      {requests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/14 px-6 py-12 text-center sm:px-10">
          <p className="text-sm font-medium text-white/80">No white-label requests yet</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/55">
            Success-page visitors can open <code className="text-white/70">/white-label</code> to learn more and submit
            this form.
          </p>
        </div>
      ) : (
        <div className="hidden overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] lg:block">
          <table className="min-w-full table-fixed border-collapse text-left text-[13px]">
            <thead className="bg-white/[0.04] uppercase tracking-[0.14em] text-[10px] text-white/53">
              <tr>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Organization</th>
                <th className="px-5 py-3 font-semibold">Message</th>
                <th className="px-5 py-3 font-semibold">Received</th>
                <th className="px-5 py-3 text-right font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-white/[0.05] transition-colors hover:bg-white/[0.035]"
                >
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-white/75">
                      {row.submission_type}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-white">{row.contact_name}</td>
                  <td className="px-5 py-4 text-[var(--color-accent-hover)]">{row.email}</td>
                  <td className="px-5 py-4 text-white/65">{row.organization?.trim() ? row.organization : "—"}</td>
                  <td className="max-w-[220px] truncate px-5 py-4 text-white/60" title={row.message ?? undefined}>
                    {previewMessage(row.message)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-[12px] text-white/68">
                    {formatTimestamp(row.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/white-label-requests/${row.id}`}
                      className="inline-flex rounded-full border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)] underline-offset-[6px] transition-colors hover:border-white/22 hover:bg-white/[0.05]"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {requests.length > 0 ? (
        <div className="grid gap-4 lg:hidden">
          {requests.map((row) => (
            <article
              key={`${row.id}-m`}
              className="space-y-4 rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-[#101018] via-[#0f0f17] to-[#050609] px-5 py-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-white/60">
                  {row.submission_type}
                </span>
                <span className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                  {formatTimestamp(row.created_at)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white">{row.contact_name}</h3>
              <p className="text-sm text-[var(--color-accent-hover)]">{row.email}</p>
              <p className="text-sm text-white/60">{row.organization?.trim() || "No organization given"}</p>
              <p className="text-sm leading-relaxed text-white/72">{row.message?.trim() || "No message"}</p>
              <Link
                href={`/admin/white-label-requests/${row.id}`}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-white/[0.12] py-3 text-center text-[11px] font-semibold uppercase tracking-[0.26em] text-white transition-colors hover:bg-white/[0.08]"
              >
                Full detail
              </Link>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

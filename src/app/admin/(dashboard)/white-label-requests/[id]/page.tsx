import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { fetchWhiteLabelRequestByIdAdmin } from "@/lib/sitebrief/queries";
import { WHITE_LABEL_SUBMISSION_TYPE } from "@/lib/sitebrief/white-label-request";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const REQ_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Props = { params: Promise<{ id: string }> };

function formatTimestamp(timestamp: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date(timestamp));
  } catch {
    return timestamp;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!REQ_ID_RE.test(id.trim())) {
    return { title: "Request not found", robots: { index: false, follow: false } };
  }

  const supabase = await createSupabaseServerClient();
  const row = await fetchWhiteLabelRequestByIdAdmin(supabase, id.trim());

  if (!row) {
    return { title: "Request not found", robots: { index: false, follow: false } };
  }

  return {
    title: `${row.contact_name} · White-label request`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminWhiteLabelRequestDetailPage({ params }: Props) {
  const { id } = await params;
  const trimmed = id.trim();

  if (!REQ_ID_RE.test(trimmed)) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const row = await fetchWhiteLabelRequestByIdAdmin(supabase, trimmed);

  if (!row) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 pb-16 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ButtonLink href="/admin" variant="ghost" className="border border-white/12 px-5 text-white/88">
          ← Submissions overview
        </ButtonLink>
        <span className="rounded-full border border-white/15 px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-white/70">
          {WHITE_LABEL_SUBMISSION_TYPE}
        </span>
      </div>

      <header className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
          White-label inquiry
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{row.contact_name}</h1>
        <p className="text-sm text-white/55">Received {formatTimestamp(row.created_at)}</p>
      </header>

      <dl className="space-y-6 rounded-3xl border border-white/[0.08] bg-white/[0.03] px-6 py-8 sm:px-8">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">Email</dt>
          <dd className="mt-2 break-all text-[15px] text-[var(--color-accent-hover)]">
            <Link href={`mailto:${row.email}`} className="underline-offset-4 hover:underline">
              {row.email}
            </Link>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">Agency / business</dt>
          <dd className="mt-2 text-[15px] text-white/85">{row.organization?.trim() || "—"}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">Message</dt>
          <dd className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-white/78">
            {row.message?.trim() || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">Row id</dt>
          <dd className="mt-2 break-all font-mono text-[12px] text-white/55">{row.id}</dd>
        </div>
      </dl>
    </div>
  );
}

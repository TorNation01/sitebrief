import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyClientBriefButton } from "@/components/admin/copy-client-brief-button";
import { ExportFullPackToolbar } from "@/components/admin/export-full-pack-toolbar";
import { IntakeDecisionPanel } from "@/components/admin/intake-decision-panel";
import { InternalPriceEstimatePanel } from "@/components/admin/internal-price-estimate-panel";
import { PromptPackWorkbench } from "@/components/admin/prompt-pack-workbench";
import { SUBMISSION_FIELD_BLUEPRINT } from "@/components/admin/submission-detail-matrix";
import { SubmissionNoteComposer } from "@/components/admin/submission-note-composer";
import { SubmissionStatusSwitcher } from "@/components/admin/submission-status-switcher";
import { buildFullClientPackMarkdown, sanitizePackFileStem } from "@/lib/sitebrief/build-full-client-pack-md";
import { coerceWorkflowStatus, isWorkflowStatus } from "@/lib/sitebrief/workflow-status";
import type { AdminNoteRow, WebsiteIntakeWithClientRow } from "@/types/database";
import {
  canExportFullClientPack,
  canUseInternalPricingEngine,
  type SubscriptionTier,
} from "@/types/subscription";

type SubmissionStudioDetailProps = {
  record: WebsiteIntakeWithClientRow;
  notes: AdminNoteRow[];
  subscriptionTier: SubscriptionTier;
};

function formatTimeline(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "full",
      timeStyle: "medium",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function renderField(value: string | null | undefined) {
  if (value == null) {
    return "—";
  }
  const trimmed = value.trim();
  if (!trimmed.length) {
    return "—";
  }
  return trimmed;
}

export function SubmissionStudioDetail({ record, notes, subscriptionTier }: SubmissionStudioDetailProps) {
  if (!record.clients) {
    notFound();
  }

  const canExportPack = canExportFullClientPack(subscriptionTier);
  const pricingEngineEnabled = canUseInternalPricingEngine(subscriptionTier);

  const canonical = coerceWorkflowStatus(record.status);

  const selectableStatus = isWorkflowStatus(canonical) ? canonical : "New";

  const fullPackMarkdown = buildFullClientPackMarkdown({
    client: record.clients,
    intake: record,
    notes,
  });
  const packFileStem = sanitizePackFileStem(record.clients.business_name, record.id);

  return (
    <div className="space-y-14 text-white">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-8 max-w-4xl">
          <div>
            <Link
              href="/admin"
              className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]"
            >
              ← Return to queue
            </Link>
            <h1 className="mt-6 text-pretty text-[2.75rem] font-semibold leading-tight">
              {record.clients.business_name}
            </h1>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/53">Liaison</p>
                <p className="mt-3 text-lg font-semibold text-white">{record.clients.contact_name}</p>
                <p className="mt-3 text-sm font-mono text-[var(--color-accent-hover)]">{record.clients.email}</p>
                <p className="mt-3 text-sm text-white/70">{renderField(record.clients.phone)}</p>
                <p className="mt-3 text-sm text-white/70">{renderField(record.clients.website)}</p>
              </div>
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/53">Lifecycle</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{canonical}</p>
                </div>
                <div className="border-t border-white/[0.06] pt-5 text-sm leading-relaxed text-white/70 space-y-3">
                  <p>Captured {formatTimeline(record.created_at)}</p>
                  <p>Last mutation {formatTimeline(record.updated_at)}</p>
                  <p className="font-mono text-xs text-white/45">{record.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md space-y-6 rounded-[32px] border border-white/[0.08] bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-7 shadow-2xl shadow-black/50">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/55">Stage control</p>
            <p className="mt-3 text-sm text-white/70">
              Select the appropriate macro stage to give downstream automations the right trigger.
            </p>
          </div>
          <SubmissionStatusSwitcher intakeId={record.id} initialStatus={selectableStatus} />
          <CopyClientBriefButton client={record.clients} intake={record} />
          <ExportFullPackToolbar
            markdown={fullPackMarkdown}
            fileStem={packFileStem}
            canExport={canExportPack}
          />
        </div>
      </div>

      <IntakeDecisionPanel intake={record} />

      <PromptPackWorkbench
        key={`prompt-pack-${record.id}`}
        intakeId={record.id}
        businessName={record.clients.business_name}
        initialMarkdown={record.generated_prompt_pack}
      />

      <InternalPriceEstimatePanel
        key={`price-${record.id}-${record.updated_at}`}
        intakeId={record.id}
        businessName={record.clients.business_name}
        stored={record.internal_price_estimate}
        pricingEngineEnabled={pricingEngineEnabled}
      />

      <section className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
            Reviewer memory
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-white">Internal conversation log</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Each memo stays private to the studio until you intentionally share it elsewhere.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,_0.9fr)_minmax(0,_1.1fr)]">
          <div className="space-y-5">
            {notes.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-white/12 px-6 py-10 text-center text-sm text-white/60">
                No reviewer notes yet—drop the first breadcrumb for this partner.
              </p>
            ) : (
              notes.map((note) => (
                <article
                  key={note.id}
                  className="space-y-4 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 shadow-lg shadow-black/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/45">
                    <span>Note id</span>
                    <span>{formatTimeline(note.created_at)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-white">{note.note}</p>
                </article>
              ))
            )}
          </div>

          <div className="rounded-[32px] border border-white/[0.08] bg-white/[0.02] p-6">
            <SubmissionNoteComposer intakeId={record.id} />
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
            Full payload
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white">Captured client answers</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">
            Every field below is exactly what the partner supplied through the multi-step intake wizard. No
            phantom defaults.
          </p>
        </div>

        <div className="grid gap-10">
          {SUBMISSION_FIELD_BLUEPRINT.map((segment) => (
            <section
              key={segment.title}
              className="rounded-[32px] border border-white/[0.08] bg-black/30 p-8 shadow-inner shadow-black/50"
            >
              <div className="max-w-4xl space-y-3">
                <h3 className="text-xl font-semibold text-white">{segment.title}</h3>
                <p className="text-sm text-white/62">{segment.description}</p>
              </div>
              <dl className="mt-8 grid gap-6 md:grid-cols-2">
                {segment.fields.map((field) => (
                  <div key={field.key} className="space-y-3 rounded-3xl border border-white/[0.04] bg-white/[0.015] p-5">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/53">
                      {field.label}
                    </dt>
                    <dd className="whitespace-pre-wrap text-sm leading-relaxed text-white/86">
                      {renderField(record[field.key] as string | null | undefined)}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}

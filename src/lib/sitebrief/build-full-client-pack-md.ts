import { SUBMISSION_FIELD_BLUEPRINT } from "@/components/admin/submission-detail-matrix";
import { formatInternalPriceEstimateForCopy } from "@/lib/sitebrief/build-internal-price-estimate";
import { getPublicBrand } from "@/lib/sitebrief/brand";
import { coerceWorkflowStatus } from "@/lib/sitebrief/workflow-status";
import type { AdminNoteRow, ClientRow, WebsiteIntakeRow } from "@/types/database";
import { parseStoredPriceEstimate } from "@/types/price-estimate";

function nz(value: string | null | undefined): string {
  if (value == null) return "";
  const t = String(value).trim();
  return t.length ? t : "";
}

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en", { dateStyle: "full", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export type FullClientPackInput = {
  client: ClientRow;
  intake: WebsiteIntakeRow;
  notes: AdminNoteRow[];
};

/**
 * Markdown bundle: liaison, intake matrix, Cursor pack, internal estimate, reviewer notes.
 * Safe on the server for passing into a thin client export toolbar.
 */
export function buildFullClientPackMarkdown({ client, intake, notes }: FullClientPackInput): string {
  const brand = getPublicBrand();
  const status = coerceWorkflowStatus(intake.status);
  const estimate = parseStoredPriceEstimate(intake.internal_price_estimate);

  const chunks: string[] = [];

  chunks.push(`# Full client pack — ${client.business_name}`, ``);
  chunks.push(`## Submission meta`, ``);
  chunks.push(`- **Submission id:** ${intake.id}`);
  chunks.push(`- **Lifecycle:** ${status}`);
  chunks.push(`- **Captured:** ${formatWhen(intake.created_at)}`);
  chunks.push(`- **Updated:** ${formatWhen(intake.updated_at)}`);
  chunks.push(``);

  chunks.push(`## Client details`, ``);
  chunks.push(`- **Business:** ${client.business_name}`);
  chunks.push(`- **Contact:** ${client.contact_name}`);
  chunks.push(`- **Email:** ${client.email}`);
  chunks.push(client.phone?.trim() ? `- **Phone:** ${client.phone}` : `- **Phone:** —`);
  chunks.push(client.website?.trim() ? `- **Website:** ${client.website}` : `- **Website:** —`);
  chunks.push(``);

  chunks.push(`## Full intake answers`, ``);
  for (const segment of SUBMISSION_FIELD_BLUEPRINT) {
    chunks.push(`### ${segment.title}`, ``);
    for (const field of segment.fields) {
      const raw = nz(intake[field.key] as string | null | undefined);
      chunks.push(`#### ${field.label}`, ``);
      chunks.push(raw.length ? raw : `_Not specified._`, ``);
    }
  }

  const pack = nz(intake.generated_prompt_pack);
  chunks.push(`## Generated prompt pack`, ``);
  chunks.push(pack.length ? pack : `_No prompt pack stored._`, ``);

  chunks.push(`## Internal price estimate`, ``);
  if (estimate) {
    const block = formatInternalPriceEstimateForCopy(estimate, client.business_name)
      .replace(/^#[^\n]+\n+/, "")
      .trimStart();
    chunks.push(block, ``);
  } else {
    chunks.push(`_No internal price estimate saved for this submission._`, ``);
  }

  chunks.push(`## Internal notes`, ``);
  if (notes.length === 0) {
    chunks.push(`_No reviewer notes yet._`, ``);
  } else {
    const sorted = [...notes].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    for (const note of sorted) {
      chunks.push(`### ${formatWhen(note.created_at)}`, ``);
      chunks.push(`_Note id:_ \`${note.id}\``, ``);
      chunks.push(note.note.trim().length ? note.note.trim() : `_(empty)_`, ``);
    }
  }

  chunks.push(`---`, `_Exported from ${brand.appName} · ${brand.studioDisplayName}_`, ``);

  return chunks.join("\n");
}

export function sanitizePackFileStem(clientName: string, intakeId: string): string {
  const slug = clientName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  const base = slug.length ? slug : "submission";
  return `${base}-${intakeId.slice(0, 8)}`;
}

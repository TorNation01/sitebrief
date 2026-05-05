import type { AdminNoteRow, WebsiteIntakeWithClientRow } from "@/types/database";

/**
 * Stable JSON for agents / external tools: questionnaire fields under `intake_responses`,
 * prompt pack and internal pricing as first-class fields.
 */
export function serializeIntakeForApi(
  row: WebsiteIntakeWithClientRow,
  options?: { admin_notes?: AdminNoteRow[] },
) {
  const {
    clients,
    generated_prompt_pack,
    internal_price_estimate,
    id,
    client_id,
    status,
    created_at,
    updated_at,
    ...intakeResponses
  } = row;

  return {
    id,
    client_id,
    status,
    created_at,
    updated_at,
    client: clients,
    prompt_pack_markdown: generated_prompt_pack,
    internal_price_estimate,
    intake_responses: intakeResponses,
    ...(options?.admin_notes !== undefined ? { admin_notes: options.admin_notes } : {}),
  };
}

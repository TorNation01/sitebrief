export const INTAKE_WORKFLOW_STATUSES = [
  "New",
  "Reviewed",
  "In Progress",
  "Prompt Generated",
  "Completed",
] as const;

export type IntakeWorkflowStatus = (typeof INTAKE_WORKFLOW_STATUSES)[number];

const LEGACY_STATUS_MAP: Record<string, IntakeWorkflowStatus> = {
  submitted: "New",
  Submitted: "New",
};

export function coerceWorkflowStatus(raw: string | null | undefined): IntakeWorkflowStatus | string {
  if (!raw) {
    return "New";
  }
  if ((INTAKE_WORKFLOW_STATUSES as readonly string[]).includes(raw)) {
    return raw as IntakeWorkflowStatus;
  }
  return LEGACY_STATUS_MAP[raw] ?? raw;
}

export function isWorkflowStatus(status: string): status is IntakeWorkflowStatus {
  return (INTAKE_WORKFLOW_STATUSES as readonly string[]).includes(status);
}

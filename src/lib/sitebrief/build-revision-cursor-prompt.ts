import type { ClientRow, RevisionItemRow, WebsiteIntakeRow } from "@/types/database";

function nz(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

/**
 * Builds a single Cursor-ready instruction block from accepted revision items
 * plus a thin slice of the original intake for context.
 */
export function buildRevisionCursorPromptMarkdown(input: {
  businessName: string;
  intake: WebsiteIntakeRow;
  client: ClientRow | null;
  roundNumber: number;
  items: RevisionItemRow[];
}): string {
  const accepted = input.items.filter((i) => i.status === "accepted");
  const parts: string[] = [
    `# SiteBrief — revision implementation pack`,
    ``,
    `**Business:** ${input.businessName}`,
    `**Revision round:** ${input.roundNumber}`,
    ``,
    `## Original brief (context)`,
    `- Primary goal: ${nz(input.intake.website_goal)}`,
    `- Pages / IA notes: ${nz(input.intake.pages_needed)}`,
    `- Features: ${nz(input.intake.features_needed)}`,
    `- Integrations: ${nz(input.intake.integrations_needed)}`,
    `- Branding: ${nz(input.intake.branding_status)}`,
  ];
  const site = input.client?.website?.trim();
  if (site) {
    parts.push(`- Live reference: ${site}`);
  }
  parts.push(``, `## Accepted change requests (implement in code)`);

  if (!accepted.length) {
    parts.push(`_No items are marked accepted for this round yet._`);
  } else {
    for (const item of accepted) {
      const page = nz(item.page_reference) || "(site-wide / unspecified page)";
      parts.push(`### ${item.category} — ${page}`);
      parts.push(`- **Priority (client):** ${item.priority.replace(/_/g, " ")}`);
      parts.push(`- **Change:** ${nz(item.description)}`);
      if (item.admin_response?.trim()) {
        parts.push(`- **Studio note:** ${item.admin_response.trim()}`);
      }
      parts.push(``);
    }
  }

  parts.push(
    `## Implementation notes`,
    `- Prefer minimal, scoped edits; keep existing patterns and design tokens.`,
    `- After changes, smoke-test navigation, forms, and any touched integrations.`,
    `- Do not expose internal pricing or admin-only fields on public routes.`,
  );

  return parts.join("\n");
}

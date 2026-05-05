import type { ClientRow, WebsiteIntakeRow } from "@/types/database";
import { getPublicBrand } from "@/lib/sitebrief/brand";
import { coerceWorkflowStatus } from "@/lib/sitebrief/workflow-status";

function nz(value: string | null | undefined, fallback = "_Not specified in intake._"): string {
  if (value == null) {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
}

function bulletsFromParagraphs(text: string | null | undefined): string {
  const raw = text?.trim() ?? "";
  if (!raw.length) {
    return "- _(No discrete sitemap lines supplied — infer or workshop with stakeholders.)_";
  }

  const asList = raw
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-\*]\s*/, "").trim())
    .filter(Boolean);
  if (asList.length > 1 || raw.includes("\n")) {
    return asList.map((line) => `- ${line}`).join("\n");
  }

  const parts = raw.split(/[,;]+\s+/).map((part) => part.replace(/^[•\-\*]\s*/, "").trim()).filter(Boolean);
  if (parts.length) {
    return parts.map((part) => `- ${part}`).join("\n");
  }
  return `- ${raw}`;
}

function fenced(title: string, body: string) {
  const trimmed = body.trim();
  if (!trimmed.length) {
    return "";
  }
  return `${title}\n\n\`\`\`text\n${trimmed}\n\`\`\`\n`;
}

/**
 * Produce a Cursor-ready markdown pack from persisted intake answers.
 */
export function buildCursorPromptPackMarkdown(client: ClientRow, intake: WebsiteIntakeRow): string {
  const brand = getPublicBrand();
  const biz = client.business_name;
  const liaison = `${client.contact_name} <${client.email}>${client.phone ? ` · ${client.phone}` : ""}`;
  const site = nz(client.website, "_No legacy URL supplied._");
  const status = coerceWorkflowStatus(intake.status);
  const platform = nz(intake.platform_preference);

  const sections: string[] = [
    `# ${brand.appName} · Cursor prompt pack`,
    ``,
    `> Intake **${intake.id}** · Workspace status **${status}**`,
    ``,
    `---`,
    ``,
    `## 1. Client summary`,
    ``,
    `| Signal | Detail |`,
    `| --- | --- |`,
    `| Business name | ${biz} |`,
    `| Primary liaison | ${liaison} |`,
    `| Existing property | ${site} |`,
    `| Services / lines offered | ${nz(intake.services)} |`,
    `| Elevator synopsis | ${nz(intake.business_summary)} |`,
    `| Problems to unwind | ${nz(intake.problem_solved)} |`,
    `| Sharpest differentiation | ${nz(intake.unique_value)} |`,
    `| Budget band communicated | ${nz(intake.budget_range)} |`,
    `| Calendar posture | ${nz(intake.deadline)} · ${nz(intake.priority_level)} |`,
    ``,
    `---`,
    ``,
    `## 2. Website objective`,
    ``,
    nz(intake.website_goal),
    ``,
    `### Desired visitor actions`,
    nz(intake.desired_actions),
    ``,
    `### Instrumentation / success metrics`,
    nz(intake.success_metrics),
    ``,
    `---`,
    ``,
    `## 3. Target audience`,
    ``,
    nz(intake.ideal_customer),
    ``,
    `---`,
    ``,
    `## 4. Brand direction`,
    ``,
    `| Checkpoint | Guidance |`,
    `| --- | --- |`,
    `| Brand readiness | ${nz(intake.branding_status)} |`,
    `| Personality & tonality | ${nz(intake.brand_personality)} |`,
    ``,
    `### Inspirational references`,
    nz(intake.liked_websites),
    ``,
    `### Veto signals / patterns to dodge`,
    nz(intake.disliked_websites),
    ``,
    `---`,
    ``,
    `## 5. Sitemap`,
    ``,
    bulletsFromParagraphs(intake.pages_needed),
    ``,
    `---`,
    ``,
    `## 6. Page-by-page build instructions`,
    ``,
    `For each URL implied by §5, assemble: hero promise, stacked modules, CMS bindings, gated logic, QA hooks.`,
    ``,
    `### Content readiness`,
    nz(intake.content_status),
    ``,
    `### Functional inventory`,
    nz(intake.features_needed),
    ``,
    `---`,
    ``,
    `## 7. Copywriting direction`,
    ``,
    `| Lever | Guidance |`,
    `| --- | --- |`,
    `| Voice & tone | ${nz(intake.tone_of_voice)} |`,
    ``,
    `### Core POV / claims`,
    nz(intake.key_messages),
    ``,
    `### Offers & conversion choreography`,
    nz(intake.offers),
    ``,
    `### Proof reservoirs`,
    nz(intake.testimonials),
    ``,
    `---`,
    ``,
    `## 8. UI / UX design system`,
    ``,
    `- Distill palette + typography from admired references while respecting vetoes.`,
    `- Define spacing, radii, borders, motion language, focus rings, empty + loading states.`,
    `- Component library first: buttons, badges, cards, navigation, tabs, sliders, dialog, forms, tables.`,
    `- Mobile-first responsive choreography; stress-test complex narratives + data-dense rows.`,
    `- Motion: purposeful, never decorative noise.`,
    ``,
    `_Creative north star:_ ${nz(intake.brand_personality)}`,
    ``,
    `---`,
    ``,
    `## 9. Component plan`,
    ``,
    `| Plane | Input |`,
    `| --- | --- |`,
    `| Platform bias | ${platform} |`,
    ``,
    `### Systems to translate into reusable primitives`,
    nz(intake.features_needed),
    ``,
    `### AI-forward expectations`,
    nz(intake.ai_features),
    ``,
    `---`,
    ``,
    `## 10. SEO requirements`,
    ``,
    `- Unique titles + meta descriptions for every indexable URL.`,
    `- Structured data (organization, breadcrumbs, FAQ, product/offers) when supported by copy.`,
    `- Clean internal linking echoing funnel storyline in §2.`,
    `- Performance parity: Core Web Vitals friendly media + font loading discipline.`,
    `- Guard against duplicate thin routes; canonical strategy documented.`,
    ``,
    `### Copy seeds pulled from brief`,
    nz(intake.key_messages),
    ``,
    `### Ancillary notes influencing search`,
    nz(intake.extra_notes),
    ``,
    `---`,
    ``,
    `## 11. Integrations`,
    ``,
    nz(intake.integrations_needed),
    ``,
    `_Expectation:_ sandbox creds, deterministic fixtures, documented env vars + rotation path.`,
    ``,
    `---`,
    ``,
    `## 12. Security requirements`,
    ``,
    nz(intake.compliance_needs),
    ``,
    `_Baseline even if unstated:_ HTTPS everywhere, sanitized rich text, parameterized data access, audited auth if present, hardened headers (CSP/HSTS) on public surfaces.`,
    ``,
    `---`,
    ``,
    `## 13. Deployment instructions`,
    ``,
    `| Concern | Input |`,
    `| --- | --- |`,
    `| Domain choreography | ${nz(intake.domain_status)} |`,
    `| Hosting stance | ${nz(intake.hosting_status)} |`,
    `| Platform target | ${platform} |`,
    `| Calendar / tempo | ${nz(intake.deadline)} · ${nz(intake.priority_level)} |`,
    ``,
    `### Cutover checklist`,
    `- DNS / TLS validation with registrar owners`,
    `- Tiered environments (dev / preview / prod) with seeded parity`,
    `- Monitoring + alerts (uptime + error budgets)`,
    `- Backups + rollback rehearsal`,
    ``,
    `---`,
    ``,
    `## 14. Cursor execution prompts · staged playbook`,
    ``,
    `Drop each block into a fresh Cursor conversation with this full pack attached when needed.`,
    ``,
  ];

  const tail = [
    fenced(
      "### Stage A · Discovery + guardrails",
      [
        `Lead as tech architect for ${biz}.`,
        `Reconcile §5–§6 into a sequenced build plan, call out ambiguities before implementation, and note compliance/integration blockers from §11–§12.`,
      ].join("\n"),
    ),
    fenced(
      "### Stage B · Design tokens + global shell",
      [
        `Codify §8 into tokens (color, type, spacing) and implement global layout (nav/footer/announcement).`,
        `Reference admired/excluded sites from §4 for micro decisions.`,
      ].join("\n"),
    ),
    fenced(
      "### Stage C · Page construction loop",
      [
        `Iterate each route: hero, supporting bands, dynamic data wiring, CMS authoring ergonomics.`,
        `Align CTA inventory with §2 and copy direction in §7.`,
      ].join("\n"),
    ),
    fenced(
      "### Stage D · Integrations + dynamic intelligence",
      [
        `Implement flows from §11 with resilient error handling, secure secret management, and pragmatic fallbacks.`,
        `If AI surfaces exist (§9), document safety + human-in-loop requirements.`,
      ].join("\n"),
    ),
    fenced(
      "### Stage E · SEO, accessibility, performance",
      [
        `Execute §10 + audit keyboard focus, contrast, reduced motion, lighthouse remediation backlog.`,
      ].join("\n"),
    ),
    fenced(
      "### Stage F · Launch + observability",
      [
        `Operationalize §13: DNS cut, caches, smoke suites, stakeholder sign-off checklist, post-launch monitoring playbook.`,
      ].join("\n"),
    ),
    ``,
    `### Residual partner notes`,
    nz(intake.extra_notes),
    ``,
    `---`,
    ``,
    `_${brand.appName} pack · regenerate whenever intake answers change._`,
    ``,
  ];

  return [...sections, ...tail].join("\n").trimEnd();
}

export function sanitizePromptPackFilename(businessName: string, intakeId: string) {
  const { exportSlug } = getPublicBrand();
  const slug =
    businessName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "client";

  return `${exportSlug}-${slug}-${intakeId.slice(0, 8)}`;
}

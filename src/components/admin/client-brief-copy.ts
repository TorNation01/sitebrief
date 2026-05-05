import type { ClientRow, WebsiteIntakeRow } from "@/types/database";
import { getPublicBrand } from "@/lib/sitebrief/brand";
import { coerceWorkflowStatus } from "@/lib/sitebrief/workflow-status";

export function composeClientBriefBundle(client: ClientRow, intake: WebsiteIntakeRow) {
  const brand = getPublicBrand();
  const status = coerceWorkflowStatus(intake.status);

  const lines = [
    `${brand.appName} submission snapshot`,
    "==============================",
    `Business legal / trading identity: ${client.business_name}`,
    `Primary liaison: ${client.contact_name}`,
    `Email thread: ${client.email}`,
    client.phone?.trim()?.length ? `Phone / sms: ${client.phone}` : "Phone / sms: Not specified",
    client.website?.trim()?.length
      ? `Live reference site: ${client.website}`
      : "Live reference site: Not specified",
    `Workflow status inside studio: ${status}`,
    intake.budget_range ? `Investment band: ${intake.budget_range}` : "Investment band: Not specified",
    intake.deadline ? `Stakeholder-facing launch window: ${intake.deadline}` : "Launch expectation: Flexible / TBD",
    "",
    "--- Intake payloads ---",
  ];

  const entries: Array<[string, keyof WebsiteIntakeRow]> = [
    ["Elevator positioning", "business_summary"],
    ["Offers & monetization strands", "services"],
    ["Ideal-fit customer", "ideal_customer"],
    ["Problem articulated", "problem_solved"],
    ["Sharpest differentiated value story", "unique_value"],
    ["Primary mandate for launch", "website_goal"],
    ["Calls-to-action we should choreograph", "desired_actions"],
    ["Quantified KPIs / north stars", "success_metrics"],
    ["IA & page intents", "pages_needed"],
    ["Content preparedness", "content_status"],
    ["Critical features & systems", "features_needed"],
    ["Visual brand fidelity", "branding_status"],
    ["Articulated aesthetics & tone", "brand_personality"],
    ["Reference comps we admired", "liked_websites"],
    ["Signals to avoid consciously", "disliked_websites"],
    ["Domain choreography", "domain_status"],
    ["Hosting stance", "hosting_status"],
    ["Platform predisposition", "platform_preference"],
    ["Integrations handshake map", "integrations_needed"],
    ["Editorial tenor", "tone_of_voice"],
    ["Sticky POV snippets", "key_messages"],
    ["Conversion scaffolding", "offers"],
    ["Proof reservoirs", "testimonials"],
    ["Trust & compliance scaffolding", "compliance_needs"],
    ["Growth horizon roadmap", "future_expansion"],
    ["AI-augmentation appetite", "ai_features"],
    ["Priority signalling", "priority_level"],
    ["Extra studio-only notes", "extra_notes"],
    ["Generated prompt scaffold", "generated_prompt_pack"],
  ];

  entries.forEach(([label, column]) => {
    const payload = intake[column];
    if (typeof payload === "string") {
      const trimmed = payload.trim();
      lines.push(trimmed.length ? `${label}: ${trimmed}` : `${label}: —`);
    } else if (payload == null || payload === undefined) {
      lines.push(`${label}: —`);
    } else {
      lines.push(`${label}: ${String(payload)}`);
    }
  });

  lines.push("", `Captured at (UTC-ish): ${intake.created_at}`);
  lines.push(`Last mutation: ${intake.updated_at}`);
  lines.push("", `Submission UUID for audit: ${intake.id}`);

  return lines.join("\n");
}

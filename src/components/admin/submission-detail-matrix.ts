import type { WebsiteIntakeRow } from "@/types/database";

type FieldSpec = {
  label: string;
  key: keyof WebsiteIntakeRow;
};

export type SubmissionFieldSection = {
  title: string;
  description: string;
  fields: FieldSpec[];
};

export const SUBMISSION_FIELD_BLUEPRINT: SubmissionFieldSection[] = [
  {
    title: "Narrative differentiation",
    description: "Purpose, economics, and wedge thinking your build team must internalize.",
    fields: [
      { label: "Elevator storyline", key: "business_summary" },
      { label: "Service & delivery mix", key: "services" },
      { label: "Prime customer segments", key: "ideal_customer" },
      { label: "Constraints you unwind", key: "problem_solved" },
      { label: "Non-negotiable value prop", key: "unique_value" },
    ],
  },
  {
    title: "Velocity & intent",
    description: "Goals, conversion motions, and fidelity for each page template.",
    fields: [
      { label: "Website north star", key: "website_goal" },
      { label: "Priority actions we must choreograph", key: "desired_actions" },
      { label: "Signal / metric stack", key: "success_metrics" },
      { label: "Page & section architecture", key: "pages_needed" },
      { label: "Content readiness", key: "content_status" },
      { label: "Feature & systems choreography", key: "features_needed" },
    ],
  },
  {
    title: "Sensory design world",
    description: "Signals for art direction, kinetic language, and veto patterns.",
    fields: [
      { label: "Brand language maturity", key: "branding_status" },
      { label: "Personality scaffolding", key: "brand_personality" },
      { label: "Reference experiences that spark joy", key: "liked_websites" },
      { label: "Signals to avoid meticulously", key: "disliked_websites" },
    ],
  },
  {
    title: "Infra & interoperability",
    description: "Hosting preferences, domain choreography, and integrations with teeth.",
    fields: [
      { label: "Domain positioning", key: "domain_status" },
      { label: "Hosting & operations posture", key: "hosting_status" },
      { label: "Platform inclinations", key: "platform_preference" },
      { label: "Handshake systems", key: "integrations_needed" },
    ],
  },
  {
    title: "Messaging & conversion scaffolding",
    description: "Tone, offers, and trust collateral that must survive legal review.",
    fields: [
      { label: "Editorial tone", key: "tone_of_voice" },
      { label: "Battle-tested talking points", key: "key_messages" },
      { label: "Offers & funnels", key: "offers" },
      { label: "Proof & validation", key: "testimonials" },
    ],
  },
  {
    title: "Compliance & horizon",
    description: "Governance, roadmap, and augmentation experiments worth planning for.",
    fields: [
      { label: "Compliance & risk guardrails", key: "compliance_needs" },
      { label: "Product & web horizon", key: "future_expansion" },
      { label: "AI posture", key: "ai_features" },
    ],
  },
  {
    title: "Commercial constraints",
    description: "Investment guardrails and calendar pressure that affect staffing.",
    fields: [
      { label: "Investment band", key: "budget_range" },
      { label: "External launch expectations", key: "deadline" },
      { label: "Tempo & priority call", key: "priority_level" },
    ],
  },
  {
    title: "Operational appendices",
    description: "Anything outside the structured matrix. Generated Cursor packs now live in the dedicated studio module above.",
    fields: [{ label: "Residual colour / notes", key: "extra_notes" }],
  },
];

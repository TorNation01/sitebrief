import type { FieldPath, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { BUDGET_RANGE_SLUGS } from "@/lib/sitebrief/budget-range";
import type { SubmitWebsiteIntakePayload } from "@/types/database";

export const SERVICES_OPTIONS = [
  "Web design",
  "Web development / engineering",
  "E-commerce",
  "Brand identity",
  "SEO / content marketing",
  "Ongoing support & care plan",
] as const;

export const FEATURES_OPTIONS = [
  "Blog / resources hub",
  "CMS to edit pages in-house",
  "Booking or scheduling",
  "Member / customer portal",
  "Global search",
  "Multi-language / localization",
  "Newsletter capture & automation hooks",
] as const;

export const INTEGRATIONS_OPTIONS = [
  "CRM (HubSpot, Salesforce, Pipedrive, etc.)",
  "Payments (Stripe, PayPal, etc.)",
  "Marketing automation (Klaviyo, Mailchimp, etc.)",
  "Analytics (GA4, Matomo, etc.)",
  "Single sign-on / directory (Okta, Google Workspace)",
  "Not sure",
] as const;

export const AI_OPTIONS = [
  "AI-assisted site search",
  "AI chat / triage for visitors",
  "Drafting support for long-form pages",
  "Translation or localization assist",
  "Not sure",
] as const;

const TEXT_SHORT = 500;
const TEXT_MEDIUM = 4_000;
const TEXT_LONG = 12_000;

const optionalText = z.string().max(TEXT_LONG).default("");

export const intakeFormSchema = z.object({
  contact_name: z.string().trim().min(1, "Contact name is required").max(200),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(254, "Email is too long")
    .email("Enter a valid email address"),
  phone: z.string().max(160).default(""),
  website: z.string().max(2048).default(""),
  business_name: z.string().trim().min(1, "Business name is required").max(240),
  business_summary: optionalText,
  services_selected: z.array(z.string()).default([]),
  services_detail: optionalText,
  ideal_customer: optionalText,
  problem_solved: optionalText,
  unique_value: optionalText,
  website_goal: z
    .string()
    .trim()
    .min(1, "Describe the primary goal for the new website")
    .max(TEXT_MEDIUM),
  desired_actions: optionalText,
  success_metrics: optionalText,
  pages_needed: optionalText,
  content_status: optionalText,
  features_selected: z.array(z.string()).default([]),
  features_detail: optionalText,
  branding_status: optionalText,
  brand_personality: optionalText,
  liked_websites: optionalText,
  disliked_websites: optionalText,
  domain_status: optionalText,
  hosting_status: optionalText,
  platform_preference: optionalText,
  integrations_selected: z.array(z.string()).default([]),
  integrations_detail: optionalText,
  tone_of_voice: optionalText,
  key_messages: optionalText,
  offers: optionalText,
  testimonials: optionalText,
  compliance_needs: optionalText,
  future_expansion: optionalText,
  ai_selected: z.array(z.string()).default([]),
  ai_detail: optionalText,
  budget_range: z
    .string()
    .trim()
    .min(1, "Select a budget range")
    .max(TEXT_SHORT)
    .refine((v) => (BUDGET_RANGE_SLUGS as readonly string[]).includes(v), { message: "Select a budget range" }),
  deadline: optionalText.refine((value) => {
    const t = value.trim();
    return !t.length || !Number.isNaN(Date.parse(t));
  }, "Enter a recognizable date or leave this blank"),
  priority_level: optionalText,
  extra_notes: optionalText,
});

export const intakeFormSchemaWithHoneypot = intakeFormSchema.extend({
  hp_company_url: z.string().max(280).default(""),
  /** Second trap — autocomplete-attracting “role”; must stay blank. */
  hp_department_role: z.string().max(280).default(""),
}).superRefine((data, ctx) => {
  if (data.hp_company_url.trim().length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "blocked",
      path: ["hp_company_url"],
    });
    return;
  }
  if (data.hp_department_role.trim().length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "blocked",
      path: ["hp_department_role"],
    });
  }
});

export type IntakeFormValues = z.infer<typeof intakeFormSchema>;
export type IntakeFormValuesWithHoneypot = z.infer<typeof intakeFormSchemaWithHoneypot>;

export const INTAKE_HONEYPOT_FIELD_NAMES = ["hp_company_url", "hp_department_role"] as const;

export function intakeFormHoneypotWasTriggered(
  issues: readonly { path?: readonly PropertyKey[] }[],
): boolean {
  const names = new Set<string>(INTAKE_HONEYPOT_FIELD_NAMES);
  return issues.some((issue) => names.has(String(issue.path?.[0])));
}

export function stripIntakeFormHoneypot(values: IntakeFormValuesWithHoneypot): IntakeFormValues {
  const { hp_company_url, hp_department_role, ...rest } = values;
  void hp_company_url;
  void hp_department_role;
  return rest as IntakeFormValues;
}

export const intakeDefaultValues: IntakeFormValues = {
  contact_name: "",
  email: "",
  phone: "",
  website: "",
  business_name: "",
  business_summary: "",
  services_selected: [],
  services_detail: "",
  ideal_customer: "",
  problem_solved: "",
  unique_value: "",
  website_goal: "",
  desired_actions: "",
  success_metrics: "",
  pages_needed: "",
  content_status: "",
  features_selected: [],
  features_detail: "",
  branding_status: "",
  brand_personality: "",
  liked_websites: "",
  disliked_websites: "",
  domain_status: "",
  hosting_status: "",
  platform_preference: "",
  integrations_selected: [],
  integrations_detail: "",
  tone_of_voice: "",
  key_messages: "",
  offers: "",
  testimonials: "",
  compliance_needs: "",
  future_expansion: "",
  ai_selected: [],
  ai_detail: "",
  budget_range: "",
  deadline: "",
  priority_level: "",
  extra_notes: "",
};

/** Defaults for `<IntakeWizard />`, including honeypot bound off-screen. */
export const intakeWizardDefaultValues: IntakeFormValuesWithHoneypot = {
  ...intakeDefaultValues,
  hp_company_url: "",
  hp_department_role: "",
};

export const INTAKE_STEPS = [
  {
    id: "contact",
    title: "Contact details",
    description: "How we reach you about this project.",
    fields: [
      "contact_name",
      "email",
      "phone",
      "website",
    ] as const satisfies ReadonlyArray<keyof IntakeFormValues>,
  },
  {
    id: "business",
    title: "Business core",
    description: "Context about who you are and who you serve.",
    fields: [
      "business_name",
      "business_summary",
      "services_selected",
      "services_detail",
      "ideal_customer",
      "problem_solved",
      "unique_value",
    ] as const satisfies ReadonlyArray<keyof IntakeFormValues>,
  },
  {
    id: "goals",
    title: "Website goals",
    description: "What success looks like when the site launches.",
    fields: ["website_goal", "desired_actions", "success_metrics"] as const,
  },
  {
    id: "structure",
    title: "Website structure",
    description: "Pages, content readiness, and must-have features.",
    fields: [
      "pages_needed",
      "content_status",
      "features_selected",
      "features_detail",
    ] as const,
  },
  {
    id: "branding",
    title: "Branding & design",
    description: "Visual direction, references, and guardrails.",
    fields: [
      "branding_status",
      "brand_personality",
      "liked_websites",
      "disliked_websites",
    ] as const,
  },
  {
    id: "tech",
    title: "Tech & integrations",
    description: "Infrastructure decisions and connected systems.",
    fields: [
      "domain_status",
      "hosting_status",
      "platform_preference",
      "integrations_selected",
      "integrations_detail",
    ] as const,
  },
  {
    id: "content",
    title: "Content & conversion",
    description: "Messaging, offers, and proof that drives action.",
    fields: ["tone_of_voice", "key_messages", "offers", "testimonials"] as const,
  },
  {
    id: "compliance",
    title: "Trust & compliance",
    description: "Policies, industries, and legal considerations.",
    fields: ["compliance_needs"] as const,
  },
  {
    id: "future",
    title: "Future expansion",
    description: "Where the roadmap may take the experience next.",
    fields: ["future_expansion", "ai_selected", "ai_detail"] as const,
  },
  {
    id: "budget",
    title: "Budget & timeline",
    description: "Constraints that keep planning realistic.",
    fields: ["budget_range", "deadline", "priority_level"] as const,
  },
  {
    id: "notes",
    title: "Final notes",
    description: "Anything else we should know before we review.",
    fields: ["extra_notes"] as const,
  },
] as const;

const stepSchemaFor = <K extends keyof IntakeFormValues>(keys: readonly K[]) => {
  const shape = {} as Record<K, (typeof intakeFormSchema.shape)[K]>;
  for (const key of keys) {
    shape[key] = intakeFormSchema.shape[key];
  }
  return z.object(shape);
};

export const intakeStepSchemas = INTAKE_STEPS.map((step) =>
  stepSchemaFor(step.fields),
);

export function applyZodIssuesToForm<TFieldValues extends Record<string, unknown>>(
  form: Pick<UseFormReturn<TFieldValues>, "setError">,
  error: z.ZodError,
) {
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string") {
      form.setError(key as FieldPath<TFieldValues>, {
        message: issue.message,
      });
    }
  }
}

const CHECKBOX_LOOKUP = new Set<string>([
  ...SERVICES_OPTIONS,
  ...FEATURES_OPTIONS,
  ...INTEGRATIONS_OPTIONS,
  ...AI_OPTIONS,
]);

export function sanitizeIntakeSelections<T extends IntakeFormValues & { hp_company_url?: string; hp_department_role?: string }>(
  values: T,
): T {
  return {
    ...values,
    services_selected: values.services_selected.filter((entry) =>
      CHECKBOX_LOOKUP.has(entry),
    ),
    features_selected: values.features_selected.filter((entry) =>
      CHECKBOX_LOOKUP.has(entry),
    ),
    integrations_selected: values.integrations_selected.filter((entry) =>
      CHECKBOX_LOOKUP.has(entry),
    ),
    ai_selected: values.ai_selected.filter((entry) =>
      CHECKBOX_LOOKUP.has(entry),
    ),
  };
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function mergeBullets(selected: string[], detail: string): string | null {
  const bullets = selected.map((item) => `• ${item}`);
  const extra = detail.trim();
  const parts = [...bullets, extra].filter(Boolean);
  if (!parts.length) {
    return null;
  }
  return parts.join("\n");
}

function deadlineIsoDateOrNull(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed.length) {
    return null;
  }
  const millis = Date.parse(trimmed);
  if (Number.isNaN(millis)) {
    return null;
  }
  return new Date(millis).toISOString().slice(0, 10);
}

export function buildIntakePayload(
  values: IntakeFormValues,
): SubmitWebsiteIntakePayload {
  return {
    client: {
      business_name: values.business_name.trim(),
      contact_name: values.contact_name.trim(),
      email: values.email.trim(),
      phone: emptyToNull(values.phone),
      website: emptyToNull(values.website),
    },
    intake: {
      business_summary: emptyToNull(values.business_summary),
      services: mergeBullets(values.services_selected, values.services_detail),
      ideal_customer: emptyToNull(values.ideal_customer),
      problem_solved: emptyToNull(values.problem_solved),
      unique_value: emptyToNull(values.unique_value),
      website_goal: values.website_goal.trim(),
      desired_actions: emptyToNull(values.desired_actions),
      success_metrics: emptyToNull(values.success_metrics),
      pages_needed: emptyToNull(values.pages_needed),
      content_status: emptyToNull(values.content_status),
      features_needed: mergeBullets(
        values.features_selected,
        values.features_detail,
      ),
      branding_status: emptyToNull(values.branding_status),
      brand_personality: emptyToNull(values.brand_personality),
      liked_websites: emptyToNull(values.liked_websites),
      disliked_websites: emptyToNull(values.disliked_websites),
      domain_status: emptyToNull(values.domain_status),
      hosting_status: emptyToNull(values.hosting_status),
      platform_preference: emptyToNull(values.platform_preference),
      integrations_needed: mergeBullets(
        values.integrations_selected,
        values.integrations_detail,
      ),
      tone_of_voice: emptyToNull(values.tone_of_voice),
      key_messages: emptyToNull(values.key_messages),
      offers: emptyToNull(values.offers),
      testimonials: emptyToNull(values.testimonials),
      compliance_needs: emptyToNull(values.compliance_needs),
      future_expansion: emptyToNull(values.future_expansion),
      ai_features: mergeBullets(values.ai_selected, values.ai_detail),
      budget_range: values.budget_range.trim(),
      deadline: deadlineIsoDateOrNull(values.deadline),
      priority_level: emptyToNull(values.priority_level),
      extra_notes: emptyToNull(values.extra_notes),
    },
  };
}

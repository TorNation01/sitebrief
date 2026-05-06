import type { FieldPath, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import type { SubmitWebsiteIntakePayload } from "@/types/database";

/** Short single-line fields (labels, selects, one-liners). */
export const INTAKE_SHORT_TEXT_MAX = 500;
/** Long answers / textareas — generous to avoid false “too long” failures. */
export const INTAKE_TEXTAREA_MAX = 12_000;

/**
 * Honeypot inputs must stay effectively empty. Browsers sometimes inject 1–2 characters via
 * autofill/extensions; only treat as a bot when a field clearly has content (trimmed length).
 */
export const INTAKE_HONEYPOT_MIN_TRIGGER_CHARS = 4;

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

const optionalLongText = z.string().max(INTAKE_TEXTAREA_MAX).default("");

export const intakeFormSchema = z.object({
  contact_name: z.string().trim().min(1, "Contact name is required").max(INTAKE_SHORT_TEXT_MAX),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(254, "Email is too long")
    .email("Enter a valid email address"),
  phone: z.string().max(INTAKE_SHORT_TEXT_MAX).default(""),
  website: z.string().max(INTAKE_TEXTAREA_MAX).default(""),
  business_name: z.string().trim().min(1, "Business name is required").max(INTAKE_SHORT_TEXT_MAX),
  business_summary: optionalLongText,
  services_selected: z.array(z.string()).default([]),
  services_detail: optionalLongText,
  ideal_customer: optionalLongText,
  problem_solved: optionalLongText,
  unique_value: optionalLongText,
  website_goal: optionalLongText,
  desired_actions: optionalLongText,
  success_metrics: optionalLongText,
  pages_needed: optionalLongText,
  content_status: optionalLongText,
  features_selected: z.array(z.string()).default([]),
  features_detail: optionalLongText,
  branding_status: optionalLongText,
  brand_personality: optionalLongText,
  liked_websites: optionalLongText,
  disliked_websites: optionalLongText,
  domain_status: optionalLongText,
  hosting_status: optionalLongText,
  platform_preference: optionalLongText,
  integrations_selected: z.array(z.string()).default([]),
  integrations_detail: optionalLongText,
  tone_of_voice: optionalLongText,
  key_messages: optionalLongText,
  offers: optionalLongText,
  testimonials: optionalLongText,
  compliance_needs: optionalLongText,
  future_expansion: optionalLongText,
  ai_selected: z.array(z.string()).default([]),
  ai_detail: optionalLongText,
  /** Accept any stored value (legacy slugs, free text, etc.). */
  budget_range: z.string().max(INTAKE_SHORT_TEXT_MAX).default(""),
  deadline: optionalLongText.refine((value) => {
    const t = value.trim();
    return !t.length || !Number.isNaN(Date.parse(t));
  }, "Enter a recognizable date or leave this blank"),
  /** Accept any option or blank. */
  priority_level: z.string().max(INTAKE_SHORT_TEXT_MAX).default(""),
  extra_notes: optionalLongText,
});

export const intakeFormSchemaWithHoneypot = intakeFormSchema.extend({
  hp_company_url: z.string().max(INTAKE_SHORT_TEXT_MAX).default(""),
  /** Second trap — must stay empty; real users should never paste content here. */
  hp_department_role: z.string().max(INTAKE_SHORT_TEXT_MAX).default(""),
}).superRefine((data, ctx) => {
  if (data.hp_company_url.trim().length >= INTAKE_HONEYPOT_MIN_TRIGGER_CHARS) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "blocked",
      path: ["hp_company_url"],
    });
    return;
  }
  if (data.hp_department_role.trim().length >= INTAKE_HONEYPOT_MIN_TRIGGER_CHARS) {
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

function humanizeFieldKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Top-level form field from a Zod issue path (honeypots use their real field names). */
function topLevelFieldFromIssuePath(path: readonly PropertyKey[]): string | null {
  const head = path[0];
  return typeof head === "string" ? head : null;
}

export type IntakeValidationIssueRow = {
  fieldKey: string;
  fieldLabel: string;
  message: string;
  stepIndex: number | null;
};

/**
 * Turns a Zod error into rows we can show on the review step. Skips duplicate (field, message) pairs.
 */
export function formatIntakeValidationIssues(error: z.ZodError): IntakeValidationIssueRow[] {
  const seen = new Set<string>();
  const rows: IntakeValidationIssueRow[] = [];

  for (const issue of error.issues) {
    const fieldKey = topLevelFieldFromIssuePath(issue.path);
    if (!fieldKey) {
      const dedupe = `__root__:${issue.message}`;
      if (seen.has(dedupe)) {
        continue;
      }
      seen.add(dedupe);
      rows.push({
        fieldKey: "form",
        fieldLabel: "Form",
        message: issue.message,
        stepIndex: null,
      });
      continue;
    }

    const dedupe = `${fieldKey}:${issue.message}`;
    if (seen.has(dedupe)) {
      continue;
    }
    seen.add(dedupe);

    const stepIndex = INTAKE_STEPS.findIndex((definition) =>
      (definition.fields as readonly string[]).includes(fieldKey),
    );

    rows.push({
      fieldKey,
      fieldLabel: humanizeFieldKey(fieldKey),
      message: issue.message,
      stepIndex: stepIndex >= 0 ? stepIndex : null,
    });
  }

  return rows;
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
    services_selected: (values.services_selected ?? []).filter((entry) =>
      CHECKBOX_LOOKUP.has(entry),
    ),
    features_selected: (values.features_selected ?? []).filter((entry) =>
      CHECKBOX_LOOKUP.has(entry),
    ),
    integrations_selected: (values.integrations_selected ?? []).filter((entry) =>
      CHECKBOX_LOOKUP.has(entry),
    ),
    ai_selected: (values.ai_selected ?? []).filter((entry) =>
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
      website_goal: emptyToNull(values.website_goal ?? ""),
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
      budget_range: (values.budget_range ?? "").trim().length ? (values.budget_range ?? "").trim() : null,
      deadline: deadlineIsoDateOrNull(values.deadline),
      priority_level: emptyToNull(values.priority_level),
      extra_notes: emptyToNull(values.extra_notes),
    },
  };
}

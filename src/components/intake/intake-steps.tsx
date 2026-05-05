"use client";

import type { FieldError } from "react-hook-form";
import { Controller, useFormContext } from "react-hook-form";

import {
  FieldGroup,
  TextInput,
  selectClassName,
  textareaClassName,
} from "@/components/intake/intake-field";
import {
  AI_OPTIONS,
  FEATURES_OPTIONS,
  INTEGRATIONS_OPTIONS,
  IntakeFormValues,
  SERVICES_OPTIONS,
} from "@/components/intake/intake-schema";

const checklistBoxClass =
  "mt-1 h-4 w-4 shrink-0 rounded border border-zinc-300 accent-[color:color-mix(in_srgb,var(--color-accent)_80%,black)]";

const checklistRowClass =
  "flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-100 bg-white p-3 text-sm leading-snug shadow-sm hover:border-[var(--color-accent)]/35";

type SelectChoice = {
  value: string;
  label: string;
  disabled?: boolean;
};

const SELECT_PLACEHOLDER: SelectChoice = {
  value: "",
  label: "Select an option",
  disabled: true,
};

const CONTENT_STATUS_OPTIONS = [
  SELECT_PLACEHOLDER,
  {
    value: "ready-copy",
    label: "Copy is drafted and largely ready",
    disabled: false,
  },
  {
    value: "partial-gap",
    label: "Drafts exist but key sections remain open",
    disabled: false,
  },
  {
    value: "net-new",
    label: "We need positioning plus net-new narratives",
    disabled: false,
  },
  {
    value: "unsure-content",
    label: "Not sure yet—we need directional guidance",
    disabled: false,
  },
];

const BRANDING_OPTIONS = [
  SELECT_PLACEHOLDER,
  {
    value: "system-ready",
    label: "Full brand guidelines plus assets unlocked",
    disabled: false,
  },
  {
    value: "needs-refresh",
    label: "Existing brand equity with modernization goals",
    disabled: false,
  },
  {
    value: "green-field",
    label: "No formal brand—we need foundational strategy",
    disabled: false,
  },
];

const DOMAIN_OPTIONS = [
  SELECT_PLACEHOLDER,
  {
    value: "owned-ready",
    label: "Domains secured—ready for DNS choreography",
    disabled: false,
  },
  {
    value: "owned-transfer",
    label: "Legacy domains need consolidation / migration assistance",
    disabled: false,
  },
  {
    value: "need-buy",
    label: "We need brokerage / acquisition support",
    disabled: false,
  },
  {
    value: "unsure-domain",
    label: "Unsure—we value recommendations",
    disabled: false,
  },
];

const HOSTING_OPTIONS = [
  SELECT_PLACEHOLDER,
  {
    value: "agency-managed",
    label: "Prefer fully managed ops from the studio",
    disabled: false,
  },
  {
    value: "existing-vendor",
    label: "We have vendor contracts plus SLAs in place today",
    disabled: false,
  },
  {
    value: "need-guidance-hosting",
    label: "Open playbook—shopping for the right footing",
    disabled: false,
  },
];

const PLATFORM_OPTIONS = [
  SELECT_PLACEHOLDER,
  {
    value: "open",
    label: "Flexible—looking for pragmatic recommendations",
    disabled: false,
  },
  {
    value: "wordpress",
    label: "WordPress (block or hybrid theme)",
    disabled: false,
  },
  {
    value: "webflow",
    label: "Webflow-first production",
    disabled: false,
  },
  {
    value: "shopify",
    label: "Shopify / headless commerce stack",
    disabled: false,
  },
  {
    value: "headless-custom",
    label: "Headless orchestration / custom React footprint",
    disabled: false,
  },
];

const PRIORITY_OPTIONS = [
  SELECT_PLACEHOLDER,
  {
    value: "balanced",
    label: "Balance velocity with meticulous craft",
    disabled: false,
  },
  {
    value: "urgent-high",
    label: "Time-sensitive—we still expect premium execution",
    disabled: false,
  },
  {
    value: "deadline-hard",
    label: "Immovable date / stakeholder announcement window",
    disabled: false,
  },
];

const BUDGET_OPTIONS: SelectChoice[] = [
  { value: "", label: "Choose a budget band", disabled: true },
  {
    value: "under-25k-usd",
    label: "Under $25k USD invested across build plus integrations",
    disabled: false,
  },
  {
    value: "25k-55k-usd",
    label: "$25k–$55k USD all-in engagements",
    disabled: false,
  },
  {
    value: "55k-115k-usd",
    label: "$55k–$115k USD programs with nuanced IA/compliance",
    disabled: false,
  },
  {
    value: "115k-plus-usd",
    label: "$115k USD+ multi-phase transformational programs",
    disabled: false,
  },
];

function CheckboxList(props: {
  label: string;
  hint?: string;
  required?: boolean;
  name:
    | "services_selected"
    | "features_selected"
    | "integrations_selected"
    | "ai_selected";
  options: readonly string[];
}) {
  const { label, hint, required, name, options } = props;
  const { control } = useFormContext<IntakeFormValues>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const value = field.value as string[];

        function toggle(option: string) {
          const has = value.includes(option);
          const next = has
            ? value.filter((item) => item !== option)
            : [...value, option];
          field.onChange(next);
        }

        return (
          <FieldGroup label={label} hint={hint} required={required}>
            <div className="grid gap-3 sm:grid-cols-2">
              {options.map((option) => (
                <label key={option} className={checklistRowClass}>
                  <input
                    type="checkbox"
                    className={checklistBoxClass}
                    checked={value.includes(option)}
                    onChange={() => toggle(option)}
                  />
                  <span className="text-sm text-zinc-800">{option}</span>
                </label>
              ))}
            </div>
          </FieldGroup>
        );
      }}
    />
  );
}

function SelectInput(props: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: FieldError;
  options: SelectChoice[];
  fieldName: keyof IntakeFormValues;
}) {
  const { id, label, hint, required, error, options, fieldName } = props;
  const { register } = useFormContext<IntakeFormValues>();

  return (
    <FieldGroup
      label={label}
      htmlFor={id}
      hint={hint}
      required={required}
      error={error}
    >
      <select id={id} className={selectClassName} {...register(fieldName)}>
        {options.map((option) => (
          <option
            key={`${option.value}-${option.label}`}
            value={option.value}
            disabled={option.disabled ?? false}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FieldGroup>
  );
}

export function IntakeStepFields({ stepIndex }: { stepIndex: number }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<IntakeFormValues>();

  switch (stepIndex) {
    case 0:
      return (
        <div className="space-y-6">
          <FieldGroup
            label="Primary contact name"
            htmlFor="contact_name"
            hint="We'll match approvals and onboarding comms against this persona."
            required
            error={errors.contact_name}
          >
            <TextInput id="contact_name" autoComplete="name" {...register("contact_name")} />
          </FieldGroup>

          <FieldGroup
            label="Work email"
            htmlFor="email"
            hint="Routing for confirmations plus async follow-ups throughout scoping."
            required
            error={errors.email}
          >
            <TextInput id="email" type="email" autoComplete="email" {...register("email")} />
          </FieldGroup>

          <FieldGroup
            label="Mobile or office phone"
            htmlFor="phone"
            hint="Optional—helps us escalate nuanced decisions without scheduling friction."
            error={errors.phone}
          >
            <TextInput id="phone" type="tel" autoComplete="tel" {...register("phone")} />
          </FieldGroup>

          <FieldGroup
            label="Existing website URL"
            htmlFor="website"
            hint="Include https:// if something is publicly live—even if overdue for rework."
            error={errors.website}
          >
            <TextInput
              id="website"
              {...register("website")}
            />
          </FieldGroup>
        </div>
      );
    case 1:
      return (
        <div className="space-y-6">
          <FieldGroup
            label="Business name"
            htmlFor="business_name"
            hint="Trading name surfaced to prospects—not only the legal corp string."
            required
            error={errors.business_name}
          >
            <TextInput id="business_name" autoComplete="organization" {...register("business_name")} />
          </FieldGroup>

          <FieldGroup
            label="Elevator narrative"
            htmlFor="business_summary"
            hint="One tight paragraph capturing offer, wedge, geography, marquee proof points."
            error={errors.business_summary}
          >
            <textarea
              id="business_summary"
              className={textareaClassName}
              {...register("business_summary")}
              rows={5}
            />
          </FieldGroup>

          <CheckboxList
            label="Service lines we should consider in scope conversations"
            hint="Select every materially revenue-bearing practice—we'll stitch nuance downstream."
            name="services_selected"
            options={SERVICES_OPTIONS}
          />

          <FieldGroup
            label="Services context & nuance"
            htmlFor="services_detail"
            hint="Retainers vs. launches, SKU density, certifications, alliances—anything the checkboxes truncate."
            error={errors.services_detail}
          >
            <textarea
              id="services_detail"
              className={textareaClassName}
              {...register("services_detail")}
              rows={4}
            />
          </FieldGroup>

          <FieldGroup
            label="Ideal customer archetype"
            htmlFor="ideal_customer"
            hint="Industries, company scale, stakeholder roles buying the solution."
            error={errors.ideal_customer}
          >
            <textarea
              id="ideal_customer"
              className={textareaClassName}
              {...register("ideal_customer")}
              rows={4}
            />
          </FieldGroup>

          <FieldGroup
            label="Pain the site needs to dissolve"
            htmlFor="problem_solved"
            hint="Friction you hear in sales/support—missed differentiation, mistrust signals, onboarding drag."
            error={errors.problem_solved}
          >
            <textarea
              id="problem_solved"
              className={textareaClassName}
              {...register("problem_solved")}
              rows={4}
            />
          </FieldGroup>

          <FieldGroup
            label="Sharpest distinctive value"
            htmlFor="unique_value"
            hint="Why switch or stay—proof, methodology, telemetry, specialization."
            error={errors.unique_value}
          >
            <textarea
              id="unique_value"
              className={textareaClassName}
              {...register("unique_value")}
              rows={4}
            />
          </FieldGroup>
        </div>
      );
    case 2:
      return (
        <div className="space-y-6">
          <FieldGroup
            label="Primary outcome for the rebuilt site"
            htmlFor="website_goal"
            hint="Growth, repositioning, lead quality, onboarding cost, ecommerce lift—prioritize the apex outcome."
            required
            error={errors.website_goal}
          >
            <textarea
              id="website_goal"
              className={textareaClassName}
              {...register("website_goal")}
              rows={5}
            />
          </FieldGroup>

          <FieldGroup
            label="Visitors should be able to…"
            htmlFor="desired_actions"
            hint="Micro-conversions beyond contact forms—pricing requests, benchmarking tools, onboarding paths."
            error={errors.desired_actions}
          >
            <textarea
              id="desired_actions"
              className={textareaClassName}
              {...register("desired_actions")}
              rows={4}
            />
          </FieldGroup>

          <FieldGroup
            label="Measured success indicators"
            htmlFor="success_metrics"
            hint="SQL volume, funnel velocity, AOV/ACV deltas, churn, SLA reductions—anything with baselines appreciated."
            error={errors.success_metrics}
          >
            <textarea
              id="success_metrics"
              className={textareaClassName}
              {...register("success_metrics")}
              rows={4}
            />
          </FieldGroup>
        </div>
      );
    case 3:
      return (
        <div className="space-y-6">
          <FieldGroup
            label="Mission-critical screens & sections"
            htmlFor="pages_needed"
            hint="Think IA: marketing, logged-in dashboards, gated resources, internationalized hubs, etc."
            error={errors.pages_needed}
          >
            <textarea
              id="pages_needed"
              className={textareaClassName}
              {...register("pages_needed")}
              rows={5}
            />
          </FieldGroup>

          <SelectInput
            id="content_status"
            label="Production readiness for words & visuals"
            hint="Helps staffing writers, motion, and approvals."
            fieldName="content_status"
            options={CONTENT_STATUS_OPTIONS}
            error={errors.content_status}
          />

          <CheckboxList
            label="Flagship UX / CMS capabilities"
            hint="Select every materially important surface area—the detail box captures specialty asks."
            name="features_selected"
            options={FEATURES_OPTIONS}
          />

          <FieldGroup
            label="Functional depth & tooling"
            htmlFor="features_detail"
            hint="Edge flows, calculators, multilingual governance, SSO, experimentation stack, etc."
            error={errors.features_detail}
          >
            <textarea
              id="features_detail"
              className={textareaClassName}
              {...register("features_detail")}
              rows={4}
            />
          </FieldGroup>
        </div>
      );
    case 4:
      return (
        <div className="space-y-6">
          <SelectInput
            id="branding_status"
            label="Brand system maturity"
            hint="Guides how much discovery vs. expression work precedes UI."
            fieldName="branding_status"
            options={BRANDING_OPTIONS}
            error={errors.branding_status}
          />

          <FieldGroup
            label="Voice + visual personality"
            htmlFor="brand_personality"
            hint="Adjectives, cultural references, guardrails (never sound X, always feel Y)."
            error={errors.brand_personality}
          >
            <textarea
              id="brand_personality"
              className={textareaClassName}
              {...register("brand_personality")}
              rows={4}
            />
          </FieldGroup>

          <FieldGroup
            label="Experiences you admire"
            htmlFor="liked_websites"
            hint="URLs plus a sentence each on what to emulate (motion, density, clarity of story)."
            error={errors.liked_websites}
          >
            <textarea
              id="liked_websites"
              className={textareaClassName}
              {...register("liked_websites")}
              rows={4}
            />
          </FieldGroup>

          <FieldGroup
            label="Experiences to avoid"
            htmlFor="disliked_websites"
            hint="Competitor clichés, tacky patterns, compliance landmines—call them out."
            error={errors.disliked_websites}
          >
            <textarea
              id="disliked_websites"
              className={textareaClassName}
              {...register("disliked_websites")}
              rows={4}
            />
          </FieldGroup>
        </div>
      );
    case 5:
      return (
        <div className="space-y-6">
          <SelectInput
            id="domain_status"
            label="Domain posture"
            hint="Impacts launch sequencing and SEO migrations."
            fieldName="domain_status"
            options={DOMAIN_OPTIONS}
            error={errors.domain_status}
          />

          <SelectInput
            id="hosting_status"
            label="Hosting & operations comfort"
            hint="Helps us pair you with the right stack + support contracts."
            fieldName="hosting_status"
            options={HOSTING_OPTIONS}
            error={errors.hosting_status}
          />

          <SelectInput
            id="platform_preference"
            label="Platform bias (if any)"
            hint="We can still challenge assumptions—this frames research depth."
            fieldName="platform_preference"
            options={PLATFORM_OPTIONS}
            error={errors.platform_preference}
          />

          <CheckboxList
            label="Integrations we should architect for on day one"
            hint="Select every system that must handshake with the site or its data layer."
            name="integrations_selected"
            options={INTEGRATIONS_OPTIONS}
          />

          <FieldGroup
            label="Integration nuance & auth models"
            htmlFor="integrations_detail"
            hint="API ownership, sandboxes, compliance, rate limits, legacy SOAP—free-form detail welcome."
            error={errors.integrations_detail}
          >
            <textarea
              id="integrations_detail"
              className={textareaClassName}
              {...register("integrations_detail")}
              rows={4}
            />
          </FieldGroup>
        </div>
      );
    case 6:
      return (
        <div className="space-y-6">
          <FieldGroup
            label="Tone of voice"
            htmlFor="tone_of_voice"
            hint="Editorial posture: confident vs. academic, playful vs. sober, inclusive language notes."
            error={errors.tone_of_voice}
          >
            <textarea
              id="tone_of_voice"
              className={textareaClassName}
              {...register("tone_of_voice")}
              rows={4}
            />
          </FieldGroup>

          <FieldGroup
            label="Non-negotiable proof points / POV"
            htmlFor="key_messages"
            hint="Claims that must survive legal review, mission statements, category POV."
            error={errors.key_messages}
          >
            <textarea
              id="key_messages"
              className={textareaClassName}
              {...register("key_messages")}
              rows={4}
            />
          </FieldGroup>

          <FieldGroup
            label="Primary offers & CTAs"
            htmlFor="offers"
            hint="Book consult, request demo, download benchmark, apply for program—link to pricing philosophy if sensitive."
            error={errors.offers}
          >
            <textarea
              id="offers"
              className={textareaClassName}
              {...register("offers")}
              rows={4}
            />
          </FieldGroup>

          <FieldGroup
            label="Proof & social validation"
            htmlFor="testimonials"
            hint="Named logos, quantified outcomes, analyst quotes, community love—note any NDAs."
            error={errors.testimonials}
          >
            <textarea
              id="testimonials"
              className={textareaClassName}
              {...register("testimonials")}
              rows={4}
            />
          </FieldGroup>
        </div>
      );
    case 7:
      return (
        <div className="space-y-6">
          <FieldGroup
            label="Trust, risk, and compliance guardrails"
            htmlFor="compliance_needs"
            hint="HIPAA, FINRA, GDPR, accessibility targets (WCAG), sector regulators, data residency, etc."
            error={errors.compliance_needs}
          >
            <textarea
              id="compliance_needs"
              className={textareaClassName}
              {...register("compliance_needs")}
              rows={6}
            />
          </FieldGroup>
        </div>
      );
    case 8:
      return (
        <div className="space-y-6">
          <FieldGroup
            label="Product / web roadmap for the next 18–24 months"
            htmlFor="future_expansion"
            hint="New geos, languages, revenue lines, community programs—helps us avoid painting into corners."
            error={errors.future_expansion}
          >
            <textarea
              id="future_expansion"
              className={textareaClassName}
              {...register("future_expansion")}
              rows={5}
            />
          </FieldGroup>

          <CheckboxList
            label="AI-assisted experiences on the radar"
            hint="We're not auto-enabling anything—this clarifies due diligence + policy work."
            name="ai_selected"
            options={AI_OPTIONS}
          />

          <FieldGroup
            label="AI nuance, constraints, or vendor preferences"
            htmlFor="ai_detail"
            hint="Guardrails, opt-in policies, data retention, human-in-the-loop requirements."
            error={errors.ai_detail}
          >
            <textarea
              id="ai_detail"
              className={textareaClassName}
              {...register("ai_detail")}
              rows={4}
            />
          </FieldGroup>
        </div>
      );
    case 9:
      return (
        <div className="space-y-6">
          <SelectInput
            id="budget_range"
            label="Budget allocation for this chapter"
            hint="Ranges are directional—helps triage sequencing and partner fit."
            required
            fieldName="budget_range"
            options={BUDGET_OPTIONS}
            error={errors.budget_range}
          />

          <FieldGroup
            label="Desired launch window"
            htmlFor="deadline"
            hint="Optional—choose a stakeholder-facing milestone or drop context in final notes instead."
            error={errors.deadline}
          >
            <TextInput id="deadline" type="date" {...register("deadline")} />
          </FieldGroup>

          <SelectInput
            id="priority_level"
            label="Delivery tempo vs. depth"
            fieldName="priority_level"
            options={PRIORITY_OPTIONS}
            error={errors.priority_level}
          />
        </div>
      );
    case 10:
      return (
        <div className="space-y-6">
          <FieldGroup
            label="Executive summary / final context"
            htmlFor="extra_notes"
            hint="Links to briefs decks, stakeholder politics, blackout dates, procurement hurdles—anything you want leadership to absorb."
            error={errors.extra_notes}
          >
            <textarea
              id="extra_notes"
              className={textareaClassName}
              {...register("extra_notes")}
              rows={8}
            />
          </FieldGroup>
        </div>
      );
    default:
      return null;
  }
}

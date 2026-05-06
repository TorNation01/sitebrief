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
  checklistDisplayLabel,
  getBrandingStatusOptions,
  getBudgetOptions,
  getContentStatusOptions,
  getDomainOptions,
  getHostingOptions,
  getPlatformOptions,
  getPriorityOptions,
  pickIntakeLine,
} from "@/components/intake/intake-ux-copy";
import { useIntakeUxMode } from "@/components/intake/intake-ux-mode";
import {
  AI_OPTIONS,
  FEATURES_OPTIONS,
  INTEGRATIONS_OPTIONS,
  IntakeFormValues,
  SERVICES_OPTIONS,
} from "@/components/intake/intake-schema";
import { BUDGET_RANGE_LABELS, BUDGET_RANGE_SLUGS } from "@/lib/sitebrief/budget-range";

const checklistBoxClass =
  "mt-1 h-4 w-4 shrink-0 rounded border border-zinc-300 accent-[color:color-mix(in_srgb,var(--color-accent)_80%,black)]";

const checklistRowClass =
  "flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-100 bg-white p-3 text-sm leading-snug shadow-sm hover:border-[var(--color-accent)]/35";

export type IntakeSelectChoice = {
  value: string;
  label: string;
  disabled?: boolean;
};

const SELECT_PLACEHOLDER: IntakeSelectChoice = {
  value: "",
  label: "Select an option",
  disabled: true,
};

export const CONTENT_STATUS_OPTIONS = [
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

export const BRANDING_OPTIONS = [
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

export const DOMAIN_OPTIONS = [
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
  {
    value: "not-sure",
    label: "Not sure",
    disabled: false,
  },
];

export const HOSTING_OPTIONS = [
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
  {
    value: "not-sure",
    label: "Not sure",
    disabled: false,
  },
];

export const PLATFORM_OPTIONS = [
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
  {
    value: "not-sure",
    label: "Not sure",
    disabled: false,
  },
];

export const PRIORITY_OPTIONS = [
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

export const BUDGET_OPTIONS: IntakeSelectChoice[] = [
  { value: "", label: "Choose a budget band", disabled: true },
  ...BUDGET_RANGE_SLUGS.map((slug) => ({
    value: slug,
    label: BUDGET_RANGE_LABELS[slug],
    disabled: false,
  })),
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
  optionLabel?: (option: string) => string;
}) {
  const { label, hint, required, name, options, optionLabel } = props;
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
                  <span className="text-sm text-zinc-800">
                    {optionLabel ? optionLabel(option) : option}
                  </span>
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
  options: IntakeSelectChoice[];
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
    setValue,
    formState: { errors },
  } = useFormContext<IntakeFormValues>();
  const { mode } = useIntakeUxMode();
  const L = (technical: string, simple: string) => pickIntakeLine(mode, { technical, simple });
  const optLbl = (o: string) => checklistDisplayLabel(mode, o);

  switch (stepIndex) {
    case 0:
      return (
        <div className="space-y-6">
          <FieldGroup
            label={L("Primary contact name", "Your name")}
            htmlFor="contact_name"
            hint={L(
              "We'll match approvals and onboarding comms against this persona.",
              "The person we should address when we reply.",
            )}
            required
            error={errors.contact_name}
          >
            <TextInput id="contact_name" autoComplete="name" {...register("contact_name")} />
          </FieldGroup>

          <FieldGroup
            label={L("Work email", "Email")}
            htmlFor="email"
            hint={L(
              "Routing for confirmations plus async follow-ups throughout scoping.",
              "We send your confirmation and follow-up questions here.",
            )}
            required
            error={errors.email}
          >
            <TextInput id="email" type="email" autoComplete="email" {...register("email")} />
          </FieldGroup>

          <FieldGroup
            label={L("Mobile or office phone", "Phone (optional)")}
            htmlFor="phone"
            hint={L(
              "Optional—helps us escalate nuanced decisions without scheduling friction.",
              "Optional—useful if we need a quick call.",
            )}
            error={errors.phone}
          >
            <TextInput id="phone" type="tel" autoComplete="tel" {...register("phone")} />
          </FieldGroup>

          <FieldGroup
            label={L("Existing website URL", "Current website (if you have one)")}
            htmlFor="website"
            hint={L(
              "Include https:// if something is publicly live—even if overdue for rework.",
              "Paste the full link, even if the site is old or you plan to replace it.",
            )}
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
            label={L("Business name", "Business or organisation name")}
            htmlFor="business_name"
            hint={L(
              "Trading name surfaced to prospects—not only the legal corp string.",
              "The name customers know you by (can differ from the legal company name).",
            )}
            required
            error={errors.business_name}
          >
            <TextInput id="business_name" autoComplete="organization" {...register("business_name")} />
          </FieldGroup>

          <FieldGroup
            label={L("Elevator narrative", "What you do—in a short paragraph")}
            htmlFor="business_summary"
            hint={L(
              "One tight paragraph capturing offer, wedge, geography, marquee proof points.",
              "In plain language: what you sell or deliver, who it is for, and what makes you different.",
            )}
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
            label={L(
              "Service lines we should consider in scope conversations",
              "Services you want the website to reflect",
            )}
            hint={L(
              "Select every materially revenue-bearing practice—we'll stitch nuance downstream.",
              "Tick everything that applies. Use the box below for extra detail.",
            )}
            name="services_selected"
            options={SERVICES_OPTIONS}
            optionLabel={optLbl}
          />

          <FieldGroup
            label={L("Services context & nuance", "More about your services")}
            htmlFor="services_detail"
            hint={L(
              "Retainers vs. launches, SKU density, certifications, alliances—anything the checkboxes truncate.",
              "Anything the tick-boxes did not capture—packages, industries, certifications, etc.",
            )}
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
            label={L("Ideal customer archetype", "Your ideal customer")}
            htmlFor="ideal_customer"
            hint={L(
              "Your ideal customer means the type of person or business most likely to buy from you. Mention industries, company size, roles, or anything that helps describe them.",
              "Who is most likely to buy from you? Industries, company size, job roles—whatever helps us picture them.",
            )}
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
            label={L("Pain the site needs to dissolve", "Problems you solve for customers")}
            htmlFor="problem_solved"
            hint={L(
              "Friction you hear in sales/support—missed differentiation, mistrust signals, onboarding drag.",
              "What frustrations or risks do customers have before they find you?",
            )}
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
            label={L("Sharpest distinctive value", "Why customers choose you")}
            htmlFor="unique_value"
            hint={L(
              "Why switch or stay—proof, methodology, telemetry, specialization.",
              "What makes you the better choice—experience, speed, quality, price, niche focus, etc.?",
            )}
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
            label={L("Primary outcome for the rebuilt site", "Main goal for the new website")}
            htmlFor="website_goal"
            hint={L(
              "Website goal means the main job your website needs to do—like generating leads, selling products, or building trust. Answer in your own words; we will translate it.",
              "In your own words: what should the website help you achieve? (Leads, bookings, sales, trust, etc.)",
            )}
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
            label={L("Visitors should be able to…", "What should visitors be able to do?")}
            htmlFor="desired_actions"
            hint={L(
              "Micro-conversions beyond contact forms—pricing requests, benchmarking tools, onboarding paths.",
              "Beyond reading the site—book, buy, log in, download, apply, etc.",
            )}
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
            label={L("Measured success indicators", "How will you measure success?")}
            htmlFor="success_metrics"
            hint={L(
              "SQL volume, funnel velocity, AOV/ACV deltas, churn, SLA reductions—anything with baselines appreciated.",
              "Numbers or signals you care about—more enquiries, faster bookings, lower bounce rate, etc.",
            )}
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
            label={L("Mission-critical screens & sections", "Pages and main sections")}
            htmlFor="pages_needed"
            hint={L(
              "Think IA: marketing, logged-in dashboards, gated resources, internationalized hubs, etc.",
              "List the pages or areas you need—Home, About, Services, Contact, Shop, Login, etc.",
            )}
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
            label={L("Production readiness for words & visuals", "Where is your written content?")}
            hint={L(
              "Helps staffing writers, motion, and approvals.",
              "Helps us plan writing and design support.",
            )}
            fieldName="content_status"
            options={getContentStatusOptions(mode, CONTENT_STATUS_OPTIONS)}
            error={errors.content_status}
          />

          <CheckboxList
            label={L("Flagship UX / CMS capabilities", "Important features")}
            hint={L(
              "Select every materially important surface area—the detail box captures specialty asks.",
              "Tick what you need. Add unusual requests in the next box.",
            )}
            name="features_selected"
            options={FEATURES_OPTIONS}
            optionLabel={optLbl}
          />

          <FieldGroup
            label={L("Functional depth & tooling", "Extra feature detail")}
            htmlFor="features_detail"
            hint={L(
              "Edge flows, calculators, multilingual governance, SSO, experimentation stack, etc.",
              "Special flows, calculators, languages, logins, or anything not covered above.",
            )}
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
            label={L("Brand system maturity", "Brand materials")}
            hint={L(
              "Guides how much discovery vs. expression work precedes UI.",
              "Tells us how much brand work happens before we design pages.",
            )}
            fieldName="branding_status"
            options={getBrandingStatusOptions(mode, BRANDING_OPTIONS)}
            error={errors.branding_status}
          />

          <FieldGroup
            label={L("Voice + visual personality", "Look and tone")}
            htmlFor="brand_personality"
            hint={L(
              "Adjectives, cultural references, guardrails (never sound X, always feel Y).",
              "Words that describe your style—modern, warm, bold—and anything to avoid.",
            )}
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
            label={L("Experiences you admire", "Websites you like")}
            htmlFor="liked_websites"
            hint={L(
              "URLs plus a sentence each on what to emulate (motion, density, clarity of story).",
              "Paste links and say what you like about each (layout, colours, speed, tone).",
            )}
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
            label={L("Experiences to avoid", "Websites or styles to avoid")}
            htmlFor="disliked_websites"
            hint={L(
              "Competitor clichés, tacky patterns, compliance landmines—call them out.",
              "Examples or patterns you do not want on your site.",
            )}
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
            label={L("Domain posture", "Your domain name")}
            hint={L(
              "Impacts launch sequencing and SEO migrations.",
              "Whether you already own the web address and if it is ready to connect.",
            )}
            fieldName="domain_status"
            options={getDomainOptions(mode, DOMAIN_OPTIONS)}
            error={errors.domain_status}
          />

          <SelectInput
            id="hosting_status"
            label={L("Hosting & operations comfort", "Website hosting")}
            hint={L(
              "Helps us pair you with the right stack + support contracts.",
              "Where the site should live and who should manage servers and updates.",
            )}
            fieldName="hosting_status"
            options={getHostingOptions(mode, HOSTING_OPTIONS)}
            error={errors.hosting_status}
          />

          <SelectInput
            id="platform_preference"
            label={L("Platform bias (if any)", "Preferred platform (optional)")}
            hint={L(
              "We can still challenge assumptions—this frames research depth.",
              "If you have a preference (WordPress, Webflow, Shopify, etc.) say so—or choose not sure.",
            )}
            fieldName="platform_preference"
            options={getPlatformOptions(mode, PLATFORM_OPTIONS)}
            error={errors.platform_preference}
          />

          <CheckboxList
            label={L(
              "Integrations we should architect for on day one",
              "Tools the site should connect to",
            )}
            hint={L(
              "Integrations are tools your website may need to connect with—like Stripe, Calendly, Mailchimp, or a CRM. Select what applies, or choose “Not sure” for guidance later.",
              "Tick tools you use or plan to use—payments, email, CRM, bookings. Choose “Not sure” if you want advice.",
            )}
            name="integrations_selected"
            options={INTEGRATIONS_OPTIONS}
            optionLabel={optLbl}
          />

          <FieldGroup
            label={L("Integration nuance & auth models", "More on tools and logins")}
            htmlFor="integrations_detail"
            hint={L(
              "API ownership, sandboxes, compliance, rate limits, legacy SOAP—free-form detail welcome.",
              "Accounts, logins, who owns each tool, or anything unusual we should know.",
            )}
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
            label={L("Tone of voice", "How you want to sound")}
            htmlFor="tone_of_voice"
            hint={L(
              "Editorial posture: confident vs. academic, playful vs. sober, inclusive language notes.",
              "Friendly, formal, bold, calm—whatever fits your brand.",
            )}
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
            label={L("Non-negotiable proof points / POV", "Key messages")}
            htmlFor="key_messages"
            hint={L(
              "Claims that must survive legal review, mission statements, category POV.",
              "Headlines or points that must appear—or legal lines we should not cross.",
            )}
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
            label={L("Primary offers & CTAs", "Offers and calls to action")}
            htmlFor="offers"
            hint={L(
              "Book consult, request demo, download benchmark, apply for program—link to pricing philosophy if sensitive.",
              "What you want people to do next—book, call, buy, download—and any pricing sensitivity.",
            )}
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
            label={L("Proof & social validation", "Testimonials and proof")}
            htmlFor="testimonials"
            hint={L(
              "Named logos, quantified outcomes, analyst quotes, community love—note any NDAs.",
              "Quotes, case studies, awards, logos—note if anything is confidential.",
            )}
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
            label={L("Trust, risk, and compliance guardrails", "Legal, privacy, and accessibility")}
            htmlFor="compliance_needs"
            hint={L(
              "Examples: HIPAA, FINRA, GDPR, accessibility (WCAG), industry regulators, or data residency. If you are unsure, use the button below or leave a short note—we will follow up.",
              "Any health, finance, privacy, or accessibility rules we must follow. If unsure, tap the shortcut below.",
            )}
            error={errors.compliance_needs}
          >
            <textarea
              id="compliance_needs"
              className={textareaClassName}
              {...register("compliance_needs")}
              rows={6}
            />
            <button
              type="button"
              className="mt-2 text-left text-xs font-semibold text-[color:color-mix(in_srgb,var(--color-accent)_90%,black)] underline-offset-4 hover:underline"
              onClick={() =>
                setValue("compliance_needs", "Not sure", {
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
            >
              Insert “Not sure”
            </button>
          </FieldGroup>
        </div>
      );
    case 8:
      return (
        <div className="space-y-6">
          <FieldGroup
            label={L("Product / web roadmap for the next 18–24 months", "Plans for the next year or two")}
            htmlFor="future_expansion"
            hint={L(
              "New geos, languages, revenue lines, community programs—helps us avoid painting into corners.",
              "New products, regions, languages, or features so we leave room to grow.",
            )}
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
            label={L("AI-assisted experiences on the radar", "AI features you might want")}
            hint={L(
              "We will not enable anything automatically—this shapes planning and guardrails. Select what interests you or choose “Not sure”.",
              "Nothing is switched on automatically—this only helps us plan. Choose “Not sure” if you want guidance.",
            )}
            name="ai_selected"
            options={AI_OPTIONS}
            optionLabel={optLbl}
          />

          <FieldGroup
            label={L("AI nuance, constraints, or vendor preferences", "More about AI (optional)")}
            htmlFor="ai_detail"
            hint={L(
              "Guardrails, opt-in policies, data retention, human-in-the-loop requirements.",
              "Privacy preferences, what AI should never do, or tools you prefer.",
            )}
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
            label={L("Budget allocation for this chapter", "Rough project budget")}
            hint={L(
              "Ranges are directional—helps triage sequencing and partner fit.",
              "Approximate range in AUD—helps us suggest a realistic path.",
            )}
            fieldName="budget_range"
            options={getBudgetOptions(mode, BUDGET_OPTIONS)}
            error={errors.budget_range}
          />

          <FieldGroup
            label={L("Desired launch window", "Target launch date (optional)")}
            htmlFor="deadline"
            hint={L(
              "Optional—choose a stakeholder-facing milestone or drop context in final notes instead.",
              "Pick a date if you have one—or explain timing in the final notes step.",
            )}
            error={errors.deadline}
          >
            <TextInput id="deadline" type="date" {...register("deadline")} />
          </FieldGroup>

          <SelectInput
            id="priority_level"
            label={L("Delivery tempo vs. depth", "Timeline priority")}
            hint={L(
              "Helps us balance polish against calendar pressure.",
              "Tell us if the date is flexible or fixed.",
            )}
            fieldName="priority_level"
            options={getPriorityOptions(mode, PRIORITY_OPTIONS)}
            error={errors.priority_level}
          />
        </div>
      );
    case 10:
      return (
        <div className="space-y-6">
          <FieldGroup
            label={L("Executive summary / final context", "Anything else we should know")}
            htmlFor="extra_notes"
            hint={L(
              "Links to briefs decks, stakeholder politics, blackout dates, procurement hurdles—anything you want leadership to absorb.",
              "Links, blackout dates, stakeholders, or context that did not fit elsewhere.",
            )}
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

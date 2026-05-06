import type { IntakeUxMode } from "@/components/intake/intake-ux-mode";
import { INTAKE_STEPS } from "@/components/intake/intake-schema";

type SelectChoice = {
  value: string;
  label: string;
  disabled?: boolean;
};

export function pickIntakeLine(
  mode: IntakeUxMode,
  lines: { technical: string; simple: string },
): string {
  return mode === "simple" ? lines.simple : lines.technical;
}

export function getIntakeStepHeader(mode: IntakeUxMode, stepIndex: number) {
  const step = INTAKE_STEPS[stepIndex];
  if (!step) {
    return { title: "", description: "" };
  }
  const id = step.id as (typeof INTAKE_STEPS)[number]["id"];
  const meta = STEP_HEADER_COPY[id];
  if (!meta) {
    return { title: step.title, description: step.description };
  }
  return {
    title: pickIntakeLine(mode, meta.title),
    description: pickIntakeLine(mode, meta.description),
  };
}

const STEP_HEADER_COPY: Record<
  string,
  { title: { technical: string; simple: string }; description: { technical: string; simple: string } }
> = {
  contact: {
    title: { technical: "Contact details", simple: "How we reach you" },
    description: {
      technical: "How we reach you about this project.",
      simple: "Your name and email so we can reply and confirm we received your brief.",
    },
  },
  business: {
    title: { technical: "Business core", simple: "About your business" },
    description: {
      technical: "Context about who you are and who you serve.",
      simple: "Help us understand what you do and who you help—in everyday words.",
    },
  },
  goals: {
    title: { technical: "Website goals", simple: "What you want the website to achieve" },
    description: {
      technical: "What success looks like when the site launches.",
      simple: "What should happen when the new site goes live? (Leads, sales, trust, etc.)",
    },
  },
  structure: {
    title: { technical: "Website structure", simple: "Pages and features" },
    description: {
      technical: "Pages, content readiness, and must-have features.",
      simple: "Rough list of pages, where your words/images are at, and any special features you need.",
    },
  },
  branding: {
    title: { technical: "Branding & design", simple: "Look, feel, and brand" },
    description: {
      technical: "Visual direction, references, and guardrails.",
      simple: "Your brand maturity, personality, and sites you like (or want to avoid).",
    },
  },
  tech: {
    title: { technical: "Tech & integrations", simple: "Domain, hosting, and tools" },
    description: {
      technical: "Infrastructure decisions and connected systems.",
      simple: "Your domain, where the site will live, and tools the site should connect to (optional).",
    },
  },
  content: {
    title: { technical: "Content & conversion", simple: "Messages and proof" },
    description: {
      technical: "Messaging, offers, and proof that drives action.",
      simple: "Tone of voice, key points, offers, and testimonials or success stories.",
    },
  },
  compliance: {
    title: { technical: "Trust & compliance", simple: "Rules and sensitive industries" },
    description: {
      technical: "Policies, industries, and legal considerations.",
      simple: "Any legal, privacy, or accessibility rules we should plan for.",
    },
  },
  future: {
    title: { technical: "Future expansion", simple: "Plans for later" },
    description: {
      technical: "Where the roadmap may take the experience next.",
      simple: "Anything you might add in the next year or two so we do not paint you into a corner.",
    },
  },
  budget: {
    title: { technical: "Budget & timeline", simple: "Budget and timing" },
    description: {
      technical: "Constraints that keep planning realistic.",
      simple: "Rough budget band and when you would like to launch (if you know).",
    },
  },
  notes: {
    title: { technical: "Final notes", simple: "Anything else" },
    description: {
      technical: "Anything else we should know before we review.",
      simple: "Loose ends, links, or context we should read before we respond.",
    },
  },
};

function mapChoices(
  base: readonly SelectChoice[],
  relabel: Record<string, { simple: string }>,
  mode: IntakeUxMode,
): SelectChoice[] {
  if (mode === "technical") {
    return [...base];
  }
  return base.map((row) => {
    const alt = row.value ? relabel[row.value] : undefined;
    if (!alt) {
      return row;
    }
    return { ...row, label: alt.simple };
  });
}

const CONTENT_SIMPLE: Record<string, { simple: string }> = {
  "": { simple: "Select an option" },
  "ready-copy": { simple: "Mostly written—small edits only" },
  "partial-gap": { simple: "Drafts exist—some gaps to fill" },
  "net-new": { simple: "We need help writing from scratch" },
  "unsure-content": { simple: "Not sure yet" },
};

const BRAND_SIMPLE: Record<string, { simple: string }> = {
  "": { simple: "Select an option" },
  "system-ready": { simple: "We have a full brand kit (logo, colours, fonts)" },
  "needs-refresh": { simple: "We have a brand but it needs a refresh" },
  "green-field": { simple: "We are starting branding from scratch" },
};

const DOMAIN_SIMPLE: Record<string, { simple: string }> = {
  "": { simple: "Select an option" },
  "owned-ready": { simple: "We own the domain and it is ready to use" },
  "owned-transfer": { simple: "We own domains but need help moving or merging them" },
  "need-buy": { simple: "We need help buying the right domain" },
  "unsure-domain": { simple: "Not sure—open to advice" },
  "not-sure": { simple: "Not sure" },
};

const HOSTING_SIMPLE: Record<string, { simple: string }> = {
  "": { simple: "Select an option" },
  "agency-managed": { simple: "We prefer the studio to manage hosting" },
  "existing-vendor": { simple: "We already have a host or vendor contract" },
  "need-guidance-hosting": { simple: "Open to recommendations" },
  "not-sure": { simple: "Not sure" },
};

const PLATFORM_SIMPLE: Record<string, { simple: string }> = {
  "": { simple: "Select an option" },
  open: { simple: "No strong preference—recommend for us" },
  wordpress: { simple: "WordPress" },
  webflow: { simple: "Webflow" },
  shopify: { simple: "Shopify (or similar shop platform)" },
  "headless-custom": { simple: "Custom / headless (developer-led)" },
  "not-sure": { simple: "Not sure" },
};

const PRIORITY_SIMPLE: Record<string, { simple: string }> = {
  "": { simple: "Select an option" },
  balanced: { simple: "Balance speed and quality" },
  "urgent-high": { simple: "Fast timeline—still want quality" },
  "deadline-hard": { simple: "Fixed launch date we cannot move" },
};

const BUDGET_SIMPLE: Record<string, { simple: string }> = {
  "": { simple: "Choose a budget band" },
  "under-25k-usd": { simple: "Under ~$25k USD total" },
  "25k-55k-usd": { simple: "~$25k–$55k USD total" },
  "55k-115k-usd": { simple: "~$55k–$115k USD total" },
  "115k-plus-usd": { simple: "~$115k USD and up" },
};

export function getContentStatusOptions(
  mode: IntakeUxMode,
  base: readonly SelectChoice[],
): SelectChoice[] {
  return mapChoices(base, CONTENT_SIMPLE, mode);
}

export function getBrandingStatusOptions(mode: IntakeUxMode, base: readonly SelectChoice[]) {
  return mapChoices(base, BRAND_SIMPLE, mode);
}

export function getDomainOptions(mode: IntakeUxMode, base: readonly SelectChoice[]) {
  return mapChoices(base, DOMAIN_SIMPLE, mode);
}

export function getHostingOptions(mode: IntakeUxMode, base: readonly SelectChoice[]) {
  return mapChoices(base, HOSTING_SIMPLE, mode);
}

export function getPlatformOptions(mode: IntakeUxMode, base: readonly SelectChoice[]) {
  return mapChoices(base, PLATFORM_SIMPLE, mode);
}

export function getPriorityOptions(mode: IntakeUxMode, base: readonly SelectChoice[]) {
  return mapChoices(base, PRIORITY_SIMPLE, mode);
}

export function getBudgetOptions(mode: IntakeUxMode, base: readonly SelectChoice[]) {
  return mapChoices(base, BUDGET_SIMPLE, mode);
}

/** Checkbox rows: same stored value, friendlier visible label in simple mode. */
export function checklistDisplayLabel(mode: IntakeUxMode, option: string): string {
  if (mode === "technical") {
    return option;
  }
  return (
    CHECKLIST_SIMPLE[option] ??
    option.replace(/\s*\/\s*/g, " · ").replace(/\bCMS\b/g, "content editor")
  );
}

const CHECKLIST_SIMPLE: Record<string, string> = {
  "Web design": "Web design",
  "Web development / engineering": "Web development (coding & build)",
  "E-commerce": "Online shop / e-commerce",
  "Brand identity": "Brand identity (logo & visuals)",
  "SEO / content marketing": "SEO & content marketing",
  "Ongoing support & care plan": "Ongoing care & updates after launch",
  "Blog / resources hub": "Blog or resources section",
  "CMS to edit pages in-house": "Easy in-house page editing",
  "Booking or scheduling": "Booking or scheduling",
  "Member / customer portal": "Member or customer login area",
  "Global search": "Site-wide search",
  "Multi-language / localization": "Multiple languages",
  "Newsletter capture & automation hooks": "Newsletter signup & email tools",
  "CRM (HubSpot, Salesforce, Pipedrive, etc.)": "CRM (customer records)",
  "Payments (Stripe, PayPal, etc.)": "Taking payments online",
  "Marketing automation (Klaviyo, Mailchimp, etc.)": "Marketing email tools",
  "Analytics (GA4, Matomo, etc.)": "Analytics (visitor stats)",
  "Single sign-on / directory (Okta, Google Workspace)": "Single sign-on (work login)",
  "Not sure": "Not sure",
  "AI-assisted site search": "AI-powered site search",
  "AI chat / triage for visitors": "AI chat for visitors",
  "Drafting support for long-form pages": "AI help drafting long pages",
  "Translation or localization assist": "AI help with translation",
};

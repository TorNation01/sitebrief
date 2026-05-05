import type { WebsiteIntakeRow } from "@/types/database";
import type { InternalPriceEstimateV1 } from "@/types/price-estimate";

export const INTERNAL_PRICE_ESTIMATE_CURRENCY = "AUD" as const;

type ReasonLine = InternalPriceEstimateV1["reasoning"][number];

const BASIC_ADD = { min: 300, max: 800 } as const;
const ADVANCED_ADD = { min: 1000, max: 5000 } as const;

type PageTier = {
  label: string;
  minAud: number;
  maxAud: number;
};

const PAGE_TIER_LANDING: PageTier = {
  label: "Simple Landing Page",
  minAud: 750,
  maxAud: 1_500,
};
const PAGE_TIER_STANDARD: PageTier = {
  label: "Standard Business Website",
  minAud: 1_500,
  maxAud: 3_500,
};
const PAGE_TIER_GROWTH: PageTier = {
  label: "Growth Website",
  minAud: 3_500,
  maxAud: 7_500,
};
const PAGE_TIER_ADVANCED: PageTier = {
  label: "Advanced Custom Platform",
  minAud: 15_000,
  maxAud: 50_000,
};

const ECOMMERCE_STRUCTURAL_BAND: PageTier = {
  label: "E-commerce Website",
  minAud: 5_000,
  maxAud: 12_000,
};

const PORTAL_STRUCTURAL_BAND: PageTier = {
  label: "Membership / Portal Website",
  minAud: 8_000,
  maxAud: 20_000,
};

export function formatEstimateAud(n: number): string {
  return n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
}

function corpusFromIntake(record: WebsiteIntakeRow): string {
  const chunks = [
    record.business_summary,
    record.services,
    record.pages_needed,
    record.website_goal,
    record.desired_actions,
    record.features_needed,
    record.integrations_needed,
    record.ai_features,
    record.future_expansion,
    record.compliance_needs,
    record.extra_notes,
    record.priority_level,
  ];
  return chunks.filter(Boolean).join("\n").toLowerCase();
}

/** Best-effort page count for pricing heuristics. */
export function estimatePageCount(record: WebsiteIntakeRow): { count: number; note: string } {
  const raw = `${record.pages_needed ?? ""}`;
  const t = raw.toLowerCase().trim();

  if (!t.length) {
    return { count: 5, note: "No page list supplied—defaulted to ~5 pages pending discovery." };
  }

  const range = t.match(/(\d+)\s*[-–to]+\s*(\d+)/);
  if (range) {
    const hi = Math.max(Number.parseInt(range[1], 10), Number.parseInt(range[2], 10));
    return {
      count: Number.isFinite(hi) ? hi : 5,
      note: `Parsed a page band from the brief (high end ${hi}).`,
    };
  }

  const plusPages = t.match(/(\d+)\s*\+\s*pages?/);
  if (plusPages) {
    const n = Number.parseInt(plusPages[1], 10);
    return { count: Number.isFinite(n) ? Math.max(n, 1) : 5, note: `"${n}+ pages" language detected.` };
  }

  const pagesDigit = t.match(/(\d+)\s*pages?\b/);
  if (pagesDigit) {
    const n = Number.parseInt(pagesDigit[1], 10);
    return { count: Number.isFinite(n) ? Math.max(n, 1) : 5, note: `"${n} pages" explicit count.` };
  }

  if (/\b(landing|splash|single\s*page|one\s*page|1\s*page)\b/.test(t)) {
    return { count: 1, note: 'Landing / single-page positioning called out explicitly.' };
  }

  const bullets = (raw.match(/•|\u2022/gu) ?? []).length;
  if (bullets >= 3) {
    const capped = Math.min(Math.max(bullets, 3), 20);
    return { count: capped, note: `Checklist bullets suggest ~${capped} templated surfaces (validate in workshop).` };
  }

  return { count: 5, note: "Ambiguous IA description—assume ~5 until refined." };
}

function tierFromPages(count: number): PageTier & { rationale: string } {
  if (count <= 1) {
    return { ...PAGE_TIER_LANDING, rationale: `${count} page aligns with landing-page economics.` };
  }
  if (count <= 5) {
    return { ...PAGE_TIER_STANDARD, rationale: `${count} pages fall in the 2–5 page standard-business band.` };
  }
  if (count <= 10) {
    return { ...PAGE_TIER_GROWTH, rationale: `${count} pages fall in the 6–10 growth band.` };
  }
  return { ...PAGE_TIER_ADVANCED, rationale: `${count} pages signals 11+ advanced / multi-surface choreography.` };
}

function pickSuggestedTier(params: {
  pages: number;
  ecommerce: boolean;
  authenticatedPortal: boolean;
  complexity: InternalPriceEstimateV1["complexity"];
  maxAud: number;
}): string {
  if (params.complexity === "Enterprise" || params.maxAud >= 42_500) {
    return PAGE_TIER_ADVANCED.label;
  }
  if (params.authenticatedPortal) {
    return PORTAL_STRUCTURAL_BAND.label;
  }
  if (params.ecommerce) {
    return ECOMMERCE_STRUCTURAL_BAND.label;
  }
  if (params.pages >= 11) {
    return PAGE_TIER_ADVANCED.label;
  }
  if (params.pages >= 6) {
    return PAGE_TIER_GROWTH.label;
  }
  if (params.pages >= 2) {
    return PAGE_TIER_STANDARD.label;
  }
  return PAGE_TIER_LANDING.label;
}

function buildRedFlags(
  record: WebsiteIntakeRow,
  corpus: string,
  pages: number,
  ecommerce: boolean,
  midpoint: number,
  estimateMax: number,
): string[] {
  const flags: string[] = [];

  if (!`${record.pages_needed ?? ""}`.trim()) {
    flags.push("Page inventory is empty—confirm IA before binding a fixed quote.");
  }

  if (pages >= 10 && !ecommerce && !corpus.includes("cms")) {
    flags.push("Large IA without explicit CMS/editorial workflow called out—probe maintainability expectations.");
  }

  if (record.deadline) {
    const due = Date.parse(`${record.deadline}T00:00:00`);
    if (!Number.isNaN(due)) {
      const days = (due - Date.now()) / 86_400_000;
      if (days < 21 && estimateMax > 12_000) {
        flags.push("Aggressive calendar vs. high estimate—flag rush surcharges or descoping.");
      }
    }
  }

  if (/\bdeadline-hard\b/i.test(`${record.priority_level ?? ""}`) && estimateMax > 15_000) {
    flags.push('"Immovable date" + broad scope → align expectations on phased delivery or premium staffing.');
  }

  if (record.budget_range?.includes("under-25k") && estimateMax > 35_000) {
    flags.push("Client budget band skews lower than heuristic ceiling—budget reality check recommended.");
  }

  if (corpus.includes("hipaa") || corpus.includes("finra")) {
    flags.push("Regulated-sector language—engage compliance counsel + infra review early.");
  }

  if (estimateMax >= 35_000 && !record.integrations_needed?.trim()) {
    flags.push("High estimate yet integrations narrative is thin—stress-test data dependencies.");
  }

  return flags.slice(0, 8);
}

function addRange(reasoning: ReasonLine[], label: string, detail: string, minAdd: number, maxAdd: number): void {
  reasoning.push({
    label,
    detail,
    audMinAddon: minAdd,
    audMaxAddon: maxAdd,
  });
}

/** Admin-only heuristic estimate from stored intake answers. Never call from public surfaces. */
export function buildInternalPriceEstimate(
  intake: WebsiteIntakeRow,
  generatedAtIso = new Date().toISOString(),
): InternalPriceEstimateV1 {
  const corpus = corpusFromIntake(intake);
  const { count: pages, note: pageEstimateNote } = estimatePageCount(intake);
  const pageTier = tierFromPages(pages);

  const reasoning: ReasonLine[] = [
    {
      label: "Page-scope baseline",
      detail: `${pageTier.rationale} ${pageEstimateNote} Starting band ${formatEstimateAud(pageTier.minAud)}–${formatEstimateAud(pageTier.maxAud)}.`,
    },
  ];

  let minAud = pageTier.minAud;
  let maxAud = pageTier.maxAud;

  const ecommerce = /\b(e-?commerce|ecommerce|online store|shopify|woo\s*commerce|shopping cart|product catalog(?:ue)?|\bSKU\b|sell\s+online)\b/i.test(
    corpus,
  );

  const memberSurface =
    /\b(member\s*portal|customer\s*portal|client\s*portal|member\s*login|user\s*login|authenticate\s+(?:users|members)|\bsso\b|\boauth\b)\b/i.test(
      corpus,
    ) || /\bcustomer portal\b/i.test(`${intake.features_needed ?? ""}`);

  const dashboard =
    /\b(dashboard\b|analytics hub|seller portal|merchant portal|metrics hub|logged-?in home)\b/i.test(corpus) &&
    !/\bmarketing dashboard\b/i.test(corpus);

  const customAdmin = /\b(custom admin|staff portal|operations portal|back office|vendor portal|moderation\s*console)\b/i.test(
    corpus,
  );

  const apiHeavy = /\b(api integrations?|multiple apis|middleware|graphql|oauth flows?|real-?time sync|webhooks?)\b/i.test(
    corpus,
  );

  const booking =
    /\b(booking\b|appointment|scheduler|scheduling|calendly|acuity|simplybook)\b/i.test(corpus);

  const paymentsStandalone =
    !ecommerce &&
    /\b(stripe\b|paypal|payment gateway|hosted checkout|\btake\s*payments\b|\btransactions\b)\b/i.test(corpus);

  const aiTouch =
    /\b(ai\s*chat|chatbot|\bchat\s*agent\b|openai|vector store|embeddings|\bllm\b|generative)\b/i.test(corpus) ||
    /\bai\b/i.test(`${intake.ai_features ?? ""}`);

  const crm = /\b(crm\b|hubspot|salesforce|pipedrive|zoho\s*crm)\b/i.test(corpus);

  const emailMarketing =
    /\b(mailchimp|klaviyo|sendgrid|email automation|drip campaign|newsletter platform)\b/i.test(corpus);

  const blogCms = /\b(cms\b|content management|\bblog\b|edit pages|in-?house edits|page builder)\b/i.test(corpus);

  const multiLanguage = /\b(multi-?language|localization|localisation|translation workflow|\bi18n\b)\b/i.test(
    corpus,
  );

  const advancedSeo = /\b(technical seo|schema markup|structured data|advanced seo|core web vitals program)\b/i.test(
    corpus,
  );

  const complianceHeavy =
    /\b(hipaa|gdpr|finra|pci-?dss|ada\b|wcag|accessibility audit|privacy program)\b/i.test(corpus) ||
    /\bcompliance\b/i.test(`${intake.compliance_needs ?? ""}`);

  const brandingGreenField =
    `${intake.branding_status ?? ""}`.includes("green-field") ||
    /\b(from scratch|no brand|brand strategy|foundational brand)\b/i.test(corpus);

  const copyHeavy =
    ["net-new", "partial-gap", "unsure-content", "need-guidance"].some((slug) =>
      `${intake.content_status ?? ""}`.includes(slug),
    ) || /\bcopywriting\b|\bwriters?\b|\bcontent strategy\b/i.test(corpus);

  if (ecommerce) {
    const prevMin = minAud;
    const prevMax = maxAud;
    minAud = Math.max(minAud, ECOMMERCE_STRUCTURAL_BAND.minAud);
    maxAud = Math.max(maxAud, ECOMMERCE_STRUCTURAL_BAND.maxAud);
    addRange(
      reasoning,
      "E-commerce structural alignment",
      `Commerce inventory / checkout signals → minimums aligned with ${ECOMMERCE_STRUCTURAL_BAND.label} economics before add-ons.`,
      Math.max(minAud - prevMin, 0),
      Math.max(maxAud - prevMax, 0),
    );
    addRange(
      reasoning,
      "E-commerce delivery load",
      "Catalog QA, tax/shipping edge cases, transactional mail, and payment hardening typically stack on top.",
      2_500,
      8_000,
    );
    minAud += 2_500;
    maxAud += 8_000;
  }

  const portalStructural =
    memberSurface ||
    /\b(seller|merchant|vendor|operations)\s*portal\b/i.test(corpus) ||
    (Boolean(dashboard) && apiHeavy);

  if (portalStructural) {
    const prevMin = minAud;
    const prevMax = maxAud;
    minAud = Math.max(minAud, PORTAL_STRUCTURAL_BAND.minAud);
    maxAud = Math.max(maxAud, PORTAL_STRUCTURAL_BAND.maxAud);
    addRange(
      reasoning,
      "Authenticated / portal alignment",
      `Member or high-trust portal signals → minimums aligned with ${PORTAL_STRUCTURAL_BAND.label} economics.`,
      Math.max(minAud - prevMin, 0),
      Math.max(maxAud - prevMax, 0),
    );
  }

  if (booking) {
    addRange(
      reasoning,
      "Booking / scheduling",
      `Specialist flows + reminders + ICS / staffing rules — heuristic add ${formatEstimateAud(BASIC_ADD.min)}–${formatEstimateAud(BASIC_ADD.max)}.`,
      BASIC_ADD.min,
      BASIC_ADD.max,
    );
    minAud += BASIC_ADD.min;
    maxAud += BASIC_ADD.max;
  }

  if (paymentsStandalone) {
    addRange(
      reasoning,
      "Standalone payments capture",
      "Hosted checkout or invoicing without full merchandising scope.",
      BASIC_ADD.min,
      BASIC_ADD.max,
    );
    minAud += BASIC_ADD.min;
    maxAud += BASIC_ADD.max;
  }

  if (crm) {
    addRange(
      reasoning,
      "CRM handshake",
      "Field mapping, automation guardrails, sandbox sign-off.",
      BASIC_ADD.min,
      BASIC_ADD.max,
    );
    minAud += BASIC_ADD.min;
    maxAud += BASIC_ADD.max;
  }

  if (emailMarketing) {
    addRange(
      reasoning,
      "Email marketing integration",
      "List capture, double opt-in, ESP governance.",
      BASIC_ADD.min,
      BASIC_ADD.max,
    );
    minAud += BASIC_ADD.min;
    maxAud += BASIC_ADD.max;
  }

  if (blogCms) {
    addRange(
      reasoning,
      "Blog / CMS",
      "Editorial components, permissions, training collateral.",
      BASIC_ADD.min,
      BASIC_ADD.max,
    );
    minAud += BASIC_ADD.min;
    maxAud += BASIC_ADD.max;
  }

  if (multiLanguage) {
    addRange(
      reasoning,
      "Localization",
      "IA duplication, translation workflow, QA matrix.",
      BASIC_ADD.min,
      BASIC_ADD.max,
    );
    minAud += BASIC_ADD.min;
    maxAud += BASIC_ADD.max;
  }

  if (advancedSeo) {
    addRange(
      reasoning,
      "Advanced SEO program",
      "Technical remediation + instrumentation beyond baseline meta tags.",
      ADVANCED_ADD.min,
      ADVANCED_ADD.max,
    );
    minAud += ADVANCED_ADD.min;
    maxAud += ADVANCED_ADD.max;
  } else if (/\bseo\b/.test(corpus)) {
    addRange(
      reasoning,
      "SEO enhancements",
      "Baseline improvements + tracking guidance.",
      BASIC_ADD.min,
      BASIC_ADD.max,
    );
    minAud += BASIC_ADD.min;
    maxAud += BASIC_ADD.max;
  }

  if (complianceHeavy || /\blegal pages\b|privacy policy|terms of service|cookie consent\b/i.test(corpus)) {
    addRange(
      reasoning,
      "Compliance / legal surfacing",
      "Policy templates, consent UX, counsel loops.",
      BASIC_ADD.min,
      BASIC_ADD.max,
    );
    minAud += BASIC_ADD.min;
    maxAud += BASIC_ADD.max;
  }

  if (memberSurface && !dashboard) {
    addRange(
      reasoning,
      "Member authentication (no dashboard yet)",
      "Accounts, password flows, onboarding — lighter than full analytics surfaces.",
      2_000,
      7_000,
    );
    minAud += 2_000;
    maxAud += 7_000;
  }

  if (dashboard) {
    addRange(
      reasoning,
      "Dashboard / logged-in UX",
      "Data pulls, charts, authorization, responsive parity.",
      3_000,
      10_000,
    );
    minAud += 3_000;
    maxAud += 10_000;
  }

  if (customAdmin) {
    addRange(
      reasoning,
      "Custom operations console",
      "Role-based tooling beyond stock CMS affordances.",
      ADVANCED_ADD.min,
      ADVANCED_ADD.max,
    );
    minAud += ADVANCED_ADD.min;
    maxAud += ADVANCED_ADD.max;
  }

  if (apiHeavy || /\bintegrations?\b/.test(corpus)) {
    addRange(
      reasoning,
      "API / integration choreography",
      "Auth, monitoring, failure handling, sandbox burn-down.",
      1_500,
      8_000,
    );
    minAud += 1_500;
    maxAud += 8_000;
  }

  if (aiTouch) {
    addRange(
      reasoning,
      "AI-assisted surface",
      "Guardrails, inference spend, moderation workflow.",
      2_000,
      10_000,
    );
    minAud += 2_000;
    maxAud += 10_000;
  }

  if (brandingGreenField) {
    addRange(
      reasoning,
      "Branding from scratch",
      "Discovery → palette / type system before UI lock.",
      800,
      3_000,
    );
    minAud += 800;
    maxAud += 3_000;
  }

  if (copyHeavy) {
    addRange(
      reasoning,
      "Copywriting / narrative debt",
      "Interviews, rewrites, stakeholder sign-off runway.",
      500,
      3_000,
    );
    minAud += 500;
    maxAud += 3_000;
  }

  maxAud = Math.max(maxAud, minAud);

  const midpoint = (minAud + maxAud) / 2;

  const scopeHits =
    Number(booking) +
    Number(paymentsStandalone) +
    Number(crm) +
    Number(emailMarketing) +
    Number(blogCms) +
    Number(multiLanguage) +
    Number(apiHeavy) +
    Number(aiTouch) +
    Number(customAdmin) +
    Number(dashboard);

  let complexity: InternalPriceEstimateV1["complexity"] = "Low";
  if (midpoint > 42_500 || (apiHeavy && customAdmin && pages >= 12)) {
    complexity = "Enterprise";
  } else if (ecommerce || dashboard || (memberSurface && dashboard) || maxAud > 18_000) {
    complexity = "High";
  } else if (pages >= 6 || scopeHits >= 3 || midpoint > 6_500) {
    complexity = "Medium";
  }

  const authenticatedPortal = memberSurface && dashboard;

  const suggestedTier = pickSuggestedTier({
    pages,
    ecommerce,
    authenticatedPortal,
    complexity,
    maxAud,
  });

  let timeline: string;
  if (authenticatedPortal || customAdmin || pages >= 12) {
    timeline = "8–16+ weeks (authenticated / operations tooling + stabilization)";
  } else if (ecommerce || dashboard || apiHeavy) {
    timeline = "4–8 weeks (commerce, data surfaces, or API hardening)";
  } else if (pages >= 6) {
    timeline = "3–6 weeks (multi-template build + reviews)";
  } else if (pages >= 2) {
    timeline = "1–3 weeks (standard marketing site cadence)";
  } else {
    timeline = "3–7 days (single-surface sprint — copy + approvals dependent)";
  }

  let deposit: InternalPriceEstimateV1["deposit"];
  if (complexity === "Enterprise") {
    deposit = {
      mode: "milestones",
      note: "Enterprise estimate — use milestone invoices (design / build / launch) rather than a single deposit %.",
    };
  } else {
    const pct = midpoint < 3_500 ? 50 : midpoint < 12_000 ? 40 : 30;
    deposit = {
      mode: "percent",
      percent: pct,
      note: `${pct}% deposit per studio policy for ${midpoint < 3_500 ? "small" : midpoint < 12_000 ? "medium" : "large"} engagements.`,
      audRangeAppliedToMinMax: {
        depositMinAud: Math.round(minAud * (pct / 100)),
        depositMaxAud: Math.round(maxAud * (pct / 100)),
      },
    };
  }

  const redFlags = buildRedFlags(intake, corpus, pages, ecommerce, midpoint, maxAud);

  return {
    version: 1,
    currency: INTERNAL_PRICE_ESTIMATE_CURRENCY,
    generatedAt: generatedAtIso,
    suggestedTier,
    priceRangeAud: { min: minAud, max: maxAud },
    complexity,
    reasoning,
    deposit,
    timeline,
    redFlags,
  };
}

/** Plain-text / markdown friendly block for clipboard export. */
export function formatInternalPriceEstimateForCopy(estimate: InternalPriceEstimateV1, businessName: string): string {
  const lines: string[] = [
    `# Internal price estimate — ${businessName}`,
    ``,
    `**INTERNAL ONLY — not for client distribution**`,
    ``,
    `- Currency: ${estimate.currency}`,
    `- Generated: ${estimate.generatedAt}`,
    `- Suggested tier: ${estimate.suggestedTier}`,
    `- Range: ${formatEstimateAud(estimate.priceRangeAud.min)} – ${formatEstimateAud(estimate.priceRangeAud.max)}`,
    `- Complexity: ${estimate.complexity}`,
    `- Timeline guidance: ${estimate.timeline}`,
    ``,
    `## Deposit`,
    estimate.deposit.mode === "percent" && estimate.deposit.audRangeAppliedToMinMax
      ? `- ${estimate.deposit.percent}% — ${estimate.deposit.note}\n- Indicative deposit range: ${formatEstimateAud(estimate.deposit.audRangeAppliedToMinMax.depositMinAud)} – ${formatEstimateAud(estimate.deposit.audRangeAppliedToMinMax.depositMaxAud)}`
      : `- ${estimate.deposit.note}`,
    ``,
    `## Reasoning`,
    ...estimate.reasoning.map((row) => {
      const dollars =
        row.audMinAddon != null && row.audMaxAddon != null
          ? ` (+${formatEstimateAud(row.audMinAddon)} – ${formatEstimateAud(row.audMaxAddon)})`
          : "";
      return `- **${row.label}**${dollars}: ${row.detail}`;
    }),
    ``,
    `## Red flags / discovery prompts`,
    ...(estimate.redFlags.length ? estimate.redFlags.map((f) => `- ${f}`) : ["- None auto-detected — still sanity-check live."]),
    ``,
  ];
  return lines.join("\n");
}

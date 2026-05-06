import type { WebsiteIntakeRow } from "@/types/database";
import type {
  InternalPriceEstimateV1,
  InternalPriceEstimateV2,
  InternalPriceFactorScore,
  InternalPriceTierDefinition,
  StoredInternalPriceEstimate,
} from "@/types/price-estimate";
import { INTERNAL_PRICE_TIER_DEFINITIONS } from "@/types/price-estimate";

export const INTERNAL_PRICE_ESTIMATE_CURRENCY = "AUD" as const;

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
    return { count: 1, note: "Landing / single-page positioning called out explicitly." };
  }

  const bullets = (raw.match(/•|\u2022/gu) ?? []).length;
  if (bullets >= 3) {
    const capped = Math.min(Math.max(bullets, 3), 20);
    return { count: capped, note: `Checklist bullets suggest ~${capped} templated surfaces (validate in workshop).` };
  }

  return { count: 5, note: "Ambiguous IA description—assume ~5 until refined." };
}

function countBulletLines(text: string | null | undefined): number {
  const raw = `${text ?? ""}`.trim();
  if (!raw.length) {
    return 0;
  }
  return (raw.match(/•|\u2022/gu) ?? []).length;
}

function factor(
  factorKey: InternalPriceFactorScore["factorKey"],
  points: 1 | 2 | 3,
  label: string,
  rationale: string,
): InternalPriceFactorScore {
  return { factorKey, points, label, rationale };
}

function gradePages(count: number, pageNote: string): InternalPriceFactorScore {
  if (count <= 3) {
    return factor("pages", 1, "1–3 pages", `${count} page(s). ${pageNote}`);
  }
  if (count <= 8) {
    return factor("pages", 2, "4–8 pages", `${count} pages. ${pageNote}`);
  }
  return factor("pages", 3, "9+ pages", `${count} pages. ${pageNote}`);
}

function gradeContent(record: WebsiteIntakeRow, corpus: string): InternalPriceFactorScore {
  const slug = `${record.content_status ?? ""}`.trim();
  if (slug === "ready-copy") {
    return factor(
      "content",
      1,
      "Client provides all",
      "Content status: copy drafted and largely ready.",
    );
  }
  if (slug === "partial-gap" || slug === "unsure-content") {
    return factor(
      "content",
      2,
      "Needs restructuring",
      slug === "partial-gap"
        ? "Drafts exist but key sections remain open."
        : "Direction unclear—expect restructuring and guidance.",
    );
  }
  if (slug === "net-new") {
    return factor("content", 3, "Needs creation", "Net-new positioning and narratives required.");
  }
  if (/\bcopywriting\b|\bwriters?\b|\bcontent strategy\b/i.test(corpus)) {
    return factor("content", 3, "Needs creation", "Corpus signals substantive copy / strategy work.");
  }
  if (/\b(restructure|reorganize|migrate content)\b/i.test(corpus)) {
    return factor("content", 2, "Needs restructuring", "Inferred restructuring language in free text.");
  }
  return factor(
    "content",
    2,
    "Needs restructuring",
    "No explicit content status—assume moderate editorial shaping until workshop.",
  );
}

function gradeBranding(record: WebsiteIntakeRow, corpus: string): InternalPriceFactorScore {
  const slug = `${record.branding_status ?? ""}`.trim();
  if (slug === "system-ready") {
    return factor("branding", 1, "Has brand kit", "Full brand guidelines and assets in place.");
  }
  if (slug === "needs-refresh") {
    return factor("branding", 2, "Needs refinement", "Existing brand with modernization goals.");
  }
  if (slug === "green-field") {
    return factor("branding", 3, "Starting from zero", "No formal brand—foundational strategy before UI lock.");
  }
  if (/\b(from scratch|no brand|brand strategy|foundational brand)\b/i.test(corpus)) {
    return factor("branding", 3, "Starting from zero", "Inferred green-field branding from narrative.");
  }
  return factor(
    "branding",
    2,
    "Needs refinement",
    "Brand maturity not selected—assume some refinement work.",
  );
}

function gradeFeatures(
  corpus: string,
  flags: {
    ecommerce: boolean;
    memberSurface: boolean;
    dashboard: boolean;
    customAdmin: boolean;
    apiHeavy: boolean;
    booking: boolean;
    paymentsStandalone: boolean;
    aiTouch: boolean;
    blogCms: boolean;
    emailMarketing: boolean;
    multiLanguage: boolean;
  },
): InternalPriceFactorScore {
  const {
    ecommerce,
    memberSurface,
    dashboard,
    customAdmin,
    apiHeavy,
    booking,
    paymentsStandalone,
    aiTouch,
    blogCms,
    emailMarketing,
    multiLanguage,
  } = flags;

  const tier3 =
    dashboard ||
    customAdmin ||
    apiHeavy ||
    aiTouch ||
    (memberSurface && dashboard) ||
    (ecommerce && (apiHeavy || customAdmin || dashboard));

  if (tier3) {
    return factor(
      "features",
      3,
      "Custom logic / APIs / dashboards",
      "Logged-in data surfaces, custom operations tooling, heavy API choreography, or AI-assisted flows detected.",
    );
  }

  const tier2 =
    ecommerce ||
    memberSurface ||
    blogCms ||
    booking ||
    paymentsStandalone ||
    emailMarketing ||
    multiLanguage ||
    /\b(cms\b|authentication|login|sso|oauth|stripe|paypal|checkout)\b/i.test(corpus);

  if (tier2) {
    return factor(
      "features",
      2,
      "CMS / auth / payments",
      "Commerce, member/auth flows, CMS/editorial, booking, payments capture, marketing automation, or localization scope.",
    );
  }

  return factor(
    "features",
    1,
    "Static / forms only",
    "Marketing-style site with forms-led conversion—no CMS, commerce, or app-style surface detected.",
  );
}

function gradeIntegrations(record: WebsiteIntakeRow, corpus: string): InternalPriceFactorScore {
  const bullets = countBulletLines(record.integrations_needed);
  const hasNotSureOnly =
    bullets === 1 && /\bnot sure\b/i.test(`${record.integrations_needed ?? ""}`);

  const effectiveBullets = hasNotSureOnly ? 0 : bullets;

  const corpusHits = [
    /\b(crm\b|hubspot|salesforce|pipedrive)\b/i.test(corpus),
    /\b(stripe|paypal|payment gateway|checkout)\b/i.test(corpus),
    /\b(mailchimp|klaviyo|sendgrid)\b/i.test(corpus),
    /\b(booking|calendly|acuity|scheduler)\b/i.test(corpus),
    /\b(api integrations?|webhooks?|graphql|middleware)\b/i.test(corpus),
    /\b(zapier|make\.com|integromat)\b/i.test(corpus),
  ].filter(Boolean).length;

  const integrationScore = Math.max(effectiveBullets, corpusHits >= 3 ? 3 : corpusHits);

  if (integrationScore >= 3) {
    return factor(
      "integrations",
      3,
      "3+ (CRM / booking / custom)",
      `~${Math.max(integrationScore, 3)} integration signals (checkboxes + narrative).`,
    );
  }
  if (integrationScore === 2) {
    return factor(
      "integrations",
      2,
      "1–2 (e.g. Stripe, email)",
      "Two distinct systems or equivalent narrative depth.",
    );
  }
  if (integrationScore === 1) {
    return factor(
      "integrations",
      2,
      "1–2 (e.g. Stripe, email)",
      "Single named integration or light automation hook.",
    );
  }
  return factor(
    "integrations",
    1,
    "None / basic",
    "No integration checklist and no strong third-party coupling in text (analytics-only counts as basic).",
  );
}

function tierFromTotalScore(total: number): InternalPriceTierDefinition {
  const hit = INTERNAL_PRICE_TIER_DEFINITIONS.find(
    (row) => total >= row.scoreRange.min && total <= row.scoreRange.max,
  );
  if (hit) {
    return hit;
  }
  if (total < 5) {
    return INTERNAL_PRICE_TIER_DEFINITIONS[0];
  }
  return INTERNAL_PRICE_TIER_DEFINITIONS[INTERNAL_PRICE_TIER_DEFINITIONS.length - 1];
}

function buildRedFlags(
  record: WebsiteIntakeRow,
  corpus: string,
  pages: number,
  ecommerce: boolean,
  priceMax: number,
  totalScore: number,
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
      if (days < 14 && priceMax >= 3_500) {
        flags.push("Tight calendar vs. tier—flag rush surcharges or descoping.");
      }
    }
  }

  if (/\bdeadline-hard\b/i.test(`${record.priority_level ?? ""}`) && priceMax >= 7_000) {
    flags.push('"Immovable date" + upper tiers → align on phased delivery or premium staffing.');
  }

  if (record.budget_range?.includes("under-25k") && totalScore >= 11 && priceMax >= 3_500) {
    flags.push("Stated budget band is modest versus Professional / Custom score—confirm budget or descope before quoting.");
  }

  if (corpus.includes("hipaa") || corpus.includes("finra")) {
    flags.push("Regulated-sector language—engage compliance counsel + infra review early.");
  }

  if (priceMax >= 7_000 && !record.integrations_needed?.trim()) {
    flags.push("Custom tier yet integrations narrative is thin—stress-test data dependencies.");
  }

  return flags.slice(0, 8);
}

/** Admin-only tiered AUD estimate from intake answers. Never call from public surfaces. */
export function buildInternalPriceEstimate(
  intake: WebsiteIntakeRow,
  generatedAtIso = new Date().toISOString(),
): InternalPriceEstimateV2 {
  const corpus = corpusFromIntake(intake);
  const { count: pages, note: pageEstimateNote } = estimatePageCount(intake);

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

  const booking = /\b(booking\b|appointment|scheduler|scheduling|calendly|acuity|simplybook)\b/i.test(corpus);

  const paymentsStandalone =
    !ecommerce &&
    /\b(stripe\b|paypal|payment gateway|hosted checkout|\btake\s*payments\b|\btransactions\b)\b/i.test(corpus);

  const aiTouch =
    /\b(ai\s*chat|chatbot|\bchat\s*agent\b|openai|vector store|embeddings|\bllm\b|generative)\b/i.test(corpus) ||
    /\bai\b/i.test(`${intake.ai_features ?? ""}`);

  const emailMarketing =
    /\b(mailchimp|klaviyo|sendgrid|email automation|drip campaign|newsletter platform)\b/i.test(corpus);

  const blogCms = /\b(cms\b|content management|\bblog\b|edit pages|in-?house edits|page builder)\b/i.test(corpus);

  const multiLanguage = /\b(multi-?language|localization|localisation|translation workflow|\bi18n\b)\b/i.test(corpus);

  const pagesFactor = gradePages(pages, pageEstimateNote);
  const featuresFactor = gradeFeatures(corpus, {
    ecommerce,
    memberSurface,
    dashboard,
    customAdmin,
    apiHeavy,
    booking,
    paymentsStandalone,
    aiTouch,
    blogCms,
    emailMarketing,
    multiLanguage,
  });
  const contentFactor = gradeContent(intake, corpus);
  const brandingFactor = gradeBranding(intake, corpus);
  const integrationsFactor = gradeIntegrations(intake, corpus);

  const totalScore =
    pagesFactor.points +
    featuresFactor.points +
    contentFactor.points +
    brandingFactor.points +
    integrationsFactor.points;

  const def = tierFromTotalScore(totalScore);
  const redFlags = buildRedFlags(intake, corpus, pages, ecommerce, def.priceMaxAud, totalScore);

  const tierSnapshot: InternalPriceEstimateV2["tier"] = {
    name: def.name,
    scoreRange: { ...def.scoreRange },
    priceMinAud: def.priceMinAud,
    priceMaxAud: def.priceMaxAud,
    priceMaxIsOpenEnded: def.name === "Custom",
    deliveryEstimate: def.deliveryEstimate,
  };

  return {
    version: 2,
    currency: INTERNAL_PRICE_ESTIMATE_CURRENCY,
    generatedAt: generatedAtIso,
    tier: tierSnapshot,
    totalScore,
    scoreBreakdown: {
      pages: pagesFactor,
      features: featuresFactor,
      content: contentFactor,
      branding: brandingFactor,
      integrations: integrationsFactor,
    },
    priceRangeAud: { min: def.priceMinAud, max: def.priceMaxAud },
    redFlags,
  };
}

/** Plain-text / markdown friendly block for clipboard export. */
export function formatInternalPriceEstimateForCopy(estimate: InternalPriceEstimateV2, businessName: string): string {
  const b = estimate.scoreBreakdown;
  const t = estimate.tier;
  const lines: string[] = [
    `# Internal price estimate — ${businessName}`,
    ``,
    `**INTERNAL ONLY — not for client distribution**`,
    ``,
    `- Currency: ${estimate.currency}`,
    `- Generated: ${estimate.generatedAt}`,
    `- Tier: **${t.name}** (score band ${t.scoreRange.min}–${t.scoreRange.max}, actual total ${estimate.totalScore} / 15)`,
    `- Range: ${formatEstimateAud(t.priceMinAud)} – ${formatEstimateAud(t.priceMaxAud)}${t.priceMaxIsOpenEnded ? " (may exceed — validate in workshop)" : ""}`,
    `- Delivery estimate: ${t.deliveryEstimate}`,
    ``,
    `## Score breakdown (1–3 pts each)`,
    `- **Pages** (${b.pages.points}): ${b.pages.label} — ${b.pages.rationale}`,
    `- **Features** (${b.features.points}): ${b.features.label} — ${b.features.rationale}`,
    `- **Content** (${b.content.points}): ${b.content.label} — ${b.content.rationale}`,
    `- **Branding** (${b.branding.points}): ${b.branding.label} — ${b.branding.rationale}`,
    `- **Integrations** (${b.integrations.points}): ${b.integrations.label} — ${b.integrations.rationale}`,
    ``,
    `## Red flags / discovery prompts`,
    ...(estimate.redFlags.length ? estimate.redFlags.map((f) => `- ${f}`) : ["- None auto-detected — still sanity-check live."]),
    ``,
  ];
  return lines.join("\n");
}

function formatInternalPriceEstimateV1ForCopy(estimate: InternalPriceEstimateV1, businessName: string): string {
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

/** Clipboard / markdown export for whichever estimate version is stored. */
export function formatStoredInternalPriceEstimateForCopy(
  estimate: StoredInternalPriceEstimate,
  businessName: string,
): string {
  return estimate.version === 2
    ? formatInternalPriceEstimateForCopy(estimate, businessName)
    : formatInternalPriceEstimateV1ForCopy(estimate, businessName);
}

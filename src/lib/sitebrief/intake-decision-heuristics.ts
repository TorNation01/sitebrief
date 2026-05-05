import type { WebsiteIntakeRow } from "@/types/database";
import type { InternalPriceEstimateV1 } from "@/types/price-estimate";

export type RecommendedAction = "reject" | "follow_up" | "quote" | "fast_track";

export type SuggestedNextStep = "ask_clarifying" | "send_proposal" | "jump_on_call" | "start_build";

export type RiskIndicator = "budget_too_low" | "scope_unclear" | "missing_info";

export type IntakeDecisionResult = {
  recommendedAction: RecommendedAction;
  suggestedNextStep: SuggestedNextStep;
  risks: RiskIndicator[];
  /** Short rationales for the reviewer (never shown on public surfaces here). */
  signals: string[];
};

const AUD_PER_USD = 1.55;

/** Rough maximum communicated budget ceiling in AUD from intake slug (heuristic). */
function budgetCeilingAudFromSlug(slug: string | null | undefined): number | null {
  const s = slug?.trim() ?? "";
  if (!s) {
    return null;
  }
  if (s.includes("under-25k")) {
    return Math.round(25_000 * AUD_PER_USD);
  }
  if (s.includes("25k-55k")) {
    return Math.round(55_000 * AUD_PER_USD);
  }
  if (s.includes("55k-115k")) {
    return Math.round(115_000 * AUD_PER_USD);
  }
  if (s.includes("115k-plus")) {
    return Math.round(250_000 * AUD_PER_USD);
  }
  return null;
}

function nz(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function wordCount(value: string): number {
  return nz(value).split(/\s+/).filter(Boolean).length;
}

function corpus(intake: WebsiteIntakeRow): string {
  return [
    intake.business_summary,
    intake.services,
    intake.website_goal,
    intake.desired_actions,
    intake.pages_needed,
    intake.features_needed,
    intake.integrations_needed,
    intake.ai_features,
    intake.extra_notes,
    intake.priority_level,
  ]
    .map(nz)
    .join("\n")
    .toLowerCase();
}

/**
 * Lightweight triage readout for admins. Outputs are advisory and not persisted.
 */
export function computeIntakeDecisionPanel(
  intake: WebsiteIntakeRow,
  estimate: InternalPriceEstimateV1 | null,
): IntakeDecisionResult {
  const risks: RiskIndicator[] = [];
  const signals: string[] = [];

  const goal = nz(intake.website_goal);
  const pages = nz(intake.pages_needed);
  const features = nz(intake.features_needed);
  const summary = nz(intake.business_summary);
  const corp = corpus(intake);
  const budgetSlug = nz(intake.budget_range);

  const ceilingAud = budgetCeilingAudFromSlug(budgetSlug);

  const thinGoal = goal.length < 36 || wordCount(goal) < 14;
  const thinArchitecture =
    pages.length < 12 && wordCount(pages) < 8 && features.length < 12 && wordCount(features) < 10;
  const noOverview = summary.length === 0;

  if (thinGoal || (thinArchitecture && thinGoal)) {
    risks.push("missing_info");
    signals.push(
      thinGoal ? "Website goal is thin versus the depth we'd expect before quoting." : "IA/features fields are skeletal.",
    );
  }
  if (noOverview && wordCount(goal) < 35) {
    risks.push("missing_info");
    signals.push("Business overview is blank and mandate text stays compressed.");
  }

  const vagueHits = /\b(not sure|tbd|don't know|do not know|unsure|figure it out later|you tell us)\b/i;
  let vagueScore = 0;
  [
    intake.website_goal,
    intake.pages_needed,
    intake.features_needed,
    intake.budget_range,
    intake.success_metrics,
  ]
    .map(nz)
    .forEach((chunk) => {
      if (vagueHits.test(chunk)) {
        vagueScore += 1;
      }
    });
  if (vagueScore >= 2 || (vagueScore >= 1 && thinArchitecture)) {
    risks.push("scope_unclear");
    signals.push(
      vagueScore >= 2
        ? "Multiple answers lean heavily on exploratory phrasing."
        : "Structural scope cues conflict with exploratory language.",
    );
  }

  if (estimate) {
    const minAud = estimate.priceRangeAud.min;
    const aggregatedRed = `${estimate.timeline}\n${estimate.redFlags.join("\n")}`;

    let budgetMisaligned =
      ceilingAud !== null &&
      minAud > ceilingAud * (budgetSlug.includes("under-25k") ? 1.06 : budgetSlug.includes("25k-55k") ? 1.08 : 1.1);

    if (/\bbudget\b.*(reality check|skew|ceiling)/i.test(aggregatedRed)) {
      budgetMisaligned = true;
    }

    if (budgetMisaligned) {
      risks.push("budget_too_low");
      signals.push(
        ceilingAud !== null
          ? `Estimated minimum (${minAud.toLocaleString()} AUD) clears the client's stated ceiling (~${ceilingAud.toLocaleString()} AUD).`
          : `Estimated minimum (${minAud.toLocaleString()} AUD) clashes with communicated budget framing.`,
      );
    }
  } else if (
    budgetSlug.includes("under-25k") &&
    /\b(member|portal|e-?commerce|marketplace|multi-?tenant|saas|subscription)\b/i.test(corp)
  ) {
    risks.push("budget_too_low");
    signals.push("Low budget band overlaps with heavyweight product vocabulary (no estimate yet).");
  }

  const uniqueRisks: RiskIndicator[] = [];
  for (const r of risks) {
    if (!uniqueRisks.includes(r)) {
      uniqueRisks.push(r);
    }
  }

  const has = (r: RiskIndicator) => uniqueRisks.includes(r);
  const chaos =
    uniqueRisks.length >= 3 ||
    (has("budget_too_low") && has("missing_info") && has("scope_unclear")) ||
    (has("budget_too_low") && has("scope_unclear"));

  let recommendedAction: RecommendedAction;
  if (chaos) {
    recommendedAction = "reject";
    signals.push("Stacked negatives—prefer a reset call or politely decline.");
  } else if (has("missing_info")) {
    recommendedAction = "follow_up";
  } else if (has("budget_too_low")) {
    recommendedAction = "follow_up";
  } else if (has("scope_unclear")) {
    recommendedAction = "follow_up";
  } else {
    const premiumBudget = budgetSlug.includes("115k-plus") || budgetSlug.includes("55k-115k");
    const urgency = /\bdeadline-hard\b/i.test(`${intake.priority_level}`) || /\b(days?|weeks?)\s+until\b/i.test(corp);
    const depthOk = wordCount(goal) >= 28 && wordCount(`${pages}\n${features}`) >= 28;

    if (premiumBudget && depthOk && urgency) {
      recommendedAction = "fast_track";
      signals.push("Investment band plus narrative density and urgency read decision-ready.");
    } else if (depthOk || premiumBudget) {
      recommendedAction = "quote";
      signals.push(
        premiumBudget ? "Investment band supports a fuller commercial response." : "Scope narrative cohesive enough for a formal estimate.",
      );
    } else {
      recommendedAction = "follow_up";
      signals.push("Mostly tidy—one more conversational pass unlocks estimating confidence.");
    }
  }

  let suggestedNextStep: SuggestedNextStep;
  if (recommendedAction === "reject") {
    suggestedNextStep = "jump_on_call";
  } else if (has("missing_info")) {
    suggestedNextStep = "ask_clarifying";
  } else if (has("scope_unclear")) {
    suggestedNextStep = "ask_clarifying";
  } else if (recommendedAction === "fast_track") {
    suggestedNextStep = "start_build";
  } else if (recommendedAction === "quote") {
    suggestedNextStep = "send_proposal";
  } else if (has("budget_too_low")) {
    suggestedNextStep = "jump_on_call";
  } else {
    suggestedNextStep = "jump_on_call";
  }

  if (!signals.length) {
    signals.push("Neutral baseline from intake prose—manual review always wins.");
  }

  return {
    recommendedAction,
    suggestedNextStep,
    risks: uniqueRisks,
    signals: signals.slice(0, 8),
  };
}

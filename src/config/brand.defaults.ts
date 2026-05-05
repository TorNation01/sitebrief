/**
 * Default branding when environment variables are unset.
 * Overrides: see `.env.example` (`NEXT_PUBLIC_SITEBRIEF_*` plus `SITEBRIEF_NOTIFICATION_EMAIL`).
 */
export const BRAND_DEFAULTS = {
  appName: "SiteBrief",
  /** Parent studio (sidebar + provenance lines). */
  studioDisplayName: "Anakatech",
  taglineFooter:
    "Standalone website briefing from Anakatech—premium, calm, and fast for clients and delivery teams alike.",
  metaDescriptionShort:
    "SiteBrief is a standalone Anakatech technology: an elegant guided website brief that feels premium and moves fast—goals, scope, and preferences in one place.",
  /** Filename slug for exports (`{slug}-business-intake-id.md`). */
  exportSlug: "sitebrief",
  accentHex: "#c9a962",
  accentHoverHex: "#e0c97f",
} as const;

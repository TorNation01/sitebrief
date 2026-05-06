/**
 * Default branding when environment variables are unset.
 * Overrides: see `.env.example` (`NEXT_PUBLIC_SITEBRIEF_*` plus `SITEBRIEF_NOTIFICATION_EMAIL`).
 */
export const BRAND_DEFAULTS = {
  appName: "SiteBrief",
  /** Parent studio (sidebar + provenance lines). */
  studioDisplayName: "Anakatech",
  taglineFooter:
    "A guided website brief from Anakatech—capture goals, scope, and preferences in one calm flow for your team and ours.",
  metaDescriptionShort:
    "Turn your website idea into a clear build plan in minutes: one smart brief, zero jargon overload, and a faster path from goals to launch. Tap through—your next site deserves a head start.",
  /** Filename slug for exports (`{slug}-business-intake-id.md`). */
  exportSlug: "sitebrief",
  accentHex: "#c9a962",
  accentHoverHex: "#e0c97f",
} as const;

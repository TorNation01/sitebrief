/**
 * Default branding when environment variables are unset.
 * Overrides: see `.env.example` (`NEXT_PUBLIC_SITEBRIEF_*` plus `SITEBRIEF_NOTIFICATION_EMAIL`).
 */
export const BRAND_DEFAULTS = {
  appName: "SiteBrief",
  /** Sidebar / admin operating name (agency, pod, or company). */
  studioDisplayName: "Your studio",
  taglineFooter: "Client intake for custom website builds.",
  metaDescriptionShort:
    "Capture detailed website briefs from clients and turn them into structured, Cursor-ready build prompts.",
  /** Filename slug for exports (`{slug}-business-intake-id.md`). */
  exportSlug: "sitebrief",
  accentHex: "#c9a962",
  accentHoverHex: "#d9bc78",
} as const;

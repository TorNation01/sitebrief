import { BRAND_DEFAULTS } from "@/config/brand.defaults";

function nonempty(value: string | undefined): string | undefined {
  const t = value?.trim();
  return t?.length ? t : undefined;
}

function parseAccentHex(raw: string | undefined): string | null {
  const t = nonempty(raw);
  if (!t) {
    return null;
  }
  let h = t.startsWith("#") ? t.slice(1) : t;
  if (h.length === 3) {
    h = [...h].map((c) => `${c}${c}`).join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    return null;
  }
  return `#${h.toLowerCase()}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = parseAccentHex(hex);
  if (!normalized) {
    return null;
  }
  const h = normalized.slice(1);
  const n = Number.parseInt(h, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

/** Mix accent toward white for a hover token */
function lightenTowardWhite(hex: string, fraction: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return BRAND_DEFAULTS.accentHoverHex;
  }
  const t = Math.min(1, Math.max(0, fraction));
  const r = Math.round(rgb.r + (255 - rgb.r) * t);
  const g = Math.round(rgb.g + (255 - rgb.g) * t);
  const b = Math.round(rgb.b + (255 - rgb.b) * t);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Safe public URL/path for `<img src>` — relative paths or absolute http(s). */
export function normalizeLogoSrc(raw: string | undefined): string | null {
  const t = nonempty(raw);
  if (!t) {
    return null;
  }
  if (t.startsWith("/")) {
    return t;
  }
  try {
    const parsed = new URL(t);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.href;
    }
  } catch {
    /* fallthrough */
  }
  return null;
}

/** Public hostname from `NEXT_PUBLIC_SITE_URL`, for footer / provenance labels. */
export function getPublicSiteHostname(): string | null {
  const raw = nonempty(process.env.NEXT_PUBLIC_SITE_URL);
  if (!raw?.startsWith("http")) {
    return null;
  }
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

export type ResolvedPublicBrand = {
  appName: string;
  studioDisplayName: string;
  taglineFooter: string;
  metaDescription: string;
  logoUrl: string | null;
  accent: string;
  accentHover: string;
  exportSlug: string;
};

/**
 * Resolved brand for UI + metadata (`NEXT_PUBLIC_SITEBRIEF_*`).
 * Safe in Server Components and in Client Components (env inlined at build).
 */
export function getPublicBrand(): ResolvedPublicBrand {
  const appName =
    nonempty(process.env.NEXT_PUBLIC_SITEBRIEF_APP_NAME) ??
    nonempty(process.env.NEXT_PUBLIC_APP_NAME) ??
    BRAND_DEFAULTS.appName;
  const studioDisplayName =
    nonempty(process.env.NEXT_PUBLIC_SITEBRIEF_STUDIO_DISPLAY_NAME) ??
    nonempty(process.env.NEXT_PUBLIC_BRAND_OWNER) ??
    BRAND_DEFAULTS.studioDisplayName;
  const taglineFooter =
    nonempty(process.env.NEXT_PUBLIC_SITEBRIEF_SITE_TAGLINE) ?? BRAND_DEFAULTS.taglineFooter;
  const metaDescription =
    nonempty(process.env.NEXT_PUBLIC_SITEBRIEF_META_DESCRIPTION) ?? BRAND_DEFAULTS.metaDescriptionShort;

  const logoUrl =
    normalizeLogoSrc(process.env.NEXT_PUBLIC_SITEBRIEF_LOGO_URL) ??
    normalizeLogoSrc(process.env.NEXT_PUBLIC_SITEBRIEF_LOGO_SRC);

  const accentParsed = parseAccentHex(process.env.NEXT_PUBLIC_SITEBRIEF_ACCENT);
  const accent = accentParsed ?? BRAND_DEFAULTS.accentHex;
  const hoverParsed = parseAccentHex(process.env.NEXT_PUBLIC_SITEBRIEF_ACCENT_HOVER);
  const accentHover = hoverParsed ?? lightenTowardWhite(accent, 0.14);

  let exportSlug: string = BRAND_DEFAULTS.exportSlug;
  const rawSlug = nonempty(process.env.NEXT_PUBLIC_SITEBRIEF_EXPORT_SLUG);
  if (rawSlug) {
    const cleaned = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 32);
    if (cleaned.length > 0) {
      exportSlug = cleaned;
    }
  }

  return {
    appName,
    studioDisplayName,
    taglineFooter,
    metaDescription,
    logoUrl,
    accent,
    accentHover,
    exportSlug,
  };
}

/**
 * CSS overrides for `:root` when accent env differs from shipped defaults.
 */
export function getBrandCssVars(): string | null {
  const touchedAccent = parseAccentHex(process.env.NEXT_PUBLIC_SITEBRIEF_ACCENT);
  const touchedHover = parseAccentHex(process.env.NEXT_PUBLIC_SITEBRIEF_ACCENT_HOVER);
  if (!touchedAccent && !touchedHover) {
    return null;
  }

  const b = getPublicBrand();
  return [`--color-accent: ${b.accent};`, `--color-accent-hover: ${b.accentHover};`].join(" ");
}

/**
 * Comma- or semicolon-separated admin inboxes for transactional alerts (`SITEBRIEF_NOTIFICATION_EMAIL`).
 */
export function parseNotificationEmailDestinations(): string[] {
  const raw = nonempty(process.env.SITEBRIEF_NOTIFICATION_EMAIL);
  if (!raw) {
    return [];
  }
  return raw
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Destination for notification / transactional email (planned server use only).
 */
export function getNotificationEmailDestination(): string | null {
  return nonempty(process.env.SITEBRIEF_NOTIFICATION_EMAIL) ?? null;
}

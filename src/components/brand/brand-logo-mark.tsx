import type { CSSProperties } from "react";

import { getPublicBrand } from "@/lib/sitebrief/brand";

type BrandLogoMarkProps = {
  /** Pixel height for the logo slot */
  logoHeightPx?: number;
  className?: string;
};

/**
 * Renders configurable logo (`NEXT_PUBLIC_SITEBRIEF_LOGO_URL`) or an accent pillar fallback.
 */
export function BrandLogoMark({ logoHeightPx = 28, className }: BrandLogoMarkProps) {
  const brand = getPublicBrand();
  const heightPx = Math.min(Math.max(logoHeightPx, 20), 40);
  const sizeStyle = { height: heightPx } satisfies CSSProperties;

  if (brand.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- white-label origins vary; avoids remotePatterns for every hostname
      <img
        src={brand.logoUrl}
        alt=""
        aria-hidden
        className={`w-auto max-w-[176px] object-contain object-left ${className ?? ""}`}
        style={sizeStyle}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`inline-block w-1 shrink-0 rounded-full bg-[var(--color-accent)] ${className ?? ""}`}
      style={{ width: 4, ...sizeStyle }}
    />
  );
}

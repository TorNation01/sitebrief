import { type ReactNode } from "react";

import Link from "next/link";

import { BrandLogoMark } from "@/components/brand/brand-logo-mark";
import { ButtonLink } from "@/components/ui/button";
import { getPublicBrand } from "@/lib/sitebrief/brand";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/intake", label: "Start brief" },
  { href: "/contact", label: "Contact" },
  { href: "/admin", label: "Admin" },
];

type SiteHeaderProps = {
  rightSlot?: ReactNode;
};

export function SiteHeader({ rightSlot }: SiteHeaderProps) {
  const brand = getPublicBrand();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[var(--color-surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 shrink-0"
          aria-label={`${brand.appName} home`}
        >
          <BrandLogoMark logoHeightPx={28} />
          <span className="truncate text-sm font-semibold tracking-tight text-white sm:text-base">
            {brand.appName}
          </span>
        </Link>
        <nav
          aria-label="Main"
          className="ml-auto flex items-center gap-1 sm:mr-0 sm:gap-2"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          {rightSlot}
          <ButtonLink
            href="/intake"
            variant="primary"
            className="ml-2 hidden sm:inline-flex"
          >
            New project
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}

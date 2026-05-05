import Link from "next/link";

import { getPublicBrand } from "@/lib/sitebrief/brand";

export function SiteFooter() {
  const brand = getPublicBrand();

  return (
    <footer className="border-t border-white/[0.08] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold text-white">{brand.appName}</p>
          <p className="mt-1 max-w-xl text-sm text-white/55">{brand.taglineFooter}</p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <Link
            href="/intake"
            className="text-white/60 transition-colors hover:text-[var(--color-accent)]"
          >
            Brief
          </Link>
          <Link
            href="/admin"
            className="text-white/60 transition-colors hover:text-[var(--color-accent)]"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}

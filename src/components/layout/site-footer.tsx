import Link from "next/link";

import { getPublicBrand, getPublicSiteHostname } from "@/lib/sitebrief/brand";

export function SiteFooter() {
  const brand = getPublicBrand();
  const host = getPublicSiteHostname();

  return (
    <footer className="border-t border-white/[0.08] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-base font-semibold text-white">{brand.appName}</p>
            <p className="text-base leading-relaxed text-white/65">{brand.taglineFooter}</p>
            <p className="text-sm leading-relaxed text-white/55">
              <strong className="font-semibold text-white/75">Paid work:</strong> Submitting this brief does not start
              billable work by itself. When you and {brand.studioDisplayName} agree a written scope or statement of work,
              services are invoiced as set out there.{" "}
              <strong className="font-semibold text-white/75">
                Generally, where agreed deliverables or time are provided, payment is due according to that contract and
                applicable law.
              </strong>{" "}
              If you are unsure what is in scope, confirm in writing before work proceeds.
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]/90">
              {brand.appName} · {brand.studioDisplayName}
              {host ? ` · ${host}` : ""}
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-col gap-4 text-base sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-3">
            <Link href="/intake" className="text-white/65 transition-colors hover:text-[var(--color-accent)]">
              Start brief
            </Link>
            <Link href="/legal/terms" className="text-white/65 transition-colors hover:text-[var(--color-accent)]">
              Terms &amp; Conditions
            </Link>
            <Link href="/legal/privacy" className="text-white/65 transition-colors hover:text-[var(--color-accent)]">
              Privacy notice
            </Link>
            <Link href="/admin" className="text-white/65 transition-colors hover:text-[var(--color-accent)]">
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

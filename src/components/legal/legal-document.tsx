import type { ReactNode } from "react";

import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";

type LegalDocumentProps = {
  title: string;
  intro: string;
  children: ReactNode;
};

/** Shared layout for public legal pages (marketing shell). */
export function LegalDocument({ title, intro, children }: LegalDocumentProps) {
  return (
    <div className="mx-auto max-w-3xl flex-1 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <ButtonLink href="/" variant="ghost" className="mb-8 border border-white/12 px-4 text-sm text-white/80">
        ← Home
      </ButtonLink>
      <article className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-xl shadow-black/30 sm:p-10">
        <h1 className="text-balance text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
        <p className="mt-4 text-base leading-relaxed text-white/70">{intro}</p>
        <div className="mt-10 space-y-6 text-base leading-relaxed text-white/78 [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h2]:first:mt-0 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </div>
        <p className="mt-12 text-sm text-white/50">
          These documents are informational and do not replace legal advice. For binding terms on a specific engagement,
          use your executed statement of work or contract.
        </p>
        <p className="mt-4">
          <Link href="/legal/privacy" className="text-sm font-semibold text-[var(--color-accent)] hover:underline">
            Privacy notice
          </Link>
          {" · "}
          <Link href="/legal/terms" className="text-sm font-semibold text-[var(--color-accent)] hover:underline">
            Terms &amp; Conditions
          </Link>
        </p>
      </article>
    </div>
  );
}

import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/contact-form";
import { getPublicBrand } from "@/lib/sitebrief/brand";

const brand = getPublicBrand();

export const metadata: Metadata = {
  title: "Contact",
  description: `Reach ${brand.studioDisplayName} about ${brand.appName}, new projects, or support.`,
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">Contact</p>
        <h1 className="text-balance text-3xl font-semibold text-white sm:text-4xl">Get in touch</h1>
        <p className="max-w-2xl text-base leading-relaxed text-white/70">
          Share a quick note and we will respond by email. For structured website scoping, the{" "}
          <a href="/intake" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
            intake brief
          </a>{" "}
          is still the fastest path to a build-ready plan.
        </p>
      </div>

      <div className="mt-12 rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-6 sm:p-10">
        <ContactForm />
      </div>
    </div>
  );
}

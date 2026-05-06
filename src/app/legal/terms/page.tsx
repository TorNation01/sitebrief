import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { getPublicBrand } from "@/lib/sitebrief/brand";

const brand = getPublicBrand();

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms of use for ${brand.appName} — the guided website briefing experience from ${brand.studioDisplayName}.`,
  openGraph: {
    title: `Terms · ${brand.appName}`,
    description: `Understand how ${brand.appName} may be used, what this briefing tool does and does not include, and how commercial work is governed separately.`,
  },
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms & Conditions"
      intro={`These Terms govern your use of the public ${brand.appName} website and briefing questionnaire operated by or on behalf of ${brand.studioDisplayName}. They do not replace a separate contract for paid design, development, or consulting services.`}
    >
      <h2>1. The briefing tool</h2>
      <p>
        {brand.appName} collects information you choose to submit through the guided form. Submitting a brief does not
        obligate either party to enter a paid engagement. {brand.studioDisplayName} may accept or decline projects in its
        sole discretion.
      </p>

      <h2>2. Commercial work and payment</h2>
      <p>
        Design, engineering, content, strategy, or other professional services are offered only under a separate written
        agreement (for example a proposal, statement of work, or master services agreement) with clear scope, fees, and
        payment milestones.{" "}
        <strong>
          Where work is performed under such an agreement, you agree to pay for deliverables and time incurred in
          accordance with that document and applicable law.
        </strong>{" "}
        If you have not signed or accepted a commercial agreement, do not assume that any build or launch commitment
        exists solely because you submitted this brief.
      </p>

      <h2>3. Accuracy of information</h2>
      <p>
        You are responsible for the accuracy of the information you provide. You confirm you have authority to share any
        business, brand, or customer details you include.
      </p>

      <h2>4. Acceptable use</h2>
      <p>
        You must not misuse the service, attempt unauthorized access, interfere with security, or submit unlawful,
        harassing, or malicious content. We may suspend access where reasonably necessary to protect the service or other
        users.
      </p>

      <h2>5. Intellectual property</h2>
      <p>
        You retain rights in materials you submit. You grant {brand.studioDisplayName} a limited licence to use your
        submission to evaluate fit, prepare proposals, and deliver agreed services. Unless otherwise agreed in writing,
        no transfer of ownership in {brand.studioDisplayName}&apos;s tools, templates, or pre-existing materials is implied.
      </p>

      <h2>6. Disclaimers</h2>
      <p>
        The public site and form are provided &quot;as is&quot; to the extent permitted by law. We do not guarantee
        uninterrupted availability or that every submission will receive a response within a particular timeframe.
      </p>

      <h2>7. Governing approach</h2>
      <p>
        Where mandatory consumer or small-business laws apply in your jurisdiction, those laws may prevail over parts of
        these Terms. For all other matters, the studio will look first to your executed commercial agreement; these Terms
        fill gaps only for use of this public briefing experience.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update these Terms from time to time. Material changes will be reflected on this page with an updated
        effective date where practicable.
      </p>

      <p className="text-sm text-white/55">
        <strong>Effective:</strong> May 2026 · Questions? Contact {brand.studioDisplayName} using the details published on
        your engagement or project correspondence.
      </p>
    </LegalDocument>
  );
}

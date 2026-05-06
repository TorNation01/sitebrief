import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { getPublicBrand } from "@/lib/sitebrief/brand";

const brand = getPublicBrand();

export const metadata: Metadata = {
  title: "Privacy notice",
  description: `How ${brand.appName} handles information you submit in the website briefing flow.`,
  openGraph: {
    title: `Privacy · ${brand.appName}`,
    description: `Plain-language summary of what ${brand.appName} collects in the briefing form, why it is used, and how long it may be kept.`,
  },
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy notice"
      intro={`This notice describes how ${brand.appName}—operated by or on behalf of ${brand.studioDisplayName}—handles personal and business information you submit through the public briefing questionnaire.`}
    >
      <h2>1. What we collect</h2>
      <p>
        When you use the brief, we collect the fields you complete (for example contact details, business description,
        goals, budget band, and free-text answers). Technical data such as IP-derived abuse signals may be processed
        where needed to run the service safely.
      </p>

      <h2>2. Why we use it</h2>
      <p>We use submissions to:</p>
      <ul>
        <li>Evaluate whether we can help and prepare a response or proposal;</li>
        <li>Operate, secure, and improve the briefing experience;</li>
        <li>Meet legal, accounting, or regulatory obligations where applicable.</li>
      </ul>

      <h2>3. Legal bases (where GDPR-style laws apply)</h2>
      <p>
        Depending on context we rely on performance of a contract (or steps prior to contract), legitimate interests in
        running a professional services studio (balanced against your rights), or consent where we expressly request
        it.
      </p>

      <h2>4. Sharing</h2>
      <p>
        We use service providers (such as hosting, email delivery, and database vendors) who process data on our
        instructions under appropriate agreements. We do not sell your personal information. We may disclose
        information if required by law or to protect rights, safety, or security.
      </p>

      <h2>5. Retention</h2>
      <p>
        Briefs are typically retained for as long as needed to pursue or manage an engagement and for legitimate business
        records (for example accounting or dispute resolution), unless a shorter period is agreed or required by law.
      </p>

      <h2>6. Security</h2>
      <p>
        We implement reasonable technical and organisational measures appropriate to the risk. No online transmission is
        completely secure; please avoid sharing highly sensitive secrets through the public form where a secure channel
        is available.
      </p>

      <h2>7. Your choices</h2>
      <p>
        Where applicable law grants access, correction, deletion, portability, or objection rights, you may contact us
        with your request. We will respond in line with legal timeframes. If you are only browsing and not submitting a
        brief, cookie or analytics details follow your browser settings and our host&apos;s documentation.
      </p>

      <h2>8. International transfers</h2>
      <p>
        If data is processed in countries other than your own, we use safeguards such as standard contractual clauses or
        equivalent mechanisms where required.
      </p>

      <h2>9. Children</h2>
      <p>This service is aimed at businesses and adults. It is not directed at children.</p>

      <h2>10. Updates</h2>
      <p>We may update this notice to reflect product, legal, or regulatory changes. Check this page periodically.</p>

      <p className="text-sm text-white/55">
        <strong>Effective:</strong> May 2026 · Data controller: {brand.studioDisplayName} (as identified in your
        project paperwork or public contact channels).
      </p>
    </LegalDocument>
  );
}

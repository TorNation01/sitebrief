"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type ClientMaterialsHandoffProps = {
  intakeId: string;
  businessName: string;
  clientEmail: string;
  /** First studio notification inbox, if configured */
  studioInbox: string | null;
};

function buildSubject(businessName: string, intakeId: string) {
  return `SiteBrief materials — ${businessName} — ref ${intakeId}`;
}

function buildEmailBody(intakeId: string, businessName: string, clientEmail: string) {
  return [
    `Project reference (include in subject line): ${intakeId}`,
    `Business: ${businessName}`,
    `Client contact email on file: ${clientEmail}`,
    ``,
    `Please attach or link:`,
    `- Brand pack (logos, colours, fonts, guidelines)`,
    `- Final or draft copy / images for key pages`,
    `- Shared drive or workspace link (view access is enough unless upload is required)`,
    ``,
    `Note: This brief form does not accept large file uploads. Use email or a shared folder the studio approves.`,
  ].join("\n");
}

export function ClientMaterialsHandoff({
  intakeId,
  businessName,
  clientEmail,
  studioInbox,
}: ClientMaterialsHandoffProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const subject = useMemo(() => buildSubject(businessName, intakeId), [businessName, intakeId]);
  const body = useMemo(
    () => buildEmailBody(intakeId, businessName, clientEmail),
    [intakeId, businessName, clientEmail],
  );

  const mailto = studioInbox
    ? `mailto:${studioInbox}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : null;

  async function copyRef() {
    try {
      await navigator.clipboard.writeText(intakeId);
      setCopied("ref");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  async function copyEmailTemplate() {
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${body}`);
      setCopied("template");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  return (
    <section className="rounded-[32px] border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.08] via-white/[0.02] to-transparent p-8 shadow-xl shadow-black/40">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
          Client materials
        </p>
        <h2 className="text-2xl font-semibold text-white">Brand packs, content, and shared folders</h2>
        <p className="max-w-3xl text-base leading-relaxed text-white/72">
          After you have engaged the client, use a clear project reference so files do not get mixed up. Ask them to
          email materials or share a Drive / Dropbox / Notion / workspace link. This app does not host large uploads;
          agree on a channel your studio already uses for file intake.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-black/30 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Brief reference (copy)</p>
          <p className="mt-3 break-all font-mono text-sm text-emerald-100/95">{intakeId}</p>
          <Button type="button" variant="secondary" className="mt-4 border border-white/15 text-white" onClick={() => void copyRef()}>
            {copied === "ref" ? "Copied" : "Copy reference ID"}
          </Button>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-black/30 p-5 space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Suggested email to client</p>
          <p className="text-sm text-white/70">
            Subject line pattern: <span className="font-semibold text-white">{subject}</span>
          </p>
          {mailto ? (
            <a
              href={mailto}
              className="inline-flex rounded-xl border border-[var(--color-accent)]/50 bg-[var(--color-accent)]/15 px-4 py-3 text-sm font-semibold text-[var(--color-accent-hover)] hover:bg-[var(--color-accent)]/25"
            >
              Open mail to studio inbox
            </a>
          ) : (
            <p className="text-sm text-amber-200/90">
              Set <span className="font-mono">SITEBRIEF_NOTIFICATION_EMAIL</span> on the server to enable one-click mail.
            </p>
          )}
          <Button type="button" variant="ghost" className="border border-white/12 text-white/85" onClick={() => void copyEmailTemplate()}>
            {copied === "template" ? "Copied template" : "Copy subject + body template"}
          </Button>
        </div>
      </div>

      <ul className="mt-8 list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/75">
        <li>Confirm the client knows the reference ID belongs to this submission.</li>
        <li>Prefer virus scanning and access expiry on shared links where your policy requires it.</li>
        <li>Do not request credentials in plain email; use your studio password manager or SSO flows.</li>
      </ul>
    </section>
  );
}

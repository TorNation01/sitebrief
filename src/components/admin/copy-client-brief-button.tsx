"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { composeClientBriefBundle } from "@/components/admin/client-brief-copy";
import type { ClientRow, WebsiteIntakeRow } from "@/types/database";

type CopyClientBriefButtonProps = {
  client: ClientRow;
  intake: WebsiteIntakeRow;
};

export function CopyClientBriefButton({ client, intake }: CopyClientBriefButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "blocked">("idle");
  const [pending, setPending] = useState(false);

  async function copy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setStatus("blocked");
      return;
    }

    setPending(true);
    try {
      await navigator.clipboard.writeText(composeClientBriefBundle(client, intake));
      setStatus("copied");
    } catch {
      setStatus("blocked");
    } finally {
      setPending(false);
    }

    setTimeout(() => setStatus("idle"), 2200);
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="secondary"
        className="w-full justify-between border border-[var(--color-accent)]/34 bg-white/[0.04] px-5 text-left text-sm text-white lg:w-auto"
        disabled={pending}
        onClick={() => void copy()}
      >
        <span>Copy dossier payload</span>
        <span aria-hidden>⧉</span>
      </Button>
      <p className="text-xs text-white/60">
        {status === "idle"
          ? "Marshals business, contact, mandate, and unstructured fields for Slack, Notion, or Loom context."
          : null}
        {status === "copied" ? "Clipboard synchronised—paste wherever your team collaborates." : null}
        {status === "blocked"
          ? "Browser blocked clipboard access. Manually select the relevant panel or enable secure context permissions."
          : null}
      </p>
    </div>
  );
}

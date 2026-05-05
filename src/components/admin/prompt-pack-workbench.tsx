"use client";

import { useMemo, useState } from "react";

import { regenerateCursorPromptPackAction } from "@/actions/admin-dashboard";
import { sanitizePromptPackFilename } from "@/lib/sitebrief/build-cursor-prompt-pack";
import { Button } from "@/components/ui/button";

type PromptPackWorkbenchProps = {
  intakeId: string;
  businessName: string;
  initialMarkdown: string | null | undefined;
};

export function PromptPackWorkbench({
  intakeId,
  businessName,
  initialMarkdown,
}: PromptPackWorkbenchProps) {
  const [markdown, setMarkdown] = useState(initialMarkdown?.trim() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "blocked">("idle");
  const [isSaving, setSaving] = useState(false);

  const hasPack = useMemo(() => markdown.trim().length > 0, [markdown]);
  const safeFilename = useMemo(
    () => `${sanitizePromptPackFilename(businessName, intakeId)}.md`,
    [businessName, intakeId],
  );

  async function runGenerator() {
    setError(null);
    setSaving(true);

    try {
      const response = await regenerateCursorPromptPackAction(intakeId);

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.markdown) {
        setMarkdown(response.markdown);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    if (!markdown.trim()) {
      return;
    }
    if (!navigator?.clipboard) {
      setCopyState("blocked");
      return;
    }

    try {
      await navigator.clipboard.writeText(markdown);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2400);
    } catch {
      setCopyState("blocked");
      setTimeout(() => setCopyState("idle"), 4200);
    }
  }

  function handleDownload() {
    if (!markdown.trim()) {
      return;
    }
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = safeFilename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-6 rounded-[36px] border border-white/[0.1] bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-8 shadow-2xl shadow-black/50">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
            Cursor synthesis
          </p>
          <h2 className="text-3xl font-semibold text-white">Structured prompt pack orchestration</h2>
          <p className="text-sm leading-relaxed text-white/70">
            Every section is composed from the raw intake payload — no synthetic filler. Generating overwrites
            the stored `generated_prompt_pack` column for this submission, so keep prior versions elsewhere if
            needed.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <Button
            type="button"
            variant="primary"
            className="w-full px-6 lg:w-auto"
            disabled={isSaving}
            onClick={() => void runGenerator()}
          >
            {isSaving ? "Synthesizing…" : "Generate Cursor Prompt Pack"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={!hasPack || isSaving}
            className="w-full border border-white/[0.22] px-6 text-white lg:w-auto disabled:opacity-30"
            onClick={() => void runGenerator()}
          >
            Regenerate
          </Button>
        </div>
      </div>

      {error ? (
        <div
          className="rounded-2xl border border-red-400/40 bg-red-950/50 px-5 py-4 text-sm leading-relaxed text-red-50"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex flex-col gap-4 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/45">Preview · live markdown</p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 px-5 text-white md:flex-none"
              disabled={!hasPack || isSaving}
              onClick={() => void handleCopy()}
            >
              Copy to clipboard
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1 border border-white/[0.22] px-5 text-white md:flex-none disabled:opacity-30"
              disabled={!hasPack || isSaving}
              onClick={handleDownload}
            >
              Download .md
            </Button>
          </div>
        </div>
        {copyState === "copied" ? (
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-400">Copied</p>
        ) : null}
        {copyState === "blocked" ? (
          <p className="text-xs text-amber-400">Clipboard unavailable in this context — select text manually.</p>
        ) : null}

        <textarea
          readOnly
          value={markdown}
          spellCheck={false}
          rows={24}
          aria-label="Generated Cursor prompt pack markdown"
          className="w-full resize-y rounded-[28px] border border-white/[0.12] bg-black/55 p-6 font-mono text-[13px] leading-relaxed text-white/90 shadow-inner shadow-black/40 outline-none ring-2 ring-transparent transition focus-visible:ring-[var(--color-accent)]"
        />
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { markdownToPlainForPdf } from "@/lib/sitebrief/markdown-plain-for-pdf";

type ExportFullPackToolbarProps = {
  markdown: string;
  fileStem: string;
  canExport: boolean;
};

export function ExportFullPackToolbar({ markdown, fileStem, canExport }: ExportFullPackToolbarProps) {
  const [clipboard, setClipboard] = useState<"idle" | "copied" | "blocked">("idle");
  const [busy, setBusy] = useState<"md" | "pdf" | null>(null);

  const handleCopy = useCallback(async () => {
    setClipboard("idle");
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setClipboard("blocked");
      return;
    }
    try {
      await navigator.clipboard.writeText(markdown);
      setClipboard("copied");
      window.setTimeout(() => setClipboard("idle"), 2000);
    } catch {
      setClipboard("blocked");
    }
  }, [markdown]);

  const handleDownloadMd = useCallback(() => {
    setBusy("md");
    try {
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${fileStem}-full-pack.md`;
      anchor.rel = "noopener";
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  }, [markdown, fileStem]);

  const handleDownloadPdf = useCallback(async () => {
    setBusy("pdf");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageH = doc.internal.pageSize.getHeight();
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 14;
      const maxW = pageW - margin * 2;
      let y = margin;
      const lineH = 5;
      const bottom = pageH - margin;

      const plain = markdownToPlainForPdf(markdown);
      const paras = plain.split(/\n\n+/);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 35);

      for (const para of paras) {
        const chunk = para.trim().replace(/\n/g, " ");
        if (!chunk.length) {
          y += lineH * 0.35;
          continue;
        }
        const wrapped = doc.splitTextToSize(chunk, maxW);
        for (const line of wrapped) {
          if (y + lineH > bottom) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += lineH;
        }
        y += lineH * 0.35;
      }

      doc.save(`${fileStem}-full-pack.pdf`);
    } finally {
      setBusy(null);
    }
  }, [markdown, fileStem]);

  return (
    <div className="space-y-4 border-t border-white/[0.08] pt-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/54">Export full client pack</p>
        <p className="mt-2 text-[11px] leading-relaxed text-white/52">
          Includes intake answers, stored prompt pack, internal price estimate, and reviewer notes.
        </p>
      </div>

      {!canExport ? (
        <div className="rounded-2xl border border-white/[0.1] bg-white/[0.03] px-4 py-5 text-sm leading-relaxed text-white/72">
          <p>
            Full pack export (copy, Markdown, PDF) is available on{" "}
            <span className="font-semibold text-white">Professional</span>.
          </p>
          <Link
            href="/admin/billing"
            className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)] hover:underline"
          >
            Plan & billing →
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full justify-center border border-white/[0.14] bg-white/[0.04] px-4 text-sm text-white"
              onClick={() => void handleCopy()}
            >
              Copy full pack
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy === "md"}
              className="w-full justify-center border border-white/[0.14] bg-white/[0.04] px-4 text-sm text-white disabled:opacity-50"
              onClick={() => handleDownloadMd()}
            >
              {busy === "md" ? "Preparing…" : "Download .md"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy === "pdf"}
              className="w-full justify-center border border-white/[0.14] bg-white/[0.04] px-4 text-sm text-white disabled:opacity-50"
              onClick={() => void handleDownloadPdf()}
            >
              {busy === "pdf" ? "Rendering…" : "Download PDF"}
            </Button>
          </div>

          <p className="text-[10px] leading-relaxed text-white/55">
            {clipboard === "copied"
              ? "Copied to clipboard."
              : clipboard === "blocked"
                ? "Clipboard unavailable in this browser context."
                : "PDF uses a compact plain-text layout derived from the same export."}
          </p>
        </>
      )}
    </div>
  );
}

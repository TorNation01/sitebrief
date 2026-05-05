"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { addSubmissionNoteAction } from "@/actions/admin-dashboard";
import { Button } from "@/components/ui/button";

type SubmissionNoteComposerProps = {
  intakeId: string;
};

const MAX_NOTE = 12_000;

export function SubmissionNoteComposer({ intakeId }: SubmissionNoteComposerProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function dispatch() {
    const trimmed = body.trim();
    if (!trimmed.length) {
      setError("Add some text before attaching a note.");
      return;
    }
    if (trimmed.length > MAX_NOTE) {
      setError(`Notes are limited to ${MAX_NOTE.toLocaleString()} characters.`);
      return;
    }

    setError(null);
    setPending(true);

    try {
      const form = new FormData();
      form.append("note", trimmed);
      const response = await addSubmissionNoteAction(intakeId, form);

      if (response.error) {
        setError(response.error);
      } else {
        setBody("");
        router.refresh();
      }
    } catch {
      setError("Saving the memo failed intermittently—wait a breath and retry.");
    } finally {
      setPending(false);
    }
  }

  const remaining = Math.max(0, MAX_NOTE - body.length);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.32em] text-white/55" htmlFor="note">
          Add contextual note for this audit trail
        </label>
        <textarea
          id="note"
          value={body}
          rows={6}
          onChange={(evt) => setBody(evt.target.value)}
          placeholder="Call outcomes, escalation risks, stakeholder politics, QA findings…"
          disabled={pending}
          maxLength={MAX_NOTE}
          aria-describedby="note-limit"
          className="w-full rounded-2xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none ring-2 ring-transparent transition focus-visible:ring-[var(--color-accent)] disabled:pointer-events-none disabled:opacity-50"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p id="note-limit" className="text-[11px] text-white/45">
          {remaining.toLocaleString()} characters remaining
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="primary"
          className="w-full px-10 sm:w-auto"
          aria-busy={pending}
          disabled={pending || body.trim().length === 0}
          onClick={() => void dispatch()}
        >
          {pending ? "Securing memo…" : "Append reviewer note"}
        </Button>
        <p className="text-[11px] leading-relaxed text-white/53">
          Notes inherit hardened row policies—clients never see these unless duplicated manually.
        </p>
      </div>
      {error ? (
        <p className="text-sm font-semibold text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

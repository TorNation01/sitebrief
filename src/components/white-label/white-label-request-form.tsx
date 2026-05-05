"use client";

import { useCallback, useState } from "react";

import { submitWhiteLabelRequestAction } from "@/actions/white-label-request";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function formatUnknownSubmitError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong—please retry.";
}

type WhiteLabelRequestFormProps = {
  supabaseConfigured: boolean;
};

export function WhiteLabelRequestForm({ supabaseConfigured }: WhiteLabelRequestFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [didSucceed, setDidSucceed] = useState(false);

  const onSubmitForm = useCallback(
    async (evt: React.FormEvent<HTMLFormElement>) => {
      evt.preventDefault();
      setSubmitError("");

      if (!supabaseConfigured) {
        setSubmitError(
          "This deployment cannot accept requests yet: Supabase keys are missing in the browser environment.",
        );
        return;
      }

      const form = evt.currentTarget;
      const fd = new FormData(form);
      const record: Record<string, string> = {};
      fd.forEach((value, key) => {
        record[key] = typeof value === "string" ? value : "";
      });

      setSubmitting(true);
      try {
        const outcome = await submitWhiteLabelRequestAction(record);
        if (!outcome.ok) {
          setSubmitError(outcome.error);
          return;
        }
        setDidSucceed(true);
        form.reset();
      } catch (err) {
        setSubmitError(formatUnknownSubmitError(err));
      } finally {
        setSubmitting(false);
      }
    },
    [supabaseConfigured],
  );

  if (didSucceed) {
    return (
      <Card tone="light" className="border-[var(--color-accent)]/25 bg-[color-mix(in_srgb,var(--color-accent)_5%,transparent)]">
        <p className="text-sm font-semibold text-zinc-900">Thanks — request received.</p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          We have logged your inquiry. Our team will follow up by email shortly.
        </p>
      </Card>
    );
  }

  return (
    <Card tone="light" title="Request white-label version" description="Brief details help us reply faster.">
      {!supabaseConfigured ? (
        <p className="mb-6 text-sm text-amber-800">
          Submission is unavailable in this preview: configure Supabase (<code>NEXT_PUBLIC_SUPABASE_*</code>).
        </p>
      ) : null}

      {submitError ? (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</p>
      ) : null}

      <form className="relative space-y-5" onSubmit={onSubmitForm}>
        <div className="space-y-2">
          <label htmlFor="wl-name" className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Your name *
          </label>
          <input
            id="wl-name"
            name="contact_name"
            required
            maxLength={200}
            autoComplete="name"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none ring-2 ring-transparent transition focus:border-zinc-300 focus:ring-[var(--color-accent)]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="wl-email" className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Email *
          </label>
          <input
            id="wl-email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none ring-2 ring-transparent transition focus:border-zinc-300 focus:ring-[var(--color-accent)]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="wl-org" className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Agency / business (optional)
          </label>
          <input
            id="wl-org"
            name="organization"
            maxLength={240}
            autoComplete="organization"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none ring-2 ring-transparent transition focus:border-zinc-300 focus:ring-[var(--color-accent)]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="wl-msg" className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Anything we should know? (optional)
          </label>
          <textarea
            id="wl-msg"
            name="message"
            rows={4}
            maxLength={4000}
            className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none ring-2 ring-transparent transition focus:border-zinc-300 focus:ring-[var(--color-accent)]"
          />
        </div>

        <input
          type="text"
          name="hp_company_url"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute h-px w-px -translate-x-[9999px] opacity-0"
        />

        <input
          type="text"
          name="hp_agency_size"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute h-px w-px -translate-x-[9999px] opacity-0"
        />

        <Button
          type="submit"
          variant="primary"
          disabled={submitting || !supabaseConfigured}
          className="w-full justify-center px-8 py-3 text-[15px] font-semibold sm:w-auto"
        >
          {submitting ? "Sending…" : "Request White-Label Version"}
        </Button>
      </form>
    </Card>
  );
}

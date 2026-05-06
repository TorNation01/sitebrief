"use client";

import { useState, useTransition } from "react";

import { submitContactFormAction, type ContactSubmitState } from "@/actions/contact-submit";
import { Button } from "@/components/ui/button";

const SUBJECTS = [
  "General Inquiry",
  "Project Question",
  "Support",
  "Partnership",
  "Other",
] as const;

export function ContactForm() {
  const [state, setState] = useState<ContactSubmitState | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mx-auto max-w-xl space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const res = await submitContactFormAction(fd);
          setState(res);
          if (res.ok) {
            e.currentTarget.reset();
          }
        });
      }}
    >
      <div className="space-y-2">
        <label htmlFor="contact-name" className="text-sm font-medium text-zinc-200">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          required
          autoComplete="name"
          className="w-full rounded-xl border border-white/[0.12] bg-black/40 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-[var(--color-accent)]"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-email" className="text-sm font-medium text-zinc-200">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-white/[0.12] bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--color-accent)]"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-phone" className="text-sm font-medium text-zinc-200">
          Phone <span className="text-white/40">(optional)</span>
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="w-full rounded-xl border border-white/[0.12] bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--color-accent)]"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-subject" className="text-sm font-medium text-zinc-200">
          Subject <span className="text-red-400">*</span>
        </label>
        <select
          id="contact-subject"
          name="subject"
          required
          defaultValue={SUBJECTS[0]}
          className="w-full rounded-xl border border-white/[0.12] bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--color-accent)]"
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-message" className="text-sm font-medium text-zinc-200">
          Message <span className="text-red-400">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          className="w-full rounded-xl border border-white/[0.12] bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--color-accent)]"
        />
      </div>

      {state && !state.ok ? (
        <p className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100" role="alert">
          {state.error}
        </p>
      ) : null}

      {state?.ok ? (
        <p className="rounded-xl border border-emerald-500/35 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-100">
          Thanks — your message was sent. We will reply by email.
        </p>
      ) : null}

      <Button type="submit" variant="primary" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

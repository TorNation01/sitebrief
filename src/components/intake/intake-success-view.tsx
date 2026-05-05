"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { SITE_VERCEL_EVENTS, trackSiteVercelEvent } from "@/components/analytics/vercel-tracking";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function IntakeSuccessView() {
  const params = useSearchParams();
  const intakeRef = params.get("ref");

  useEffect(() => {
    trackSiteVercelEvent(SITE_VERCEL_EVENTS.intakeSuccessView, {
      has_confirmation_ref: Boolean(intakeRef),
    });
  }, [intakeRef]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
          All set
        </p>
        <h1 className="mt-5 text-balance text-4xl font-semibold text-white sm:text-[2.85rem] sm:leading-tight">
          Your Website Brief Has Been Submitted
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/72 sm:text-base">
          Thanks — we’ve received your answers and will use them to prepare the best website build plan for your
          project.
        </p>
      </div>

      <Card tone="light">
        <p className="text-sm font-semibold text-zinc-900">What happens now</p>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-zinc-600">
          <li>Your answers land with our team in a clear, structured brief—easy to review and act on.</li>
          <li>Expect a thoughtful follow-up with any clarification questions or suggested next conversations.</li>
          <li>Need to change something meaningful? Reply on the acknowledgement message once it arrives.</li>
        </ul>

        <div className="mt-6 rounded-xl bg-zinc-50 px-4 py-4 text-sm text-zinc-700 ring-1 ring-zinc-200">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Confirmation token</p>
          <p className="mt-2 break-all font-mono text-sm text-zinc-900">{intakeRef ?? "Unavailable"}</p>
          {!intakeRef ? (
            <p className="mt-3 text-xs text-red-700">
              The identifier was not returned in the URL. Check your history or contact the studio with
              your business email for manual lookup.
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ButtonLink href="/" variant="primary" className="w-full justify-center px-6 sm:w-auto">
            Return to overview
          </ButtonLink>
          <Link
            href="/admin"
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-center text-sm font-medium text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50 sm:w-auto"
          >
            Staff sign-in →
          </Link>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-zinc-500">
          The staff link is for Anakatech operators only (separate secure sign-in)—not this public briefing form.
        </p>
      </Card>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-6 text-center sm:px-8">
        <p className="text-sm leading-relaxed text-white/52">
          Want your own version of this system for your business?
        </p>
        <ButtonLink href="/white-label" variant="ghost" className="mx-auto mt-4 border border-white/[0.12] px-6 text-[13px] text-white/80">
          Get Your Own
        </ButtonLink>
      </div>
    </div>
  );
}

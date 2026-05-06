"use client";

import { useMemo, useState, useTransition } from "react";

import { submitCustomerRevisionRoundAction } from "@/actions/revisions-public";
import { Button } from "@/components/ui/button";

type ItemDraft = {
  category: "content" | "design" | "layout" | "functionality" | "branding" | "other";
  page_reference: string;
  description: string;
  priority: "must_have" | "nice_to_have";
};

const CATEGORIES: ItemDraft["category"][] = [
  "content",
  "design",
  "layout",
  "functionality",
  "branding",
  "other",
];

type CustomerRevisionFormProps = {
  intakeId: string;
  token: string;
  businessName: string;
  round: {
    id: string;
    status: string;
    round_number: number;
    token_revoked_at: string | null;
  };
  allowanceSummary: {
    totalSlots: number;
    includedRounds: number;
    extraPurchased: number;
    extraRoundPriceAud: number;
  };
};

function emptyItem(): ItemDraft {
  return {
    category: "content",
    page_reference: "",
    description: "",
    priority: "must_have",
  };
}

export function CustomerRevisionForm(props: CustomerRevisionFormProps) {
  const [overall, setOverall] = useState("");
  const [finalComments, setFinalComments] = useState("");
  const [items, setItems] = useState<ItemDraft[]>([emptyItem()]);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const locked = useMemo(() => {
    if (props.round.token_revoked_at) {
      return "revoked" as const;
    }
    if (props.round.status !== "pending") {
      return "submitted" as const;
    }
    return null;
  }, [props.round.status, props.round.token_revoked_at]);

  const extraLine =
    props.allowanceSummary.extraPurchased > 0
      ? ` (${props.allowanceSummary.includedRounds} included + ${props.allowanceSummary.extraPurchased} purchased at ${props.allowanceSummary.extraRoundPriceAud.toLocaleString("en-AU")} AUD each)`
      : ` (${props.allowanceSummary.includedRounds} included)`;

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-14 sm:px-6 lg:px-8">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">Revision review</p>
        <h1 className="text-balance text-3xl font-semibold text-white sm:text-4xl">Feedback for {props.businessName}</h1>
        <p className="text-sm font-semibold text-white/80">
          Round {props.round.round_number} of {props.allowanceSummary.totalSlots} available
          {extraLine}
        </p>
      </header>

      <section className="rounded-2xl border border-white/[0.1] bg-white/[0.03] p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">How to get the best outcome</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/75">
          <li>Take your time reviewing each page of your site.</li>
          <li>Focus on one section at a time.</li>
          <li>
            Be specific — instead of &quot;I don&apos;t like the header&quot;, say &quot;Make the header text larger and change the
            background to navy blue&quot;.
          </li>
          <li>Mark each item as Must Have or Nice to Have so we can sequence work.</li>
        </ul>
      </section>

      {locked === "revoked" ? (
        <p className="rounded-2xl border border-amber-500/40 bg-amber-950/30 px-4 py-4 text-sm text-amber-50">
          This review link is no longer active. Please ask the studio for a new link.
        </p>
      ) : null}

      {locked === "submitted" ? (
        <p className="rounded-2xl border border-emerald-500/35 bg-emerald-950/25 px-4 py-4 text-sm text-emerald-50">
          Thank you — this revision round was already submitted. The studio will follow up by email if anything else is
          needed.
        </p>
      ) : null}

      {done ? (
        <p className="rounded-2xl border border-emerald-500/35 bg-emerald-950/25 px-5 py-6 text-sm leading-relaxed text-emerald-50">
          Submitted — thank you. The studio will review your items and follow up as needed.
        </p>
      ) : null}

      {!locked && !done ? (
        <form
          className="space-y-10"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            startTransition(async () => {
              const res = await submitCustomerRevisionRoundAction({
                intakeId: props.intakeId,
                token: props.token,
                overall_impression: overall,
                final_comments: finalComments,
                items: items.map((row) => ({
                  category: row.category,
                  page_reference: row.page_reference,
                  description: row.description,
                  priority: row.priority,
                })),
              });
              if (!res.ok) {
                setError(res.error);
                return;
              }
              setDone(true);
            });
          }}
        >
          <section className="space-y-3">
            <label className="block text-sm font-medium text-white" htmlFor="overall">
              Overall first impression
            </label>
            <textarea
              id="overall"
              value={overall}
              onChange={(e) => setOverall(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/[0.12] bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-accent)]"
              placeholder="What stands out first — good or rough?"
            />
          </section>

          <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Page-by-page change requests</h2>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setItems((prev) => [...prev, emptyItem()])}
              >
                Add another item
              </Button>
            </div>

            {items.map((row, idx) => (
              <div
                key={idx}
                className="space-y-4 rounded-2xl border border-white/[0.08] bg-black/25 p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">Item {idx + 1}</p>
                  {items.length > 1 ? (
                    <button
                      type="button"
                      className="text-xs font-semibold text-red-300 hover:text-red-200"
                      onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/70">Category</label>
                    <select
                      className="w-full rounded-lg border border-white/[0.12] bg-black/40 px-3 py-2 text-sm text-white"
                      value={row.category}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((r, i) =>
                            i === idx ? { ...r, category: e.target.value as ItemDraft["category"] } : r,
                          ),
                        )
                      }
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/70">Priority</label>
                    <select
                      className="w-full rounded-lg border border-white/[0.12] bg-black/40 px-3 py-2 text-sm text-white"
                      value={row.priority}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((r, i) =>
                            i === idx ? { ...r, priority: e.target.value as ItemDraft["priority"] } : r,
                          ),
                        )
                      }
                    >
                      <option value="must_have">Must have</option>
                      <option value="nice_to_have">Nice to have</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">Which page or area?</label>
                  <input
                    className="w-full rounded-lg border border-white/[0.12] bg-black/40 px-3 py-2 text-sm text-white"
                    value={row.page_reference}
                    onChange={(e) =>
                      setItems((prev) => prev.map((r, i) => (i === idx ? { ...r, page_reference: e.target.value } : r)))
                    }
                    placeholder="e.g. Home hero, Pricing, Contact form"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">Describe the change</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full rounded-lg border border-white/[0.12] bg-black/40 px-3 py-2 text-sm text-white"
                    value={row.description}
                    onChange={(e) =>
                      setItems((prev) => prev.map((r, i) => (i === idx ? { ...r, description: e.target.value } : r)))
                    }
                  />
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <label className="block text-sm font-medium text-white" htmlFor="final">
              Final comments
            </label>
            <textarea
              id="final"
              value={finalComments}
              onChange={(e) => setFinalComments(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/[0.12] bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-accent)]"
              placeholder="Anything else we should know before the studio reviews this round?"
            />
          </section>

          {error ? (
            <p className="rounded-xl border border-red-500/40 bg-red-950/35 px-4 py-3 text-sm text-red-100" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Submitting…" : "Submit revision round"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}

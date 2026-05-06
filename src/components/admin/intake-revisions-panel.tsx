"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createRevisionRoundAdminAction,
  generateRevisionCursorPromptAdminAction,
  markRevisionRoundCompletedAdminAction,
  registerPaidExtraRevisionRoundAction,
  revokeRevisionRoundTokenAdminAction,
  updateRevisionItemAdminAction,
} from "@/actions/revisions-admin";
import type { RevisionAllowance } from "@/lib/sitebrief/revision-allowance";
import type { RevisionRoundWithChildren } from "@/lib/sitebrief/queries";
import type { RevisionItemRow } from "@/types/database";
import { Button } from "@/components/ui/button";

type IntakeRevisionsPanelProps = {
  intakeId: string;
  allowance: RevisionAllowance;
  initialRounds: RevisionRoundWithChildren[];
};

function itemStatusLabel(s: string) {
  switch (s) {
    case "pending":
      return "Pending";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "completed":
      return "Completed";
    default:
      return s;
  }
}

function ItemEditor(props: {
  item: RevisionItemRow;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState(props.item.status);
  const [note, setNote] = useState(props.item.admin_response ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/25 p-4 space-y-3">
      <div className="flex flex-wrap gap-3 text-xs text-white/55">
        <span className="font-mono">{props.item.id.slice(0, 8)}…</span>
        <span className="uppercase tracking-wide text-[var(--color-accent)]">{props.item.category}</span>
        <span>{props.item.priority.replace(/_/g, " ")}</span>
      </div>
      {props.item.page_reference?.trim() ? (
        <p className="text-sm text-white/70">
          <span className="font-semibold text-white/80">Page:</span> {props.item.page_reference}
        </p>
      ) : null}
      <p className="text-sm leading-relaxed text-white/90 whitespace-pre-wrap">{props.item.description}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-white/60">
          Status
          <select
            className="mt-1 w-full rounded-lg border border-white/[0.12] bg-black/40 px-3 py-2 text-sm text-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {(["pending", "accepted", "rejected", "completed"] as const).map((s) => (
              <option key={s} value={s}>
                {itemStatusLabel(s)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-xs font-medium text-white/60">
        Admin response
        <textarea
          className="mt-1 w-full rounded-lg border border-white/[0.12] bg-black/40 px-3 py-2 text-sm text-white"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
      <Button
        type="button"
        variant="secondary"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const res = await updateRevisionItemAdminAction({
              itemId: props.item.id,
              status: status as "pending" | "accepted" | "rejected" | "completed",
              admin_response: note,
            });
            if (res.ok) {
              props.onSaved();
            }
          });
        }}
      >
        {pending ? "Saving…" : "Save item"}
      </Button>
    </div>
  );
}

export function IntakeRevisionsPanel(props: IntakeRevisionsPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const { allowance } = props;

  const refresh = () => {
    router.refresh();
  };

  const shareUrl = (token: string) =>
    typeof window !== "undefined" ? `${window.location.origin}/revisions/${props.intakeId}/${token}` : "";

  return (
    <section className="space-y-6 rounded-[32px] border border-white/[0.08] bg-black/30 p-8 shadow-inner shadow-black/40">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">Revisions</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Client review rounds</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">
          Create a round to generate a shareable link. Tier{" "}
          {allowance.tierName ? (
            <strong className="text-white/85">{allowance.tierName}</strong>
          ) : (
            <span className="text-white/55">(generate an internal estimate for tier defaults)</span>
          )}{" "}
          includes <strong className="text-white/85">{allowance.includedRounds}</strong> revision
          {allowance.includedRounds === 1 ? "" : "s"}. Extra purchased slots:{" "}
          <strong className="text-white/85">{allowance.extraPurchased}</strong>. Each extra slot is billed at{" "}
          <strong className="text-white/85">{allowance.extraRoundPriceAud.toLocaleString("en-AU")} AUD</strong> when you
          confirm with the client.
        </p>
        <p className="mt-2 text-sm text-white/80">
          Rounds used: <strong>{allowance.roundsCreated}</strong> of <strong>{allowance.totalSlots}</strong> total
          slots · <strong>{allowance.remainingCreates}</strong> remaining to open
        </p>
      </div>

      {message ? (
        <p className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm text-white/85">{message}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="primary"
          disabled={pending || allowance.remainingCreates <= 0}
          onClick={() => {
            setMessage(null);
            startTransition(async () => {
              const res = await createRevisionRoundAdminAction(props.intakeId);
              if (!res.ok) {
                setMessage(res.error);
                return;
              }
              setMessage(
                `Round ${res.roundNumber} created. Copy link: ${typeof window !== "undefined" ? window.location.origin : ""}${res.sharePath}`,
              );
              refresh();
            });
          }}
        >
          Create revision round
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(`Register one paid extra revision slot at ${allowance.extraRoundPriceAud} AUD?`)) {
              return;
            }
            setMessage(null);
            startTransition(async () => {
              const res = await registerPaidExtraRevisionRoundAction(props.intakeId);
              if (!res.ok) {
                setMessage(res.error);
                return;
              }
              setMessage("Recorded +1 paid revision slot on this intake.");
              refresh();
            });
          }}
        >
          +1 paid extra round ({allowance.extraRoundPriceAud.toLocaleString("en-AU")} AUD)
        </Button>
      </div>

      {allowance.remainingCreates <= 0 ? (
        <p className="text-sm text-amber-200/90">
          No free slots left — use &quot;+1 paid extra round&quot; after the client agrees, then create the next round.
        </p>
      ) : null}

      <div className="space-y-8">
        {props.initialRounds.map((round) => (
          <article key={round.id} className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Round {round.round_number}</h3>
                <p className="mt-1 text-xs font-mono text-white/45 break-all">id {round.id}</p>
                <p className="mt-2 text-sm text-white/70">
                  Status: <strong className="text-white">{round.status}</strong>
                  {round.submitted_at ? ` · Submitted ${new Date(round.submitted_at).toLocaleString()}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void navigator.clipboard.writeText(shareUrl(round.customer_access_token));
                    setMessage("Customer link copied to clipboard.");
                  }}
                >
                  Copy customer link
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => {
                    if (!window.confirm("Revoke this link? The client will need a new round.")) {
                      return;
                    }
                    startTransition(async () => {
                      const res = await revokeRevisionRoundTokenAdminAction(round.id);
                      setMessage(res.ok ? "Link revoked." : res.error);
                      refresh();
                    });
                  }}
                >
                  Revoke link
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={pending || round.status !== "submitted"}
                  onClick={() => {
                    startTransition(async () => {
                      const res = await markRevisionRoundCompletedAdminAction(round.id);
                      setMessage(res.ok ? "Marked round completed." : res.error);
                      refresh();
                    });
                  }}
                >
                  Mark round completed
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  disabled={pending}
                  onClick={() => {
                    setLastPrompt(null);
                    startTransition(async () => {
                      const res = await generateRevisionCursorPromptAdminAction({
                        intakeId: props.intakeId,
                        roundId: round.id,
                      });
                      if (!res.ok) {
                        setMessage(res.error);
                        return;
                      }
                      setLastPrompt(res.markdown);
                      setMessage("Prompt generated and saved to this round.");
                      refresh();
                    });
                  }}
                >
                  Generate Cursor prompt
                </Button>
              </div>
            </div>

            {round.overall_impression?.trim() || round.final_comments?.trim() ? (
              <div className="grid gap-4 md:grid-cols-2 text-sm text-white/80">
                {round.overall_impression?.trim() ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/45">Overall impression</p>
                    <p className="mt-2 whitespace-pre-wrap">{round.overall_impression}</p>
                  </div>
                ) : null}
                {round.final_comments?.trim() ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/45">Final comments</p>
                    <p className="mt-2 whitespace-pre-wrap">{round.final_comments}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white">Items</h4>
              {round.revision_items.length === 0 ? (
                <p className="text-sm text-white/55">No items yet.</p>
              ) : (
                <div className="grid gap-4">
                  {round.revision_items.map((item) => (
                    <ItemEditor key={item.id} item={item} onSaved={refresh} />
                  ))}
                </div>
              )}
            </div>

            {round.revision_prompts.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white">Saved Cursor prompts</h4>
                <ul className="space-y-2 text-xs text-white/55">
                  {round.revision_prompts.map((p) => (
                    <li key={p.id}>
                      {new Date(p.created_at).toLocaleString()} — {p.prompt_text.length} chars
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {lastPrompt ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">Latest generated prompt (also stored on the round)</p>
          <textarea readOnly className="h-64 w-full rounded-xl border border-white/[0.1] bg-black/50 p-4 font-mono text-xs text-white/90" value={lastPrompt} />
        </div>
      ) : null}
    </section>
  );
}

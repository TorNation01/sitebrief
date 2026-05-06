"use client";

import { useIntakeUxMode } from "@/components/intake/intake-ux-mode";

type IntakeUxModeToggleProps = {
  /** Larger, more prominent on the intro card */
  variant?: "compact" | "intro";
};

export function IntakeUxModeToggle({ variant = "compact" }: IntakeUxModeToggleProps) {
  const { mode, setMode } = useIntakeUxMode();
  const intro = variant === "intro";

  return (
    <div
      className={
        intro
          ? "rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
          : "rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2"
      }
      role="group"
      aria-label="Question wording style"
    >
      <p
        className={
          intro
            ? "text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
            : "text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55"
        }
      >
        How should we phrase questions?
      </p>
      <div className={intro ? "mt-3 flex flex-col gap-2 sm:flex-row" : "mt-2 flex gap-1.5"}>
        <button
          type="button"
          onClick={() => setMode("simple")}
          className={
            mode === "simple"
              ? intro
                ? "rounded-xl bg-[var(--color-accent)] px-4 py-3 text-left text-sm font-semibold text-zinc-950 shadow-sm"
                : "flex-1 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-zinc-950"
              : intro
                ? "rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm font-medium text-zinc-700 hover:border-zinc-300"
                : "flex-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/75 hover:bg-white/10"
          }
        >
          Plain language
          {intro ? (
            <span className="mt-1 block text-xs font-normal opacity-90">Best if you are not in tech or marketing.</span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setMode("technical")}
          className={
            mode === "technical"
              ? intro
                ? "rounded-xl bg-[var(--color-accent)] px-4 py-3 text-left text-sm font-semibold text-zinc-950 shadow-sm"
                : "flex-1 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-zinc-950"
              : intro
                ? "rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm font-medium text-zinc-700 hover:border-zinc-300"
                : "flex-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/75 hover:bg-white/10"
          }
        >
          Technical / industry
          {intro ? (
            <span className="mt-1 block text-xs font-normal opacity-90">Same questions, delivery-style wording.</span>
          ) : null}
        </button>
      </div>
      <p className={intro ? "mt-3 text-xs leading-relaxed text-zinc-600" : "mt-2 text-[10px] leading-relaxed text-white/50"}>
        You can switch any time—your answers stay on this device until you submit.
      </p>
    </div>
  );
}

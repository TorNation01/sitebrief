import { type ReactNode } from "react";

type LandingShellProps = {
  children: ReactNode;
};

/**
 * Atmospheric background for premium marketing chrome (charcoal / gold wash).
 */
export function LandingShell({ children }: LandingShellProps) {
  return (
    <div className="relative isolate flex min-h-[60vh] flex-1 flex-col bg-[#040406]">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[38%] left-1/2 h-[32rem] w-[56rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--color-accent)_18%,transparent),transparent_68%)] blur-3xl opacity-75" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[length:100%_44px]" />
      </div>
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}

import { type ReactNode } from "react";

type LandingWhiteCardProps = {
  children: ReactNode;
  className?: string;
};

export function LandingWhiteCard({ children, className = "" }: LandingWhiteCardProps) {
  return (
    <div
      className={`rounded-[1.125rem] border border-zinc-200/90 bg-white p-6 shadow-[0_22px_60px_-28px_rgba(0,0,0,0.55)] ring-1 ring-black/[0.04] sm:p-7 ${className}`}
    >
      {children}
    </div>
  );
}

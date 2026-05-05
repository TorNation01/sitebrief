import { type ReactNode } from "react";

type LandingSectionProps = {
  children: ReactNode;
  id?: string;
  /** Section-level layout (typically includes vertical rhythm: py-*, backgrounds, borders) */
  className?: string;
};

export function LandingSection({ children, id, className = "" }: LandingSectionProps) {
  return (
    <section id={id} className={`scroll-mt-[5.25rem] ${className}`}>
      <div className="mx-auto w-full max-w-[72rem] px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

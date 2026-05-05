import { type ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

type AppShellProps = {
  children: ReactNode;
  headerRightSlot?: ReactNode;
};

export function AppShell({ children, headerRightSlot }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-col bg-[var(--color-surface)]">
      <SiteHeader rightSlot={headerRightSlot} />
      <main className="relative flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}

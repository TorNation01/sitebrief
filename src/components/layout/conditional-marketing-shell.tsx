"use client";

import type { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";

/** Marketing chrome renders everywhere except authenticated admin workspaces. */
export function ConditionalMarketingShell(props: PropsWithChildren) {
  const pathname = usePathname();
  const isAdminShell = pathname?.startsWith("/admin") ?? false;

  if (isAdminShell) {
    return <div className="min-h-full flex flex-col">{props.children}</div>;
  }

  return <AppShell>{props.children}</AppShell>;
}

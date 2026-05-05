"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

/** Custom event keys for SiteBrief funnel (Vercel Web Analytics → Events). */
export const SITE_VERCEL_EVENTS = {
  landingVisit: "landing_visit",
  intakeStarted: "intake_started",
  intakeCompleted: "intake_completed",
  intakeSuccessView: "intake_success_view",
} as const;

export type SiteVercelEventName = (typeof SITE_VERCEL_EVENTS)[keyof typeof SITE_VERCEL_EVENTS];

export function trackSiteVercelEvent(
  name: SiteVercelEventName,
  properties?: Record<string, string | number | boolean | null>,
): void {
  try {
    track(name, properties);
  } catch {
    /* ignore */
  }
}

/** One beacon per homepage mount — use alongside route-level analytics in Vercel. */
export function LandingVisitBeacon() {
  useEffect(() => {
    trackSiteVercelEvent(SITE_VERCEL_EVENTS.landingVisit);
  }, []);
  return null;
}

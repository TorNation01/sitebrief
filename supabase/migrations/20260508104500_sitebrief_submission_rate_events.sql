-- Server-side submission rate telemetry (service role only — anon/auth have no privileges).
CREATE TABLE public.sitebrief_submission_rate_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('intake', 'white_label')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sitebrief_rate_ip_kind_created_idx
  ON public.sitebrief_submission_rate_events (ip_hash, kind, created_at DESC);

COMMENT ON TABLE public.sitebrief_submission_rate_events IS 'Rate limiting for SiteBrief public submits — write/query with SUPABASE_SERVICE_ROLE_KEY from app server only';

ALTER TABLE public.sitebrief_submission_rate_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.sitebrief_submission_rate_events FROM PUBLIC;
REVOKE ALL ON public.sitebrief_submission_rate_events FROM anon;
REVOKE ALL ON public.sitebrief_submission_rate_events FROM authenticated;

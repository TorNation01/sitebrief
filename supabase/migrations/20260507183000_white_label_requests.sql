-- White-label inquiries (success-page hook → /white-label → admin queue)

CREATE TABLE public.white_label_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type text NOT NULL DEFAULT 'white_label_request'
    CHECK (submission_type = 'white_label_request'),
  contact_name text NOT NULL,
  email text NOT NULL,
  organization text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX white_label_requests_created_at_idx
  ON public.white_label_requests (created_at DESC);

COMMENT ON TABLE public.white_label_requests IS 'Public-insert inquiry rows surfaced in SiteBrief admin; submission_type kept for inbox evolution';

ALTER TABLE public.white_label_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "white_label_requests_insert_public"
  ON public.white_label_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (submission_type = 'white_label_request');

CREATE POLICY "white_label_requests_select_admin"
  ON public.white_label_requests
  FOR SELECT
  TO authenticated
  USING (public.sitebrief_is_admin());

CREATE POLICY "white_label_requests_delete_admin"
  ON public.white_label_requests
  FOR DELETE
  TO authenticated
  USING (public.sitebrief_is_admin());

GRANT SELECT, INSERT, DELETE ON public.white_label_requests TO anon, authenticated;

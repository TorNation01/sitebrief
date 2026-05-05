-- SiteBrief core schema: clients, website_intakes, admin_notes
-- Admin access: set JWT app_metadata or user_metadata role to "admin"
--   Example (SQL, run as service role / dashboard): 
--   update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where id = '<user-uuid>';

-- ---------------------------------------------------------------------------
-- Helper: admin check from Supabase Auth JWT claims
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sitebrief_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role'
  ) = 'admin';
$$;

COMMENT ON FUNCTION public.sitebrief_is_admin() IS 'True when the current JWT declares role admin in app_metadata or user_metadata (SiteBrief admin).';

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  website text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.website_intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  business_summary text,
  services text,
  ideal_customer text,
  problem_solved text,
  unique_value text,
  website_goal text,
  desired_actions text,
  success_metrics text,
  pages_needed text,
  content_status text,
  features_needed text,
  branding_status text,
  brand_personality text,
  liked_websites text,
  disliked_websites text,
  domain_status text,
  hosting_status text,
  platform_preference text,
  integrations_needed text,
  tone_of_voice text,
  key_messages text,
  offers text,
  testimonials text,
  compliance_needs text,
  future_expansion text,
  ai_features text,
  budget_range text,
  deadline date,
  priority_level text,
  extra_notes text,
  generated_prompt_pack text,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id uuid NOT NULL REFERENCES public.website_intakes(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sitebrief_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := pg_catalog.now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER website_intakes_set_updated_at
BEFORE UPDATE ON public.website_intakes
FOR EACH ROW
EXECUTE PROCEDURE public.sitebrief_touch_updated_at();

COMMENT ON TRIGGER website_intakes_set_updated_at ON public.website_intakes IS 'Bump updated_at on row change';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX website_intakes_client_id_idx ON public.website_intakes (client_id);
CREATE INDEX website_intakes_status_idx ON public.website_intakes (status);
CREATE INDEX website_intakes_created_at_idx ON public.website_intakes (created_at DESC);
CREATE INDEX admin_notes_intake_id_idx ON public.admin_notes (intake_id);
CREATE INDEX admin_notes_created_at_idx ON public.admin_notes (created_at DESC);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- Public (anon + authenticated) may insert client rows as part of intake flow.
CREATE POLICY "clients_insert_public_intake"
  ON public.clients
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "clients_select_admin"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (public.sitebrief_is_admin());

CREATE POLICY "clients_update_admin"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (public.sitebrief_is_admin())
  WITH CHECK (public.sitebrief_is_admin());

CREATE POLICY "clients_delete_admin"
  ON public.clients
  FOR DELETE
  TO authenticated
  USING (public.sitebrief_is_admin());

-- Intakes: public insert only; admins read/write.
CREATE POLICY "website_intakes_insert_public_intake"
  ON public.website_intakes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "website_intakes_select_admin"
  ON public.website_intakes
  FOR SELECT
  TO authenticated
  USING (public.sitebrief_is_admin());

CREATE POLICY "website_intakes_update_admin"
  ON public.website_intakes
  FOR UPDATE
  TO authenticated
  USING (public.sitebrief_is_admin())
  WITH CHECK (public.sitebrief_is_admin());

CREATE POLICY "website_intakes_delete_admin"
  ON public.website_intakes
  FOR DELETE
  TO authenticated
  USING (public.sitebrief_is_admin());

-- Internal notes visible and editable only by admins.
CREATE POLICY "admin_notes_select_admin"
  ON public.admin_notes
  FOR SELECT
  TO authenticated
  USING (public.sitebrief_is_admin());

CREATE POLICY "admin_notes_insert_admin"
  ON public.admin_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (public.sitebrief_is_admin());

CREATE POLICY "admin_notes_update_admin"
  ON public.admin_notes
  FOR UPDATE
  TO authenticated
  USING (public.sitebrief_is_admin())
  WITH CHECK (public.sitebrief_is_admin());

CREATE POLICY "admin_notes_delete_admin"
  ON public.admin_notes
  FOR DELETE
  TO authenticated
  USING (public.sitebrief_is_admin());

-- ---------------------------------------------------------------------------
-- Grants (PostgREST / Supabase roles)
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.website_intakes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_notes TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.sitebrief_is_admin() TO anon, authenticated;

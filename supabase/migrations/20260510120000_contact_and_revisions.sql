-- Public contact form + revision rounds (customer magic link + admin workflow).
-- Customer revision reads/writes go through Next.js server code with the service role
-- after validating intake_id + customer_access_token; RLS here is admin-focused.

-- ---------------------------------------------------------------------------
-- contact_messages (public contact form)
-- ---------------------------------------------------------------------------
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.website_intakes
  ADD COLUMN IF NOT EXISTS extra_revision_rounds_purchased integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.website_intakes.extra_revision_rounds_purchased IS
  'Additional paid revision rounds beyond tier allowance (see internal price tier config).';

-- ---------------------------------------------------------------------------
-- revision_rounds
-- ---------------------------------------------------------------------------
CREATE TABLE public.revision_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id uuid NOT NULL REFERENCES public.website_intakes(id) ON DELETE CASCADE,
  round_number integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_review', 'submitted', 'completed', 'rejected')
  ),
  review_notes text,
  overall_impression text,
  final_comments text,
  customer_access_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  token_revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  completed_at timestamptz,
  CONSTRAINT revision_rounds_intake_round_unique UNIQUE (intake_id, round_number)
);

CREATE INDEX revision_rounds_intake_id_idx ON public.revision_rounds (intake_id);
CREATE INDEX revision_rounds_customer_token_idx ON public.revision_rounds (customer_access_token);

-- ---------------------------------------------------------------------------
-- revision_items
-- ---------------------------------------------------------------------------
CREATE TABLE public.revision_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES public.revision_rounds(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (
    category IN ('content', 'design', 'layout', 'functionality', 'branding', 'other')
  ),
  page_reference text,
  description text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('must_have', 'nice_to_have')),
  admin_response text,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'rejected', 'completed')
  ),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX revision_items_round_id_idx ON public.revision_items (round_id);

-- ---------------------------------------------------------------------------
-- revision_prompts
-- ---------------------------------------------------------------------------
CREATE TABLE public.revision_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES public.revision_rounds(id) ON DELETE CASCADE,
  prompt_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX revision_prompts_round_id_idx ON public.revision_prompts (round_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_messages_insert_anon"
  ON public.contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "contact_messages_insert_authenticated"
  ON public.contact_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "contact_messages_select_admin"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (public.sitebrief_is_admin());

CREATE POLICY "contact_messages_delete_admin"
  ON public.contact_messages
  FOR DELETE
  TO authenticated
  USING (public.sitebrief_is_admin());

ALTER TABLE public.revision_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revision_rounds_admin_all"
  ON public.revision_rounds
  FOR ALL
  TO authenticated
  USING (public.sitebrief_is_admin())
  WITH CHECK (public.sitebrief_is_admin());

CREATE POLICY "revision_items_admin_all"
  ON public.revision_items
  FOR ALL
  TO authenticated
  USING (public.sitebrief_is_admin())
  WITH CHECK (public.sitebrief_is_admin());

CREATE POLICY "revision_prompts_admin_all"
  ON public.revision_prompts
  FOR ALL
  TO authenticated
  USING (public.sitebrief_is_admin())
  WITH CHECK (public.sitebrief_is_admin());

-- ---------------------------------------------------------------------------
-- Grants (match existing SiteBrief tables)
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.revision_rounds TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.revision_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.revision_prompts TO anon, authenticated;

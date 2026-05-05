-- Singleton studio SaaS tier + future Stripe linkage (admins read/update; anon has no access).
CREATE TABLE public.studio_subscription (
  id bigint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  subscription_tier text NOT NULL DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'professional')),
  stripe_customer_id text,
  stripe_subscription_id text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.studio_subscription (id, subscription_tier) VALUES (1, 'basic');

COMMENT ON TABLE public.studio_subscription IS 'Single-tenant studio plan; tier drives feature gates and Basic monthly intake cap. Stripe ids reserved for future Checkout sync.';

ALTER TABLE public.studio_subscription ENABLE ROW LEVEL SECURITY;

CREATE POLICY "studio_subscription_select_admin"
  ON public.studio_subscription
  FOR SELECT
  TO authenticated
  USING (public.sitebrief_is_admin());

CREATE POLICY "studio_subscription_update_admin"
  ON public.studio_subscription
  FOR UPDATE
  TO authenticated
  USING (public.sitebrief_is_admin())
  WITH CHECK (public.sitebrief_is_admin());

GRANT SELECT, UPDATE ON public.studio_subscription TO authenticated;

REVOKE ALL ON public.studio_subscription FROM anon;

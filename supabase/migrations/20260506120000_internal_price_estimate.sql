-- Admin-only internal pricing suggestion (JSON). Never selected on public routes.
ALTER TABLE public.website_intakes
  ADD COLUMN IF NOT EXISTS internal_price_estimate jsonb;

COMMENT ON COLUMN public.website_intakes.internal_price_estimate IS 'Studio-only machine-generated price estimate (JSON v1). Not shown to public clients.';

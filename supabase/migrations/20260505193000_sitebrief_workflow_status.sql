-- Align SiteBrief intake status labels with operational workflow.

ALTER TABLE public.website_intakes
  ALTER COLUMN status SET DEFAULT 'New';

UPDATE public.website_intakes
SET status = 'New'
WHERE status IS NULL OR status IN ('submitted', 'Submitted');

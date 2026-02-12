
ALTER TABLE public.wedding_landing_pages
  ADD COLUMN IF NOT EXISTS intro_text text;


ALTER TABLE public.wedding_landing_pages
  ADD COLUMN IF NOT EXISTS same_venue boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS reception_venue_name text,
  ADD COLUMN IF NOT EXISTS reception_venue_address text,
  ADD COLUMN IF NOT EXISTS theme_preset text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS gallery_urls text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS show_gallery boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_video boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS verse_text text,
  ADD COLUMN IF NOT EXISTS show_verse boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS font_family text;

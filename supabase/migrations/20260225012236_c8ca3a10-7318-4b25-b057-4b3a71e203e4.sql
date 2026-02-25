
-- Add preferred_language column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'pt';

-- Add side column to guests table to differentiate groom's side vs bride's side
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS side TEXT CHECK (side IN ('noivo', 'noiva', NULL));
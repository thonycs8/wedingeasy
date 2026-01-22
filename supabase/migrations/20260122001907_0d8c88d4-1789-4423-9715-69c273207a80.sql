-- Fix generate_event_code implementation to avoid gen_random_bytes dependency
CREATE OR REPLACE FUNCTION public.generate_event_code()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SET search_path TO 'public'
AS $$
DECLARE
  raw text;
BEGIN
  -- Use UUID as randomness source; take 16 hex chars for the code
  raw := replace(gen_random_uuid()::text, '-', '');
  RETURN 'WEPLAN-' || upper(substring(raw from 1 for 16));
END;
$$;

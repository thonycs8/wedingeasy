-- Add a minimum length constraint now that all existing rows are compliant
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'wedding_data_event_code_min_length'
  ) THEN
    ALTER TABLE public.wedding_data
    ADD CONSTRAINT wedding_data_event_code_min_length
    CHECK (char_length(event_code) >= 14);
  END IF;
END $$;

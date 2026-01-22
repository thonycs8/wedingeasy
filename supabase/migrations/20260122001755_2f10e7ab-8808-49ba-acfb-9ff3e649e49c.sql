-- Strengthen wedding event_code generation and normalization to reduce guessability/bruteforce risk

-- 1) Generate a cryptographically strong event code (keeps existing WEPLAN prefix)
CREATE OR REPLACE FUNCTION public.generate_event_code()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SET search_path TO 'public'
AS $$
DECLARE
  code text;
BEGIN
  -- 16 hex chars (~64 bits) with prefix; example: WEPLAN-3F7A9C1D2E4B8A10
  code := 'WEPLAN-' || upper(encode(gen_random_bytes(8), 'hex'));
  RETURN code;
END;
$$;

-- 2) Normalize event_code: uppercase, trim, and auto-fill when empty
CREATE OR REPLACE FUNCTION public.normalize_wedding_event_code()
RETURNS trigger
LANGUAGE plpgsql
VOLATILE
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.event_code IS NULL OR btrim(NEW.event_code) = '' THEN
    NEW.event_code := public.generate_event_code();
  ELSE
    NEW.event_code := upper(btrim(NEW.event_code));
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_wedding_event_code ON public.wedding_data;
CREATE TRIGGER trg_normalize_wedding_event_code
BEFORE INSERT OR UPDATE OF event_code
ON public.wedding_data
FOR EACH ROW
EXECUTE FUNCTION public.normalize_wedding_event_code();

-- 3) Ensure new inserts get a default, even if clients omit the column
ALTER TABLE public.wedding_data
ALTER COLUMN event_code SET DEFAULT public.generate_event_code();

-- 4) Ensure uniqueness (create a unique index if the constraint/index name differs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname='public'
      AND tablename='wedding_data'
      AND indexname='wedding_data_event_code_key'
  ) THEN
    -- If an equivalent unique constraint already exists, this will error; that's fine to adjust later.
    BEGIN
      CREATE UNIQUE INDEX wedding_data_event_code_key ON public.wedding_data(event_code);
    EXCEPTION WHEN duplicate_table THEN
      NULL;
    WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

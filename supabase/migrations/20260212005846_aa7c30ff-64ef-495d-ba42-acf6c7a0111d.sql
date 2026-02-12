
-- 1. Drop the existing check constraint (already dropped by previous failed migration attempt)
ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_special_role_check;

-- 2. Convert special_role from text to text[]
ALTER TABLE public.guests
  ALTER COLUMN special_role TYPE text[]
  USING CASE WHEN special_role IS NOT NULL THEN ARRAY[special_role] ELSE NULL END;

-- 3. Create validation function for special_role array
CREATE OR REPLACE FUNCTION public.validate_guest_special_roles()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $func$
DECLARE
  allowed text[] := ARRAY[
    'padrinho', 'madrinha',
    'pai do noivo', 'mãe do noivo',
    'pai da noiva', 'mãe da noiva',
    'irmão(ã)',
    'dama de honor', 'pajem', 'florista',
    'portador das alianças',
    'amigo do noivo', 'amiga da noiva',
    'celebrante', 'convidado de honra'
  ];
  r text;
BEGIN
  IF NEW.special_role IS NOT NULL THEN
    FOREACH r IN ARRAY NEW.special_role LOOP
      IF NOT (lower(r) = ANY(allowed)) THEN
        RAISE EXCEPTION 'Invalid special_role: %', r;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$func$;

-- 4. Create trigger
DROP TRIGGER IF EXISTS validate_guest_special_roles_trigger ON public.guests;
CREATE TRIGGER validate_guest_special_roles_trigger
  BEFORE INSERT OR UPDATE ON public.guests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_guest_special_roles();

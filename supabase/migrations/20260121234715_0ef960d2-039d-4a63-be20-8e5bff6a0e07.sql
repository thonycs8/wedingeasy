-- 1) Add age_band to guests
ALTER TABLE public.guests
ADD COLUMN IF NOT EXISTS age_band text;

-- 2) Table to store wedding-level pricing rules for guest age bands
CREATE TABLE IF NOT EXISTS public.wedding_guest_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL UNIQUE,
  adult_price numeric NOT NULL DEFAULT 0,
  pct_0_4 numeric NOT NULL DEFAULT 0,
  pct_5_10 numeric NOT NULL DEFAULT 0.5,
  pct_11_plus numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_wedding_guest_pricing_updated_at'
  ) THEN
    CREATE TRIGGER update_wedding_guest_pricing_updated_at
    BEFORE UPDATE ON public.wedding_guest_pricing
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 4) Enable RLS
ALTER TABLE public.wedding_guest_pricing ENABLE ROW LEVEL SECURITY;

-- 5) Policies
DROP POLICY IF EXISTS "Collaborators can view wedding guest pricing" ON public.wedding_guest_pricing;
CREATE POLICY "Collaborators can view wedding guest pricing"
ON public.wedding_guest_pricing
FOR SELECT
USING (public.is_wedding_collaborator(auth.uid(), wedding_id));

DROP POLICY IF EXISTS "Wedding admins can manage wedding guest pricing" ON public.wedding_guest_pricing;
CREATE POLICY "Wedding admins can manage wedding guest pricing"
ON public.wedding_guest_pricing
FOR ALL
USING (public.is_wedding_admin(auth.uid(), wedding_id))
WITH CHECK (public.is_wedding_admin(auth.uid(), wedding_id));

-- 6) Basic index
CREATE INDEX IF NOT EXISTS idx_wedding_guest_pricing_wedding_id ON public.wedding_guest_pricing(wedding_id);

-- Create wedding_landing_pages table
CREATE TABLE public.wedding_landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.wedding_data(id) ON DELETE CASCADE,
  is_published boolean NOT NULL DEFAULT false,
  hero_message text DEFAULT 'Vamos casar!',
  venue_name text,
  venue_address text,
  venue_lat numeric,
  venue_lng numeric,
  ceremony_time time,
  party_time time,
  dress_code text,
  custom_message text,
  show_countdown boolean NOT NULL DEFAULT true,
  show_map boolean NOT NULL DEFAULT true,
  show_rsvp boolean NOT NULL DEFAULT true,
  theme_color text DEFAULT '#e11d48',
  cover_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(wedding_id)
);

-- Enable RLS
ALTER TABLE public.wedding_landing_pages ENABLE ROW LEVEL SECURITY;

-- Wedding admins can manage their landing page
CREATE POLICY "Wedding admins can manage landing pages"
ON public.wedding_landing_pages
FOR ALL
TO authenticated
USING (is_wedding_admin(auth.uid(), wedding_id))
WITH CHECK (is_wedding_admin(auth.uid(), wedding_id));

-- Collaborators can view landing page config
CREATE POLICY "Collaborators can view landing pages"
ON public.wedding_landing_pages
FOR SELECT
TO authenticated
USING (is_wedding_collaborator(auth.uid(), wedding_id));

-- Public can view published landing pages (for anon access)
CREATE POLICY "Public can view published landing pages"
ON public.wedding_landing_pages
FOR SELECT
TO anon
USING (is_published = true);

-- Trigger for updated_at
CREATE TRIGGER update_wedding_landing_pages_updated_at
BEFORE UPDATE ON public.wedding_landing_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create public_rsvp RPC for unauthenticated RSVP
CREATE OR REPLACE FUNCTION public.public_rsvp(_event_code text, _guest_name text, _confirmed boolean DEFAULT true)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _wedding_id uuid;
  _rsvp_enabled boolean;
  _updated_count int;
BEGIN
  -- Find wedding by event code
  SELECT wd.id INTO _wedding_id
  FROM wedding_data wd
  WHERE upper(btrim(wd.event_code)) = upper(btrim(_event_code))
    AND wd.is_active = true;

  IF _wedding_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'event_not_found');
  END IF;

  -- Check if landing page is published and RSVP enabled
  SELECT wlp.show_rsvp INTO _rsvp_enabled
  FROM wedding_landing_pages wlp
  WHERE wlp.wedding_id = _wedding_id
    AND wlp.is_published = true;

  IF _rsvp_enabled IS NULL OR _rsvp_enabled = false THEN
    RETURN jsonb_build_object('success', false, 'error', 'rsvp_disabled');
  END IF;

  -- Update guest confirmation
  UPDATE guests
  SET confirmed = _confirmed, updated_at = now()
  WHERE wedding_id = _wedding_id
    AND name ILIKE btrim(_guest_name);

  GET DIAGNOSTICS _updated_count = ROW_COUNT;

  IF _updated_count = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'guest_not_found');
  END IF;

  RETURN jsonb_build_object('success', true, 'confirmed', _confirmed);
END;
$$;

-- Grant execute to anon for public RSVP
GRANT EXECUTE ON FUNCTION public.public_rsvp(text, text, boolean) TO anon;

-- Also allow anon to read wedding_data for the public page (only basic info)
CREATE POLICY "Public can view active wedding basic data"
ON public.wedding_data
FOR SELECT
TO anon
USING (is_active = true);

-- Add wedding_landing feature
INSERT INTO public.app_features (feature_key, display_name, description, category, sort_order)
VALUES ('wedding_landing', 'Página do Evento', 'Landing page pública personalizada para o casamento com countdown, mapa, RSVP e convites por papel', 'Evento', 50);

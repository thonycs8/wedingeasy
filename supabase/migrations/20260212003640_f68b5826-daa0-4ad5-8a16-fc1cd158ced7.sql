-- Move unaccent extension to the extensions schema
DROP EXTENSION IF EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA extensions;

-- Recreate the function referencing extensions.unaccent
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
  SELECT wd.id INTO _wedding_id
  FROM wedding_data wd
  WHERE upper(btrim(wd.event_code)) = upper(btrim(_event_code))
    AND wd.is_active = true;

  IF _wedding_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'event_not_found');
  END IF;

  SELECT wlp.show_rsvp INTO _rsvp_enabled
  FROM wedding_landing_pages wlp
  WHERE wlp.wedding_id = _wedding_id
    AND wlp.is_published = true;

  IF _rsvp_enabled IS NULL OR _rsvp_enabled = false THEN
    RETURN jsonb_build_object('success', false, 'error', 'rsvp_disabled');
  END IF;

  UPDATE guests
  SET confirmed = _confirmed, updated_at = now()
  WHERE wedding_id = _wedding_id
    AND lower(extensions.unaccent(name)) = lower(extensions.unaccent(btrim(_guest_name)));

  GET DIAGNOSTICS _updated_count = ROW_COUNT;

  IF _updated_count = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'guest_not_found');
  END IF;

  RETURN jsonb_build_object('success', true, 'confirmed', _confirmed);
END;
$$;
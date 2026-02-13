
-- Add is_suspended column to wedding_collaborators
ALTER TABLE public.wedding_collaborators 
ADD COLUMN is_suspended boolean NOT NULL DEFAULT false;

-- Update is_wedding_collaborator to exclude suspended users
CREATE OR REPLACE FUNCTION public.is_wedding_collaborator(_user_id uuid, _wedding_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.wedding_collaborators
    WHERE wedding_id = _wedding_id
      AND user_id = _user_id
      AND is_suspended = false
  );
$$;

-- Update is_wedding_admin to exclude suspended users
CREATE OR REPLACE FUNCTION public.is_wedding_admin(_user_id uuid, _wedding_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.wedding_data
    WHERE id = _wedding_id AND user_id = _user_id
  )
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators
    WHERE wedding_id = _wedding_id 
      AND user_id = _user_id 
      AND role IN ('noivo', 'noiva', 'celebrante')
      AND is_suspended = false
  );
$$;

-- Update is_wedding_owner to exclude suspended users
CREATE OR REPLACE FUNCTION public.is_wedding_owner(_user_id uuid, _wedding_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.wedding_data
    WHERE id = _wedding_id AND user_id = _user_id
  )
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators
    WHERE wedding_id = _wedding_id 
      AND user_id = _user_id 
      AND role IN ('noivo', 'noiva')
      AND is_suspended = false
  );
$$;

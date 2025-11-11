-- Atualizar funções e políticas para garantir privilégios completos de owner para noiva/noivo

-- Atualizar função is_wedding_owner
CREATE OR REPLACE FUNCTION public.is_wedding_owner(_user_id uuid, _wedding_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
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
  );
$$;

-- Atualizar função is_wedding_admin
CREATE OR REPLACE FUNCTION public.is_wedding_admin(_user_id uuid, _wedding_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
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
  );
$$;

-- Dropar e recriar políticas de wedding_data
DROP POLICY IF EXISTS "Wedding owners and admins can manage wedding data" ON public.wedding_data;
DROP POLICY IF EXISTS "All collaborators can view wedding data" ON public.wedding_data;
DROP POLICY IF EXISTS "Wedding admins can manage wedding data" ON public.wedding_data;
DROP POLICY IF EXISTS "Collaborators can view wedding data" ON public.wedding_data;

CREATE POLICY "Owners can manage wedding data"
ON public.wedding_data
FOR ALL
TO authenticated
USING (
  user_id = auth.uid()
  OR
  public.is_wedding_owner(auth.uid(), id)
  OR
  public.is_wedding_admin(auth.uid(), id)
)
WITH CHECK (
  user_id = auth.uid()
  OR
  public.is_wedding_owner(auth.uid(), id)
  OR
  public.is_wedding_admin(auth.uid(), id)
);

CREATE POLICY "Collaborators can view wedding data"
ON public.wedding_data
FOR SELECT
TO authenticated
USING (
  public.is_wedding_collaborator(auth.uid(), id)
);

-- Dropar e recriar políticas de wedding_collaborators
DROP POLICY IF EXISTS "Wedding owners can manage collaborators" ON public.wedding_collaborators;
DROP POLICY IF EXISTS "Users can view all collaborators of their wedding" ON public.wedding_collaborators;
DROP POLICY IF EXISTS "Wedding owner can manage collaborators" ON public.wedding_collaborators;
DROP POLICY IF EXISTS "Users can view wedding collaborators" ON public.wedding_collaborators;
DROP POLICY IF EXISTS "Users can view their collaborations" ON public.wedding_collaborators;

CREATE POLICY "Owners can manage collaborators"
ON public.wedding_collaborators
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_data
    WHERE id = wedding_collaborators.wedding_id
      AND user_id = auth.uid()
  )
  OR
  public.is_wedding_owner(auth.uid(), wedding_id)
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wedding_data
    WHERE id = wedding_collaborators.wedding_id
      AND user_id = auth.uid()
  )
  OR
  public.is_wedding_owner(auth.uid(), wedding_id)
);

CREATE POLICY "Collaborators can view all wedding members"
ON public.wedding_collaborators
FOR SELECT
TO authenticated
USING (
  public.is_wedding_collaborator(auth.uid(), wedding_id)
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_data wd
    WHERE wd.id = wedding_collaborators.wedding_id
      AND wd.user_id = auth.uid()
  )
);
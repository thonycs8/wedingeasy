-- Garantir que noiva e noivo tenham privilégios completos de owner
-- Atualizar funções de segurança para incluir noiva/noivo como owners

-- Função para verificar se é owner (noiva ou noivo)
CREATE OR REPLACE FUNCTION public.is_wedding_owner(_user_id uuid, _wedding_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Verifica se o usuário criou o casamento
  SELECT EXISTS (
    SELECT 1 FROM public.wedding_data
    WHERE id = _wedding_id AND user_id = _user_id
  )
  OR
  -- Verifica se é noiva ou noivo (owners)
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators
    WHERE wedding_id = _wedding_id 
      AND user_id = _user_id 
      AND role IN ('noivo', 'noiva')
  );
$$;

-- Função para verificar se é admin (owner ou celebrante)
CREATE OR REPLACE FUNCTION public.is_wedding_admin(_user_id uuid, _wedding_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Verifica se o usuário criou o casamento
  SELECT EXISTS (
    SELECT 1 FROM public.wedding_data
    WHERE id = _wedding_id AND user_id = _user_id
  )
  OR
  -- Verifica se é noiva, noivo ou celebrante (todos têm privilégios administrativos)
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators
    WHERE wedding_id = _wedding_id 
      AND user_id = _user_id 
      AND role IN ('noivo', 'noiva', 'celebrante')
  );
$$;

-- Atualizar política de wedding_data para garantir que noiva/noivo possam gerenciar tudo
DROP POLICY IF EXISTS "Wedding admins can manage wedding data" ON public.wedding_data;
DROP POLICY IF EXISTS "Collaborators can view wedding data" ON public.wedding_data;

CREATE POLICY "Wedding owners and admins can manage wedding data"
ON public.wedding_data
FOR ALL
TO authenticated
USING (
  -- Criador do casamento
  user_id = auth.uid()
  OR
  -- Noiva, noivo ou celebrante
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators
    WHERE wedding_id = wedding_data.id
      AND user_id = auth.uid()
      AND role IN ('noivo', 'noiva', 'celebrante')
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators
    WHERE wedding_id = wedding_data.id
      AND user_id = auth.uid()
      AND role IN ('noivo', 'noiva', 'celebrante')
  )
);

CREATE POLICY "All collaborators can view wedding data"
ON public.wedding_data
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators
    WHERE wedding_id = wedding_data.id
      AND user_id = auth.uid()
  )
);

-- Atualizar política de wedding_collaborators para que noiva/noivo possam gerenciar colaboradores
DROP POLICY IF EXISTS "Wedding owner can manage collaborators" ON public.wedding_collaborators;
DROP POLICY IF EXISTS "Users can view wedding collaborators" ON public.wedding_collaborators;
DROP POLICY IF EXISTS "Users can view their collaborations" ON public.wedding_collaborators;

CREATE POLICY "Wedding owners can manage collaborators"
ON public.wedding_collaborators
FOR ALL
TO authenticated
USING (
  -- Criador do casamento
  EXISTS (
    SELECT 1 FROM public.wedding_data
    WHERE id = wedding_collaborators.wedding_id
      AND user_id = auth.uid()
  )
  OR
  -- Noiva ou noivo (owners)
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.wedding_id = wedding_collaborators.wedding_id
      AND wc.user_id = auth.uid()
      AND wc.role IN ('noivo', 'noiva')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wedding_data
    WHERE id = wedding_collaborators.wedding_id
      AND user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.wedding_id = wedding_collaborators.wedding_id
      AND wc.user_id = auth.uid()
      AND wc.role IN ('noivo', 'noiva')
  )
);

CREATE POLICY "Users can view all collaborators of their wedding"
ON public.wedding_collaborators
FOR SELECT
TO authenticated
USING (
  -- Pode ver se for colaborador do mesmo casamento
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.wedding_id = wedding_collaborators.wedding_id
      AND wc.user_id = auth.uid()
  )
  OR
  -- Pode ver se for o criador do casamento
  EXISTS (
    SELECT 1 FROM public.wedding_data wd
    WHERE wd.id = wedding_collaborators.wedding_id
      AND wd.user_id = auth.uid()
  )
);
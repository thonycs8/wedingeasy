-- Criar trigger para adicionar automaticamente o criador como "noivo" quando um casamento é criado

-- Remover triggers antigos se existirem
DROP TRIGGER IF EXISTS add_creator_as_owner_trigger ON public.wedding_data;
DROP TRIGGER IF EXISTS add_creator_as_collaborator_trigger ON public.wedding_data;

-- Criar função atualizada para adicionar criador como noivo (owner)
CREATE OR REPLACE FUNCTION public.add_creator_as_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Adiciona o criador como 'noivo' (owner) automaticamente
  INSERT INTO public.wedding_collaborators (wedding_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'noivo')
  ON CONFLICT (wedding_id, user_id) 
  DO UPDATE SET role = 'noivo';
  
  RETURN NEW;
END;
$$;

-- Criar trigger para executar a função quando um casamento é criado
CREATE TRIGGER add_creator_as_owner_trigger
AFTER INSERT ON public.wedding_data
FOR EACH ROW
EXECUTE FUNCTION public.add_creator_as_owner();
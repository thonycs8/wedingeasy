-- Remove the old check constraint if it exists
ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_special_role_check;

-- Add updated check constraint with all ceremony roles
ALTER TABLE public.guests ADD CONSTRAINT guests_special_role_check 
CHECK (
  special_role IS NULL OR 
  special_role IN (
    'Padrinho',
    'Madrinha',
    'Dama de Honor',
    'Pajem',
    'Florista',
    'Portador das Alianças',
    'Amigo do Noivo',
    'Amiga da Noiva',
    'Convidado de Honra'
  )
);
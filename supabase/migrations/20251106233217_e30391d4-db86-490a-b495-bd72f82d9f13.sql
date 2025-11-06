-- Remove the old check constraint
ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_special_role_check;

-- Add updated check constraint with all ceremony roles including parents and celebrant
ALTER TABLE public.guests ADD CONSTRAINT guests_special_role_check 
CHECK (
  special_role IS NULL OR 
  special_role IN (
    'Padrinho',
    'Madrinha',
    'Pai do Noivo',
    'Mãe do Noivo',
    'Pai da Noiva',
    'Mãe da Noiva',
    'Dama de Honor',
    'Pajem',
    'Florista',
    'Portador das Alianças',
    'Amigo do Noivo',
    'Amiga da Noiva',
    'Celebrante',
    'Convidado de Honra'
  )
);
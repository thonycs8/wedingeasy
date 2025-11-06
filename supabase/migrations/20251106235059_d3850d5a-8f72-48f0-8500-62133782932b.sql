-- Remove the old check constraint
ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_special_role_check;

-- Add updated check constraint that is case-insensitive for ceremony roles
ALTER TABLE public.guests ADD CONSTRAINT guests_special_role_check 
CHECK (
  special_role IS NULL OR 
  LOWER(special_role) IN (
    LOWER('Padrinho'),
    LOWER('Madrinha'),
    LOWER('Pai do Noivo'),
    LOWER('Mãe do Noivo'),
    LOWER('Pai da Noiva'),
    LOWER('Mãe da Noiva'),
    LOWER('Irmão do Noivo'),
    LOWER('Irmã do Noivo'),
    LOWER('Irmão da Noiva'),
    LOWER('Irmã da Noiva'),
    LOWER('Dama de Honor'),
    LOWER('Pajem'),
    LOWER('Florista'),
    LOWER('Portador das Alianças'),
    LOWER('Amigo do Noivo'),
    LOWER('Amiga da Noiva'),
    LOWER('Celebrante'),
    LOWER('Convidado de Honra')
  )
);
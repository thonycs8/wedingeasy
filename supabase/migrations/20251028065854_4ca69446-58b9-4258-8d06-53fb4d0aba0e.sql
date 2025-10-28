-- Update guests_special_role_check constraint to accept Portuguese role names
ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_special_role_check;

ALTER TABLE public.guests ADD CONSTRAINT guests_special_role_check 
CHECK (
  special_role IS NULL 
  OR special_role = ANY (ARRAY[
    'best_man'::text, 
    'maid_of_honor'::text, 
    'groomsman'::text, 
    'bridesmaid'::text, 
    'witness'::text, 
    'officiant'::text, 
    'pastor'::text, 
    'musician'::text, 
    'honor_guest'::text, 
    'flower_girl'::text, 
    'ring_bearer'::text, 
    'reader'::text, 
    'usher'::text,
    'Padrinho'::text,
    'Madrinha'::text,
    'Dama de Honor'::text,
    'Pajem'::text,
    'Florista'::text,
    'Portador das Alianças'::text
  ])
);
-- Adicionar novas categorias para convidados e campos específicos para casamento
ALTER TABLE public.guests 
DROP CONSTRAINT IF EXISTS guests_category_check;

-- Adicionar novas colunas para funcionalidades avançadas
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS printed_invitation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS special_role TEXT,
ADD COLUMN IF NOT EXISTS table_number INTEGER,
ADD COLUMN IF NOT EXISTS relationship TEXT;

-- Atualizar constraint de categoria para incluir todas as novas categorias
ALTER TABLE public.guests 
ADD CONSTRAINT guests_category_check 
CHECK (category IN (
  'family', 'friends', 'work', 'other',
  'groomsmen', 'bridesmaids', 'groomsman_friends', 'bridesmaid_friends',
  'witnesses', 'officiant', 'pastor', 'musicians', 'honor_guests'
));

-- Adicionar constraint para special_role
ALTER TABLE public.guests 
ADD CONSTRAINT guests_special_role_check 
CHECK (special_role IS NULL OR special_role IN (
  'best_man', 'maid_of_honor', 'groomsman', 'bridesmaid',
  'witness', 'officiant', 'pastor', 'musician', 'honor_guest',
  'flower_girl', 'ring_bearer', 'reader', 'usher'
));

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_guests_category ON public.guests(category);
CREATE INDEX IF NOT EXISTS idx_guests_special_role ON public.guests(special_role);
CREATE INDEX IF NOT EXISTS idx_guests_confirmed ON public.guests(confirmed);
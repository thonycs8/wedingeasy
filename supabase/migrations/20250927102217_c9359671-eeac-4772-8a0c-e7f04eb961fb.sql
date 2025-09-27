-- Criar tabela de categorias de orçamento
CREATE TABLE public.budget_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  budgeted_amount numeric DEFAULT 0,
  spent_amount numeric DEFAULT 0,
  priority text DEFAULT 'media' CHECK (priority IN ('alta', 'media', 'baixa')),
  description text,
  icon text DEFAULT 'DollarSign',
  color text DEFAULT '#3b82f6',
  is_default boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de gastos
CREATE TABLE public.budget_expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.budget_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  receipt_url text,
  vendor text,
  status text DEFAULT 'pago' CHECK (status IN ('pago', 'pendente', 'cancelado')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de opções/alternativas para cada categoria
CREATE TABLE public.budget_options (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.budget_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_min numeric,
  price_max numeric,
  vendor text,
  website text,
  phone text,
  email text,
  address text,
  notes text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  is_favorite boolean DEFAULT false,
  status text DEFAULT 'considerando' CHECK (status IN ('considerando', 'contactado', 'cotacao', 'contratado', 'rejeitado')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_options ENABLE ROW LEVEL SECURITY;

-- Políticas para budget_categories
CREATE POLICY "Users can view their own budget categories" 
ON public.budget_categories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget categories" 
ON public.budget_categories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget categories" 
ON public.budget_categories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget categories" 
ON public.budget_categories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para budget_expenses
CREATE POLICY "Users can view their own budget expenses" 
ON public.budget_expenses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget expenses" 
ON public.budget_expenses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget expenses" 
ON public.budget_expenses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget expenses" 
ON public.budget_expenses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para budget_options
CREATE POLICY "Users can view their own budget options" 
ON public.budget_options 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget options" 
ON public.budget_options 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget options" 
ON public.budget_options 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget options" 
ON public.budget_options 
FOR DELETE 
USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_budget_categories_updated_at
BEFORE UPDATE ON public.budget_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_expenses_updated_at
BEFORE UPDATE ON public.budget_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_options_updated_at
BEFORE UPDATE ON public.budget_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para atualizar automaticamente o valor gasto das categorias
CREATE OR REPLACE FUNCTION public.update_category_spent_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the spent amount for the category
  UPDATE public.budget_categories 
  SET spent_amount = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM public.budget_expenses 
    WHERE category_id = COALESCE(NEW.category_id, OLD.category_id)
    AND status = 'pago'
  )
  WHERE id = COALESCE(NEW.category_id, OLD.category_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar valores gastos automaticamente
CREATE TRIGGER update_spent_amount_on_expense_insert
AFTER INSERT ON public.budget_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_category_spent_amount();

CREATE TRIGGER update_spent_amount_on_expense_update
AFTER UPDATE ON public.budget_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_category_spent_amount();

CREATE TRIGGER update_spent_amount_on_expense_delete
AFTER DELETE ON public.budget_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_category_spent_amount();
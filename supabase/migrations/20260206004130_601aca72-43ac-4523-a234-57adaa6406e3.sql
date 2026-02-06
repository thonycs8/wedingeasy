
-- ============================
-- Admin Panel Enhanced: Subscription System + Admin Policies
-- ============================

-- 1. Add is_active column to wedding_data
ALTER TABLE public.wedding_data ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 2. Admin RLS policies for existing tables (admin visibility)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all wedding data"
ON public.wedding_data FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all collaborators"
ON public.wedding_collaborators FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all guests"
ON public.guests FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Subscription Plans table
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  price numeric DEFAULT 0,
  max_guests integer DEFAULT 50,
  max_collaborators integer DEFAULT 1,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
ON public.subscription_plans FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all plans"
ON public.subscription_plans FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. App Features table (feature registry)
CREATE TABLE public.app_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  category text DEFAULT 'general',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.app_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view features"
ON public.app_features FOR SELECT
USING (true);

CREATE POLICY "Admins can manage features"
ON public.app_features FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Plan-Feature mapping table
CREATE TABLE public.plan_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES public.subscription_plans(id) ON DELETE CASCADE NOT NULL,
  feature_id uuid REFERENCES public.app_features(id) ON DELETE CASCADE NOT NULL,
  enabled boolean DEFAULT false,
  UNIQUE(plan_id, feature_id)
);

ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plan features"
ON public.plan_features FOR SELECT
USING (true);

CREATE POLICY "Admins can manage plan features"
ON public.plan_features FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Wedding Subscriptions table
CREATE TABLE public.wedding_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid REFERENCES public.wedding_data(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_id uuid REFERENCES public.subscription_plans(id) NOT NULL,
  status text DEFAULT 'active',
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.wedding_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
ON public.wedding_subscriptions FOR SELECT TO authenticated
USING (public.is_wedding_collaborator(auth.uid(), wedding_id));

CREATE POLICY "Admins can manage all subscriptions"
ON public.wedding_subscriptions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Seed default subscription plans
INSERT INTO public.subscription_plans (name, display_name, description, price, max_guests, max_collaborators, sort_order) VALUES
('basic', 'Básico', 'Plano essencial para começar a planear o casamento', 0, 50, 1, 1),
('advanced', 'Avançado', 'Mais funcionalidades e limites expandidos', 9.99, 200, 5, 2),
('pro', 'Profissional', 'Acesso completo sem limites', 19.99, -1, -1, 3);

-- 8. Seed default app features
INSERT INTO public.app_features (feature_key, display_name, description, category, sort_order) VALUES
('guests_management', 'Gestão de Convidados', 'Lista e gestão básica de convidados', 'Convidados', 1),
('guests_bulk_import', 'Importação em Massa', 'Importar convidados via CSV', 'Convidados', 2),
('guests_export', 'Exportação de Dados', 'Exportar listas para PDF/CSV', 'Convidados', 3),
('budget_management', 'Gestão de Orçamento', 'Categorias e despesas básicas', 'Orçamento', 4),
('budget_charts', 'Gráficos de Orçamento', 'Visualizações e relatórios', 'Orçamento', 5),
('budget_options', 'Comparação de Opções', 'Comparar fornecedores por categoria', 'Orçamento', 6),
('timeline_management', 'Cronograma', 'Gestão de tarefas e prazos', 'Planeamento', 7),
('timeline_priorities', 'Prioridades Avançadas', 'Filtros avançados e prioridades', 'Planeamento', 8),
('ceremony_roles', 'Papéis de Cerimónia', 'Atribuir papéis especiais', 'Cerimónia', 9),
('collaborators', 'Colaboradores', 'Convidar utilizadores para colaborar', 'Colaboração', 10),
('photo_gallery', 'Galeria de Fotos', 'Upload e organização de fotos', 'Media', 11),
('marketplace', 'Marketplace', 'Acesso ao marketplace de serviços', 'Serviços', 12),
('notifications_system', 'Notificações', 'Alertas e lembretes automáticos', 'Sistema', 13),
('wedding_choices', 'Decisões', 'Gerir escolhas do casamento', 'Planeamento', 14),
('realtime_sync', 'Tempo Real', 'Atualizações instantâneas', 'Sistema', 15),
('pdf_export', 'Exportação PDF', 'Gerar relatórios PDF', 'Sistema', 16);

-- 9. Seed plan-feature mappings
DO $$
DECLARE
  basic_id uuid;
  advanced_id uuid;
  pro_id uuid;
  feat record;
BEGIN
  SELECT id INTO basic_id FROM public.subscription_plans WHERE name = 'basic';
  SELECT id INTO advanced_id FROM public.subscription_plans WHERE name = 'advanced';
  SELECT id INTO pro_id FROM public.subscription_plans WHERE name = 'pro';

  FOR feat IN SELECT id, feature_key FROM public.app_features
  LOOP
    -- Basic: core features only
    INSERT INTO public.plan_features (plan_id, feature_id, enabled) VALUES
      (basic_id, feat.id, feat.feature_key IN ('guests_management', 'budget_management', 'timeline_management'));
    
    -- Advanced: most features
    INSERT INTO public.plan_features (plan_id, feature_id, enabled) VALUES
      (advanced_id, feat.id, feat.feature_key IN (
        'guests_management', 'guests_bulk_import', 'guests_export',
        'budget_management', 'budget_charts',
        'timeline_management', 'timeline_priorities',
        'ceremony_roles', 'collaborators',
        'notifications_system', 'wedding_choices'
      ));
    
    -- Pro: all features
    INSERT INTO public.plan_features (plan_id, feature_id, enabled) VALUES
      (pro_id, feat.id, true);
  END LOOP;
END;
$$;

-- 10. Triggers for updated_at on new tables
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wedding_subscriptions_updated_at
BEFORE UPDATE ON public.wedding_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================
-- Fase 2: Tabelas de Billing + Alterações
-- =====================================================

-- 2.1 Tabela billing_profiles
CREATE TABLE public.billing_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  billing_name text,
  billing_email text,
  tax_id text,
  billing_address jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.billing_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own billing profile"
  ON public.billing_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own billing profile"
  ON public.billing_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own billing profile"
  ON public.billing_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all billing profiles"
  ON public.billing_profiles FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_billing_profiles_updated_at
  BEFORE UPDATE ON public.billing_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2.2 Tabela payment_history
CREATE TABLE public.payment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wedding_id uuid REFERENCES public.wedding_data(id) ON DELETE SET NULL,
  stripe_payment_id text,
  stripe_invoice_id text,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'eur',
  status text NOT NULL DEFAULT 'pending',
  description text,
  payment_type text NOT NULL DEFAULT 'subscription',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment history"
  ON public.payment_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payment history"
  ON public.payment_history FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2.3 Tabela service_subscriptions
CREATE TABLE public.service_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wedding_id uuid NOT NULL REFERENCES public.wedding_data(id) ON DELETE CASCADE,
  service_type text NOT NULL,
  reference_id uuid,
  stripe_subscription_id text,
  auto_renew boolean NOT NULL DEFAULT true,
  amount numeric NOT NULL DEFAULT 0,
  interval text NOT NULL DEFAULT 'yearly',
  current_period_start timestamptz,
  current_period_end timestamptz,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own service subscriptions"
  ON public.service_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own service subscriptions"
  ON public.service_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all service subscriptions"
  ON public.service_subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_service_subscriptions_updated_at
  BEFORE UPDATE ON public.service_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2.4 Alterar subscription_plans
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS one_time_price numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS billing_type text NOT NULL DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS stripe_monthly_price_id text,
  ADD COLUMN IF NOT EXISTS stripe_onetime_price_id text,
  ADD COLUMN IF NOT EXISTS stripe_product_id text;

-- 2.5 Alterar wedding_subscriptions
ALTER TABLE public.wedding_subscriptions
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS billing_type text,
  ADD COLUMN IF NOT EXISTS paid_amount numeric,
  ADD COLUMN IF NOT EXISTS payment_date timestamptz;

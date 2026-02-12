
-- Create role_guides table for admin-editable role manuals
CREATE TABLE public.role_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL UNIQUE,
  title text NOT NULL,
  intro text NOT NULL DEFAULT '',
  responsibilities text[] NOT NULL DEFAULT '{}',
  dos text[] NOT NULL DEFAULT '{}',
  donts text[] NOT NULL DEFAULT '{}',
  faq jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.role_guides ENABLE ROW LEVEL SECURITY;

-- Admins can manage all role guides
CREATE POLICY "Admins can manage role guides"
ON public.role_guides
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can read role guides (public content for event pages)
CREATE POLICY "Anyone can view role guides"
ON public.role_guides
FOR SELECT
USING (true);

-- Create wedding_role_invite_config table for per-wedding invite customization
CREATE TABLE public.wedding_role_invite_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.wedding_data(id) ON DELETE CASCADE,
  role_key text NOT NULL,
  icon_name text DEFAULT 'Crown',
  label text,
  invite_message text,
  accept_message text,
  family_message text,
  theme_color_override text,
  accept_button_text text DEFAULT 'Aceitar Convite',
  show_accept_button boolean DEFAULT true,
  show_celebration boolean DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(wedding_id, role_key)
);

-- Enable RLS
ALTER TABLE public.wedding_role_invite_config ENABLE ROW LEVEL SECURITY;

-- Admins can manage all configs
CREATE POLICY "Admins can manage role invite configs"
ON public.wedding_role_invite_config
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Wedding admins can manage their configs
CREATE POLICY "Wedding admins can manage role invite configs"
ON public.wedding_role_invite_config
FOR ALL
USING (is_wedding_admin(auth.uid(), wedding_id))
WITH CHECK (is_wedding_admin(auth.uid(), wedding_id));

-- Public can view published configs (needed for event page)
CREATE POLICY "Anyone can view role invite configs"
ON public.wedding_role_invite_config
FOR SELECT
USING (true);

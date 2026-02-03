-- =============================================================================
-- MIGRATION: Multi-Wedding Architecture
-- Adds wedding_id to operational tables, migrates data, updates RLS policies,
-- creates aggregation functions, and enables realtime
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PART 1: Add wedding_id columns to operational tables
-- -----------------------------------------------------------------------------

-- Guests table
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS wedding_id uuid REFERENCES public.wedding_data(id) ON DELETE CASCADE;

-- Budget categories
ALTER TABLE public.budget_categories 
ADD COLUMN IF NOT EXISTS wedding_id uuid REFERENCES public.wedding_data(id) ON DELETE CASCADE;

-- Budget expenses
ALTER TABLE public.budget_expenses 
ADD COLUMN IF NOT EXISTS wedding_id uuid REFERENCES public.wedding_data(id) ON DELETE CASCADE;

-- Budget options
ALTER TABLE public.budget_options 
ADD COLUMN IF NOT EXISTS wedding_id uuid REFERENCES public.wedding_data(id) ON DELETE CASCADE;

-- Timeline tasks
ALTER TABLE public.timeline_tasks 
ADD COLUMN IF NOT EXISTS wedding_id uuid REFERENCES public.wedding_data(id) ON DELETE CASCADE;

-- Notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS wedding_id uuid REFERENCES public.wedding_data(id) ON DELETE CASCADE;

-- Photos
ALTER TABLE public.photos 
ADD COLUMN IF NOT EXISTS wedding_id uuid REFERENCES public.wedding_data(id) ON DELETE CASCADE;

-- -----------------------------------------------------------------------------
-- PART 2: Migrate existing data - link user_id to wedding_id
-- -----------------------------------------------------------------------------

-- Update guests
UPDATE public.guests g
SET wedding_id = wd.id
FROM public.wedding_data wd
WHERE g.user_id = wd.user_id
AND g.wedding_id IS NULL;

-- Update budget_categories
UPDATE public.budget_categories bc
SET wedding_id = wd.id
FROM public.wedding_data wd
WHERE bc.user_id = wd.user_id
AND bc.wedding_id IS NULL;

-- Update budget_expenses
UPDATE public.budget_expenses be
SET wedding_id = wd.id
FROM public.wedding_data wd
WHERE be.user_id = wd.user_id
AND be.wedding_id IS NULL;

-- Update budget_options
UPDATE public.budget_options bo
SET wedding_id = wd.id
FROM public.wedding_data wd
WHERE bo.user_id = wd.user_id
AND bo.wedding_id IS NULL;

-- Update timeline_tasks
UPDATE public.timeline_tasks tt
SET wedding_id = wd.id
FROM public.wedding_data wd
WHERE tt.user_id = wd.user_id
AND tt.wedding_id IS NULL;

-- Update notifications
UPDATE public.notifications n
SET wedding_id = wd.id
FROM public.wedding_data wd
WHERE n.user_id = wd.user_id
AND n.wedding_id IS NULL;

-- Update photos
UPDATE public.photos p
SET wedding_id = wd.id
FROM public.wedding_data wd
WHERE p.user_id = wd.user_id
AND p.wedding_id IS NULL;

-- -----------------------------------------------------------------------------
-- PART 3: Create indexes for performance
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_guests_wedding_id ON public.guests(wedding_id);
CREATE INDEX IF NOT EXISTS idx_guests_wedding_confirmed ON public.guests(wedding_id, confirmed);
CREATE INDEX IF NOT EXISTS idx_guests_wedding_category ON public.guests(wedding_id, category);

CREATE INDEX IF NOT EXISTS idx_budget_categories_wedding_id ON public.budget_categories(wedding_id);
CREATE INDEX IF NOT EXISTS idx_budget_expenses_wedding_id ON public.budget_expenses(wedding_id);
CREATE INDEX IF NOT EXISTS idx_budget_expenses_wedding_status ON public.budget_expenses(wedding_id, status);
CREATE INDEX IF NOT EXISTS idx_budget_options_wedding_id ON public.budget_options(wedding_id);

CREATE INDEX IF NOT EXISTS idx_timeline_tasks_wedding_id ON public.timeline_tasks(wedding_id);
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_wedding_completed ON public.timeline_tasks(wedding_id, completed);
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_wedding_due ON public.timeline_tasks(wedding_id, due_date);

CREATE INDEX IF NOT EXISTS idx_notifications_wedding_id ON public.notifications(wedding_id);
CREATE INDEX IF NOT EXISTS idx_photos_wedding_id ON public.photos(wedding_id);

-- -----------------------------------------------------------------------------
-- PART 4: Drop old RLS policies and create new wedding_id based policies
-- -----------------------------------------------------------------------------

-- GUESTS - Drop old policies
DROP POLICY IF EXISTS "Users can view wedding guests" ON public.guests;
DROP POLICY IF EXISTS "Wedding admins can manage guests" ON public.guests;

-- GUESTS - New policies using wedding_id
CREATE POLICY "Collaborators can view wedding guests"
ON public.guests FOR SELECT
TO authenticated
USING (
  wedding_id IS NOT NULL 
  AND is_wedding_collaborator(auth.uid(), wedding_id)
);

CREATE POLICY "Wedding admins can manage guests"
ON public.guests FOR ALL
TO authenticated
USING (
  wedding_id IS NOT NULL 
  AND is_wedding_admin(auth.uid(), wedding_id)
)
WITH CHECK (
  wedding_id IS NOT NULL 
  AND is_wedding_admin(auth.uid(), wedding_id)
);

-- BUDGET CATEGORIES - Drop old policies
DROP POLICY IF EXISTS "Collaborators can view budget categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Wedding admins can manage budget categories" ON public.budget_categories;

-- BUDGET CATEGORIES - New policies
CREATE POLICY "Collaborators can view budget categories"
ON public.budget_categories FOR SELECT
TO authenticated
USING (
  wedding_id IS NOT NULL 
  AND is_wedding_collaborator(auth.uid(), wedding_id)
);

CREATE POLICY "Wedding admins can manage budget categories"
ON public.budget_categories FOR ALL
TO authenticated
USING (
  wedding_id IS NOT NULL 
  AND is_wedding_admin(auth.uid(), wedding_id)
)
WITH CHECK (
  wedding_id IS NOT NULL 
  AND is_wedding_admin(auth.uid(), wedding_id)
);

-- BUDGET EXPENSES - Drop old policies
DROP POLICY IF EXISTS "Collaborators can view budget expenses" ON public.budget_expenses;
DROP POLICY IF EXISTS "Wedding admins can manage budget expenses" ON public.budget_expenses;

-- BUDGET EXPENSES - New policies
CREATE POLICY "Collaborators can view budget expenses"
ON public.budget_expenses FOR SELECT
TO authenticated
USING (
  wedding_id IS NOT NULL 
  AND is_wedding_collaborator(auth.uid(), wedding_id)
);

CREATE POLICY "Wedding admins can manage budget expenses"
ON public.budget_expenses FOR ALL
TO authenticated
USING (
  wedding_id IS NOT NULL 
  AND is_wedding_admin(auth.uid(), wedding_id)
)
WITH CHECK (
  wedding_id IS NOT NULL 
  AND is_wedding_admin(auth.uid(), wedding_id)
);

-- BUDGET OPTIONS - Drop old policies
DROP POLICY IF EXISTS "Collaborators can view budget options" ON public.budget_options;
DROP POLICY IF EXISTS "Wedding admins can manage budget options" ON public.budget_options;

-- BUDGET OPTIONS - New policies
CREATE POLICY "Collaborators can view budget options"
ON public.budget_options FOR SELECT
TO authenticated
USING (
  wedding_id IS NOT NULL 
  AND is_wedding_collaborator(auth.uid(), wedding_id)
);

CREATE POLICY "Wedding admins can manage budget options"
ON public.budget_options FOR ALL
TO authenticated
USING (
  wedding_id IS NOT NULL 
  AND is_wedding_admin(auth.uid(), wedding_id)
)
WITH CHECK (
  wedding_id IS NOT NULL 
  AND is_wedding_admin(auth.uid(), wedding_id)
);

-- TIMELINE TASKS - Drop old policies
DROP POLICY IF EXISTS "Collaborators can view timeline tasks" ON public.timeline_tasks;
DROP POLICY IF EXISTS "Wedding admins can manage timeline tasks" ON public.timeline_tasks;

-- TIMELINE TASKS - New policies
CREATE POLICY "Collaborators can view timeline tasks"
ON public.timeline_tasks FOR SELECT
TO authenticated
USING (
  wedding_id IS NOT NULL 
  AND is_wedding_collaborator(auth.uid(), wedding_id)
);

CREATE POLICY "Wedding admins can manage timeline tasks"
ON public.timeline_tasks FOR ALL
TO authenticated
USING (
  wedding_id IS NOT NULL 
  AND is_wedding_admin(auth.uid(), wedding_id)
)
WITH CHECK (
  wedding_id IS NOT NULL 
  AND is_wedding_admin(auth.uid(), wedding_id)
);

-- NOTIFICATIONS - Drop old policies
DROP POLICY IF EXISTS "Collaborators can view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Wedding admins can manage notifications" ON public.notifications;

-- NOTIFICATIONS - New policies
CREATE POLICY "Collaborators can view notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (
  wedding_id IS NOT NULL 
  AND is_wedding_collaborator(auth.uid(), wedding_id)
);

CREATE POLICY "Wedding admins can manage notifications"
ON public.notifications FOR ALL
TO authenticated
USING (
  wedding_id IS NOT NULL 
  AND is_wedding_admin(auth.uid(), wedding_id)
)
WITH CHECK (
  wedding_id IS NOT NULL 
  AND is_wedding_admin(auth.uid(), wedding_id)
);

-- PHOTOS - Drop old policies
DROP POLICY IF EXISTS "Collaborators can view photos" ON public.photos;
DROP POLICY IF EXISTS "Wedding admins can manage photos" ON public.photos;

-- PHOTOS - New policies
CREATE POLICY "Collaborators can view photos"
ON public.photos FOR SELECT
TO authenticated
USING (
  wedding_id IS NOT NULL 
  AND is_wedding_collaborator(auth.uid(), wedding_id)
);

CREATE POLICY "Wedding admins can manage photos"
ON public.photos FOR ALL
TO authenticated
USING (
  wedding_id IS NOT NULL 
  AND is_wedding_admin(auth.uid(), wedding_id)
)
WITH CHECK (
  wedding_id IS NOT NULL 
  AND is_wedding_admin(auth.uid(), wedding_id)
);

-- -----------------------------------------------------------------------------
-- PART 5: Create Dashboard Aggregation RPC
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_wedding_dashboard_metrics(_wedding_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Check if user is a collaborator
  IF NOT is_wedding_collaborator(auth.uid(), _wedding_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT jsonb_build_object(
    'guests', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'confirmed', COUNT(*) FILTER (WHERE confirmed = true),
        'pending', COUNT(*) FILTER (WHERE confirmed = false OR confirmed IS NULL),
        'with_plus_one', COUNT(*) FILTER (WHERE plus_one = true),
        'by_side', jsonb_build_object(
          'noivo', COUNT(*) FILTER (WHERE side = 'noivo'),
          'noiva', COUNT(*) FILTER (WHERE side = 'noiva'),
          'sem_lado', COUNT(*) FILTER (WHERE side IS NULL OR side NOT IN ('noivo', 'noiva'))
        ),
        'by_category', (
          SELECT COALESCE(jsonb_object_agg(category, cnt), '{}'::jsonb)
          FROM (SELECT category, COUNT(*) as cnt FROM guests WHERE wedding_id = _wedding_id GROUP BY category) cats
        )
      )
      FROM guests WHERE wedding_id = _wedding_id
    ),
    'budget', (
      SELECT jsonb_build_object(
        'total_budgeted', COALESCE(SUM(budgeted_amount), 0),
        'total_spent', COALESCE(SUM(spent_amount), 0),
        'categories_count', COUNT(*),
        'categories', (
          SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'id', id,
            'name', name,
            'budgeted', budgeted_amount,
            'spent', spent_amount,
            'color', color,
            'icon', icon
          ) ORDER BY name), '[]'::jsonb)
          FROM budget_categories WHERE wedding_id = _wedding_id
        )
      )
      FROM budget_categories WHERE wedding_id = _wedding_id
    ),
    'timeline', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'completed', COUNT(*) FILTER (WHERE completed = true),
        'pending', COUNT(*) FILTER (WHERE completed = false),
        'overdue', COUNT(*) FILTER (WHERE completed = false AND due_date < CURRENT_DATE),
        'upcoming_week', COUNT(*) FILTER (WHERE completed = false AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'),
        'by_priority', jsonb_build_object(
          'alta', COUNT(*) FILTER (WHERE priority = 'alta'),
          'media', COUNT(*) FILTER (WHERE priority = 'media'),
          'baixa', COUNT(*) FILTER (WHERE priority = 'baixa')
        )
      )
      FROM timeline_tasks WHERE wedding_id = _wedding_id
    ),
    'notifications', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'unread', COUNT(*) FILTER (WHERE read = false)
      )
      FROM notifications WHERE wedding_id = _wedding_id
    ),
    'wedding', (
      SELECT jsonb_build_object(
        'id', id,
        'couple_name', couple_name,
        'partner_name', partner_name,
        'wedding_date', wedding_date,
        'estimated_budget', estimated_budget,
        'guest_count', guest_count,
        'days_until', CASE 
          WHEN wedding_date IS NOT NULL THEN wedding_date - CURRENT_DATE 
          ELSE NULL 
        END
      )
      FROM wedding_data WHERE id = _wedding_id
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- -----------------------------------------------------------------------------
-- PART 6: Create Paginated Guests RPC
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_guests_paginated(
  _wedding_id uuid,
  _page int DEFAULT 1,
  _page_size int DEFAULT 20,
  _search text DEFAULT NULL,
  _category text DEFAULT NULL,
  _side text DEFAULT NULL,
  _confirmed boolean DEFAULT NULL,
  _order_by text DEFAULT 'name',
  _order_dir text DEFAULT 'asc'
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  total_count int;
  offset_val int;
BEGIN
  -- Check authorization
  IF NOT is_wedding_collaborator(auth.uid(), _wedding_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  offset_val := (_page - 1) * _page_size;

  -- Get total count with filters
  SELECT COUNT(*) INTO total_count
  FROM guests g
  WHERE g.wedding_id = _wedding_id
    AND (_search IS NULL OR g.name ILIKE '%' || _search || '%' OR g.email ILIKE '%' || _search || '%')
    AND (_category IS NULL OR g.category = _category)
    AND (_side IS NULL OR g.side = _side)
    AND (_confirmed IS NULL OR g.confirmed = _confirmed);

  -- Get paginated results
  SELECT jsonb_build_object(
    'data', COALESCE((
      SELECT jsonb_agg(row_to_json(g.*) ORDER BY
        CASE WHEN _order_by = 'name' AND _order_dir = 'asc' THEN g.name END ASC,
        CASE WHEN _order_by = 'name' AND _order_dir = 'desc' THEN g.name END DESC,
        CASE WHEN _order_by = 'created_at' AND _order_dir = 'asc' THEN g.created_at END ASC,
        CASE WHEN _order_by = 'created_at' AND _order_dir = 'desc' THEN g.created_at END DESC
      )
      FROM (
        SELECT *
        FROM guests
        WHERE wedding_id = _wedding_id
          AND (_search IS NULL OR name ILIKE '%' || _search || '%' OR email ILIKE '%' || _search || '%')
          AND (_category IS NULL OR category = _category)
          AND (_side IS NULL OR side = _side)
          AND (_confirmed IS NULL OR confirmed = _confirmed)
        ORDER BY
          CASE WHEN _order_by = 'name' AND _order_dir = 'asc' THEN name END ASC,
          CASE WHEN _order_by = 'name' AND _order_dir = 'desc' THEN name END DESC,
          CASE WHEN _order_by = 'created_at' AND _order_dir = 'asc' THEN created_at END ASC,
          CASE WHEN _order_by = 'created_at' AND _order_dir = 'desc' THEN created_at END DESC
        LIMIT _page_size
        OFFSET offset_val
      ) g
    ), '[]'::jsonb),
    'pagination', jsonb_build_object(
      'page', _page,
      'page_size', _page_size,
      'total', total_count,
      'total_pages', CEIL(total_count::float / _page_size)
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- -----------------------------------------------------------------------------
-- PART 7: Create Paginated Budget RPC
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_budget_paginated(
  _wedding_id uuid,
  _page int DEFAULT 1,
  _page_size int DEFAULT 20,
  _category_id uuid DEFAULT NULL,
  _status text DEFAULT NULL,
  _order_by text DEFAULT 'date',
  _order_dir text DEFAULT 'desc'
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  total_count int;
  offset_val int;
BEGIN
  -- Check authorization
  IF NOT is_wedding_collaborator(auth.uid(), _wedding_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  offset_val := (_page - 1) * _page_size;

  -- Get total count with filters
  SELECT COUNT(*) INTO total_count
  FROM budget_expenses e
  WHERE e.wedding_id = _wedding_id
    AND (_category_id IS NULL OR e.category_id = _category_id)
    AND (_status IS NULL OR e.status = _status);

  -- Get paginated results
  SELECT jsonb_build_object(
    'data', COALESCE((
      SELECT jsonb_agg(row_to_json(e.*))
      FROM (
        SELECT be.*, bc.name as category_name, bc.color as category_color, bc.icon as category_icon
        FROM budget_expenses be
        LEFT JOIN budget_categories bc ON bc.id = be.category_id
        WHERE be.wedding_id = _wedding_id
          AND (_category_id IS NULL OR be.category_id = _category_id)
          AND (_status IS NULL OR be.status = _status)
        ORDER BY
          CASE WHEN _order_by = 'date' AND _order_dir = 'desc' THEN be.date END DESC,
          CASE WHEN _order_by = 'date' AND _order_dir = 'asc' THEN be.date END ASC,
          CASE WHEN _order_by = 'amount' AND _order_dir = 'desc' THEN be.amount END DESC,
          CASE WHEN _order_by = 'amount' AND _order_dir = 'asc' THEN be.amount END ASC
        LIMIT _page_size
        OFFSET offset_val
      ) e
    ), '[]'::jsonb),
    'pagination', jsonb_build_object(
      'page', _page,
      'page_size', _page_size,
      'total', total_count,
      'total_pages', CEIL(total_count::float / _page_size)
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- -----------------------------------------------------------------------------
-- PART 8: Seed Default Categories and Tasks RPC
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.seed_wedding_defaults(_wedding_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _wedding_date date;
BEGIN
  -- Check authorization
  IF NOT is_wedding_admin(auth.uid(), _wedding_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Get user_id and wedding_date
  SELECT user_id, wedding_date INTO _user_id, _wedding_date
  FROM wedding_data WHERE id = _wedding_id;

  -- Insert default budget categories if none exist
  IF NOT EXISTS (SELECT 1 FROM budget_categories WHERE wedding_id = _wedding_id) THEN
    INSERT INTO budget_categories (wedding_id, user_id, name, icon, color, is_default, priority) VALUES
      (_wedding_id, _user_id, 'Local & Catering', 'MapPin', '#ef4444', true, 'alta'),
      (_wedding_id, _user_id, 'Fotografia & Vídeo', 'Camera', '#f97316', true, 'alta'),
      (_wedding_id, _user_id, 'Vestuário', 'Shirt', '#eab308', true, 'media'),
      (_wedding_id, _user_id, 'Decoração & Flores', 'Flower2', '#22c55e', true, 'media'),
      (_wedding_id, _user_id, 'Música & Entretenimento', 'Music', '#3b82f6', true, 'media'),
      (_wedding_id, _user_id, 'Papelaria & Convites', 'FileText', '#8b5cf6', true, 'baixa'),
      (_wedding_id, _user_id, 'Beleza', 'Sparkles', '#ec4899', true, 'media'),
      (_wedding_id, _user_id, 'Transporte', 'Car', '#6366f1', true, 'baixa'),
      (_wedding_id, _user_id, 'Alianças & Joias', 'Heart', '#f43f5e', true, 'alta'),
      (_wedding_id, _user_id, 'Outros', 'MoreHorizontal', '#64748b', true, 'baixa');
  END IF;

  -- Insert default timeline tasks if none exist
  IF NOT EXISTS (SELECT 1 FROM timeline_tasks WHERE wedding_id = _wedding_id) THEN
    INSERT INTO timeline_tasks (wedding_id, user_id, title, description, due_date, priority, category) VALUES
      (_wedding_id, _user_id, 'Definir orçamento total', 'Estabelecer o orçamento global para o casamento', COALESCE(_wedding_date - INTERVAL '12 months', CURRENT_DATE + INTERVAL '30 days'), 'alta', 'budget'),
      (_wedding_id, _user_id, 'Escolher data do casamento', 'Definir a data oficial do evento', COALESCE(_wedding_date - INTERVAL '11 months', CURRENT_DATE + INTERVAL '30 days'), 'alta', 'planning'),
      (_wedding_id, _user_id, 'Visitar locais para cerimónia', 'Agendar visitas a possíveis locais', COALESCE(_wedding_date - INTERVAL '10 months', CURRENT_DATE + INTERVAL '60 days'), 'alta', 'venue'),
      (_wedding_id, _user_id, 'Contratar fotógrafo', 'Pesquisar e reservar fotógrafo profissional', COALESCE(_wedding_date - INTERVAL '9 months', CURRENT_DATE + INTERVAL '90 days'), 'alta', 'vendors'),
      (_wedding_id, _user_id, 'Elaborar lista de convidados', 'Criar lista inicial de convidados', COALESCE(_wedding_date - INTERVAL '8 months', CURRENT_DATE + INTERVAL '120 days'), 'media', 'guests'),
      (_wedding_id, _user_id, 'Enviar Save the Date', 'Enviar cartões de save the date', COALESCE(_wedding_date - INTERVAL '6 months', CURRENT_DATE + INTERVAL '180 days'), 'media', 'guests'),
      (_wedding_id, _user_id, 'Escolher vestido/fato', 'Agendar provas de vestuário', COALESCE(_wedding_date - INTERVAL '6 months', CURRENT_DATE + INTERVAL '180 days'), 'alta', 'attire'),
      (_wedding_id, _user_id, 'Contratar catering', 'Definir menu e contratar serviço', COALESCE(_wedding_date - INTERVAL '5 months', CURRENT_DATE + INTERVAL '150 days'), 'alta', 'vendors'),
      (_wedding_id, _user_id, 'Reservar DJ/Banda', 'Contratar entretenimento musical', COALESCE(_wedding_date - INTERVAL '5 months', CURRENT_DATE + INTERVAL '150 days'), 'media', 'vendors'),
      (_wedding_id, _user_id, 'Enviar convites', 'Enviar convites oficiais', COALESCE(_wedding_date - INTERVAL '3 months', CURRENT_DATE + INTERVAL '90 days'), 'alta', 'guests'),
      (_wedding_id, _user_id, 'Confirmar presenças', 'Recolher confirmações dos convidados', COALESCE(_wedding_date - INTERVAL '1 month', CURRENT_DATE + INTERVAL '30 days'), 'alta', 'guests'),
      (_wedding_id, _user_id, 'Ensaio da cerimónia', 'Organizar ensaio geral', COALESCE(_wedding_date - INTERVAL '1 week', CURRENT_DATE + INTERVAL '7 days'), 'media', 'ceremony');
  END IF;
END;
$$;

-- -----------------------------------------------------------------------------
-- PART 9: Trigger to auto-seed defaults on wedding creation
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.trigger_seed_wedding_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only seed if setup is complete
  IF NEW.is_setup_complete = true AND (OLD IS NULL OR OLD.is_setup_complete = false) THEN
    PERFORM public.seed_wedding_defaults(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_wedding_setup_complete ON public.wedding_data;
CREATE TRIGGER on_wedding_setup_complete
  AFTER INSERT OR UPDATE OF is_setup_complete ON public.wedding_data
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_seed_wedding_defaults();

-- -----------------------------------------------------------------------------
-- PART 10: Enable Realtime for main tables
-- -----------------------------------------------------------------------------

ALTER PUBLICATION supabase_realtime ADD TABLE public.guests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budget_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budget_expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.timeline_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Grant execute on new functions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_wedding_dashboard_metrics(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_guests_paginated(uuid, int, int, text, text, text, boolean, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_budget_paginated(uuid, int, int, uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.seed_wedding_defaults(uuid) TO authenticated;
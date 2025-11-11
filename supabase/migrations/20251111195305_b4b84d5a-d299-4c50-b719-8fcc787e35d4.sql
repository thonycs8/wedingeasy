-- Fix RLS policies to allow wedding collaborators (especially 'noiva') to access all wedding data
-- The issue is that guests, budget items, etc. are tied to the creator's user_id,
-- but collaborators need to access them via wedding_id

-- First, let's create a helper function to get wedding_id from user_id
CREATE OR REPLACE FUNCTION public.get_wedding_id_from_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Get wedding_id where user is owner
  SELECT id FROM public.wedding_data WHERE user_id = _user_id
  UNION
  -- Get wedding_id where user is collaborator
  SELECT wedding_id FROM public.wedding_collaborators WHERE user_id = _user_id
  LIMIT 1;
$$;

-- Update guests policies
DROP POLICY IF EXISTS "Users can view their own guests" ON public.guests;
DROP POLICY IF EXISTS "Wedding admins can manage guests" ON public.guests;
DROP POLICY IF EXISTS "Users can insert their own guests" ON public.guests;

CREATE POLICY "Users can view wedding guests"
ON public.guests
FOR SELECT
TO authenticated
USING (
  -- User owns the guest record
  auth.uid() = user_id
  OR
  -- User is collaborator of the wedding that owns these guests
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(guests.user_id)
  )
);

CREATE POLICY "Wedding admins can manage guests"
ON public.guests
FOR ALL
TO authenticated
USING (
  -- User owns the guest record
  auth.uid() = user_id
  OR
  -- User is admin (noiva, noivo, celebrante) of the wedding
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(guests.user_id)
    AND wc.role IN ('noivo', 'noiva', 'celebrante')
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(guests.user_id)
    AND wc.role IN ('noivo', 'noiva', 'celebrante')
  )
);

CREATE POLICY "Users can insert wedding guests"
ON public.guests
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(user_id)
    AND wc.role IN ('noivo', 'noiva', 'celebrante')
  )
);

-- Update budget_categories policies
DROP POLICY IF EXISTS "Collaborators can view budget categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Wedding admins can manage budget categories" ON public.budget_categories;

CREATE POLICY "Collaborators can view budget categories"
ON public.budget_categories
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(budget_categories.user_id)
  )
);

CREATE POLICY "Wedding admins can manage budget categories"
ON public.budget_categories
FOR ALL
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(budget_categories.user_id)
    AND wc.role IN ('noivo', 'noiva', 'celebrante')
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(budget_categories.user_id)
    AND wc.role IN ('noivo', 'noiva', 'celebrante')
  )
);

-- Update budget_expenses policies
DROP POLICY IF EXISTS "Collaborators can view budget expenses" ON public.budget_expenses;
DROP POLICY IF EXISTS "Wedding admins can manage budget expenses" ON public.budget_expenses;

CREATE POLICY "Collaborators can view budget expenses"
ON public.budget_expenses
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(budget_expenses.user_id)
  )
);

CREATE POLICY "Wedding admins can manage budget expenses"
ON public.budget_expenses
FOR ALL
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(budget_expenses.user_id)
    AND wc.role IN ('noivo', 'noiva', 'celebrante')
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(budget_expenses.user_id)
    AND wc.role IN ('noivo', 'noiva', 'celebrante')
  )
);

-- Update timeline_tasks policies
DROP POLICY IF EXISTS "Collaborators can view timeline tasks" ON public.timeline_tasks;
DROP POLICY IF EXISTS "Wedding admins can manage timeline tasks" ON public.timeline_tasks;

CREATE POLICY "Collaborators can view timeline tasks"
ON public.timeline_tasks
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(timeline_tasks.user_id)
  )
);

CREATE POLICY "Wedding admins can manage timeline tasks"
ON public.timeline_tasks
FOR ALL
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(timeline_tasks.user_id)
    AND wc.role IN ('noivo', 'noiva', 'celebrante')
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(timeline_tasks.user_id)
    AND wc.role IN ('noivo', 'noiva', 'celebrante')
  )
);

-- Update notifications policies
DROP POLICY IF EXISTS "Collaborators can view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Wedding admins can manage notifications" ON public.notifications;

CREATE POLICY "Collaborators can view notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(notifications.user_id)
  )
);

CREATE POLICY "Wedding admins can manage notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(notifications.user_id)
    AND wc.role IN ('noivo', 'noiva', 'celebrante')
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(notifications.user_id)
    AND wc.role IN ('noivo', 'noiva', 'celebrante')
  )
);

-- Update photos policies
DROP POLICY IF EXISTS "Collaborators can view photos" ON public.photos;
DROP POLICY IF EXISTS "Wedding admins can manage photos" ON public.photos;

CREATE POLICY "Collaborators can view photos"
ON public.photos
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(photos.user_id)
  )
);

CREATE POLICY "Wedding admins can manage photos"
ON public.photos
FOR ALL
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(photos.user_id)
    AND wc.role IN ('noivo', 'noiva', 'celebrante')
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators wc
    WHERE wc.user_id = auth.uid()
    AND wc.wedding_id = public.get_wedding_id_from_user(photos.user_id)
    AND wc.role IN ('noivo', 'noiva', 'celebrante')
  )
);
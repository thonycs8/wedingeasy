-- Create function to check if user is a wedding owner (noivo/noiva)
CREATE OR REPLACE FUNCTION public.is_wedding_owner(_user_id uuid, _wedding_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.wedding_collaborators
    WHERE wedding_id = _wedding_id
      AND user_id = _user_id
      AND role IN ('noivo', 'noiva')
  );
$$;

-- Update wedding_data policies to ensure owners have full access
DROP POLICY IF EXISTS "Collaborators can update wedding data" ON public.wedding_data;
DROP POLICY IF EXISTS "Collaborators can view wedding data" ON public.wedding_data;
DROP POLICY IF EXISTS "Users can insert their own wedding data" ON public.wedding_data;

CREATE POLICY "Wedding owners can manage wedding data"
ON public.wedding_data
FOR ALL
USING (
  (user_id = auth.uid()) OR is_wedding_owner(auth.uid(), id)
)
WITH CHECK (
  (user_id = auth.uid()) OR is_wedding_owner(auth.uid(), id)
);

CREATE POLICY "Collaborators can view wedding data"
ON public.wedding_data
FOR SELECT
USING (is_wedding_collaborator(auth.uid(), id));

-- Update budget_categories policies
DROP POLICY IF EXISTS "Collaborators can delete budget categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Collaborators can insert budget categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Collaborators can update budget categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Collaborators can view budget categories" ON public.budget_categories;

CREATE POLICY "Wedding owners can manage budget categories"
ON public.budget_categories
FOR ALL
USING (
  (user_id = auth.uid()) OR is_wedding_owner(auth.uid(), get_user_wedding_id(user_id))
)
WITH CHECK (
  (user_id = auth.uid()) OR is_wedding_owner(auth.uid(), get_user_wedding_id(user_id))
);

CREATE POLICY "Collaborators can view budget categories"
ON public.budget_categories
FOR SELECT
USING (is_wedding_collaborator(auth.uid(), get_user_wedding_id(user_id)));

-- Update budget_expenses policies
DROP POLICY IF EXISTS "Collaborators can delete budget expenses" ON public.budget_expenses;
DROP POLICY IF EXISTS "Collaborators can insert budget expenses" ON public.budget_expenses;
DROP POLICY IF EXISTS "Collaborators can update budget expenses" ON public.budget_expenses;
DROP POLICY IF EXISTS "Collaborators can view budget expenses" ON public.budget_expenses;

CREATE POLICY "Wedding owners can manage budget expenses"
ON public.budget_expenses
FOR ALL
USING (
  (user_id = auth.uid()) OR is_wedding_owner(auth.uid(), get_user_wedding_id(user_id))
)
WITH CHECK (
  (user_id = auth.uid()) OR is_wedding_owner(auth.uid(), get_user_wedding_id(user_id))
);

CREATE POLICY "Collaborators can view budget expenses"
ON public.budget_expenses
FOR SELECT
USING (is_wedding_collaborator(auth.uid(), get_user_wedding_id(user_id)));

-- Update budget_options policies
DROP POLICY IF EXISTS "Collaborators can delete budget options" ON public.budget_options;
DROP POLICY IF EXISTS "Collaborators can insert budget options" ON public.budget_options;
DROP POLICY IF EXISTS "Collaborators can update budget options" ON public.budget_options;
DROP POLICY IF EXISTS "Collaborators can view budget options" ON public.budget_options;

CREATE POLICY "Wedding owners can manage budget options"
ON public.budget_options
FOR ALL
USING (
  (user_id = auth.uid()) OR is_wedding_owner(auth.uid(), get_user_wedding_id(user_id))
)
WITH CHECK (
  (user_id = auth.uid()) OR is_wedding_owner(auth.uid(), get_user_wedding_id(user_id))
);

CREATE POLICY "Collaborators can view budget options"
ON public.budget_options
FOR SELECT
USING (is_wedding_collaborator(auth.uid(), get_user_wedding_id(user_id)));

-- Update timeline_tasks policies
DROP POLICY IF EXISTS "Collaborators can delete timeline tasks" ON public.timeline_tasks;
DROP POLICY IF EXISTS "Collaborators can insert timeline tasks" ON public.timeline_tasks;
DROP POLICY IF EXISTS "Collaborators can update timeline tasks" ON public.timeline_tasks;
DROP POLICY IF EXISTS "Collaborators can view timeline tasks" ON public.timeline_tasks;

CREATE POLICY "Wedding owners can manage timeline tasks"
ON public.timeline_tasks
FOR ALL
USING (
  (user_id = auth.uid()) OR is_wedding_owner(auth.uid(), get_user_wedding_id(user_id))
)
WITH CHECK (
  (user_id = auth.uid()) OR is_wedding_owner(auth.uid(), get_user_wedding_id(user_id))
);

CREATE POLICY "Collaborators can view timeline tasks"
ON public.timeline_tasks
FOR SELECT
USING (is_wedding_collaborator(auth.uid(), get_user_wedding_id(user_id)));

-- Update guests policies
DROP POLICY IF EXISTS "Collaborators can delete guests" ON public.guests;
DROP POLICY IF EXISTS "Collaborators can insert guests" ON public.guests;
DROP POLICY IF EXISTS "Collaborators can update guests" ON public.guests;
DROP POLICY IF EXISTS "Collaborators can view guests" ON public.guests;

CREATE POLICY "Wedding owners can manage guests"
ON public.guests
FOR ALL
USING (
  (user_id = auth.uid()) OR is_wedding_owner(auth.uid(), get_user_wedding_id(user_id))
)
WITH CHECK (
  (user_id = auth.uid()) OR is_wedding_owner(auth.uid(), get_user_wedding_id(user_id))
);

CREATE POLICY "Collaborators can view guests"
ON public.guests
FOR SELECT
USING (is_wedding_collaborator(auth.uid(), get_user_wedding_id(user_id)));

-- Update photos policies
DROP POLICY IF EXISTS "Collaborators can delete photos" ON public.photos;
DROP POLICY IF EXISTS "Collaborators can insert photos" ON public.photos;
DROP POLICY IF EXISTS "Collaborators can update photos" ON public.photos;
DROP POLICY IF EXISTS "Collaborators can view photos" ON public.photos;

CREATE POLICY "Wedding owners can manage photos"
ON public.photos
FOR ALL
USING (
  (user_id = auth.uid()) OR is_wedding_owner(auth.uid(), get_user_wedding_id(user_id))
)
WITH CHECK (
  (user_id = auth.uid()) OR is_wedding_owner(auth.uid(), get_user_wedding_id(user_id))
);

CREATE POLICY "Collaborators can view photos"
ON public.photos
FOR SELECT
USING (is_wedding_collaborator(auth.uid(), get_user_wedding_id(user_id)));

-- Update notifications policies
DROP POLICY IF EXISTS "Collaborators can delete notifications" ON public.notifications;
DROP POLICY IF EXISTS "Collaborators can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Collaborators can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Collaborators can view notifications" ON public.notifications;

CREATE POLICY "Wedding owners can manage notifications"
ON public.notifications
FOR ALL
USING (
  (user_id = auth.uid()) OR is_wedding_owner(auth.uid(), get_user_wedding_id(user_id))
)
WITH CHECK (
  (user_id = auth.uid()) OR is_wedding_owner(auth.uid(), get_user_wedding_id(user_id))
);

CREATE POLICY "Collaborators can view notifications"
ON public.notifications
FOR SELECT
USING (is_wedding_collaborator(auth.uid(), get_user_wedding_id(user_id)));
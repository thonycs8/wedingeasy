-- Create function to check if user is an administrator of a wedding (noivo, noiva, or celebrante)
CREATE OR REPLACE FUNCTION public.is_wedding_admin(_user_id uuid, _wedding_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Check if user is the wedding owner
  SELECT EXISTS (
    SELECT 1 FROM public.wedding_data
    WHERE id = _wedding_id AND user_id = _user_id
  )
  OR
  -- Check if user is a collaborator with admin role (noiva or celebrante)
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators
    WHERE wedding_id = _wedding_id 
      AND user_id = _user_id 
      AND role IN ('noiva', 'celebrante')
  );
$$;

-- Update wedding_data policies
DROP POLICY IF EXISTS "Wedding owners can manage wedding data" ON public.wedding_data;
CREATE POLICY "Wedding admins can manage wedding data"
ON public.wedding_data
FOR ALL
USING (
  (user_id = auth.uid()) OR is_wedding_admin(auth.uid(), id)
)
WITH CHECK (
  (user_id = auth.uid()) OR is_wedding_admin(auth.uid(), id)
);

-- Update budget_categories policies
DROP POLICY IF EXISTS "Wedding owners can manage budget categories" ON public.budget_categories;
CREATE POLICY "Wedding admins can manage budget categories"
ON public.budget_categories
FOR ALL
USING (
  (user_id = auth.uid()) OR is_wedding_admin(auth.uid(), get_user_wedding_id(user_id))
)
WITH CHECK (
  (user_id = auth.uid()) OR is_wedding_admin(auth.uid(), get_user_wedding_id(user_id))
);

-- Update budget_expenses policies
DROP POLICY IF EXISTS "Wedding owners can manage budget expenses" ON public.budget_expenses;
CREATE POLICY "Wedding admins can manage budget expenses"
ON public.budget_expenses
FOR ALL
USING (
  (user_id = auth.uid()) OR is_wedding_admin(auth.uid(), get_user_wedding_id(user_id))
)
WITH CHECK (
  (user_id = auth.uid()) OR is_wedding_admin(auth.uid(), get_user_wedding_id(user_id))
);

-- Update budget_options policies
DROP POLICY IF EXISTS "Wedding owners can manage budget options" ON public.budget_options;
CREATE POLICY "Wedding admins can manage budget options"
ON public.budget_options
FOR ALL
USING (
  (user_id = auth.uid()) OR is_wedding_admin(auth.uid(), get_user_wedding_id(user_id))
)
WITH CHECK (
  (user_id = auth.uid()) OR is_wedding_admin(auth.uid(), get_user_wedding_id(user_id))
);

-- Update timeline_tasks policies
DROP POLICY IF EXISTS "Wedding owners can manage timeline tasks" ON public.timeline_tasks;
CREATE POLICY "Wedding admins can manage timeline tasks"
ON public.timeline_tasks
FOR ALL
USING (
  (user_id = auth.uid()) OR is_wedding_admin(auth.uid(), get_user_wedding_id(user_id))
)
WITH CHECK (
  (user_id = auth.uid()) OR is_wedding_admin(auth.uid(), get_user_wedding_id(user_id))
);

-- Update notifications policies
DROP POLICY IF EXISTS "Wedding owners can manage notifications" ON public.notifications;
CREATE POLICY "Wedding admins can manage notifications"
ON public.notifications
FOR ALL
USING (
  (user_id = auth.uid()) OR is_wedding_admin(auth.uid(), get_user_wedding_id(user_id))
)
WITH CHECK (
  (user_id = auth.uid()) OR is_wedding_admin(auth.uid(), get_user_wedding_id(user_id))
);

-- Update photos policies
DROP POLICY IF EXISTS "Wedding owners can manage photos" ON public.photos;
CREATE POLICY "Wedding admins can manage photos"
ON public.photos
FOR ALL
USING (
  (user_id = auth.uid()) OR is_wedding_admin(auth.uid(), get_user_wedding_id(user_id))
)
WITH CHECK (
  (user_id = auth.uid()) OR is_wedding_admin(auth.uid(), get_user_wedding_id(user_id))
);

-- Update guests policies to allow admins to manage
DROP POLICY IF EXISTS "Users can delete their own guests" ON public.guests;
DROP POLICY IF EXISTS "Users can update their own guests" ON public.guests;

CREATE POLICY "Wedding admins can manage guests"
ON public.guests
FOR ALL
USING (
  (auth.uid() = user_id) OR is_wedding_admin(auth.uid(), get_user_wedding_id(user_id))
)
WITH CHECK (
  (auth.uid() = user_id) OR is_wedding_admin(auth.uid(), get_user_wedding_id(user_id))
);

-- Function to cascade delete all wedding/event data (GDPR compliant)
CREATE OR REPLACE FUNCTION public.admin_delete_wedding_cascade(_wedding_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins can execute
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Delete all related data in correct order
  DELETE FROM public.notifications WHERE wedding_id = _wedding_id;
  DELETE FROM public.photos WHERE wedding_id = _wedding_id;
  DELETE FROM public.budget_expenses WHERE wedding_id = _wedding_id;
  DELETE FROM public.budget_options WHERE wedding_id = _wedding_id;
  DELETE FROM public.budget_categories WHERE wedding_id = _wedding_id;
  DELETE FROM public.timeline_tasks WHERE wedding_id = _wedding_id;
  DELETE FROM public.guests WHERE wedding_id = _wedding_id;
  DELETE FROM public.wedding_choices WHERE wedding_id = _wedding_id;
  DELETE FROM public.wedding_landing_pages WHERE wedding_id = _wedding_id;
  DELETE FROM public.wedding_invitations WHERE wedding_id = _wedding_id;
  DELETE FROM public.custom_domains WHERE wedding_id = _wedding_id;
  DELETE FROM public.wedding_guest_pricing WHERE wedding_id = _wedding_id;
  DELETE FROM public.wedding_subscriptions WHERE wedding_id = _wedding_id;
  DELETE FROM public.wedding_collaborators WHERE wedding_id = _wedding_id;
  DELETE FROM public.wedding_data WHERE id = _wedding_id;
END;
$$;

-- Function to cascade delete all user data (GDPR compliant)
CREATE OR REPLACE FUNCTION public.admin_delete_user_data(_target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _wedding_id uuid;
BEGIN
  -- Only admins can execute
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Delete all weddings owned by this user (cascade)
  FOR _wedding_id IN SELECT id FROM public.wedding_data WHERE user_id = _target_user_id
  LOOP
    PERFORM public.admin_delete_wedding_cascade(_wedding_id);
  END LOOP;

  -- Remove user from collaborations they don't own
  DELETE FROM public.wedding_collaborators WHERE user_id = _target_user_id;

  -- Delete user profile
  DELETE FROM public.profiles WHERE user_id = _target_user_id;

  -- Delete user roles
  DELETE FROM public.user_roles WHERE user_id = _target_user_id;

  -- Delete service bookings
  DELETE FROM public.service_bookings WHERE user_id = _target_user_id;
END;
$$;

-- Allow admins to delete wedding invitations
CREATE POLICY "Admins can manage wedding invitations"
ON public.wedding_invitations
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to manage all guests (already exists but ensure delete)
-- Allow admins to delete notifications
CREATE POLICY "Admins can manage all notifications"
ON public.notifications
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Allow admins to manage all budget data
CREATE POLICY "Admins can manage all budget categories"
ON public.budget_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all budget expenses"
ON public.budget_expenses
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all budget options"
ON public.budget_options
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all timeline tasks"
ON public.timeline_tasks
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all photos"
ON public.photos
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all wedding choices"
ON public.wedding_choices
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all landing pages"
ON public.wedding_landing_pages
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all guest pricing"
ON public.wedding_guest_pricing
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all collaborators"
ON public.wedding_collaborators
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

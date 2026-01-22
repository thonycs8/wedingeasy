-- Harden profiles access by explicitly scoping policies to authenticated users
DO $$
BEGIN
  -- Drop existing policies if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Users can insert their own profile') THEN
    EXECUTE 'DROP POLICY "Users can insert their own profile" ON public.profiles';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Users can update their own profile') THEN
    EXECUTE 'DROP POLICY "Users can update their own profile" ON public.profiles';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Users can view collaborator profiles') THEN
    EXECUTE 'DROP POLICY "Users can view collaborator profiles" ON public.profiles';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Users can view their own profile') THEN
    EXECUTE 'DROP POLICY "Users can view their own profile" ON public.profiles';
  END IF;
END $$;

-- Recreate policies with explicit role scoping
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view collaborator profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_id)
  OR (
    EXISTS (
      SELECT 1
      FROM public.wedding_data wd
      JOIN public.wedding_collaborators wc ON wc.wedding_id = wd.id
      WHERE wd.user_id = auth.uid() AND wc.user_id = profiles.user_id
    )
  )
  OR (
    EXISTS (
      SELECT 1
      FROM public.wedding_collaborators wc
      JOIN public.wedding_data wd ON wd.id = wc.wedding_id
      WHERE wc.user_id = auth.uid() AND wd.user_id = profiles.user_id
    )
  )
  OR (
    EXISTS (
      SELECT 1
      FROM public.wedding_collaborators wc1
      JOIN public.wedding_collaborators wc2 ON wc2.wedding_id = wc1.wedding_id
      WHERE wc1.user_id = auth.uid() AND wc2.user_id = profiles.user_id
    )
  )
);

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Reduce risk from SECURITY DEFINER functions by restricting execution privileges
DO $$
BEGIN
  -- Revoke from PUBLIC and grant only to authenticated/service_role where needed
  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role';

  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.is_wedding_collaborator(uuid, uuid) FROM PUBLIC';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.is_wedding_collaborator(uuid, uuid) TO authenticated, service_role';

  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_user_wedding_id(uuid) FROM PUBLIC';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.get_user_wedding_id(uuid) TO authenticated, service_role';

  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_wedding_id_from_user(uuid) FROM PUBLIC';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.get_wedding_id_from_user(uuid) TO authenticated, service_role';

  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.is_wedding_admin(uuid, uuid) FROM PUBLIC';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.is_wedding_admin(uuid, uuid) TO authenticated, service_role';

  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.is_wedding_owner(uuid, uuid) FROM PUBLIC';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.is_wedding_owner(uuid, uuid) TO authenticated, service_role';

  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.generate_invitation_token() FROM PUBLIC';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.generate_invitation_token() TO authenticated, service_role';

  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role';

  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.add_creator_as_owner() FROM PUBLIC';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.add_creator_as_owner() TO service_role';

  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.add_creator_as_collaborator() FROM PUBLIC';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.add_creator_as_collaborator() TO service_role';

  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.update_category_spent_amount() FROM PUBLIC';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.update_category_spent_amount() TO service_role';

  -- Keep update_updated_at_column usable by authenticated/service_role in case of triggers
  EXECUTE 'REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated, service_role';
EXCEPTION
  WHEN undefined_function THEN
    -- In case function signatures differ, do nothing. We'll re-run with corrected signatures if needed.
    NULL;
END $$;

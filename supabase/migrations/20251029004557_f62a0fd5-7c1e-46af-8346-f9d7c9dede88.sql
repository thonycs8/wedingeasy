-- Allow collaborators to see profiles of other collaborators in the same wedding
DROP POLICY IF EXISTS "Collaborators can view each other's profiles" ON public.profiles;

CREATE POLICY "Collaborators can view each other's profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id -- Can always see own profile
  OR EXISTS ( -- Or can see profiles of users in the same wedding
    SELECT 1 FROM public.wedding_data wd
    WHERE wd.user_id = auth.uid() AND profiles.user_id IN (
      SELECT wc.user_id FROM public.wedding_collaborators wc WHERE wc.wedding_id = wd.id
      UNION
      SELECT wd.user_id
    )
  )
  OR EXISTS ( -- Or if user is a collaborator, can see other collaborators
    SELECT 1 FROM public.wedding_collaborators wc1
    WHERE wc1.user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.wedding_collaborators wc2
      WHERE wc2.wedding_id = wc1.wedding_id
      AND wc2.user_id = profiles.user_id
    )
  )
  OR EXISTS ( -- Or can see the wedding owner if user is a collaborator
    SELECT 1 FROM public.wedding_collaborators wc
    INNER JOIN public.wedding_data wd ON wd.id = wc.wedding_id
    WHERE wc.user_id = auth.uid() AND wd.user_id = profiles.user_id
  )
);
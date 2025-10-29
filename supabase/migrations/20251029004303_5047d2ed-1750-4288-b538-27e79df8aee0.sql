-- Update wedding_collaborators policies to allow all collaborators to see each other
DROP POLICY IF EXISTS "Users can view wedding collaborators" ON public.wedding_collaborators;

CREATE POLICY "Collaborators can view all wedding collaborators"
ON public.wedding_collaborators
FOR SELECT
USING (
  -- User can see collaborators if they are part of the same wedding
  EXISTS (
    SELECT 1 FROM public.wedding_data wd
    WHERE wd.id = wedding_collaborators.wedding_id
    AND (
      wd.user_id = auth.uid() -- User is the wedding owner
      OR EXISTS ( -- Or user is a collaborator of this wedding
        SELECT 1 FROM public.wedding_collaborators wc2
        WHERE wc2.wedding_id = wd.id AND wc2.user_id = auth.uid()
      )
    )
  )
  OR auth.uid() = user_id -- Can always see own collaboration
);
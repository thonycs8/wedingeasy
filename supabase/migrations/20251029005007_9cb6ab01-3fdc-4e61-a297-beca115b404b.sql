-- Drop the problematic policies first
DROP POLICY IF EXISTS "Collaborators can view all wedding collaborators" ON public.wedding_collaborators;
DROP POLICY IF EXISTS "Collaborators can view each other's profiles" ON public.profiles;

-- Recreate the simple working policy for wedding_collaborators
CREATE POLICY "Users can view wedding collaborators"
ON public.wedding_collaborators
FOR SELECT
USING (
  -- User can see collaborators if they own the wedding or are collaborators themselves
  EXISTS (
    SELECT 1 FROM public.wedding_data wd
    WHERE wd.id = wedding_collaborators.wedding_id
    AND wd.user_id = auth.uid()
  )
  OR auth.uid() = user_id
);

-- Create a simple policy for profiles that allows viewing within same wedding
CREATE POLICY "Users can view collaborator profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id -- Can always see own profile
  OR EXISTS ( -- Owner can see collaborator profiles
    SELECT 1 FROM public.wedding_data wd
    INNER JOIN public.wedding_collaborators wc ON wc.wedding_id = wd.id
    WHERE wd.user_id = auth.uid() AND wc.user_id = profiles.user_id
  )
  OR EXISTS ( -- Collaborator can see owner profile
    SELECT 1 FROM public.wedding_collaborators wc
    INNER JOIN public.wedding_data wd ON wd.id = wc.wedding_id
    WHERE wc.user_id = auth.uid() AND wd.user_id = profiles.user_id
  )
  OR EXISTS ( -- Collaborators can see each other's profiles (same wedding)
    SELECT 1 FROM public.wedding_collaborators wc1
    INNER JOIN public.wedding_collaborators wc2 ON wc2.wedding_id = wc1.wedding_id
    WHERE wc1.user_id = auth.uid() AND wc2.user_id = profiles.user_id
  )
);
-- Fix wedding_invitations table public exposure
-- Replace public policies with authenticated-only versions

DROP POLICY IF EXISTS "Collaborators can create invitations" ON public.wedding_invitations;
DROP POLICY IF EXISTS "Collaborators can view wedding invitations" ON public.wedding_invitations;
DROP POLICY IF EXISTS "Users can view their own invitations by email" ON public.wedding_invitations;

CREATE POLICY "Collaborators can create invitations"
ON public.wedding_invitations
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM wedding_collaborators
  WHERE wedding_id = wedding_invitations.wedding_id
  AND user_id = auth.uid()
));

CREATE POLICY "Collaborators can view wedding invitations"
ON public.wedding_invitations
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM wedding_collaborators
  WHERE wedding_id = wedding_invitations.wedding_id
  AND user_id = auth.uid()
));

CREATE POLICY "Users can view their own invitations by email"
ON public.wedding_invitations
FOR SELECT
TO authenticated
USING (email = (
  SELECT email FROM auth.users WHERE id = auth.uid()
));

-- Fix service_bookings table - add UPDATE and DELETE policies
CREATE POLICY "Users can update own bookings"
ON public.service_bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookings"
ON public.service_bookings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
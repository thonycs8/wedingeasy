-- Allow wedding collaborators to UPDATE guests (not just SELECT)
CREATE POLICY "Collaborators can update wedding guests"
ON public.guests FOR UPDATE
TO authenticated
USING (wedding_id IS NOT NULL AND is_wedding_collaborator(auth.uid(), wedding_id))
WITH CHECK (wedding_id IS NOT NULL AND is_wedding_collaborator(auth.uid(), wedding_id));
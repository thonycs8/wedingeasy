-- Allow collaborators to INSERT guests into their wedding
CREATE POLICY "Collaborators can insert wedding guests"
ON public.guests FOR INSERT
TO authenticated
WITH CHECK (wedding_id IS NOT NULL AND is_wedding_collaborator(auth.uid(), wedding_id));

-- Allow collaborators to DELETE guests from their wedding
CREATE POLICY "Collaborators can delete wedding guests"
ON public.guests FOR DELETE
TO authenticated
USING (wedding_id IS NOT NULL AND is_wedding_collaborator(auth.uid(), wedding_id));
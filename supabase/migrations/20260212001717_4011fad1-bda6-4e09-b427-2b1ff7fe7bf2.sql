
-- Add order tracking columns to custom_domains
ALTER TABLE public.custom_domains
  ADD COLUMN IF NOT EXISTS requested_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS order_status text NOT NULL DEFAULT 'requested',
  ADD COLUMN IF NOT EXISTS desired_domain text,
  ADD COLUMN IF NOT EXISTS price numeric,
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS request_message text;

-- Allow wedding collaborators to request domains (INSERT only)
CREATE POLICY "Wedding collaborators can request domains"
  ON public.custom_domains
  FOR INSERT
  WITH CHECK (
    is_wedding_collaborator(auth.uid(), wedding_id)
    AND requested_by = auth.uid()
  );

-- Allow wedding collaborators to view their wedding's domains
DROP POLICY IF EXISTS "Wedding owners can view their domains" ON public.custom_domains;
CREATE POLICY "Wedding collaborators can view their domains"
  ON public.custom_domains
  FOR SELECT
  USING (is_wedding_collaborator(auth.uid(), wedding_id));

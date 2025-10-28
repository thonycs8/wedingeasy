-- Fix RLS policies for guests table to allow ceremony roles management
-- Drop existing policies
DROP POLICY IF EXISTS "Collaborators can view guests" ON public.guests;
DROP POLICY IF EXISTS "Wedding owners can manage guests" ON public.guests;

-- Create new policies that allow both user_id and wedding_id based access
CREATE POLICY "Users can view their own guests"
ON public.guests
FOR SELECT
USING (
  auth.uid() = user_id 
  OR is_wedding_collaborator(auth.uid(), get_user_wedding_id(user_id))
);

CREATE POLICY "Users can insert their own guests"
ON public.guests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own guests"
ON public.guests
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR is_wedding_owner(auth.uid(), get_user_wedding_id(user_id))
);

CREATE POLICY "Users can delete their own guests"
ON public.guests
FOR DELETE
USING (
  auth.uid() = user_id 
  OR is_wedding_owner(auth.uid(), get_user_wedding_id(user_id))
);
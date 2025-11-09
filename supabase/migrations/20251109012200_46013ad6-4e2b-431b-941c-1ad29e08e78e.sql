-- Fix public data exposure on profiles table
-- Add explicit policy to block unauthenticated access

-- First, drop existing SELECT policies that don't restrict to authenticated users
DROP POLICY IF EXISTS "Users can view collaborator profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Recreate SELECT policies with explicit authentication requirement
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view collaborator profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_id) 
  OR 
  (EXISTS (
    SELECT 1
    FROM wedding_data wd
    JOIN wedding_collaborators wc ON wc.wedding_id = wd.id
    WHERE wd.user_id = auth.uid() AND wc.user_id = profiles.user_id
  )) 
  OR 
  (EXISTS (
    SELECT 1
    FROM wedding_collaborators wc
    JOIN wedding_data wd ON wd.id = wc.wedding_id
    WHERE wc.user_id = auth.uid() AND wd.user_id = profiles.user_id
  )) 
  OR 
  (EXISTS (
    SELECT 1
    FROM wedding_collaborators wc1
    JOIN wedding_collaborators wc2 ON wc2.wedding_id = wc1.wedding_id
    WHERE wc1.user_id = auth.uid() AND wc2.user_id = profiles.user_id
  ))
);

-- Ensure INSERT and UPDATE policies also require authentication
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

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
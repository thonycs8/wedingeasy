-- Add phone field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text;

-- Add index for phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Add comment
COMMENT ON COLUMN public.profiles.phone IS 'User phone number';
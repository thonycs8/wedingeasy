-- Add 'ceremony' category to guests_category_check constraint
ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_category_check;

ALTER TABLE public.guests ADD CONSTRAINT guests_category_check 
CHECK (category = ANY (ARRAY[
  'family'::text, 
  'friends'::text, 
  'work'::text, 
  'other'::text, 
  'groomsmen'::text, 
  'bridesmaids'::text, 
  'groomsman_friends'::text, 
  'bridesmaid_friends'::text, 
  'witnesses'::text, 
  'officiant'::text, 
  'pastor'::text, 
  'musicians'::text, 
  'honor_guests'::text,
  'ceremony'::text
]));
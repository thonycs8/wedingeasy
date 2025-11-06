-- Create table for wedding choices
CREATE TABLE IF NOT EXISTS public.wedding_choices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_id UUID NOT NULL REFERENCES public.wedding_data(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  options TEXT[] NOT NULL DEFAULT '{}',
  selected TEXT,
  notes TEXT,
  budget NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'decided', 'booked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wedding_choices ENABLE ROW LEVEL SECURITY;

-- Policies for wedding_choices
CREATE POLICY "Users can view choices for their weddings"
ON public.wedding_choices
FOR SELECT
USING (
  wedding_id IN (
    SELECT id FROM public.wedding_data 
    WHERE user_id = auth.uid()
  )
  OR
  wedding_id IN (
    SELECT wedding_id FROM public.wedding_collaborators 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create choices for their weddings"
ON public.wedding_choices
FOR INSERT
WITH CHECK (
  wedding_id IN (
    SELECT id FROM public.wedding_data 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Wedding owners can update choices"
ON public.wedding_choices
FOR UPDATE
USING (
  wedding_id IN (
    SELECT id FROM public.wedding_data 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Wedding owners can delete choices"
ON public.wedding_choices
FOR DELETE
USING (
  wedding_id IN (
    SELECT id FROM public.wedding_data 
    WHERE user_id = auth.uid()
  )
);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_wedding_choices_updated_at
BEFORE UPDATE ON public.wedding_choices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_wedding_choices_wedding_id ON public.wedding_choices(wedding_id);
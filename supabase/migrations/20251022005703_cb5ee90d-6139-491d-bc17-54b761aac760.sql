-- Add event_code to wedding_data
ALTER TABLE public.wedding_data
ADD COLUMN event_code TEXT UNIQUE;

-- Generate unique codes for existing weddings
UPDATE public.wedding_data
SET event_code = 'WEPLAN-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6))
WHERE event_code IS NULL;

-- Make event_code required for new records
ALTER TABLE public.wedding_data
ALTER COLUMN event_code SET NOT NULL;

-- Create wedding_collaborators table
CREATE TABLE public.wedding_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.wedding_data(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'collaborator',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wedding_id, user_id)
);

-- Enable RLS on wedding_collaborators
ALTER TABLE public.wedding_collaborators ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user is a collaborator
CREATE OR REPLACE FUNCTION public.is_wedding_collaborator(
  _user_id UUID,
  _wedding_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.wedding_collaborators
    WHERE wedding_id = _wedding_id
      AND user_id = _user_id
  );
$$;

-- Function to get user's wedding_id
CREATE OR REPLACE FUNCTION public.get_user_wedding_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT wedding_id
  FROM public.wedding_collaborators
  WHERE user_id = _user_id
  LIMIT 1;
$$;

-- RLS Policies for wedding_collaborators
CREATE POLICY "Users can view their collaborations"
  ON public.wedding_collaborators FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view wedding collaborators"
  ON public.wedding_collaborators FOR SELECT
  USING (public.is_wedding_collaborator(auth.uid(), wedding_id));

CREATE POLICY "Wedding owner can manage collaborators"
  ON public.wedding_collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.wedding_data
      WHERE id = wedding_id AND user_id = auth.uid()
    )
  );

-- Update wedding_data RLS policies
DROP POLICY IF EXISTS "Users can view their own wedding data" ON public.wedding_data;
DROP POLICY IF EXISTS "Users can insert their own wedding data" ON public.wedding_data;
DROP POLICY IF EXISTS "Users can update their own wedding data" ON public.wedding_data;

CREATE POLICY "Collaborators can view wedding data"
  ON public.wedding_data FOR SELECT
  USING (
    user_id = auth.uid() OR
    public.is_wedding_collaborator(auth.uid(), id)
  );

CREATE POLICY "Collaborators can update wedding data"
  ON public.wedding_data FOR UPDATE
  USING (
    user_id = auth.uid() OR
    public.is_wedding_collaborator(auth.uid(), id)
  );

CREATE POLICY "Users can insert their own wedding data"
  ON public.wedding_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update guests RLS policies
DROP POLICY IF EXISTS "Users can view their own guests" ON public.guests;
DROP POLICY IF EXISTS "Users can insert their own guests" ON public.guests;
DROP POLICY IF EXISTS "Users can update their own guests" ON public.guests;
DROP POLICY IF EXISTS "Users can delete their own guests" ON public.guests;

CREATE POLICY "Collaborators can view guests"
  ON public.guests FOR SELECT
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can insert guests"
  ON public.guests FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can update guests"
  ON public.guests FOR UPDATE
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can delete guests"
  ON public.guests FOR DELETE
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

-- Update budget_categories RLS policies
DROP POLICY IF EXISTS "Users can view their own budget categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Users can insert their own budget categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Users can update their own budget categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Users can delete their own budget categories" ON public.budget_categories;

CREATE POLICY "Collaborators can view budget categories"
  ON public.budget_categories FOR SELECT
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can insert budget categories"
  ON public.budget_categories FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can update budget categories"
  ON public.budget_categories FOR UPDATE
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can delete budget categories"
  ON public.budget_categories FOR DELETE
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

-- Update budget_expenses RLS policies
DROP POLICY IF EXISTS "Users can view their own budget expenses" ON public.budget_expenses;
DROP POLICY IF EXISTS "Users can insert their own budget expenses" ON public.budget_expenses;
DROP POLICY IF EXISTS "Users can update their own budget expenses" ON public.budget_expenses;
DROP POLICY IF EXISTS "Users can delete their own budget expenses" ON public.budget_expenses;

CREATE POLICY "Collaborators can view budget expenses"
  ON public.budget_expenses FOR SELECT
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can insert budget expenses"
  ON public.budget_expenses FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can update budget expenses"
  ON public.budget_expenses FOR UPDATE
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can delete budget expenses"
  ON public.budget_expenses FOR DELETE
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

-- Update budget_options RLS policies
DROP POLICY IF EXISTS "Users can view their own budget options" ON public.budget_options;
DROP POLICY IF EXISTS "Users can insert their own budget options" ON public.budget_options;
DROP POLICY IF EXISTS "Users can update their own budget options" ON public.budget_options;
DROP POLICY IF EXISTS "Users can delete their own budget options" ON public.budget_options;

CREATE POLICY "Collaborators can view budget options"
  ON public.budget_options FOR SELECT
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can insert budget options"
  ON public.budget_options FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can update budget options"
  ON public.budget_options FOR UPDATE
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can delete budget options"
  ON public.budget_options FOR DELETE
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

-- Update timeline_tasks RLS policies
DROP POLICY IF EXISTS "Users can view their own timeline tasks" ON public.timeline_tasks;
DROP POLICY IF EXISTS "Users can create their own timeline tasks" ON public.timeline_tasks;
DROP POLICY IF EXISTS "Users can update their own timeline tasks" ON public.timeline_tasks;
DROP POLICY IF EXISTS "Users can delete their own timeline tasks" ON public.timeline_tasks;

CREATE POLICY "Collaborators can view timeline tasks"
  ON public.timeline_tasks FOR SELECT
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can insert timeline tasks"
  ON public.timeline_tasks FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can update timeline tasks"
  ON public.timeline_tasks FOR UPDATE
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can delete timeline tasks"
  ON public.timeline_tasks FOR DELETE
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

-- Update photos RLS policies
DROP POLICY IF EXISTS "Users can view their own photos" ON public.photos;
DROP POLICY IF EXISTS "Users can insert their own photos" ON public.photos;
DROP POLICY IF EXISTS "Users can update their own photos" ON public.photos;
DROP POLICY IF EXISTS "Users can delete their own photos" ON public.photos;

CREATE POLICY "Collaborators can view photos"
  ON public.photos FOR SELECT
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can insert photos"
  ON public.photos FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can update photos"
  ON public.photos FOR UPDATE
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can delete photos"
  ON public.photos FOR DELETE
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

-- Update notifications RLS policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

CREATE POLICY "Collaborators can view notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can update notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

CREATE POLICY "Collaborators can delete notifications"
  ON public.notifications FOR DELETE
  USING (user_id = auth.uid() OR public.is_wedding_collaborator(auth.uid(), public.get_user_wedding_id(user_id)));

-- Function to automatically add creator as collaborator
CREATE OR REPLACE FUNCTION public.add_creator_as_collaborator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wedding_collaborators (wedding_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'owner');
  RETURN NEW;
END;
$$;

-- Trigger to add creator as collaborator
CREATE TRIGGER on_wedding_created
  AFTER INSERT ON public.wedding_data
  FOR EACH ROW
  EXECUTE FUNCTION public.add_creator_as_collaborator();
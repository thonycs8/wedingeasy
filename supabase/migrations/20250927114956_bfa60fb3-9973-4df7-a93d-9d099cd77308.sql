-- Create timeline_tasks table for wedding timeline management
CREATE TABLE public.timeline_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('alta', 'media', 'baixa')),
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('venue', 'attire', 'catering', 'decoration', 'documentation', 'other')),
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.timeline_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for timeline_tasks
CREATE POLICY "Users can view their own timeline tasks" 
ON public.timeline_tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own timeline tasks" 
ON public.timeline_tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timeline tasks" 
ON public.timeline_tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timeline tasks" 
ON public.timeline_tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_timeline_tasks_updated_at
BEFORE UPDATE ON public.timeline_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default timeline tasks for new users
INSERT INTO public.timeline_tasks (user_id, title, due_date, priority, category) VALUES 
('00000000-0000-0000-0000-000000000000', 'Escolher local do casamento', '2024-12-01', 'alta', 'venue'),
('00000000-0000-0000-0000-000000000000', 'Comprar vestido/terno', '2024-12-15', 'alta', 'attire'),
('00000000-0000-0000-0000-000000000000', 'Contratar fotógrafo', '2024-12-20', 'alta', 'other'),
('00000000-0000-0000-0000-000000000000', 'Enviar convites', '2025-01-15', 'alta', 'documentation'),
('00000000-0000-0000-0000-000000000000', 'Escolher cardápio', '2025-02-01', 'alta', 'catering'),
('00000000-0000-0000-0000-000000000000', 'Definir decoração', '2025-02-15', 'media', 'decoration'),
('00000000-0000-0000-0000-000000000000', 'Reservar lua de mel', '2025-03-01', 'baixa', 'other');
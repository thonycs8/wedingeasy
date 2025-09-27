-- Criar tabela de convidados
CREATE TABLE public.guests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  category text NOT NULL CHECK (category IN ('family', 'friends', 'work', 'other')),
  confirmed boolean DEFAULT false,
  plus_one boolean DEFAULT false,
  dietary_restrictions text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Políticas para guests
CREATE POLICY "Users can view their own guests" 
ON public.guests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own guests" 
ON public.guests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own guests" 
ON public.guests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own guests" 
ON public.guests 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar tabela de fotos
CREATE TABLE public.photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  description text,
  file_path text NOT NULL,
  file_size integer,
  file_type text,
  category text DEFAULT 'general' CHECK (category IN ('general', 'venue', 'dress', 'rings', 'flowers', 'cake', 'decoration')),
  uploaded_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Políticas para photos
CREATE POLICY "Users can view their own photos" 
ON public.photos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own photos" 
ON public.photos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos" 
ON public.photos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" 
ON public.photos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar tabela de notificações
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'reminder', 'success')),
  read boolean DEFAULT false,
  scheduled_for timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_guests_updated_at
BEFORE UPDATE ON public.guests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar bucket de armazenamento para fotos
INSERT INTO storage.buckets (id, name, public) VALUES ('wedding-photos', 'wedding-photos', false);

-- Políticas de storage para fotos
CREATE POLICY "Users can view their own wedding photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'wedding-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own wedding photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'wedding-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own wedding photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'wedding-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own wedding photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'wedding-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
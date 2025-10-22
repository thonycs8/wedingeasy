-- Add role types and invitation system
CREATE TYPE wedding_role AS ENUM (
  'noivo',
  'noiva', 
  'colaborador',
  'celebrante',
  'padrinho',
  'madrinha',
  'convidado',
  'fotografo',
  'organizador'
);

-- Update wedding_collaborators to use new role enum
ALTER TABLE public.wedding_collaborators 
  DROP COLUMN role;

ALTER TABLE public.wedding_collaborators
  ADD COLUMN role wedding_role NOT NULL DEFAULT 'colaborador';

ALTER TABLE public.wedding_collaborators
  ADD COLUMN invited_by UUID REFERENCES auth.users(id);

ALTER TABLE public.wedding_collaborators
  ADD COLUMN invitation_accepted_at TIMESTAMP WITH TIME ZONE;

-- Create invitations table
CREATE TABLE public.wedding_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.wedding_data(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role wedding_role NOT NULL DEFAULT 'colaborador',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invitation_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wedding_id, email)
);

-- Enable RLS on invitations
ALTER TABLE public.wedding_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for invitations
CREATE POLICY "Collaborators can view wedding invitations"
  ON public.wedding_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wedding_collaborators
      WHERE wedding_id = wedding_invitations.wedding_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can create invitations"
  ON public.wedding_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wedding_collaborators
      WHERE wedding_id = wedding_invitations.wedding_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own invitations by email"
  ON public.wedding_invitations FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Function to generate invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$;

-- Update trigger to add creator as owner instead of just collaborator
DROP TRIGGER IF EXISTS on_wedding_created ON public.wedding_data;

CREATE OR REPLACE FUNCTION public.add_creator_as_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wedding_collaborators (wedding_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'noivo');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_wedding_created
  AFTER INSERT ON public.wedding_data
  FOR EACH ROW
  EXECUTE FUNCTION public.add_creator_as_owner();
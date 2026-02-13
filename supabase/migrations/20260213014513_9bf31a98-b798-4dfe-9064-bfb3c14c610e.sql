
-- Table for custom password reset tokens (admin-generated)
CREATE TABLE public.password_reset_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  email text NOT NULL,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '30 minutes'),
  used_at timestamp with time zone,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Only admins can create tokens
CREATE POLICY "Admins can manage reset tokens"
  ON public.password_reset_tokens
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Edge function (service role) manages tokens, no public access needed
-- The validate-reset-token edge function will use service role

CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens (token);
CREATE INDEX idx_password_reset_tokens_user ON public.password_reset_tokens (user_id);

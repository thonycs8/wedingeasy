import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart,
  Mail,
  User,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Lock,
  LogIn,
  UserPlus
} from "lucide-react";
import { WeddingQuestionnaireModal } from "@/components/WeddingQuestionnaireModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Validation schemas
// Accept legacy (WEPLAN-XXXXXX) and hardened codes (WEPLAN-<16+ chars>)
const eventCodeSchema = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .refine((v) => /^WEPLAN-[A-Z0-9]{6,32}$/.test(v), {
    message: 'Código inválido. Formato: WEPLAN-ABC123',
  });

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
  password: z.string().min(6, 'Password deve ter pelo menos 6 caracteres').max(100, 'Password muito longa'),
  partnerName: z.string().trim().min(2, 'Nome do parceiro deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(1, 'Password é obrigatória'),
});

export const SignupModal = ({ open, onOpenChange }: SignupModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [step, setStep] = useState<'auth' | 'questionnaire' | 'dashboard'>('auth');
  const [loading, setLoading] = useState(false);
  const [weddingMode, setWeddingMode] = useState<'create' | 'join'>('create');
  const [joinCode, setJoinCode] = useState('');
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    partnerName: '',
  });

  // Check for invitation token in URL
  useEffect(() => {
    const token = searchParams.get('invitation');
    if (token && open) {
      setInvitationToken(token);
      loadInvitationData(token);
    }
  }, [searchParams, open]);

  const loadInvitationData = async (token: string) => {
    try {
      const { data, error } = await supabase
        .from('wedding_invitations')
        .select('*, wedding_data(couple_name, partner_name)')
        .eq('invitation_token', token)
        .is('accepted_at', null)
        .maybeSingle();

      if (error || !data) {
        toast.error('Convite inválido ou expirado');
        return;
      }

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        toast.error('Este convite expirou');
        return;
      }

      setInvitationData(data);
      setFormData(prev => ({ ...prev, email: data.email }));
      toast.success(`Convite para colaborar como ${data.role}`);
    } catch (error) {
      console.error('Error loading invitation:', error);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate event code if joining
    if (weddingMode === 'join') {
      try {
        eventCodeSchema.parse(joinCode.trim().toUpperCase());
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast.error(error.errors[0].message);
          return;
        }
      }
    }

    // Validate form data
    if (weddingMode === 'create') {
      try {
        signupSchema.parse(formData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast.error(error.errors[0].message);
          return;
        }
      }
    } else {
      // For join mode, only validate email and password
      if (!formData.email || !formData.password) {
        toast.error('Por favor, preencha email e password');
        return;
      }
      
      try {
        loginSchema.parse({ email: formData.email, password: formData.password });
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast.error(error.errors[0].message);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: formData.name || 'User',
            last_name: formData.partnerName || '',
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (!authData.user) {
        toast.error('Erro ao criar conta');
        return;
      }

      // If there's an invitation token, accept it
      if (invitationToken && invitationData) {
        await acceptInvitation(authData.user.id, invitationToken);
        toast.success('Conta criada! Você foi adicionado ao casamento.');
        onOpenChange(false);
        navigate('/dashboard');
        return;
      }

      // If joining an existing wedding
      if (weddingMode === 'join') {
        // Wait a bit for the user to be created in the database
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Find the wedding by code
        const { data: weddingData, error: weddingError } = await supabase
          .from('wedding_data')
          .select('id')
          .eq('event_code', joinCode.trim().toUpperCase())
          .maybeSingle();

        if (weddingError || !weddingData) {
          toast.error('Código de casamento inválido');
          setLoading(false);
          return;
        }

        // Add as collaborator
        const { error: collabError } = await supabase
          .from('wedding_collaborators')
          .insert([{
            wedding_id: weddingData.id,
            user_id: authData.user.id,
            role: 'colaborador'
          }]);

        if (collabError) {
          console.error('Error adding collaborator:', collabError);
          toast.error('Erro ao entrar no casamento');
          setLoading(false);
          return;
        }

        toast.success('Conta criada! Você foi adicionado ao casamento.');
        onOpenChange(false);
        navigate('/dashboard');
      } else {
        // Creating new wedding - show questionnaire
        toast.success('Conta criada! Complete o questionário para personalizar o seu planeamento.');
        setStep('questionnaire');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate event code if joining
    if (weddingMode === 'join') {
      try {
        eventCodeSchema.parse(joinCode.trim().toUpperCase());
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast.error(error.errors[0].message);
          return;
        }
      }
    }
    
    // Validate login inputs
    try {
      loginSchema.parse({ email: formData.email, password: formData.password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      // If there's an invitation token, accept it
      if (invitationToken && invitationData && authData.user) {
        await acceptInvitation(authData.user.id, invitationToken);
        toast.success('Você foi adicionado ao casamento!');
        onOpenChange(false);
        navigate('/dashboard');
        return;
      }

      // If joining an existing wedding
      if (weddingMode === 'join' && authData.user) {
        // Find the wedding by code
        const { data: weddingData, error: weddingError } = await supabase
          .from('wedding_data')
          .select('id')
          .eq('event_code', joinCode.trim().toUpperCase())
          .maybeSingle();

        if (weddingError || !weddingData) {
          toast.error('Código de casamento inválido');
          setLoading(false);
          return;
        }

        // Check if already a collaborator
        const { data: existingCollab } = await supabase
          .from('wedding_collaborators')
          .select('id')
          .eq('wedding_id', weddingData.id)
          .eq('user_id', authData.user.id)
          .maybeSingle();

        if (existingCollab) {
          toast.success('Você já faz parte deste casamento!');
          onOpenChange(false);
          navigate('/dashboard');
          return;
        }

        // Add as collaborator
        const { error: collabError } = await supabase
          .from('wedding_collaborators')
          .insert([{
            wedding_id: weddingData.id,
            user_id: authData.user.id,
            role: 'colaborador'
          }]);

        if (collabError) {
          console.error('Error adding collaborator:', collabError);
          toast.error('Erro ao entrar no casamento');
          setLoading(false);
          return;
        }

        toast.success('Você foi adicionado ao casamento!');
      } else {
        toast.success('Login realizado com sucesso!');
      }

      onOpenChange(false);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (userId: string, token: string) => {
    try {
      // Get invitation details
      const { data: invitation, error: invError } = await supabase
        .from('wedding_invitations')
        .select('wedding_id, role')
        .eq('invitation_token', token)
        .single();

      if (invError || !invitation) {
        throw new Error('Invitation not found');
      }

      // Add user as collaborator
      const { error: collabError } = await supabase
        .from('wedding_collaborators')
        .insert([{
          wedding_id: invitation.wedding_id,
          user_id: userId,
          role: invitation.role,
          invited_by: invitationData?.invited_by
        }]);

      if (collabError) {
        throw collabError;
      }

      // Mark invitation as accepted
      await supabase
        .from('wedding_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('invitation_token', token);

    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  };

  const handleQuestionnaireComplete = () => {
    setStep('dashboard');
    // Redirect to dashboard after brief delay
    setTimeout(() => {
      onOpenChange(false);
      setStep('auth');
      setMode('signup');
      navigate('/dashboard');
    }, 2000);
  };

  if (step === 'questionnaire') {
    return (
      <WeddingQuestionnaireModal 
        open={open}
        onOpenChange={onOpenChange}
        onComplete={handleQuestionnaireComplete}
        coupleData={formData}
        mode="create"
      />
    );
  }

  if (step === 'dashboard') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{t('signup.success.title')}</h3>
            <p className="text-muted-foreground mb-4">{t('signup.success.message')}</p>
            <div className="animate-pulse">
              <Sparkles className="w-8 h-8 text-primary mx-auto" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-6 h-6 text-primary" />
              <span className="text-primary">weddingeasy</span>
            </div>
            <div className="text-lg text-muted-foreground">
              {invitationData 
                ? `Aceitar convite para ${invitationData.wedding_data?.couple_name || 'o casamento'}`
                : mode === 'signup' ? t('signup.title') : 'Entrar na Conta'
              }
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Benefits */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('signup.benefits.title')}</h3>
              <div className="space-y-3">
                {[
                  t('signup.benefits.calculator'),
                  t('signup.benefits.budget'),
                  t('signup.benefits.timeline'),
                  t('signup.benefits.guests'),
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">
                  {t('signup.guarantee.badge')}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {t('signup.guarantee.text')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Auth Form */}
          <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex rounded-lg bg-muted p-1">
              <Button
                type="button"
                variant={mode === 'signup' ? 'default' : 'ghost'}
                className="flex-1"
                onClick={() => setMode('signup')}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Criar Conta
              </Button>
              <Button
                type="button"
                variant={mode === 'login' ? 'default' : 'ghost'}
                className="flex-1"
                onClick={() => setMode('login')}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Entrar
              </Button>
            </div>

            <form onSubmit={mode === 'signup' ? handleSignup : handleLogin} className="space-y-4">
              {/* Show invitation info if present */}
              {invitationData && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium">
                      Você foi convidado para colaborar como <Badge className="ml-1">{t(`roles.${invitationData.role}`)}</Badge>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Casamento: {invitationData.wedding_data?.couple_name} & {invitationData.wedding_data?.partner_name}
                    </p>
                  </CardContent>
                </Card>
              )}

              {!invitationToken && (
                <>
                  {/* Wedding Mode Selection */}
                  <div className="space-y-3">
                    <Label>Você quer:</Label>
                    <RadioGroup value={weddingMode} onValueChange={(value: 'create' | 'join') => setWeddingMode(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="create" id="create" />
                        <Label htmlFor="create" className="cursor-pointer">
                          {mode === 'signup' ? t('collaborators.createNew') : 'Criar novo casamento'}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="join" id="join" />
                        <Label htmlFor="join" className="cursor-pointer">
                          {t('collaborators.joinWithCode')}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {weddingMode === 'join' && (
                    <div>
                      <Label htmlFor="joinCode">{t('collaborators.eventCode')}</Label>
                      <Input
                        id="joinCode"
                        placeholder="WEPLAN-ABC123"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        className="font-mono"
                        maxLength={13}
                        required
                      />
                    </div>
                  )}

                  {weddingMode === 'create' && mode === 'signup' && (
                    <>
                      <div>
                        <Label htmlFor="name">{t('signup.form.yourName')}</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="name"
                            placeholder={t('signup.form.yourNamePlaceholder')}
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              <div>
                <Label htmlFor="email">{t('signup.form.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('signup.form.emailPlaceholder')}
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite a sua password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {mode === 'signup' && weddingMode === 'create' && (
                <div>
                  <Label htmlFor="partnerName">{t('signup.form.partnerName')}</Label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="partnerName"
                      placeholder={t('signup.form.partnerNamePlaceholder')}
                      value={formData.partnerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, partnerName: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="btn-gradient w-full" disabled={loading}>
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {mode === 'signup' ? 'Criando conta...' : 'Entrando...'}
                  </div>
                ) : (
                  <>
                    {mode === 'signup' ? t('signup.form.continue') : 'Entrar'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                {t('signup.form.privacy')}
              </p>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
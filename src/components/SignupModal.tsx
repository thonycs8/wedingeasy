import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export const SignupModal = ({ open, onOpenChange }: SignupModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [step, setStep] = useState<'auth' | 'questionnaire' | 'dashboard'>('auth');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    partnerName: '',
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.partnerName) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: formData.name,
            last_name: formData.partnerName,
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Conta criada! Complete o questionário para personalizar o seu planeamento.');
      setStep('questionnaire');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Por favor, preencha email e password');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Login realizado com sucesso!');
      onOpenChange(false);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
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
          <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            {mode === 'signup' ? t('signup.title') : 'Entrar na Conta'}
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
              {mode === 'signup' && (
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

              {mode === 'signup' && (
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
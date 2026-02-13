import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Loader2, ShieldCheck, ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type PageState = 'loading' | 'invalid' | 'expired' | 'verify_email' | 'reset_form' | 'success' | 'reported';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get('token');

  const [pageState, setPageState] = useState<PageState>('loading');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setPageState('invalid');
      return;
    }
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-reset-token', {
        body: { action: 'validate', token },
      });

      if (error || data?.error) {
        const errMsg = data?.error || 'Token inválido';
        if (errMsg.includes('expirado')) {
          setPageState('expired');
        } else {
          setPageState('invalid');
        }
        return;
      }

      setMaskedEmail(data.masked_email);
      setExpiresAt(data.expires_at);
      setPageState('verify_email');
    } catch {
      setPageState('invalid');
    }
  };

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Insira o seu email');
      return;
    }
    setPageState('reset_form');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-reset-token', {
        body: { action: 'reset', token, email: email.trim(), new_password: newPassword },
      });

      if (error || data?.error) {
        setError(data?.error || 'Erro ao redefinir senha');
        if (data?.error?.includes('email')) {
          setPageState('verify_email');
        }
        return;
      }

      setPageState('success');
    } catch {
      setError('Erro ao redefinir senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleReportUnauthorized = async () => {
    setLoading(true);
    try {
      await supabase.functions.invoke('validate-reset-token', {
        body: { action: 'report_unauthorized', token, email: email.trim() },
      });
      setPageState('reported');
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível reportar. Contacte o suporte.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const timeRemaining = () => {
    if (!expiresAt) return '';
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expirado';
    const mins = Math.floor(diff / 60000);
    return `${mins} min restantes`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">weddingeasy</h1>
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading */}
          {pageState === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">A validar o link...</p>
            </div>
          )}

          {/* Invalid token */}
          {pageState === 'invalid' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <ShieldAlert className="h-12 w-12 text-destructive" />
              <div>
                <h2 className="text-lg font-semibold">Link inválido</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Este link de redefinição de senha é inválido ou já foi utilizado.
                  Contacte o suporte para obter um novo link.
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Voltar ao Login
              </Button>
            </div>
          )}

          {/* Expired token */}
          {pageState === 'expired' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <Clock className="h-12 w-12 text-amber-500" />
              <div>
                <h2 className="text-lg font-semibold">Link expirado</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Este link de redefinição expirou (validade de 30 minutos).
                  Contacte o suporte para obter um novo link.
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Voltar ao Login
              </Button>
            </div>
          )}

          {/* Step 1: Verify email */}
          {pageState === 'verify_email' && (
            <div className="space-y-4">
              <div className="text-center">
                <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Verificar Identidade</CardTitle>
                <CardDescription className="mt-1">
                  Para sua segurança, confirme o email associado à conta.
                  <br />
                  <span className="font-medium text-foreground">{maskedEmail}</span>
                </CardDescription>
                {expiresAt && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" /> {timeRemaining()}
                  </p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verify-email">O seu email</Label>
                  <Input
                    id="verify-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Insira o email da sua conta"
                    required
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full">
                  Continuar
                </Button>
              </form>
            </div>
          )}

          {/* Step 2: Reset password form */}
          {pageState === 'reset_form' && (
            <div className="space-y-4">
              <div className="text-center">
                <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Redefinir Senha</CardTitle>
                <CardDescription className="mt-1">
                  Insira a sua nova senha abaixo
                </CardDescription>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Redefinir Senha
                </Button>
              </form>

              <button
                type="button"
                onClick={() => setPageState('verify_email')}
                className="text-sm text-muted-foreground hover:underline w-full text-center"
              >
                ← Voltar
              </button>
            </div>
          )}

          {/* Success */}
          {pageState === 'success' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <div>
                <h2 className="text-lg font-semibold">Senha redefinida!</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  A sua senha foi redefinida com sucesso. Pode agora fazer login com as novas credenciais.
                </p>
              </div>
              <Button onClick={() => navigate('/auth')}>
                Ir para Login
              </Button>

              <div className="border-t pt-4 mt-2 w-full">
                <p className="text-xs text-muted-foreground mb-2">
                  Não solicitou esta alteração?
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleReportUnauthorized}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Reportar acesso não autorizado
                </Button>
              </div>
            </div>
          )}

          {/* Reported unauthorized */}
          {pageState === 'reported' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <ShieldAlert className="h-12 w-12 text-amber-500" />
              <div>
                <h2 className="text-lg font-semibold">Conta protegida</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  A sua conta foi suspensa por segurança e a equipa de suporte foi notificada.
                  Entraremos em contacto consigo brevemente para resolver a situação.
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate('/')}>
                Voltar à página inicial
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

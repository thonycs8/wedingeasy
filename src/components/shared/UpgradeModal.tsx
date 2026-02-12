import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Lock, Sparkles, Crown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { formatCurrency } from '@/i18n';

interface Plan {
  id: string;
  name: string;
  display_name: string;
  price: number | null;
  one_time_price: number | null;
  stripe_monthly_price_id: string | null;
  stripe_onetime_price_id: string | null;
}

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
  currentPlan?: string | null;
  weddingId?: string | null;
}

export function UpgradeModal({ open, onOpenChange, featureName, currentPlan, weddingId }: UpgradeModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { currency } = useSettings();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [billingType, setBillingType] = useState<'monthly' | 'one_time'>('monthly');

  useEffect(() => {
    if (open) loadPlans();
  }, [open]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('id, name, display_name, price, one_time_price, stripe_monthly_price_id, stripe_onetime_price_id')
        .eq('is_active', true)
        .neq('name', 'basic')
        .order('sort_order');

      if (error) throw error;
      setPlans((data as Plan[]) || []);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (plan: Plan) => {
    const priceId = billingType === 'monthly' ? plan.stripe_monthly_price_id : plan.stripe_onetime_price_id;
    if (!priceId) {
      toast({ title: 'Erro', description: 'Preço não configurado para este plano', variant: 'destructive' });
      return;
    }

    setCheckoutLoading(plan.id);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          price_id: priceId,
          mode: billingType === 'monthly' ? 'subscription' : 'payment',
          wedding_id: weddingId || null,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({ title: 'Erro', description: 'Erro ao iniciar pagamento', variant: 'destructive' });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const iconMap: Record<string, typeof Sparkles> = {
    advanced: Sparkles,
    pro: Crown,
  };

  const featuresMap: Record<string, string[]> = {
    advanced: ['Importação em massa', 'Gráficos de orçamento', 'Papéis de cerimónia', 'Colaboradores', 'Notificações'],
    pro: ['Tudo do Avançado', 'Galeria de fotos', 'Marketplace', 'Tempo real', 'Exportação PDF'],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="rounded-full bg-accent/20 p-3">
              <Lock className="w-6 h-6 text-accent" />
            </div>
          </div>
          <DialogTitle className="text-xl">Funcionalidade Premium</DialogTitle>
          <DialogDescription className="text-base">
            <strong>{featureName}</strong> não está disponível no plano{' '}
            <Badge variant="secondary" className="text-xs">{currentPlan || 'Básico'}</Badge>
            . Faça upgrade para desbloquear!
          </DialogDescription>
        </DialogHeader>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mt-2">
          <Label className={billingType === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}>Mensal</Label>
          <Switch
            checked={billingType === 'one_time'}
            onCheckedChange={(checked) => setBillingType(checked ? 'one_time' : 'monthly')}
          />
          <Label className={billingType === 'one_time' ? 'font-semibold' : 'text-muted-foreground'}>
            2 Anos
            <Badge variant="secondary" className="ml-1 text-[10px]">Melhor valor</Badge>
          </Label>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {plans.map((plan) => {
              const Icon = iconMap[plan.name] || Sparkles;
              const features = featuresMap[plan.name] || [];
              const price = billingType === 'monthly' ? plan.price : plan.one_time_price;

              return (
                <div key={plan.id} className="rounded-lg border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="font-semibold">{plan.display_name}</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {price != null ? formatCurrency(price, currency) : '—'}
                    {billingType === 'monthly' && <span className="text-sm font-normal text-muted-foreground">/mês</span>}
                    {billingType === 'one_time' && <span className="text-sm font-normal text-muted-foreground"> (2 anos)</span>}
                  </div>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {features.map((h) => (
                      <li key={h} className="flex items-center gap-1.5">
                        <span className="text-primary">✓</span> {h}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => handleCheckout(plan)}
                    disabled={checkoutLoading === plan.id}
                  >
                    {checkoutLoading === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : null}
                    Escolher Plano
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Agora não
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

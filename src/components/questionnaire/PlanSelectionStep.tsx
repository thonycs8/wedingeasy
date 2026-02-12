import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Crown, Globe, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/i18n";
import { useSettings } from "@/contexts/SettingsContext";

interface Plan {
  id: string;
  name: string;
  display_name: string;
  price: number | null;
  one_time_price: number | null;
  max_guests: number | null;
  max_collaborators: number | null;
  stripe_monthly_price_id: string | null;
  stripe_onetime_price_id: string | null;
}

interface PlanSelectionStepProps {
  selectedPlanId: string | null;
  billingType: 'monthly' | 'one_time';
  desiredDomain: string;
  wantsDomain: boolean;
  onPlanChange: (planId: string | null) => void;
  onBillingTypeChange: (type: 'monthly' | 'one_time') => void;
  onDomainChange: (domain: string) => void;
  onWantsDomainChange: (wants: boolean) => void;
}

export function PlanSelectionStep({
  selectedPlanId,
  billingType,
  desiredDomain,
  wantsDomain,
  onPlanChange,
  onBillingTypeChange,
  onDomainChange,
  onWantsDomainChange,
}: PlanSelectionStepProps) {
  const { t } = useTranslation();
  const { currency } = useSettings();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('id, name, display_name, price, one_time_price, max_guests, max_collaborators, stripe_monthly_price_id, stripe_onetime_price_id')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      setPlans((data as Plan[]) || []);
      // Auto-select basic if nothing selected
      if (!selectedPlanId && data && data.length > 0) {
        const basic = data.find((p: any) => p.name === 'basic');
        if (basic) onPlanChange(basic.id);
      }
    } catch (err) {
      console.error('Error loading plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const iconMap: Record<string, typeof Sparkles> = {
    basic: Check,
    advanced: Sparkles,
    pro: Crown,
  };

  const featuresMap: Record<string, string[]> = {
    basic: ['50 convidados', '1 colaborador', 'Orçamento básico', 'Timeline'],
    advanced: ['200 convidados', '2 colaboradores', 'Gráficos avançados', 'Papéis de cerimónia', 'Notificações'],
    pro: ['Convidados ilimitados', 'Colaboradores ilimitados', 'Galeria de fotos', 'Marketplace', 'Exportação PDF'],
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Billing toggle for paid plans */}
      {selectedPlanId && plans.find(p => p.id === selectedPlanId)?.name !== 'basic' && (
        <div className="flex items-center justify-center gap-3">
          <Label className={billingType === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}>Mensal</Label>
          <Switch
            checked={billingType === 'one_time'}
            onCheckedChange={(checked) => onBillingTypeChange(checked ? 'one_time' : 'monthly')}
          />
          <Label className={billingType === 'one_time' ? 'font-semibold' : 'text-muted-foreground'}>
            2 Anos
            <Badge variant="secondary" className="ml-1 text-[10px]">Melhor valor</Badge>
          </Label>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {plans.map((plan) => {
          const Icon = iconMap[plan.name] || Sparkles;
          const features = featuresMap[plan.name] || [];
          const isSelected = selectedPlanId === plan.id;
          const price = plan.name === 'basic' ? 0 : (billingType === 'monthly' ? plan.price : plan.one_time_price);

          return (
            <Card
              key={plan.id}
              className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}
              onClick={() => onPlanChange(plan.id)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="font-semibold">{plan.display_name}</span>
                  {isSelected && <Badge className="ml-auto text-[10px]">Selecionado</Badge>}
                </div>
                <div className="text-xl font-bold text-primary">
                  {price != null ? (price === 0 ? 'Grátis' : formatCurrency(price, currency)) : '—'}
                  {price !== 0 && billingType === 'monthly' && <span className="text-xs font-normal text-muted-foreground">/mês</span>}
                  {price !== 0 && billingType === 'one_time' && <span className="text-xs font-normal text-muted-foreground"> (2 anos)</span>}
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-1">
                      <span className="text-primary">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Domain option */}
      <Card className="border-dashed">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <span className="font-semibold">Domínio Personalizado</span>
            <Badge variant="outline" className="ml-auto text-[10px]">€19.99/ano</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Tenha o seu próprio endereço web, ex: maria-e-joao.com
          </p>
          <div className="flex items-center gap-3">
            <Switch
              checked={wantsDomain}
              onCheckedChange={onWantsDomainChange}
            />
            <Label>Quero um domínio personalizado</Label>
          </div>
          {wantsDomain && (
            <Input
              placeholder="ex: maria-e-joao.com"
              value={desiredDomain}
              onChange={(e) => onDomainChange(e.target.value)}
              className="mt-2"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

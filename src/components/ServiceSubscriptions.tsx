import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Globe, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/i18n";
import { useSettings } from "@/contexts/SettingsContext";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface ServiceSub {
  id: string;
  service_type: string;
  status: string;
  auto_renew: boolean;
  amount: number;
  interval: string;
  current_period_start: string | null;
  current_period_end: string | null;
  reference_id: string | null;
}

export function ServiceSubscriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currency } = useSettings();
  const [subs, setSubs] = useState<ServiceSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadSubs();
  }, [user]);

  const loadSubs = async () => {
    try {
      const { data, error } = await supabase
        .from('service_subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSubs(data || []);
    } catch (err) {
      console.error('Error loading service subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoRenew = async (sub: ServiceSub) => {
    setUpdatingId(sub.id);
    try {
      const { error } = await supabase
        .from('service_subscriptions')
        .update({ auto_renew: !sub.auto_renew })
        .eq('id', sub.id);
      if (error) throw error;
      setSubs(prev => prev.map(s => s.id === sub.id ? { ...s, auto_renew: !s.auto_renew } : s));
      toast({ title: 'Atualizado', description: `Auto-renovação ${!sub.auto_renew ? 'ativada' : 'desativada'}` });
    } catch (err) {
      console.error('Error toggling auto-renew:', err);
      toast({ title: 'Erro', description: 'Erro ao atualizar', variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/10 text-green-700 border-green-200',
    canceled: 'bg-red-500/10 text-red-700 border-red-200',
    expired: 'bg-muted text-muted-foreground',
    pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  };

  const serviceIcons: Record<string, typeof Globe> = {
    domain: Globe,
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (subs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>Sem subscrições de serviços ativas.</p>
          <p className="text-sm mt-1">Serviços como domínios personalizados aparecerão aqui.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {subs.map((sub) => {
        const Icon = serviceIcons[sub.service_type] || AlertCircle;
        const isExpiringSoon = sub.current_period_end && 
          new Date(sub.current_period_end).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;

        return (
          <Card key={sub.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold capitalize">{sub.service_type === 'domain' ? 'Domínio Personalizado' : sub.service_type}</span>
                      <Badge className={statusColors[sub.status] || ''} variant="outline">
                        {sub.status === 'active' ? 'Ativo' : sub.status === 'canceled' ? 'Cancelado' : sub.status}
                      </Badge>
                      {isExpiringSoon && sub.status === 'active' && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-200 text-[10px]">
                          Expira em breve
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                      <p>{formatCurrency(sub.amount, currency)}/{sub.interval === 'yearly' ? 'ano' : sub.interval}</p>
                      {sub.current_period_end && (
                        <p>Próxima renovação: {format(new Date(sub.current_period_end), "d 'de' MMMM 'de' yyyy", { locale: pt })}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {updatingId === sub.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={sub.auto_renew}
                        onCheckedChange={() => toggleAutoRenew(sub)}
                        disabled={sub.status !== 'active'}
                      />
                      <Label className="text-xs text-muted-foreground">Auto-renovar</Label>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

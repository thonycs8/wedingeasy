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
import { Lock, Sparkles, Crown } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
  currentPlan?: string | null;
}

export function UpgradeModal({ open, onOpenChange, featureName, currentPlan }: UpgradeModalProps) {
  const { t } = useTranslation();

  const plans = [
    {
      name: 'Avançado',
      price: '€9.99/mês',
      icon: Sparkles,
      highlights: [
        'Importação em massa',
        'Gráficos de orçamento',
        'Papéis de cerimónia',
        'Colaboradores',
        'Notificações',
      ],
    },
    {
      name: 'Profissional',
      price: '€19.99/mês',
      icon: Crown,
      highlights: [
        'Tudo do Avançado',
        'Galeria de fotos',
        'Marketplace',
        'Tempo real',
        'Exportação PDF',
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="rounded-full bg-accent/20 p-3">
              <Lock className="w-6 h-6 text-accent" />
            </div>
          </div>
          <DialogTitle className="text-xl">
            Funcionalidade Premium
          </DialogTitle>
          <DialogDescription className="text-base">
            <strong>{featureName}</strong> não está disponível no plano{' '}
            <Badge variant="secondary" className="text-xs">
              {currentPlan || 'Básico'}
            </Badge>
            . Faça upgrade para desbloquear!
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-lg border bg-card p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <plan.icon className="w-5 h-5 text-primary" />
                <span className="font-semibold">{plan.name}</span>
              </div>
              <div className="text-2xl font-bold text-primary">{plan.price}</div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {plan.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-1.5">
                    <span className="text-success">✓</span> {h}
                  </li>
                ))}
              </ul>
              <Button className="w-full" size="sm" variant="outline" disabled>
                Em breve
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Agora não
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

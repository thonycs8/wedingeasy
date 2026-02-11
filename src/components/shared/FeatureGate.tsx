import { useState, ReactNode } from 'react';
import { useFeatureGating, type FeatureKey } from '@/hooks/useFeatureGating';
import { UpgradeModal } from './UpgradeModal';
import { Lock } from 'lucide-react';

interface FeatureGateProps {
  featureKey: FeatureKey;
  featureName: string;
  children: ReactNode;
  /** If true, renders children with an overlay instead of blocking completely */
  soft?: boolean;
}

/**
 * Wraps content that requires a specific feature.
 * If the feature is not enabled, shows a lock overlay / upgrade prompt.
 */
export function FeatureGate({ featureKey, featureName, children, soft = false }: FeatureGateProps) {
  const { isAllowed, isLoading, planName } = useFeatureGating(featureKey);
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (isLoading) return <>{children}</>;

  if (isAllowed) return <>{children}</>;

  if (soft) {
    return (
      <div className="relative">
        <div className="opacity-40 pointer-events-none select-none">
          {children}
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={() => setShowUpgrade(true)}
        >
          <div className="flex items-center gap-2 bg-card/90 border rounded-lg px-4 py-2 shadow-md">
            <Lock className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">
              {featureName} — Upgrade necessário
            </span>
          </div>
        </div>
        <UpgradeModal
          open={showUpgrade}
          onOpenChange={setShowUpgrade}
          featureName={featureName}
          currentPlan={planName}
        />
      </div>
    );
  }

  // Hard gate - just show upgrade prompt
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center cursor-pointer"
      onClick={() => setShowUpgrade(true)}
    >
      <div className="rounded-full bg-accent/20 p-4 mb-4">
        <Lock className="w-8 h-8 text-accent" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{featureName}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Esta funcionalidade requer um plano superior. Clique para ver as opções.
      </p>
      <UpgradeModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        featureName={featureName}
        currentPlan={planName}
      />
    </div>
  );
}

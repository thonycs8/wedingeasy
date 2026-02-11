import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWeddingId } from '@/hooks/useWeddingId';

export type FeatureKey =
  | 'guests_management'
  | 'guests_bulk_import'
  | 'guests_export'
  | 'budget_management'
  | 'budget_charts'
  | 'budget_options'
  | 'timeline_management'
  | 'timeline_priorities'
  | 'ceremony_roles'
  | 'collaborators'
  | 'photo_gallery'
  | 'marketplace'
  | 'notifications_system'
  | 'wedding_choices'
  | 'realtime_sync'
  | 'pdf_export'
  | 'wedding_landing';

interface FeatureGatingResult {
  isAllowed: boolean;
  isLoading: boolean;
  planName: string | null;
}

/**
 * Fetches the set of enabled feature_keys for the current wedding's subscription plan.
 */
function useEnabledFeatures() {
  const { weddingId } = useWeddingId();

  return useQuery({
    queryKey: ['enabled-features', weddingId],
    queryFn: async () => {
      if (!weddingId) return { features: new Set<string>(), planName: null as string | null };

      // Get wedding's subscription
      const { data: sub } = await supabase
        .from('wedding_subscriptions')
        .select('plan_id')
        .eq('wedding_id', weddingId)
        .eq('status', 'active')
        .maybeSingle();

      if (!sub) {
        // No subscription = basic (free) plan
        const { data: basicPlan } = await supabase
          .from('subscription_plans')
          .select('id, display_name')
          .eq('name', 'basic')
          .single();

        if (!basicPlan) return { features: new Set<string>(), planName: 'Básico' };

        const { data: pf } = await supabase
          .from('plan_features')
          .select('feature_id')
          .eq('plan_id', basicPlan.id)
          .eq('enabled', true);

        const featureIds = (pf || []).map(f => f.feature_id);
        if (featureIds.length === 0) return { features: new Set<string>(), planName: basicPlan.display_name };

        const { data: features } = await supabase
          .from('app_features')
          .select('feature_key')
          .in('id', featureIds);

        return {
          features: new Set((features || []).map(f => f.feature_key)),
          planName: basicPlan.display_name,
        };
      }

      // Get plan name
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('display_name')
        .eq('id', sub.plan_id)
        .single();

      // Get enabled features for this plan
      const { data: pf } = await supabase
        .from('plan_features')
        .select('feature_id')
        .eq('plan_id', sub.plan_id)
        .eq('enabled', true);

      const featureIds = (pf || []).map(f => f.feature_id);
      if (featureIds.length === 0) return { features: new Set<string>(), planName: plan?.display_name ?? null };

      const { data: features } = await supabase
        .from('app_features')
        .select('feature_key')
        .in('id', featureIds);

      return {
        features: new Set((features || []).map(f => f.feature_key)),
        planName: plan?.display_name ?? null,
      };
    },
    enabled: !!weddingId,
    staleTime: 1000 * 60 * 10, // 10 min cache
  });
}

/**
 * Check if a specific feature is enabled for the current wedding's plan.
 */
export function useFeatureGating(featureKey: FeatureKey): FeatureGatingResult {
  const { data, isLoading } = useEnabledFeatures();

  return {
    isAllowed: data?.features.has(featureKey) ?? false,
    isLoading,
    planName: data?.planName ?? null,
  };
}

/**
 * Check multiple features at once.
 */
export function useMultipleFeatures(featureKeys: FeatureKey[]) {
  const { data, isLoading } = useEnabledFeatures();

  const results = featureKeys.reduce<Record<string, boolean>>((acc, key) => {
    acc[key] = data?.features.has(key) ?? false;
    return acc;
  }, {});

  return { features: results, isLoading, planName: data?.planName ?? null };
}

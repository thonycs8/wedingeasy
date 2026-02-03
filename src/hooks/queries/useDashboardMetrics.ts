import { useQuery } from '@tanstack/react-query';
import { weddingApi } from '@/api/wedding.api';
import type { DashboardMetrics } from '@/types/wedding.types';

/**
 * Hook para buscar métricas agregadas do dashboard
 * Uma única chamada para todas as métricas principais
 */
export function useDashboardMetrics(weddingId: string | null) {
  return useQuery({
    queryKey: ['dashboard-metrics', weddingId],
    queryFn: () => weddingApi.getDashboardMetrics(weddingId!),
    enabled: !!weddingId,
    staleTime: 1000 * 30, // 30 segundos - métricas podem mudar frequentemente
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook helper para extrair métricas específicas
 */
export function useGuestMetrics(weddingId: string | null) {
  const query = useDashboardMetrics(weddingId);
  return {
    ...query,
    data: query.data?.guests,
  };
}

export function useBudgetMetrics(weddingId: string | null) {
  const query = useDashboardMetrics(weddingId);
  return {
    ...query,
    data: query.data?.budget,
  };
}

export function useTimelineMetrics(weddingId: string | null) {
  const query = useDashboardMetrics(weddingId);
  return {
    ...query,
    data: query.data?.timeline,
  };
}

export function useNotificationMetrics(weddingId: string | null) {
  const query = useDashboardMetrics(weddingId);
  return {
    ...query,
    data: query.data?.notifications,
  };
}

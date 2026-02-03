import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { weddingApi } from '@/api/wedding.api';

/**
 * Hook para obter o wedding_id do usuário atual
 * Retorna o ID do wedding onde o user é owner ou collaborator
 */
export function useWeddingId() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['wedding-id', user?.id],
    queryFn: () => weddingApi.getWeddingId(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutos - wedding_id raramente muda
  });

  return {
    weddingId: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

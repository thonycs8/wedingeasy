import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { weddingApi } from '@/api/wedding.api';
import { guestsApi } from '@/api/guests.api';
import { useToast } from '@/hooks/use-toast';
import type { GuestPaginationParams, PaginatedResponse } from '@/types/wedding.types';
import type { Guest, GuestCreate, GuestUpdate, GuestBulkUpdate } from '@/types/guest.types';

/**
 * Hook para buscar guests paginados via RPC
 */
export function useGuestsPaginated(params: Omit<GuestPaginationParams, 'weddingId'> & { weddingId: string | null }) {
  const { weddingId, ...filterParams } = params;

  return useQuery({
    queryKey: ['guests-paginated', weddingId, filterParams],
    queryFn: () => weddingApi.getGuestsPaginated({ weddingId: weddingId!, ...filterParams }),
    enabled: !!weddingId,
    placeholderData: (prev) => prev, // Keep previous data while loading
  });
}

/**
 * Hook para infinite scroll de guests
 */
export function useGuestsInfinite(params: Omit<GuestPaginationParams, 'weddingId' | 'page'> & { weddingId: string | null }) {
  const { weddingId, ...filterParams } = params;

  return useInfiniteQuery({
    queryKey: ['guests-infinite', weddingId, filterParams],
    queryFn: ({ pageParam = 1 }) => 
      weddingApi.getGuestsPaginated({ weddingId: weddingId!, page: pageParam, ...filterParams }),
    enabled: !!weddingId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.pagination;
      return page < total_pages ? page + 1 : undefined;
    },
  });
}

/**
 * Hook para mutations de guests com wedding_id
 */
export function useGuestMutations(weddingId: string | null) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidateQueries = () => {
    // Invalidate all guest-related queries
    queryClient.invalidateQueries({ queryKey: ['guests-paginated', weddingId] });
    queryClient.invalidateQueries({ queryKey: ['guests-infinite', weddingId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', weddingId] });
  };

  const addGuest = useMutation({
    mutationFn: (guest: Omit<GuestCreate, 'wedding_id'>) => 
      guestsApi.create({ ...guest, wedding_id: weddingId! }),
    onSuccess: () => {
      invalidateQueries();
      toast({
        title: 'Convidado adicionado',
        description: 'O convidado foi adicionado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao adicionar convidado:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o convidado.',
        variant: 'destructive',
      });
    },
  });

  const updateGuest = useMutation({
    mutationFn: (update: GuestUpdate) => guestsApi.update(update),
    onSuccess: () => {
      invalidateQueries();
    },
    onError: (error) => {
      console.error('Erro ao atualizar convidado:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o convidado.',
        variant: 'destructive',
      });
    },
  });

  const deleteGuest = useMutation({
    mutationFn: (guestId: string) => guestsApi.delete(guestId),
    onSuccess: () => {
      invalidateQueries();
      toast({
        title: 'Convidado removido',
        description: 'O convidado foi removido com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao remover convidado:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o convidado.',
        variant: 'destructive',
      });
    },
  });

  const bulkUpdate = useMutation({
    mutationFn: (bulkUpdate: GuestBulkUpdate) => guestsApi.bulkUpdate(bulkUpdate),
    onSuccess: (_, variables) => {
      invalidateQueries();
      toast({
        title: 'Convidados atualizados',
        description: `${variables.ids.length} convidado(s) atualizado(s) com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar convidados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar os convidados.',
        variant: 'destructive',
      });
    },
  });

  const bulkDelete = useMutation({
    mutationFn: (guestIds: string[]) => guestsApi.bulkDelete(guestIds),
    onSuccess: (_, guestIds) => {
      invalidateQueries();
      toast({
        title: 'Convidados removidos',
        description: `${guestIds.length} convidado(s) removido(s) com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Erro ao remover convidados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover os convidados.',
        variant: 'destructive',
      });
    },
  });

  return {
    addGuest,
    updateGuest,
    deleteGuest,
    bulkUpdate,
    bulkDelete,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestsApi } from '@/api/guests.api';
import { queryKeys } from '@/lib/query-client';
import { useToast } from '@/hooks/use-toast';
import type { Guest, GuestCreate, GuestUpdate, GuestBulkUpdate } from '@/types/guest.types';

/**
 * Hook para gestão de convidados com React Query
 * Migrado para usar weddingId em vez de userId
 */
export function useGuests(weddingId: string | null | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const id = weddingId || '';

  // Query principal - busca todos os guests por wedding_id
  const guestsQuery = useQuery({
    queryKey: queryKeys.byWedding.guests(id),
    queryFn: () => guestsApi.fetchAll(id),
    enabled: !!weddingId,
  });

  // Mutation - criar guest
  const addGuestMutation = useMutation({
    mutationFn: (guest: GuestCreate) => guestsApi.create(guest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.guests(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
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

  // Mutation - atualizar guest (com optimistic update)
  const updateGuestMutation = useMutation({
    mutationFn: (update: GuestUpdate) => guestsApi.update(update),
    onMutate: async (updatedGuest) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.byWedding.guests(id) });
      const previousGuests = queryClient.getQueryData<Guest[]>(queryKeys.byWedding.guests(id));
      
      if (previousGuests) {
        queryClient.setQueryData<Guest[]>(
          queryKeys.byWedding.guests(id),
          previousGuests.map(g => 
            g.id === updatedGuest.id ? { ...g, ...updatedGuest } : g
          )
        );
      }
      
      return { previousGuests };
    },
    onError: (error, _variables, context) => {
      if (context?.previousGuests) {
        queryClient.setQueryData(queryKeys.byWedding.guests(id), context.previousGuests);
      }
      console.error('Erro ao atualizar convidado:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o convidado.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.guests(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
    },
  });

  // Mutation - bulk update
  const bulkUpdateMutation = useMutation({
    mutationFn: (bulkUpdate: GuestBulkUpdate) => guestsApi.bulkUpdate(bulkUpdate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.guests(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
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

  // Mutation - deletar guest
  const deleteGuestMutation = useMutation({
    mutationFn: (guestId: string) => guestsApi.delete(guestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.guests(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
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

  // Mutation - bulk delete
  const bulkDeleteMutation = useMutation({
    mutationFn: (guestIds: string[]) => guestsApi.bulkDelete(guestIds),
    onSuccess: (_, guestIds) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.guests(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
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
    // Data
    guests: guestsQuery.data ?? [],
    
    // Loading states
    isLoading: guestsQuery.isLoading,
    isFetching: guestsQuery.isFetching,
    isError: guestsQuery.isError,
    error: guestsQuery.error,
    
    // Mutations
    addGuest: addGuestMutation,
    updateGuest: updateGuestMutation,
    bulkUpdate: bulkUpdateMutation,
    deleteGuest: deleteGuestMutation,
    bulkDelete: bulkDeleteMutation,
    
    // Helpers
    refetch: guestsQuery.refetch,
  };
}

/**
 * Hook para buscar apenas guests com papéis especiais (cerimónia)
 */
export function useGuestsWithRoles(weddingId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.byWedding.guests(weddingId || ''), 'with-roles'],
    queryFn: () => guestsApi.fetchWithSpecialRoles(weddingId!),
    enabled: !!weddingId,
  });
}

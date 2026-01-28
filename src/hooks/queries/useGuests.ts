import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestsApi } from '@/api/guests.api';
import { queryKeys } from '@/lib/query-client';
import { useToast } from '@/hooks/use-toast';
import type { Guest, GuestCreate, GuestUpdate, GuestBulkUpdate, GuestStats } from '@/types/guest.types';

/**
 * Hook para gestão de convidados com React Query
 * Inclui cache, mutations e optimistic updates
 */
export function useGuests(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query principal - busca todos os guests
  const guestsQuery = useQuery({
    queryKey: queryKeys.guests(userId || ''),
    queryFn: () => guestsApi.fetchAll(userId!),
    enabled: !!userId,
  });

  // Mutation - criar guest
  const addGuestMutation = useMutation({
    mutationFn: (guest: GuestCreate) => guestsApi.create(guest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guests(userId || '') });
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
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: queryKeys.guests(userId || '') });
      
      // Snapshot do estado anterior
      const previousGuests = queryClient.getQueryData<Guest[]>(queryKeys.guests(userId || ''));
      
      // Optimistic update
      if (previousGuests) {
        queryClient.setQueryData<Guest[]>(
          queryKeys.guests(userId || ''),
          previousGuests.map(g => 
            g.id === updatedGuest.id ? { ...g, ...updatedGuest } : g
          )
        );
      }
      
      return { previousGuests };
    },
    onError: (error, _variables, context) => {
      // Rollback em caso de erro
      if (context?.previousGuests) {
        queryClient.setQueryData(queryKeys.guests(userId || ''), context.previousGuests);
      }
      console.error('Erro ao atualizar convidado:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o convidado.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guests(userId || '') });
    },
  });

  // Mutation - bulk update
  const bulkUpdateMutation = useMutation({
    mutationFn: (bulkUpdate: GuestBulkUpdate) => guestsApi.bulkUpdate(bulkUpdate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guests(userId || '') });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.guests(userId || '') });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.guests(userId || '') });
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

  // Calcular estatísticas
  const stats: GuestStats | null = guestsQuery.data ? calculateStats(guestsQuery.data) : null;

  return {
    // Data
    guests: guestsQuery.data ?? [],
    stats,
    
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
 * Calcula estatísticas dos guests
 */
function calculateStats(guests: Guest[]): GuestStats {
  const confirmed = guests.filter(g => g.confirmed).length;
  
  const byCategory: Record<string, number> = {};
  const bySide = { noivo: 0, noiva: 0, semLado: 0 };
  const byAgeBand: Record<string, number> = {
    'Bebés (0-4)': 0,
    'Crianças (5-10)': 0,
    'Adolescentes (11+)': 0,
    'Adultos': 0
  };
  let withPlusOne = 0;

  guests.forEach(guest => {
    // Por categoria
    byCategory[guest.category] = (byCategory[guest.category] || 0) + 1;
    
    // Por lado
    if (guest.side === 'noivo') bySide.noivo++;
    else if (guest.side === 'noiva') bySide.noiva++;
    else bySide.semLado++;
    
    // Por faixa etária
    const ageBand = guest.age_band as string;
    if (ageBand && byAgeBand[ageBand] !== undefined) {
      byAgeBand[ageBand]++;
    }
    
    // Com +1
    if (guest.plus_one) withPlusOne++;
  });

  return {
    total: guests.length,
    confirmed,
    pending: guests.length - confirmed,
    byCategory,
    bySide,
    byAgeBand: byAgeBand as GuestStats['byAgeBand'],
    withPlusOne
  };
}

/**
 * Hook para buscar apenas guests com papéis especiais (cerimónia)
 */
export function useGuestsWithRoles(userId: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.guests(userId || ''), 'with-roles'],
    queryFn: () => guestsApi.fetchWithSpecialRoles(userId!),
    enabled: !!userId,
  });
}

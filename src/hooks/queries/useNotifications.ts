import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/api/notifications.api';
import { queryKeys } from '@/lib/query-client';
import { useToast } from '@/hooks/use-toast';
import type { Notification, NotificationCreate } from '@/types/notification.types';

/**
 * Hook para gestão de notificações com React Query
 * Migrado para usar weddingId em vez de userId
 */
export function useNotifications(weddingId: string | null | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const id = weddingId || '';

  // Query principal
  const notificationsQuery = useQuery({
    queryKey: queryKeys.byWedding.notifications(id),
    queryFn: () => notificationsApi.fetchAll(id),
    enabled: !!weddingId,
  });

  // Query de não lidas
  const unreadQuery = useQuery({
    queryKey: [...queryKeys.byWedding.notifications(id), 'unread'],
    queryFn: () => notificationsApi.fetchUnread(id),
    enabled: !!weddingId,
    refetchInterval: 30000, // Poll a cada 30 segundos
  });

  // Mutation - criar notificação
  const createNotificationMutation = useMutation({
    mutationFn: (notification: NotificationCreate) => notificationsApi.create(notification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.notifications(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
    },
    onError: (error) => {
      console.error('Erro ao criar notificação:', error);
    },
  });

  // Mutation - marcar como lida (optimistic update)
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markAsRead(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.byWedding.notifications(id) });
      const previousNotifications = queryClient.getQueryData<Notification[]>(queryKeys.byWedding.notifications(id));
      
      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          queryKeys.byWedding.notifications(id),
          previousNotifications.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
      }
      
      return { previousNotifications };
    },
    onError: (error, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKeys.byWedding.notifications(id), context.previousNotifications);
      }
      console.error('Erro ao marcar notificação como lida:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.notifications(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
    },
  });

  // Mutation - marcar todas como lidas (optimistic update)
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.byWedding.notifications(id) });
      const previousNotifications = queryClient.getQueryData<Notification[]>(queryKeys.byWedding.notifications(id));
      
      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          queryKeys.byWedding.notifications(id),
          previousNotifications.map(n => ({ ...n, read: true }))
        );
      }
      
      return { previousNotifications };
    },
    onError: (error, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKeys.byWedding.notifications(id), context.previousNotifications);
      }
      console.error('Erro ao marcar notificações como lidas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar as notificações como lidas.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.notifications(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
      toast({
        title: 'Notificações lidas',
        description: 'Todas as notificações foram marcadas como lidas.',
      });
    },
  });

  // Mutation - deletar notificação
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsApi.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.notifications(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
    },
    onError: (error) => {
      console.error('Erro ao remover notificação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a notificação.',
        variant: 'destructive',
      });
    },
  });

  // Mutation - deletar todas as lidas
  const deleteAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.deleteAllRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.notifications(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
      toast({
        title: 'Notificações removidas',
        description: 'Todas as notificações lidas foram removidas.',
      });
    },
    onError: (error) => {
      console.error('Erro ao remover notificações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover as notificações.',
        variant: 'destructive',
      });
    },
  });

  return {
    // Data
    notifications: notificationsQuery.data ?? [],
    unreadNotifications: unreadQuery.data ?? [],
    unreadCount: unreadQuery.data?.length ?? 0,
    
    // Loading states
    isLoading: notificationsQuery.isLoading,
    isFetching: notificationsQuery.isFetching,
    isError: notificationsQuery.isError,
    error: notificationsQuery.error,
    
    // Mutations
    createNotification: createNotificationMutation,
    markAsRead: markAsReadMutation,
    markAllAsRead: markAllAsReadMutation,
    deleteNotification: deleteNotificationMutation,
    deleteAllRead: deleteAllReadMutation,
    
    // Helpers
    refetch: notificationsQuery.refetch,
  };
}

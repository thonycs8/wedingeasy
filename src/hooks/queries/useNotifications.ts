import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/api/notifications.api';
import { queryKeys } from '@/lib/query-client';
import { useToast } from '@/hooks/use-toast';
import type { Notification, NotificationCreate, NotificationUpdate } from '@/types/notification.types';

/**
 * Hook para gestão de notificações com React Query
 */
export function useNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query principal
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications(userId || ''),
    queryFn: () => notificationsApi.fetchAll(userId!),
    enabled: !!userId,
  });

  // Query de não lidas
  const unreadQuery = useQuery({
    queryKey: [...queryKeys.notifications(userId || ''), 'unread'],
    queryFn: () => notificationsApi.fetchUnread(userId!),
    enabled: !!userId,
    refetchInterval: 30000, // Poll a cada 30 segundos
  });

  // Query de estatísticas
  const statsQuery = useQuery({
    queryKey: [...queryKeys.notifications(userId || ''), 'stats'],
    queryFn: () => notificationsApi.fetchStats(userId!),
    enabled: !!userId,
  });

  // Mutation - criar notificação
  const createNotificationMutation = useMutation({
    mutationFn: (notification: NotificationCreate) => notificationsApi.create(notification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId || '') });
    },
    onError: (error) => {
      console.error('Erro ao criar notificação:', error);
    },
  });

  // Mutation - marcar como lida
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markAsRead(notificationId),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications(userId || '') });
      const previousNotifications = queryClient.getQueryData<Notification[]>(queryKeys.notifications(userId || ''));
      
      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          queryKeys.notifications(userId || ''),
          previousNotifications.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
      }
      
      return { previousNotifications };
    },
    onError: (error, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKeys.notifications(userId || ''), context.previousNotifications);
      }
      console.error('Erro ao marcar notificação como lida:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId || '') });
    },
  });

  // Mutation - marcar todas como lidas
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(userId!),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications(userId || '') });
      const previousNotifications = queryClient.getQueryData<Notification[]>(queryKeys.notifications(userId || ''));
      
      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          queryKeys.notifications(userId || ''),
          previousNotifications.map(n => ({ ...n, read: true }))
        );
      }
      
      return { previousNotifications };
    },
    onError: (error, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKeys.notifications(userId || ''), context.previousNotifications);
      }
      console.error('Erro ao marcar notificações como lidas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar as notificações como lidas.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId || '') });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId || '') });
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
    mutationFn: () => notificationsApi.deleteAllRead(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId || '') });
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
    stats: statsQuery.data ?? null,
    
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

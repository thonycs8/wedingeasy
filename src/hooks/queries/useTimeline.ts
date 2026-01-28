import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timelineApi } from '@/api/timeline.api';
import { queryKeys } from '@/lib/query-client';
import { useToast } from '@/hooks/use-toast';
import type { TimelineTask, TimelineTaskCreate, TimelineTaskUpdate, TimelineStats } from '@/types/timeline.types';

/**
 * Hook para gestão de timeline/tarefas com React Query
 */
export function useTimeline(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query principal
  const timelineQuery = useQuery({
    queryKey: queryKeys.timeline(userId || ''),
    queryFn: () => timelineApi.fetchAll(userId!),
    enabled: !!userId,
  });

  // Query de estatísticas
  const statsQuery = useQuery({
    queryKey: [...queryKeys.timeline(userId || ''), 'stats'],
    queryFn: () => timelineApi.fetchStats(userId!),
    enabled: !!userId,
  });

  // Mutation - criar task
  const addTaskMutation = useMutation({
    mutationFn: (task: TimelineTaskCreate) => timelineApi.create(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline(userId || '') });
      toast({
        title: 'Tarefa adicionada',
        description: 'A tarefa foi adicionada com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao adicionar tarefa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a tarefa.',
        variant: 'destructive',
      });
    },
  });

  // Mutation - atualizar task
  const updateTaskMutation = useMutation({
    mutationFn: (update: TimelineTaskUpdate) => timelineApi.update(update),
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.timeline(userId || '') });
      const previousTasks = queryClient.getQueryData<TimelineTask[]>(queryKeys.timeline(userId || ''));
      
      if (previousTasks) {
        queryClient.setQueryData<TimelineTask[]>(
          queryKeys.timeline(userId || ''),
          previousTasks.map(t => 
            t.id === updatedTask.id ? { ...t, ...updatedTask } : t
          )
        );
      }
      
      return { previousTasks };
    },
    onError: (error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.timeline(userId || ''), context.previousTasks);
      }
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a tarefa.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline(userId || '') });
    },
  });

  // Mutation - toggle complete
  const toggleCompleteMutation = useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) => 
      timelineApi.toggleComplete(taskId, completed),
    onMutate: async ({ taskId, completed }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.timeline(userId || '') });
      const previousTasks = queryClient.getQueryData<TimelineTask[]>(queryKeys.timeline(userId || ''));
      
      if (previousTasks) {
        queryClient.setQueryData<TimelineTask[]>(
          queryKeys.timeline(userId || ''),
          previousTasks.map(t => 
            t.id === taskId ? { 
              ...t, 
              completed,
              completed_date: completed ? new Date().toISOString().split('T')[0] : null
            } : t
          )
        );
      }
      
      return { previousTasks };
    },
    onError: (error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.timeline(userId || ''), context.previousTasks);
      }
      console.error('Erro ao atualizar tarefa:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline(userId || '') });
    },
  });

  // Mutation - deletar task
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => timelineApi.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline(userId || '') });
      toast({
        title: 'Tarefa removida',
        description: 'A tarefa foi removida com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao remover tarefa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a tarefa.',
        variant: 'destructive',
      });
    },
  });

  // Mutation - bulk delete
  const bulkDeleteMutation = useMutation({
    mutationFn: (taskIds: string[]) => timelineApi.bulkDelete(taskIds),
    onSuccess: (_, taskIds) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline(userId || '') });
      toast({
        title: 'Tarefas removidas',
        description: `${taskIds.length} tarefa(s) removida(s) com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Erro ao remover tarefas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover as tarefas.',
        variant: 'destructive',
      });
    },
  });

  return {
    // Data
    tasks: timelineQuery.data ?? [],
    stats: statsQuery.data ?? null,
    
    // Loading states
    isLoading: timelineQuery.isLoading,
    isFetching: timelineQuery.isFetching,
    isError: timelineQuery.isError,
    error: timelineQuery.error,
    
    // Mutations
    addTask: addTaskMutation,
    updateTask: updateTaskMutation,
    toggleComplete: toggleCompleteMutation,
    deleteTask: deleteTaskMutation,
    bulkDelete: bulkDeleteMutation,
    
    // Helpers
    refetch: timelineQuery.refetch,
  };
}

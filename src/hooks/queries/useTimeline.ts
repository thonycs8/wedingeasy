import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timelineApi } from '@/api/timeline.api';
import { queryKeys } from '@/lib/query-client';
import { useToast } from '@/hooks/use-toast';
import type { TimelineTask, TimelineTaskCreate, TimelineTaskUpdate } from '@/types/timeline.types';

/**
 * Hook para gestão de timeline/tarefas com React Query
 * Migrado para usar weddingId em vez de userId
 */
export function useTimeline(weddingId: string | null | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const id = weddingId || '';

  // Query principal
  const timelineQuery = useQuery({
    queryKey: queryKeys.byWedding.timeline(id),
    queryFn: () => timelineApi.fetchAll(id),
    enabled: !!weddingId,
  });

  // Mutation - criar task
  const addTaskMutation = useMutation({
    mutationFn: (task: TimelineTaskCreate) => timelineApi.create(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.timeline(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
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

  // Mutation - atualizar task (optimistic update)
  const updateTaskMutation = useMutation({
    mutationFn: (update: TimelineTaskUpdate) => timelineApi.update(update),
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.byWedding.timeline(id) });
      const previousTasks = queryClient.getQueryData<TimelineTask[]>(queryKeys.byWedding.timeline(id));
      
      if (previousTasks) {
        queryClient.setQueryData<TimelineTask[]>(
          queryKeys.byWedding.timeline(id),
          previousTasks.map(t => 
            t.id === updatedTask.id ? { ...t, ...updatedTask } : t
          )
        );
      }
      
      return { previousTasks };
    },
    onError: (error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.byWedding.timeline(id), context.previousTasks);
      }
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a tarefa.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.timeline(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
    },
  });

  // Mutation - toggle complete (optimistic update)
  const toggleCompleteMutation = useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) => 
      timelineApi.toggleComplete(taskId, completed),
    onMutate: async ({ taskId, completed }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.byWedding.timeline(id) });
      const previousTasks = queryClient.getQueryData<TimelineTask[]>(queryKeys.byWedding.timeline(id));
      
      if (previousTasks) {
        queryClient.setQueryData<TimelineTask[]>(
          queryKeys.byWedding.timeline(id),
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
        queryClient.setQueryData(queryKeys.byWedding.timeline(id), context.previousTasks);
      }
      console.error('Erro ao atualizar tarefa:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.timeline(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
    },
  });

  // Mutation - deletar task
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => timelineApi.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.timeline(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.timeline(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
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

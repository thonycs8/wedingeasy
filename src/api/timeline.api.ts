import { supabase } from '@/integrations/supabase/client';
import type { 
  TimelineTask, 
  TimelineTaskCreate, 
  TimelineTaskUpdate,
  TimelineStats 
} from '@/types/timeline.types';

/**
 * API layer para operações de Timeline no Supabase
 */
export const timelineApi = {
  /**
   * Busca todas as tasks de um usuário
   */
  async fetchAll(userId: string): Promise<TimelineTask[]> {
    const { data, error } = await supabase
      .from('timeline_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return (data || []) as TimelineTask[];
  },

  /**
   * Busca uma task específica por ID
   */
  async fetchById(taskId: string): Promise<TimelineTask | null> {
    const { data, error } = await supabase
      .from('timeline_tasks')
      .select('*')
      .eq('id', taskId)
      .maybeSingle();

    if (error) throw error;
    return data as TimelineTask | null;
  },

  /**
   * Cria uma nova task
   */
  async create(task: TimelineTaskCreate): Promise<TimelineTask> {
    const { data, error } = await supabase
      .from('timeline_tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data as TimelineTask;
  },

  /**
   * Atualiza uma task existente
   */
  async update({ id, ...updates }: TimelineTaskUpdate): Promise<TimelineTask> {
    const { data, error } = await supabase
      .from('timeline_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as TimelineTask;
  },

  /**
   * Marca task como completa/incompleta
   */
  async toggleComplete(taskId: string, completed: boolean): Promise<TimelineTask> {
    const updates: Partial<TimelineTask> = {
      completed,
      completed_date: completed ? new Date().toISOString().split('T')[0] : null
    };

    const { data, error } = await supabase
      .from('timeline_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data as TimelineTask;
  },

  /**
   * Deleta uma task
   */
  async delete(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('timeline_tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  },

  /**
   * Deleta múltiplas tasks de uma vez
   */
  async bulkDelete(taskIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('timeline_tasks')
      .delete()
      .in('id', taskIds);

    if (error) throw error;
  },

  /**
   * Busca estatísticas de timeline
   */
  async fetchStats(userId: string): Promise<TimelineStats> {
    const { data, error } = await supabase
      .from('timeline_tasks')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const tasks = (data || []) as TimelineTask[];
    const today = new Date().toISOString().split('T')[0];
    
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.filter(t => !t.completed).length;
    const overdue = tasks.filter(t => !t.completed && t.due_date < today).length;

    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = { alta: 0, media: 0, baixa: 0 };

    tasks.forEach(task => {
      byCategory[task.category] = (byCategory[task.category] || 0) + 1;
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
    });

    return {
      total: tasks.length,
      completed,
      pending,
      overdue,
      byCategory,
      byPriority: byPriority as Record<'alta' | 'media' | 'baixa', number>,
      progressPercentage: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
    };
  }
};

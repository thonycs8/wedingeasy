import { supabase } from '@/integrations/supabase/client';
import type { 
  TimelineTask, 
  TimelineTaskCreate, 
  TimelineTaskUpdate,
} from '@/types/timeline.types';

/**
 * API layer para operações de Timeline no Supabase
 * Migrado para usar wedding_id em vez de user_id
 */
export const timelineApi = {
  /**
   * Busca todas as tasks de um wedding
   */
  async fetchAll(weddingId: string): Promise<TimelineTask[]> {
    const { data, error } = await supabase
      .from('timeline_tasks')
      .select('*')
      .eq('wedding_id', weddingId)
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
};

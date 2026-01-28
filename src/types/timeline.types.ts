import type { Priority } from './common.types';

// Categorias de tarefas da timeline
export const TASK_CATEGORIES = [
  'venue',
  'catering',
  'photography',
  'music',
  'decoration',
  'attire',
  'invitations',
  'ceremony',
  'reception',
  'honeymoon',
  'legal',
  'other'
] as const;

export type TaskCategory = typeof TASK_CATEGORIES[number];

// Tipo base do TimelineTask alinhado com o schema Supabase
export interface TimelineTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string;
  completed: boolean;
  completed_date: string | null;
  priority: Priority;
  category: TaskCategory | string;
  created_at: string;
  updated_at: string;
}

// Tipo para criação de Task
export interface TimelineTaskCreate {
  user_id: string;
  title: string;
  description?: string | null;
  due_date: string;
  completed?: boolean;
  priority?: Priority;
  category?: TaskCategory | string;
}

// Tipo para atualização de Task
export interface TimelineTaskUpdate extends Partial<Omit<TimelineTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>> {
  id: string;
}

// Filtros para timeline
export interface TimelineFilters {
  search?: string;
  category?: TaskCategory | string | 'all';
  priority?: Priority | 'all';
  status?: 'all' | 'completed' | 'pending';
  dateRange?: {
    start: string;
    end: string;
  };
}

// Estatísticas de timeline
export interface TimelineStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  byCategory: Record<string, number>;
  byPriority: Record<Priority, number>;
  progressPercentage: number;
}

// Task sugerida (template)
export interface TaskSuggestion {
  title: string;
  description: string;
  category: TaskCategory;
  priority: Priority;
  monthsBeforeWedding: number;
}

// Labels para categorias
export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  venue: 'Local',
  catering: 'Catering',
  photography: 'Fotografia',
  music: 'Música',
  decoration: 'Decoração',
  attire: 'Vestuário',
  invitations: 'Convites',
  ceremony: 'Cerimónia',
  reception: 'Recepção',
  honeymoon: 'Lua de Mel',
  legal: 'Legal',
  other: 'Outros'
};

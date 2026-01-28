// Tipos compartilhados entre todas as features

export type Side = 'Noivo' | 'Noiva' | null;

export type AgeBand = 'Bebés (0-4)' | 'Crianças (5-10)' | 'Adolescentes (11+)' | 'Adultos';

export type ConfirmationStatus = 'all' | 'confirmed' | 'pending';

export type Priority = 'alta' | 'media' | 'baixa';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  data: T;
  error: Error | null;
  count?: number;
}

export interface MutationContext<T> {
  previousData: T | undefined;
}

// Constantes globais
export const CATEGORIES = [
  'Família',
  'Amigos',
  'Trabalho',
  'Outros'
] as const;

export type Category = typeof CATEGORIES[number];

export const AGE_BANDS: AgeBand[] = [
  'Bebés (0-4)',
  'Crianças (5-10)',
  'Adolescentes (11+)',
  'Adultos'
];

export const SIDES: Side[] = ['Noivo', 'Noiva', null];

export const PRIORITIES: Priority[] = ['alta', 'media', 'baixa'];

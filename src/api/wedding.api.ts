import { supabase } from '@/integrations/supabase/client';
import type { 
  DashboardMetrics, 
  PaginatedResponse,
  GuestPaginationParams,
  BudgetPaginationParams 
} from '@/types/wedding.types';
import type { Guest } from '@/types/guest.types';
import type { BudgetExpense } from '@/types/budget.types';

/**
 * API layer para operações relacionadas ao Wedding
 * Inclui RPCs de agregação e paginação
 */
export const weddingApi = {
  /**
   * Busca o wedding_id do usuário atual
   * Primeiro verifica se é owner, depois se é collaborator
   */
  async getWeddingId(userId: string): Promise<string | null> {
    // Check if user owns a wedding
    const { data: owned } = await supabase
      .from('wedding_data')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (owned) return owned.id;

    // Check if user is a collaborator
    const { data: collab } = await supabase
      .from('wedding_collaborators')
      .select('wedding_id')
      .eq('user_id', userId)
      .maybeSingle();

    return collab?.wedding_id || null;
  },

  /**
   * Busca métricas agregadas do dashboard via RPC
   */
  async getDashboardMetrics(weddingId: string): Promise<DashboardMetrics> {
    const { data, error } = await supabase.rpc('get_wedding_dashboard_metrics', {
      _wedding_id: weddingId
    });

    if (error) throw error;
    return data as unknown as DashboardMetrics;
  },

  /**
   * Busca guests paginados via RPC
   */
  async getGuestsPaginated(params: GuestPaginationParams): Promise<PaginatedResponse<Guest>> {
    const { data, error } = await supabase.rpc('get_guests_paginated', {
      _wedding_id: params.weddingId,
      _page: params.page || 1,
      _page_size: params.pageSize || 20,
      _search: params.search || null,
      _category: params.category || null,
      _side: params.side || null,
      _confirmed: params.confirmed ?? null,
      _order_by: params.orderBy || 'name',
      _order_dir: params.orderDir || 'asc'
    });

    if (error) throw error;
    return data as unknown as PaginatedResponse<Guest>;
  },

  /**
   * Busca budget expenses paginados via RPC
   */
  async getBudgetPaginated(params: BudgetPaginationParams): Promise<PaginatedResponse<BudgetExpense & { category_name: string; category_color: string; category_icon: string }>> {
    const { data, error } = await supabase.rpc('get_budget_paginated', {
      _wedding_id: params.weddingId,
      _page: params.page || 1,
      _page_size: params.pageSize || 20,
      _category_id: params.categoryId || null,
      _status: params.status || null,
      _order_by: params.orderBy || 'date',
      _order_dir: params.orderDir || 'desc'
    });

    if (error) throw error;
    return data as unknown as PaginatedResponse<BudgetExpense & { category_name: string; category_color: string; category_icon: string }>;
  },

  /**
   * Seed default categories and tasks for a wedding
   */
  async seedDefaults(weddingId: string): Promise<void> {
    const { error } = await supabase.rpc('seed_wedding_defaults', {
      _wedding_id: weddingId
    });

    if (error) throw error;
  }
};

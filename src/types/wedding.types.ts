// Types para Wedding e Dashboard Metrics

export interface WeddingData {
  id: string;
  user_id: string;
  couple_name: string | null;
  partner_name: string | null;
  wedding_date: string | null;
  guest_count: number | null;
  style: string | null;
  region: string | null;
  season: string | null;
  priorities: string[] | null;
  estimated_budget: number | null;
  is_setup_complete: boolean;
  event_code: string;
  created_at: string;
  updated_at: string;
}

export interface GuestMetrics {
  total: number;
  confirmed: number;
  pending: number;
  with_plus_one: number;
  by_side: {
    noivo: number;
    noiva: number;
    sem_lado: number;
  };
  by_category: Record<string, number>;
}

export interface BudgetMetrics {
  total_budgeted: number;
  total_spent: number;
  categories_count: number;
  categories: Array<{
    id: string;
    name: string;
    budgeted: number;
    spent: number;
    color: string;
    icon: string;
  }>;
}

export interface TimelineMetrics {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  upcoming_week: number;
  by_priority: {
    alta: number;
    media: number;
    baixa: number;
  };
}

export interface NotificationMetrics {
  total: number;
  unread: number;
}

export interface WeddingInfoMetrics {
  id: string;
  couple_name: string | null;
  partner_name: string | null;
  wedding_date: string | null;
  estimated_budget: number | null;
  guest_count: number | null;
  days_until: number | null;
}

export interface DashboardMetrics {
  guests: GuestMetrics;
  budget: BudgetMetrics;
  timeline: TimelineMetrics;
  notifications: NotificationMetrics;
  wedding: WeddingInfoMetrics;
}

// Pagination types
export interface PaginationInfo {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// Filters for paginated queries
export interface GuestPaginationParams {
  weddingId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  side?: string;
  confirmed?: boolean;
  orderBy?: 'name' | 'created_at';
  orderDir?: 'asc' | 'desc';
}

export interface BudgetPaginationParams {
  weddingId: string;
  page?: number;
  pageSize?: number;
  categoryId?: string;
  status?: string;
  orderBy?: 'date' | 'amount';
  orderDir?: 'asc' | 'desc';
}

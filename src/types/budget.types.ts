import type { Priority } from './common.types';

// Status de despesas
export const EXPENSE_STATUSES = ['pago', 'pendente', 'cancelado'] as const;
export type ExpenseStatus = typeof EXPENSE_STATUSES[number];

// Status de opções
export const OPTION_STATUSES = ['considerando', 'contactado', 'reuniao_marcada', 'proposta_recebida', 'contratado', 'descartado'] as const;
export type OptionStatus = typeof OPTION_STATUSES[number];

// Tipo base do BudgetCategory alinhado com o schema Supabase
export interface BudgetCategory {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  budgeted_amount: number;
  spent_amount: number;
  priority: Priority | null;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Tipo para criação de Category
export interface BudgetCategoryCreate {
  user_id: string;
  name: string;
  description?: string | null;
  budgeted_amount?: number;
  priority?: Priority | null;
  icon?: string | null;
  color?: string | null;
  is_default?: boolean;
}

// Tipo para atualização de Category
export interface BudgetCategoryUpdate extends Partial<Omit<BudgetCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>> {
  id: string;
}

// Tipo base do BudgetExpense alinhado com o schema Supabase
export interface BudgetExpense {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  description: string | null;
  amount: number;
  date: string;
  vendor: string | null;
  status: ExpenseStatus;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

// Tipo para criação de Expense
export interface BudgetExpenseCreate {
  user_id: string;
  category_id: string;
  name: string;
  description?: string | null;
  amount: number;
  date?: string;
  vendor?: string | null;
  status?: ExpenseStatus;
  receipt_url?: string | null;
}

// Tipo para atualização de Expense
export interface BudgetExpenseUpdate extends Partial<Omit<BudgetExpense, 'id' | 'user_id' | 'created_at' | 'updated_at'>> {
  id: string;
}

// Tipo base do BudgetOption alinhado com o schema Supabase
export interface BudgetOption {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  vendor: string | null;
  price_min: number | null;
  price_max: number | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  rating: number | null;
  status: OptionStatus;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

// Tipo para criação de Option
export interface BudgetOptionCreate {
  user_id: string;
  category_id: string;
  name: string;
  vendor?: string | null;
  price_min?: number | null;
  price_max?: number | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  rating?: number | null;
  status?: OptionStatus;
  is_favorite?: boolean;
}

// Tipo para atualização de Option
export interface BudgetOptionUpdate extends Partial<Omit<BudgetOption, 'id' | 'user_id' | 'created_at' | 'updated_at'>> {
  id: string;
}

// Estatísticas de budget
export interface BudgetStats {
  totalBudgeted: number;
  totalSpent: number;
  totalPending: number;
  remainingBudget: number;
  spentPercentage: number;
  byCategory: Array<{
    category: BudgetCategory;
    spent: number;
    budgeted: number;
    percentage: number;
  }>;
}

// Labels para status
export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  pago: 'Pago',
  pendente: 'Pendente',
  cancelado: 'Cancelado'
};

export const OPTION_STATUS_LABELS: Record<OptionStatus, string> = {
  considerando: 'A Considerar',
  contactado: 'Contactado',
  reuniao_marcada: 'Reunião Marcada',
  proposta_recebida: 'Proposta Recebida',
  contratado: 'Contratado',
  descartado: 'Descartado'
};

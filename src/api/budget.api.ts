import { supabase } from '@/integrations/supabase/client';
import type { 
  BudgetCategory, 
  BudgetCategoryCreate, 
  BudgetCategoryUpdate,
  BudgetExpense,
  BudgetExpenseCreate,
  BudgetExpenseUpdate,
  BudgetOption,
  BudgetOptionCreate,
  BudgetOptionUpdate,
  BudgetStats
} from '@/types/budget.types';

/**
 * API layer para operações de Budget no Supabase
 */
export const budgetApi = {
  // ==================== CATEGORIES ====================
  
  /**
   * Busca todas as categorias de um usuário
   */
  async fetchCategories(userId: string): Promise<BudgetCategory[]> {
    const { data, error } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;
    return (data || []) as BudgetCategory[];
  },

  /**
   * Cria uma nova categoria
   */
  async createCategory(category: BudgetCategoryCreate): Promise<BudgetCategory> {
    const { data, error } = await supabase
      .from('budget_categories')
      .insert([category])
      .select()
      .single();

    if (error) throw error;
    return data as BudgetCategory;
  },

  /**
   * Atualiza uma categoria
   */
  async updateCategory({ id, ...updates }: BudgetCategoryUpdate): Promise<BudgetCategory> {
    const { data, error } = await supabase
      .from('budget_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as BudgetCategory;
  },

  /**
   * Deleta uma categoria
   */
  async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('budget_categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
  },

  // ==================== EXPENSES ====================

  /**
   * Busca todas as despesas de um usuário
   */
  async fetchExpenses(userId: string): Promise<BudgetExpense[]> {
    const { data, error } = await supabase
      .from('budget_expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []) as BudgetExpense[];
  },

  /**
   * Busca despesas por categoria
   */
  async fetchExpensesByCategory(categoryId: string): Promise<BudgetExpense[]> {
    const { data, error } = await supabase
      .from('budget_expenses')
      .select('*')
      .eq('category_id', categoryId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []) as BudgetExpense[];
  },

  /**
   * Cria uma nova despesa
   */
  async createExpense(expense: BudgetExpenseCreate): Promise<BudgetExpense> {
    const { data, error } = await supabase
      .from('budget_expenses')
      .insert([expense])
      .select()
      .single();

    if (error) throw error;
    return data as BudgetExpense;
  },

  /**
   * Atualiza uma despesa
   */
  async updateExpense({ id, ...updates }: BudgetExpenseUpdate): Promise<BudgetExpense> {
    const { data, error } = await supabase
      .from('budget_expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as BudgetExpense;
  },

  /**
   * Deleta uma despesa
   */
  async deleteExpense(expenseId: string): Promise<void> {
    const { error } = await supabase
      .from('budget_expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw error;
  },

  // ==================== OPTIONS ====================

  /**
   * Busca todas as opções de um usuário
   */
  async fetchOptions(userId: string): Promise<BudgetOption[]> {
    const { data, error } = await supabase
      .from('budget_options')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;
    return (data || []) as BudgetOption[];
  },

  /**
   * Busca opções por categoria
   */
  async fetchOptionsByCategory(categoryId: string): Promise<BudgetOption[]> {
    const { data, error } = await supabase
      .from('budget_options')
      .select('*')
      .eq('category_id', categoryId)
      .order('is_favorite', { ascending: false });

    if (error) throw error;
    return (data || []) as BudgetOption[];
  },

  /**
   * Cria uma nova opção
   */
  async createOption(option: BudgetOptionCreate): Promise<BudgetOption> {
    const { data, error } = await supabase
      .from('budget_options')
      .insert([option])
      .select()
      .single();

    if (error) throw error;
    return data as BudgetOption;
  },

  /**
   * Atualiza uma opção
   */
  async updateOption({ id, ...updates }: BudgetOptionUpdate): Promise<BudgetOption> {
    const { data, error } = await supabase
      .from('budget_options')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as BudgetOption;
  },

  /**
   * Deleta uma opção
   */
  async deleteOption(optionId: string): Promise<void> {
    const { error } = await supabase
      .from('budget_options')
      .delete()
      .eq('id', optionId);

    if (error) throw error;
  },

  /**
   * Toggle favorito de uma opção
   */
  async toggleFavorite(optionId: string, isFavorite: boolean): Promise<BudgetOption> {
    const { data, error } = await supabase
      .from('budget_options')
      .update({ is_favorite: isFavorite })
      .eq('id', optionId)
      .select()
      .single();

    if (error) throw error;
    return data as BudgetOption;
  },

  // ==================== STATS ====================

  /**
   * Calcula estatísticas de budget
   */
  async fetchStats(userId: string): Promise<BudgetStats> {
    const [categories, expenses] = await Promise.all([
      this.fetchCategories(userId),
      this.fetchExpenses(userId)
    ]);

    const totalBudgeted = categories.reduce((sum, cat) => sum + (cat.budgeted_amount || 0), 0);
    const totalSpent = expenses
      .filter(e => e.status === 'pago')
      .reduce((sum, exp) => sum + exp.amount, 0);
    const totalPending = expenses
      .filter(e => e.status === 'pendente')
      .reduce((sum, exp) => sum + exp.amount, 0);

    const byCategory = categories.map(category => {
      const categoryExpenses = expenses.filter(e => e.category_id === category.id && e.status === 'pago');
      const spent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
      const budgeted = category.budgeted_amount || 0;
      
      return {
        category,
        spent,
        budgeted,
        percentage: budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0
      };
    });

    return {
      totalBudgeted,
      totalSpent,
      totalPending,
      remainingBudget: totalBudgeted - totalSpent,
      spentPercentage: totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0,
      byCategory
    };
  }
};

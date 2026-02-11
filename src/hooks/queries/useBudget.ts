import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetApi } from '@/api/budget.api';
import { queryKeys } from '@/lib/query-client';
import { useToast } from '@/hooks/use-toast';
import type { 
  BudgetCategoryCreate, 
  BudgetCategoryUpdate,
  BudgetExpenseCreate,
  BudgetExpenseUpdate,
  BudgetOptionCreate,
  BudgetOptionUpdate
} from '@/types/budget.types';

/**
 * Hook para gestão de categorias de budget
 * Migrado para usar weddingId em vez de userId
 */
export function useBudgetCategories(weddingId: string | null | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const id = weddingId || '';

  const categoriesQuery = useQuery({
    queryKey: queryKeys.byWedding.budget.categories(id),
    queryFn: () => budgetApi.fetchCategories(id),
    enabled: !!weddingId,
  });

  const addCategoryMutation = useMutation({
    mutationFn: (category: BudgetCategoryCreate) => budgetApi.createCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.budget.categories(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
      toast({ title: 'Categoria adicionada', description: 'A categoria foi criada com sucesso.' });
    },
    onError: (error) => {
      console.error('Erro ao adicionar categoria:', error);
      toast({ title: 'Erro', description: 'Não foi possível criar a categoria.', variant: 'destructive' });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (update: BudgetCategoryUpdate) => budgetApi.updateCategory(update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.budget.categories(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar categoria:', error);
      toast({ title: 'Erro', description: 'Não foi possível atualizar a categoria.', variant: 'destructive' });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: string) => budgetApi.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.budget.categories(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
      toast({ title: 'Categoria removida', description: 'A categoria foi removida com sucesso.' });
    },
    onError: (error) => {
      console.error('Erro ao remover categoria:', error);
      toast({ title: 'Erro', description: 'Não foi possível remover a categoria.', variant: 'destructive' });
    },
  });

  return {
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    addCategory: addCategoryMutation,
    updateCategory: updateCategoryMutation,
    deleteCategory: deleteCategoryMutation,
    refetch: categoriesQuery.refetch,
  };
}

/**
 * Hook para gestão de despesas
 * Migrado para usar weddingId em vez de userId
 */
export function useBudgetExpenses(weddingId: string | null | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const id = weddingId || '';

  const expensesQuery = useQuery({
    queryKey: queryKeys.byWedding.budget.expenses(id),
    queryFn: () => budgetApi.fetchExpenses(id),
    enabled: !!weddingId,
  });

  const addExpenseMutation = useMutation({
    mutationFn: (expense: BudgetExpenseCreate) => budgetApi.createExpense(expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.budget.expenses(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.budget.categories(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
      toast({ title: 'Despesa adicionada', description: 'A despesa foi registrada com sucesso.' });
    },
    onError: (error) => {
      console.error('Erro ao adicionar despesa:', error);
      toast({ title: 'Erro', description: 'Não foi possível registrar a despesa.', variant: 'destructive' });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: (update: BudgetExpenseUpdate) => budgetApi.updateExpense(update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.budget.expenses(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.budget.categories(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar despesa:', error);
      toast({ title: 'Erro', description: 'Não foi possível atualizar a despesa.', variant: 'destructive' });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (expenseId: string) => budgetApi.deleteExpense(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.budget.expenses(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.budget.categories(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', id] });
      toast({ title: 'Despesa removida', description: 'A despesa foi removida com sucesso.' });
    },
    onError: (error) => {
      console.error('Erro ao remover despesa:', error);
      toast({ title: 'Erro', description: 'Não foi possível remover a despesa.', variant: 'destructive' });
    },
  });

  return {
    expenses: expensesQuery.data ?? [],
    isLoading: expensesQuery.isLoading,
    isError: expensesQuery.isError,
    addExpense: addExpenseMutation,
    updateExpense: updateExpenseMutation,
    deleteExpense: deleteExpenseMutation,
    refetch: expensesQuery.refetch,
  };
}

/**
 * Hook para gestão de opções/fornecedores
 * Migrado para usar weddingId em vez de userId
 */
export function useBudgetOptions(weddingId: string | null | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const id = weddingId || '';

  const optionsQuery = useQuery({
    queryKey: queryKeys.byWedding.budget.options(id),
    queryFn: () => budgetApi.fetchOptions(id),
    enabled: !!weddingId,
  });

  const addOptionMutation = useMutation({
    mutationFn: (option: BudgetOptionCreate) => budgetApi.createOption(option),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.budget.options(id) });
      toast({ title: 'Opção adicionada', description: 'A opção foi registrada com sucesso.' });
    },
    onError: (error) => {
      console.error('Erro ao adicionar opção:', error);
      toast({ title: 'Erro', description: 'Não foi possível registrar a opção.', variant: 'destructive' });
    },
  });

  const updateOptionMutation = useMutation({
    mutationFn: (update: BudgetOptionUpdate) => budgetApi.updateOption(update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.budget.options(id) });
    },
    onError: (error) => {
      console.error('Erro ao atualizar opção:', error);
      toast({ title: 'Erro', description: 'Não foi possível atualizar a opção.', variant: 'destructive' });
    },
  });

  const deleteOptionMutation = useMutation({
    mutationFn: (optionId: string) => budgetApi.deleteOption(optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.budget.options(id) });
      toast({ title: 'Opção removida', description: 'A opção foi removida com sucesso.' });
    },
    onError: (error) => {
      console.error('Erro ao remover opção:', error);
      toast({ title: 'Erro', description: 'Não foi possível remover a opção.', variant: 'destructive' });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ optionId, isFavorite }: { optionId: string; isFavorite: boolean }) => 
      budgetApi.toggleFavorite(optionId, isFavorite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.byWedding.budget.options(id) });
    },
  });

  return {
    options: optionsQuery.data ?? [],
    isLoading: optionsQuery.isLoading,
    isError: optionsQuery.isError,
    addOption: addOptionMutation,
    updateOption: updateOptionMutation,
    deleteOption: deleteOptionMutation,
    toggleFavorite: toggleFavoriteMutation,
    refetch: optionsQuery.refetch,
  };
}

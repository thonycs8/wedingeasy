import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetApi } from '@/api/budget.api';
import { queryKeys } from '@/lib/query-client';
import { useToast } from '@/hooks/use-toast';
import type { 
  BudgetCategory, 
  BudgetCategoryCreate, 
  BudgetCategoryUpdate,
  BudgetExpense,
  BudgetExpenseCreate,
  BudgetExpenseUpdate,
  BudgetOption,
  BudgetOptionCreate,
  BudgetOptionUpdate
} from '@/types/budget.types';

/**
 * Hook para gestão de categorias de budget
 */
export function useBudgetCategories(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const categoriesQuery = useQuery({
    queryKey: queryKeys.budget.categories(userId || ''),
    queryFn: () => budgetApi.fetchCategories(userId!),
    enabled: !!userId,
  });

  const addCategoryMutation = useMutation({
    mutationFn: (category: BudgetCategoryCreate) => budgetApi.createCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budget.categories(userId || '') });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.budget.categories(userId || '') });
    },
    onError: (error) => {
      console.error('Erro ao atualizar categoria:', error);
      toast({ title: 'Erro', description: 'Não foi possível atualizar a categoria.', variant: 'destructive' });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: string) => budgetApi.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budget.categories(userId || '') });
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
 */
export function useBudgetExpenses(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const expensesQuery = useQuery({
    queryKey: queryKeys.budget.expenses(userId || ''),
    queryFn: () => budgetApi.fetchExpenses(userId!),
    enabled: !!userId,
  });

  const addExpenseMutation = useMutation({
    mutationFn: (expense: BudgetExpenseCreate) => budgetApi.createExpense(expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budget.expenses(userId || '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.budget.categories(userId || '') });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.budget.expenses(userId || '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.budget.categories(userId || '') });
    },
    onError: (error) => {
      console.error('Erro ao atualizar despesa:', error);
      toast({ title: 'Erro', description: 'Não foi possível atualizar a despesa.', variant: 'destructive' });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (expenseId: string) => budgetApi.deleteExpense(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budget.expenses(userId || '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.budget.categories(userId || '') });
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
 */
export function useBudgetOptions(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const optionsQuery = useQuery({
    queryKey: queryKeys.budget.options(userId || ''),
    queryFn: () => budgetApi.fetchOptions(userId!),
    enabled: !!userId,
  });

  const addOptionMutation = useMutation({
    mutationFn: (option: BudgetOptionCreate) => budgetApi.createOption(option),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budget.options(userId || '') });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.budget.options(userId || '') });
    },
    onError: (error) => {
      console.error('Erro ao atualizar opção:', error);
      toast({ title: 'Erro', description: 'Não foi possível atualizar a opção.', variant: 'destructive' });
    },
  });

  const deleteOptionMutation = useMutation({
    mutationFn: (optionId: string) => budgetApi.deleteOption(optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budget.options(userId || '') });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.budget.options(userId || '') });
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

/**
 * Hook agregado para estatísticas de budget
 */
export function useBudgetStats(userId: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.budget.categories(userId || ''), 'stats'],
    queryFn: () => budgetApi.fetchStats(userId!),
    enabled: !!userId,
  });
}

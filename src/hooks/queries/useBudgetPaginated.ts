import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { weddingApi } from '@/api/wedding.api';
import { budgetApi } from '@/api/budget.api';
import { useToast } from '@/hooks/use-toast';
import type { BudgetPaginationParams, PaginatedResponse } from '@/types/wedding.types';
import type { BudgetExpense, BudgetExpenseCreate, BudgetExpenseUpdate, BudgetCategoryCreate, BudgetCategoryUpdate } from '@/types/budget.types';

/**
 * Hook para buscar expenses paginados via RPC
 */
export function useBudgetExpensesPaginated(params: Omit<BudgetPaginationParams, 'weddingId'> & { weddingId: string | null }) {
  const { weddingId, ...filterParams } = params;

  return useQuery({
    queryKey: ['budget-expenses-paginated', weddingId, filterParams],
    queryFn: () => weddingApi.getBudgetPaginated({ weddingId: weddingId!, ...filterParams }),
    enabled: !!weddingId,
    placeholderData: (prev) => prev,
  });
}

/**
 * Hook para infinite scroll de expenses
 */
export function useBudgetExpensesInfinite(params: Omit<BudgetPaginationParams, 'weddingId' | 'page'> & { weddingId: string | null }) {
  const { weddingId, ...filterParams } = params;

  return useInfiniteQuery({
    queryKey: ['budget-expenses-infinite', weddingId, filterParams],
    queryFn: ({ pageParam = 1 }) => 
      weddingApi.getBudgetPaginated({ weddingId: weddingId!, page: pageParam, ...filterParams }),
    enabled: !!weddingId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.pagination;
      return page < total_pages ? page + 1 : undefined;
    },
  });
}

/**
 * Hook para mutations de budget com wedding_id
 */
export function useBudgetMutations(weddingId: string | null, userId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['budget-expenses-paginated', weddingId] });
    queryClient.invalidateQueries({ queryKey: ['budget-expenses-infinite', weddingId] });
    queryClient.invalidateQueries({ queryKey: ['budget-categories', weddingId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', weddingId] });
  };

  // Category mutations
  const addCategory = useMutation({
    mutationFn: (category: Omit<BudgetCategoryCreate, 'wedding_id' | 'user_id'>) => 
      budgetApi.createCategory({ ...category, wedding_id: weddingId!, user_id: userId! }),
    onSuccess: () => {
      invalidateQueries();
      toast({
        title: 'Categoria criada',
        description: 'A categoria foi criada com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a categoria.',
        variant: 'destructive',
      });
    },
  });

  const updateCategory = useMutation({
    mutationFn: (update: BudgetCategoryUpdate) => budgetApi.updateCategory(update),
    onSuccess: () => {
      invalidateQueries();
    },
    onError: (error) => {
      console.error('Erro ao atualizar categoria:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a categoria.',
        variant: 'destructive',
      });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (categoryId: string) => budgetApi.deleteCategory(categoryId),
    onSuccess: () => {
      invalidateQueries();
      toast({
        title: 'Categoria removida',
        description: 'A categoria foi removida com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao remover categoria:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a categoria.',
        variant: 'destructive',
      });
    },
  });

  // Expense mutations
  const addExpense = useMutation({
    mutationFn: (expense: Omit<BudgetExpenseCreate, 'wedding_id' | 'user_id'>) => 
      budgetApi.createExpense({ ...expense, wedding_id: weddingId!, user_id: userId! }),
    onSuccess: () => {
      invalidateQueries();
      toast({
        title: 'Despesa adicionada',
        description: 'A despesa foi adicionada com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao adicionar despesa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a despesa.',
        variant: 'destructive',
      });
    },
  });

  const updateExpense = useMutation({
    mutationFn: (update: BudgetExpenseUpdate) => budgetApi.updateExpense(update),
    onSuccess: () => {
      invalidateQueries();
    },
    onError: (error) => {
      console.error('Erro ao atualizar despesa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a despesa.',
        variant: 'destructive',
      });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: (expenseId: string) => budgetApi.deleteExpense(expenseId),
    onSuccess: () => {
      invalidateQueries();
      toast({
        title: 'Despesa removida',
        description: 'A despesa foi removida com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao remover despesa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a despesa.',
        variant: 'destructive',
      });
    },
  });

  return {
    addCategory,
    updateCategory,
    deleteCategory,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}

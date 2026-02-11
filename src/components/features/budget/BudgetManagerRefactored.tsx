import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useWeddingId } from '@/hooks/useWeddingId';
import { useBudgetCategories, useBudgetExpenses, useBudgetOptions } from '@/hooks/queries/useBudget';
import { BudgetCharts } from '@/components/BudgetCharts';
import { LoadingState } from '@/components/shared';
import { BudgetOverview } from './BudgetOverview';
import { BudgetCategoryList } from './BudgetCategoryList';
import { BudgetExpenseList } from './BudgetExpenseList';
import { BudgetOptionList } from './BudgetOptionList';

export const BudgetManagerRefactored = () => {
  const { user } = useAuth();
  const { weddingId } = useWeddingId();

  const { categories, isLoading: loadingCats, addCategory, updateCategory, deleteCategory } = useBudgetCategories(weddingId);
  const { expenses, isLoading: loadingExp, addExpense, deleteExpense } = useBudgetExpenses(weddingId);
  const { options, isLoading: loadingOpt, addOption, toggleFavorite, updateOption } = useBudgetOptions(weddingId);

  const isLoading = loadingCats || loadingExp || loadingOpt;
  const totalBudget = categories.reduce((sum, c) => sum + c.budgeted_amount, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent_amount, 0);

  if (isLoading) {
    return <LoadingState text="A carregar orçamento..." />;
  }

  return (
    <div className="space-y-6">
      <BudgetCharts categories={categories as any[]} totalBudget={totalBudget} totalSpent={totalSpent} />

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="options">Opções</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <BudgetOverview categories={categories} expenses={expenses} options={options} />
        </TabsContent>

        <TabsContent value="categories">
          <BudgetCategoryList
            categories={categories}
            weddingId={weddingId || ''}
            userId={user?.id || ''}
            onAdd={(cat) => addCategory.mutate(cat)}
            onUpdate={(cat) => updateCategory.mutate(cat)}
            onDelete={(id) => deleteCategory.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="expenses">
          <BudgetExpenseList
            expenses={expenses}
            categories={categories}
            weddingId={weddingId || ''}
            userId={user?.id || ''}
            onAdd={(exp) => addExpense.mutate(exp)}
            onDelete={(id) => deleteExpense.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="options">
          <BudgetOptionList
            options={options}
            categories={categories}
            userId={user?.id || ''}
            onAdd={(opt) => addOption.mutate(opt)}
            onToggleFavorite={(params) => toggleFavorite.mutate(params)}
            onUpdateStatus={(update) => updateOption.mutate(update as any)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetManagerRefactored;

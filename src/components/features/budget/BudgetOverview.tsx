import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/i18n';
import { useSettings } from '@/contexts/SettingsContext';
import type { BudgetCategory, BudgetExpense, BudgetOption } from '@/types/budget.types';

interface BudgetOverviewProps {
  categories: BudgetCategory[];
  expenses: BudgetExpense[];
  options: BudgetOption[];
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'alta': return 'bg-red-100 text-red-800';
    case 'media': return 'bg-yellow-100 text-yellow-800';
    case 'baixa': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const BudgetOverview = ({ categories, expenses, options }: BudgetOverviewProps) => {
  const { currency } = useSettings();

  return (
    <div className="grid gap-4">
      {categories.map((category) => {
        const progress = category.budgeted_amount > 0 ? (category.spent_amount / category.budgeted_amount) * 100 : 0;
        const isOverBudget = progress > 100;
        const categoryExpenses = expenses.filter(e => e.category_id === category.id);
        const categoryOptions = options.filter(o => o.category_id === category.id);

        return (
          <Card key={category.id} className="overflow-hidden">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg truncate">{category.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">
                    {formatCurrency(category.spent_amount, currency)} / {formatCurrency(category.budgeted_amount, currency)}
                  </p>
                  {category.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                  <Badge className={`${getPriorityColor(category.priority || 'media')} text-xs`}>
                    {category.priority === 'alta' ? 'Alta' : category.priority === 'media' ? 'Média' : 'Baixa'}
                  </Badge>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {categoryExpenses.length} gastos • {categoryOptions.length} opções
                  </div>
                </div>
              </div>
              <Progress 
                value={Math.min(progress, 100)} 
                className={`h-2 ${isOverBudget ? 'bg-red-100' : ''}`}
              />
              {isOverBudget && (
                <p className="text-xs text-red-600 mt-1 break-words">
                  Acima do orçamento em {formatCurrency(category.spent_amount - category.budgeted_amount, currency)}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

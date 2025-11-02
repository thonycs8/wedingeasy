import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/i18n';
import { useSettings } from '@/contexts/SettingsContext';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface BudgetCategory {
  id: string;
  name: string;
  budgeted_amount: number;
  spent_amount: number;
  priority: 'alta' | 'media' | 'baixa';
  color: string;
}

interface BudgetChartsProps {
  categories: BudgetCategory[];
  totalBudget: number;
  totalSpent: number;
}

const COLORS = ['#ef4444', '#f97316', '#8b5cf6', '#10b981', '#06b6d4', '#6366f1', '#84cc16', '#f59e0b', '#ec4899', '#64748b'];

export const BudgetCharts = ({ categories, totalBudget, totalSpent }: BudgetChartsProps) => {
  const { currency } = useSettings();

  // Prepare data for pie chart
  const pieData = categories
    .filter(cat => cat.spent_amount > 0)
    .map((cat, index) => ({
      name: cat.name,
      value: cat.spent_amount,
      color: cat.color || COLORS[index % COLORS.length]
    }));

  // Prepare data for bar chart (top 5 categories by spending)
  const barData = [...categories]
    .sort((a, b) => b.spent_amount - a.spent_amount)
    .slice(0, 5)
    .map(cat => ({
      name: cat.name.length > 15 ? cat.name.substring(0, 15) + '...' : cat.name,
      orçado: cat.budgeted_amount,
      gasto: cat.spent_amount,
      restante: cat.budgeted_amount - cat.spent_amount
    }));

  const remainingBudget = totalBudget - totalSpent;
  const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Budget Overview Card */}
      <Card className="card-romantic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5 text-primary" />
            Visão Geral do Orçamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 rounded-lg bg-primary/10">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">Orçamento Total</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-primary truncate">{formatCurrency(totalBudget, currency)}</p>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg bg-destructive/10">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">Total Gasto</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-destructive truncate">{formatCurrency(totalSpent, currency)}</p>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg bg-success/10">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">Restante</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-success truncate">{formatCurrency(remainingBudget, currency)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-sm font-medium truncate">Progresso do Orçamento</span>
              <span className="text-xs sm:text-sm font-semibold shrink-0">{budgetProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  budgetProgress > 90 ? 'bg-destructive' : 
                  budgetProgress > 75 ? 'bg-warning' : 
                  'bg-success'
                }`}
                style={{ width: `${Math.min(budgetProgress, 100)}%` }}
              />
            </div>
          </div>

          {budgetProgress > 100 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <TrendingDown className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-medium break-words">Orçamento ultrapassado em {formatCurrency(totalSpent - totalBudget, currency)}</p>
            </div>
          )}

          {budgetProgress < 50 && totalSpent > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success">
              <TrendingUp className="w-4 h-4 shrink-0" />
              <p className="text-xs sm:text-sm font-medium">Ótimo! Dentro do orçamento</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pie Chart - Distribution of Spending */}
      <Card className="card-romantic">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg truncate">Distribuição de Gastos</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => {
                    const shortName = name.length > 10 ? name.substring(0, 10) + '...' : name;
                    return `${shortName}: ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value, currency)}
                  contentStyle={{ maxWidth: '200px', wordWrap: 'break-word' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground px-4">
              <p className="text-center text-sm">Nenhum gasto registado ainda</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bar Chart - Top Categories */}
      <Card className="card-romantic lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg truncate">Top 5 Categorias - Orçado vs Gasto</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300} className="min-w-[300px]">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value, currency)}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value, currency)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    maxWidth: '200px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="orçado" fill="#3b82f6" name="Orçado" />
                <Bar dataKey="gasto" fill="#ef4444" name="Gasto" />
                <Bar dataKey="restante" fill="#10b981" name="Restante" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground px-4">
              <p className="text-center text-sm">Adicione categorias e gastos para ver o gráfico</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

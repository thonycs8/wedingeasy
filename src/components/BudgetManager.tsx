import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DollarSign, 
  Plus,
  TrendingUp,
  Edit,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { formatCurrency } from "@/i18n";
import { useSettings } from "@/contexts/SettingsContext";
import { useWeddingData } from "@/contexts/WeddingContext";

interface BudgetItem {
  id: string;
  category: string;
  budgeted: number;
  spent: number;
  priority: 'alta' | 'media' | 'baixa';
  notes?: string;
}

export const BudgetManager = () => {
  const { t } = useTranslation();
  const { currency } = useSettings();
  const { weddingData } = useWeddingData();
  
  const estimatedBudget = weddingData?.wedding.estimatedBudget || 34000;

  const [budget, setBudget] = useState<BudgetItem[]>([
    { id: '1', category: t('budget.venue'), budgeted: Math.round(estimatedBudget * 0.35), spent: Math.round(estimatedBudget * 0.30), priority: 'alta' },
    { id: '2', category: t('budget.dress'), budgeted: Math.round(estimatedBudget * 0.15), spent: Math.round(estimatedBudget * 0.12), priority: 'alta' },
    { id: '3', category: t('budget.catering'), budgeted: Math.round(estimatedBudget * 0.25), spent: 0, priority: 'alta' },
    { id: '4', category: t('budget.flowers'), budgeted: Math.round(estimatedBudget * 0.10), spent: Math.round(estimatedBudget * 0.05), priority: 'media' },
    { id: '5', category: t('budget.photography'), budgeted: Math.round(estimatedBudget * 0.10), spent: Math.round(estimatedBudget * 0.10), priority: 'alta' },
    { id: '6', category: t('budget.music'), budgeted: Math.round(estimatedBudget * 0.05), spent: 0, priority: 'media' },
  ]);

  const [newExpense, setNewExpense] = useState({ category: '', amount: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const totalBudget = budget.reduce((sum, item) => sum + item.budgeted, 0);
  const totalSpent = budget.reduce((sum, item) => sum + item.spent, 0);
  const budgetProgress = (totalSpent / totalBudget) * 100;
  const remainingBudget = totalBudget - totalSpent;

  const updateExpense = (id: string, spent: number) => {
    setBudget(prev => prev.map(item => 
      item.id === id ? { ...item, spent } : item
    ));
  };

  const addExpense = () => {
    if (!newExpense.category || !newExpense.amount) return;
    
    const existingItem = budget.find(item => 
      item.category.toLowerCase() === newExpense.category.toLowerCase()
    );
    
    if (existingItem) {
      updateExpense(existingItem.id, existingItem.spent + parseFloat(newExpense.amount));
    } else {
      const newItem: BudgetItem = {
        id: Date.now().toString(),
        category: newExpense.category,
        budgeted: parseFloat(newExpense.amount) * 1.2, // Auto-suggest 20% buffer
        spent: parseFloat(newExpense.amount),
        priority: 'media',
        notes: newExpense.description
      };
      setBudget(prev => [...prev, newItem]);
    }
    
    setNewExpense({ category: '', amount: '', description: '' });
    setShowAddForm(false);
  };

  return (
    <Card className="card-romantic">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-accent" />
          {t('budget.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">{t('budget.total')}</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalBudget, currency)}</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">{t('budget.spent')}</p>
            <p className="text-2xl font-bold text-accent">{formatCurrency(totalSpent, currency)}</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">{t('budget.remaining')}</p>
            <p className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-destructive' : 'text-success'}`}>
              {formatCurrency(remainingBudget, currency)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('budget.progress')}</span>
            <span>{Math.round(budgetProgress)}%</span>
          </div>
          <Progress value={budgetProgress} className="h-3" />
          {budgetProgress > 90 && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{t('budget.warningOverBudget')}</span>
            </div>
          )}
        </div>

        {/* Budget Items */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {budget.map((item) => {
            const progress = (item.spent / item.budgeted) * 100;
            const isOverBudget = progress > 100;
            
            return (
              <div key={item.id} className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.category}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.spent, currency)} / {formatCurrency(item.budgeted, currency)}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={item.priority === 'alta' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {t(`budget.priority.${item.priority === 'alta' ? 'high' : item.priority === 'media' ? 'medium' : 'low'}`)}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => {}}>
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <Progress 
                  value={Math.min(progress, 100)} 
                  className={`h-2 ${isOverBudget ? 'bg-destructive/20' : ''}`}
                />
                {isOverBudget && (
                  <p className="text-xs text-destructive">
                    {t('budget.overBy')} {formatCurrency(item.spent - item.budgeted, currency)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Expense Form */}
        {showAddForm && (
          <div className="p-4 rounded-lg border border-border space-y-4">
            <h4 className="font-medium">{t('budget.addExpense')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">{t('budget.category')}</Label>
                <Input
                  id="category"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                  placeholder={t('budget.categoryPlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="amount">{t('budget.amount')}</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">{t('budget.description')}</Label>
              <Input
                id="description"
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('budget.descriptionPlaceholder')}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addExpense} className="btn-gradient">
                {t('budget.save')}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}

        {/* Add Button */}
        {!showAddForm && (
          <Button 
            className="btn-gradient w-full" 
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('budget.addExpense')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
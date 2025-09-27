import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  PieChart,
  Star,
  Phone,
  Mail,
  Globe,
  MapPin,
  Eye,
  Heart,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/i18n';
import { useSettings } from '@/contexts/SettingsContext';

interface BudgetCategory {
  id: string;
  name: string;
  budgeted_amount: number;
  spent_amount: number;
  priority: 'alta' | 'media' | 'baixa';
  description?: string;
  icon: string;
  color: string;
}

interface BudgetExpense {
  id: string;
  category_id: string;
  name: string;
  amount: number;
  date: string;
  description?: string;
  vendor?: string;
  status: 'pago' | 'pendente' | 'cancelado';
}

interface BudgetOption {
  id: string;
  category_id: string;
  name: string;
  price_min?: number;
  price_max?: number;
  vendor?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  rating?: number;
  is_favorite: boolean;
  status: 'considerando' | 'contactado' | 'cotacao' | 'contratado' | 'rejeitado';
}

export const BudgetManager = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { currency } = useSettings();

  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = useState<BudgetExpense[]>([]);
  const [options, setOptions] = useState<BudgetOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  const [newCategory, setNewCategory] = useState({
    name: '',
    budgeted_amount: 0,
    priority: 'media' as const,
    description: '',
    icon: 'DollarSign',
    color: '#3b82f6'
  });

  const [newExpense, setNewExpense] = useState({
    category_id: '',
    name: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    vendor: '',
    status: 'pago' as const
  });

  const [newOption, setNewOption] = useState({
    category_id: '',
    name: '',
    price_min: 0,
    price_max: 0,
    vendor: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    rating: 0,
    status: 'considerando' as const
  });

  useEffect(() => {
    if (user) {
      loadData();
      createDefaultCategories();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [categoriesRes, expensesRes, optionsRes] = await Promise.all([
        supabase.from('budget_categories').select('*').eq('user_id', user?.id).order('name'),
        supabase.from('budget_expenses').select('*').eq('user_id', user?.id).order('date', { ascending: false }),
        supabase.from('budget_options').select('*').eq('user_id', user?.id).order('name')
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (expensesRes.error) throw expensesRes.error;
      if (optionsRes.error) throw optionsRes.error;

      setCategories((categoriesRes.data || []).map(cat => ({
        ...cat,
        priority: cat.priority as BudgetCategory['priority']
      })));
      setExpenses((expensesRes.data || []).map(exp => ({
        ...exp,
        status: exp.status as BudgetExpense['status']
      })));
      setOptions((optionsRes.data || []).map(opt => ({
        ...opt,
        status: opt.status as BudgetOption['status']
      })));
    } catch (error) {
      console.error('Error loading budget data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do orçamento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCategories = async () => {
    try {
      const { data: existingCategories } = await supabase
        .from('budget_categories')
        .select('id')
        .eq('user_id', user?.id)
        .limit(1);

      if (existingCategories && existingCategories.length > 0) return;

      const defaultCategories = [
        { name: 'Local da Cerimónia', budgeted_amount: 8000, priority: 'alta', icon: 'MapPin', color: '#ef4444' },
        { name: 'Vestido e Fato', budgeted_amount: 3000, priority: 'alta', icon: 'Heart', color: '#ec4899' },
        { name: 'Catering', budgeted_amount: 6000, priority: 'alta', icon: 'UtensilsCrossed', color: '#f97316' },
        { name: 'Fotografia', budgeted_amount: 2500, priority: 'alta', icon: 'Camera', color: '#8b5cf6' },
        { name: 'Flores e Decoração', budgeted_amount: 2000, priority: 'media', icon: 'Flower', color: '#10b981' },
        { name: 'Música e Som', budgeted_amount: 1500, priority: 'media', icon: 'Music', color: '#06b6d4' },
        { name: 'Transporte', budgeted_amount: 800, priority: 'baixa', icon: 'Car', color: '#6366f1' },
        { name: 'Convites', budgeted_amount: 500, priority: 'baixa', icon: 'Mail', color: '#84cc16' },
        { name: 'Lembranças', budgeted_amount: 400, priority: 'baixa', icon: 'Gift', color: '#f59e0b' },
        { name: 'Extras', budgeted_amount: 1000, priority: 'baixa', icon: 'Plus', color: '#64748b' }
      ].map(cat => ({ ...cat, user_id: user?.id }));

      const { error } = await supabase
        .from('budget_categories')
        .insert(defaultCategories);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error creating default categories:', error);
    }
  };

  const addCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .insert([{ ...newCategory, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, { ...data, priority: data.priority as BudgetCategory['priority'] }]);
      setNewCategory({
        name: '',
        budgeted_amount: 0,
        priority: 'media',
        description: '',
        icon: 'DollarSign',
        color: '#3b82f6'
      });
      setIsAddingCategory(false);

      toast({
        title: "Sucesso",
        description: "Categoria adicionada com sucesso!",
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a categoria.",
        variant: "destructive"
      });
    }
  };

  const updateCategory = async (category: BudgetCategory) => {
    try {
      const { error } = await supabase
        .from('budget_categories')
        .update(category)
        .eq('id', category.id);

      if (error) throw error;

      setCategories(categories.map(c => c.id === category.id ? category : c));
      setEditingCategory(null);

      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a categoria.",
        variant: "destructive"
      });
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Tem certeza que deseja remover esta categoria? Todos os gastos e opções associados serão também removidos.')) return;

    try {
      const { error } = await supabase
        .from('budget_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(categories.filter(c => c.id !== categoryId));
      setExpenses(expenses.filter(e => e.category_id !== categoryId));
      setOptions(options.filter(o => o.category_id !== categoryId));

      toast({
        title: "Sucesso",
        description: "Categoria removida com sucesso!",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a categoria.",
        variant: "destructive"
      });
    }
  };

  const addExpense = async () => {
    if (!newExpense.name.trim() || !newExpense.category_id || newExpense.amount <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('budget_expenses')
        .insert([{ ...newExpense, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;

      setExpenses([{ ...data, status: data.status as BudgetExpense['status'] }, ...expenses]);
      setNewExpense({
        category_id: '',
        name: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        vendor: '',
        status: 'pago'
      });
      setIsAddingExpense(false);

      // Reload categories to update spent amounts
      loadData();

      toast({
        title: "Sucesso",
        description: "Gasto adicionado com sucesso!",
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o gasto.",
        variant: "destructive"
      });
    }
  };

  const deleteExpense = async (expenseId: string) => {
    if (!confirm('Tem certeza que deseja remover este gasto?')) return;

    try {
      const { error } = await supabase
        .from('budget_expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      setExpenses(expenses.filter(e => e.id !== expenseId));
      loadData(); // Reload to update spent amounts

      toast({
        title: "Sucesso",
        description: "Gasto removido com sucesso!",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o gasto.",
        variant: "destructive"
      });
    }
  };

  const addOption = async () => {
    if (!newOption.name.trim() || !newOption.category_id) {
      toast({
        title: "Erro",
        description: "Nome e categoria são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('budget_options')
        .insert([{ ...newOption, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;

      setOptions([...options, { ...data, status: data.status as BudgetOption['status'] }]);
      setNewOption({
        category_id: '',
        name: '',
        price_min: 0,
        price_max: 0,
        vendor: '',
        website: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        rating: 0,
        status: 'considerando'
      });
      setIsAddingOption(false);

      toast({
        title: "Sucesso",
        description: "Opção adicionada com sucesso!",
      });
    } catch (error) {
      console.error('Error adding option:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a opção.",
        variant: "destructive"
      });
    }
  };

  const toggleFavoriteOption = async (optionId: string) => {
    const option = options.find(o => o.id === optionId);
    if (!option) return;

    try {
      const { error } = await supabase
        .from('budget_options')
        .update({ is_favorite: !option.is_favorite })
        .eq('id', optionId);

      if (error) throw error;

      setOptions(options.map(o => 
        o.id === optionId ? { ...o, is_favorite: !o.is_favorite } : o
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const updateOptionStatus = async (optionId: string, status: BudgetOption['status']) => {
    try {
      const { error } = await supabase
        .from('budget_options')
        .update({ status })
        .eq('id', optionId);

      if (error) throw error;

      setOptions(options.map(o => 
        o.id === optionId ? { ...o, status } : o
      ));
    } catch (error) {
      console.error('Error updating option status:', error);
    }
  };

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budgeted_amount, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent_amount, 0);
  const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const remainingBudget = totalBudget - totalSpent;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'contratado': return 'bg-green-100 text-green-800';
      case 'cotacao': return 'bg-blue-100 text-blue-800';
      case 'contactado': return 'bg-yellow-100 text-yellow-800';
      case 'considerando': return 'bg-gray-100 text-gray-800';
      case 'rejeitado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">A carregar orçamento...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalBudget, currency)}</div>
            <div className="text-sm text-muted-foreground">Orçamento Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent, currency)}</div>
            <div className="text-sm text-muted-foreground">Total Gasto</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(remainingBudget, currency)}
            </div>
            <div className="text-sm text-muted-foreground">Disponível</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round(budgetProgress)}%</div>
            <div className="text-sm text-muted-foreground">Progresso</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do Orçamento</span>
              <span>{Math.round(budgetProgress)}%</span>
            </div>
            <Progress value={Math.min(budgetProgress, 100)} className="h-3" />
            {budgetProgress > 90 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Atenção! Você já gastou mais de 90% do orçamento planeado.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="options">Opções</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {categories.map((category) => {
              const progress = category.budgeted_amount > 0 ? (category.spent_amount / category.budgeted_amount) * 100 : 0;
              const isOverBudget = progress > 100;
              const categoryExpenses = expenses.filter(e => e.category_id === category.id);
              const categoryOptions = options.filter(o => o.category_id === category.id);

              return (
                <Card key={category.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(category.spent_amount, currency)} / {formatCurrency(category.budgeted_amount, currency)}
                        </p>
                        {category.description && (
                          <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(category.priority)}>
                          {category.priority === 'alta' ? 'Alta' : category.priority === 'media' ? 'Média' : 'Baixa'}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {categoryExpenses.length} gastos • {categoryOptions.length} opções
                        </div>
                      </div>
                    </div>
                    <Progress 
                      value={Math.min(progress, 100)} 
                      className={`h-2 ${isOverBudget ? 'bg-red-100' : ''}`}
                    />
                    {isOverBudget && (
                      <p className="text-xs text-red-600 mt-1">
                        Acima do orçamento em {formatCurrency(category.spent_amount - category.budgeted_amount, currency)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Categorias de Orçamento</h3>
            <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Categoria</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="Nome da categoria"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Valor Orçamentado *</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newCategory.budgeted_amount}
                        onChange={(e) => setNewCategory({ ...newCategory, budgeted_amount: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select value={newCategory.priority} onValueChange={(value: any) => setNewCategory({ ...newCategory, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      placeholder="Descrição opcional"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={addCategory}>
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{category.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Orçamentado: {formatCurrency(category.budgeted_amount, currency)} | 
                        Gasto: {formatCurrency(category.spent_amount, currency)}
                      </p>
                      {category.description && (
                        <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(category.priority)}>
                        {category.priority === 'alta' ? 'Alta' : category.priority === 'media' ? 'Média' : 'Baixa'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gastos</h3>
            <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Gasto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Gasto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="expense-category">Categoria *</Label>
                    <Select value={newExpense.category_id} onValueChange={(value) => setNewExpense({ ...newExpense, category_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expense-name">Nome *</Label>
                      <Input
                        id="expense-name"
                        value={newExpense.name}
                        onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                        placeholder="Nome do gasto"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expense-amount">Valor *</Label>
                      <Input
                        id="expense-amount"
                        type="number"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expense-date">Data</Label>
                      <Input
                        id="expense-date"
                        type="date"
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expense-status">Status</Label>
                      <Select value={newExpense.status} onValueChange={(value: any) => setNewExpense({ ...newExpense, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pago">Pago</SelectItem>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="expense-vendor">Fornecedor</Label>
                    <Input
                      id="expense-vendor"
                      value={newExpense.vendor}
                      onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                      placeholder="Nome do fornecedor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expense-description">Descrição</Label>
                    <Textarea
                      id="expense-description"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      placeholder="Descrição do gasto"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddingExpense(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={addExpense}>
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {expenses.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum gasto registado</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece a registar os seus gastos para acompanhar o orçamento.
                  </p>
                </CardContent>
              </Card>
            ) : (
              expenses.map((expense) => {
                const category = categories.find(c => c.id === expense.category_id);
                return (
                  <Card key={expense.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{expense.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {category?.name} • {formatCurrency(expense.amount, currency)} • {new Date(expense.date).toLocaleDateString()}
                          </p>
                          {expense.vendor && (
                            <p className="text-xs text-muted-foreground">Fornecedor: {expense.vendor}</p>
                          )}
                          {expense.description && (
                            <p className="text-xs text-muted-foreground mt-1">{expense.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={expense.status === 'pago' ? 'default' : expense.status === 'pendente' ? 'secondary' : 'destructive'}>
                            {expense.status === 'pago' ? 'Pago' : expense.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="options" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Opções e Fornecedores</h3>
            <Dialog open={isAddingOption} onOpenChange={setIsAddingOption}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Opção
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Opção</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="option-category">Categoria *</Label>
                    <Select value={newOption.category_id} onValueChange={(value) => setNewOption({ ...newOption, category_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="option-name">Nome *</Label>
                      <Input
                        id="option-name"
                        value={newOption.name}
                        onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                        placeholder="Nome da opção"
                      />
                    </div>
                    <div>
                      <Label htmlFor="option-vendor">Fornecedor</Label>
                      <Input
                        id="option-vendor"
                        value={newOption.vendor}
                        onChange={(e) => setNewOption({ ...newOption, vendor: e.target.value })}
                        placeholder="Nome do fornecedor"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="option-price-min">Preço Mínimo</Label>
                      <Input
                        id="option-price-min"
                        type="number"
                        value={newOption.price_min}
                        onChange={(e) => setNewOption({ ...newOption, price_min: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="option-price-max">Preço Máximo</Label>
                      <Input
                        id="option-price-max"
                        type="number"
                        value={newOption.price_max}
                        onChange={(e) => setNewOption({ ...newOption, price_max: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="option-phone">Telefone</Label>
                      <Input
                        id="option-phone"
                        value={newOption.phone}
                        onChange={(e) => setNewOption({ ...newOption, phone: e.target.value })}
                        placeholder="+351 123 456 789"
                      />
                    </div>
                    <div>
                      <Label htmlFor="option-email">Email</Label>
                      <Input
                        id="option-email"
                        type="email"
                        value={newOption.email}
                        onChange={(e) => setNewOption({ ...newOption, email: e.target.value })}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="option-website">Website</Label>
                    <Input
                      id="option-website"
                      value={newOption.website}
                      onChange={(e) => setNewOption({ ...newOption, website: e.target.value })}
                      placeholder="https://exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="option-address">Morada</Label>
                    <Input
                      id="option-address"
                      value={newOption.address}
                      onChange={(e) => setNewOption({ ...newOption, address: e.target.value })}
                      placeholder="Morada completa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="option-notes">Notas</Label>
                    <Textarea
                      id="option-notes"
                      value={newOption.notes}
                      onChange={(e) => setNewOption({ ...newOption, notes: e.target.value })}
                      placeholder="Notas e observações"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddingOption(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={addOption}>
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {options.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma opção registada</h3>
                  <p className="text-muted-foreground mb-4">
                    Adicione opções e fornecedores para comparar preços e tomar decisões.
                  </p>
                </CardContent>
              </Card>
            ) : (
              options.map((option) => {
                const category = categories.find(c => c.id === option.category_id);
                return (
                  <Card key={option.id} className={option.is_favorite ? 'ring-2 ring-yellow-400' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{option.name}</h4>
                            {option.is_favorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {category?.name}
                            {option.vendor && ` • ${option.vendor}`}
                          </p>
                          {(option.price_min || option.price_max) && (
                            <p className="text-sm font-medium">
                              {option.price_min && option.price_max ? 
                                `${formatCurrency(option.price_min, currency)} - ${formatCurrency(option.price_max, currency)}` :
                                option.price_min ? `A partir de ${formatCurrency(option.price_min, currency)}` :
                                `Até ${formatCurrency(option.price_max!, currency)}`
                              }
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {option.phone && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {option.phone}
                              </div>
                            )}
                            {option.email && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                {option.email}
                              </div>
                            )}
                            {option.website && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Globe className="w-3 h-3" />
                                Website
                              </div>
                            )}
                            {option.address && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {option.address}
                              </div>
                            )}
                          </div>
                          {option.notes && (
                            <p className="text-xs text-muted-foreground mt-2">{option.notes}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Badge className={getStatusColor(option.status)}>
                            {option.status === 'considerando' ? 'Considerando' :
                             option.status === 'contactado' ? 'Contactado' :
                             option.status === 'cotacao' ? 'Cotação' :
                             option.status === 'contratado' ? 'Contratado' : 'Rejeitado'}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavoriteOption(option.id)}
                              className={option.is_favorite ? 'text-yellow-500' : ''}
                            >
                              <Heart className={`w-4 h-4 ${option.is_favorite ? 'fill-current' : ''}`} />
                            </Button>
                            <Select value={option.status} onValueChange={(value: any) => updateOptionStatus(option.id, value)}>
                              <SelectTrigger className="w-8 h-8 p-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="considerando">Considerando</SelectItem>
                                <SelectItem value="contactado">Contactado</SelectItem>
                                <SelectItem value="cotacao">Cotação</SelectItem>
                                <SelectItem value="contratado">Contratado</SelectItem>
                                <SelectItem value="rejeitado">Rejeitado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-amount">Valor Orçamentado *</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    value={editingCategory.budgeted_amount}
                    onChange={(e) => setEditingCategory({ ...editingCategory, budgeted_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-priority">Prioridade</Label>
                  <Select value={editingCategory.priority} onValueChange={(value: any) => setEditingCategory({ ...editingCategory, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingCategory(null)}>
                  Cancelar
                </Button>
                <Button onClick={() => updateCategory(editingCategory)}>
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
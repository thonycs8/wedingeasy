import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/i18n';
import { useSettings } from '@/contexts/SettingsContext';
import type { BudgetCategory, BudgetExpense, BudgetExpenseCreate } from '@/types/budget.types';

interface BudgetExpenseListProps {
  expenses: BudgetExpense[];
  categories: BudgetCategory[];
  weddingId: string;
  userId: string;
  onAdd: (expense: BudgetExpenseCreate) => void;
  onDelete: (expenseId: string) => void;
}

export const BudgetExpenseList = ({ expenses, categories, weddingId, userId, onAdd, onDelete }: BudgetExpenseListProps) => {
  const { currency } = useSettings();
  const [isAdding, setIsAdding] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category_id: '',
    name: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    vendor: '',
    status: 'pago' as const
  });

  const handleAdd = () => {
    if (!newExpense.name.trim() || !newExpense.category_id || newExpense.amount <= 0) return;
    onAdd({
      ...newExpense,
      user_id: userId,
      wedding_id: weddingId,
      description: newExpense.description || null,
      vendor: newExpense.vendor || null,
    });
    setNewExpense({ category_id: '', name: '', amount: 0, date: new Date().toISOString().split('T')[0], description: '', vendor: '', status: 'pago' });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Tem certeza que deseja remover este gasto?')) return;
    onDelete(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gastos</h3>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Novo Gasto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar Gasto</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Categoria *</Label>
                <Select value={newExpense.category_id} onValueChange={(v) => setNewExpense({ ...newExpense, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome *</Label>
                  <Input value={newExpense.name} onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })} placeholder="Nome do gasto" />
                </div>
                <div>
                  <Label>Valor *</Label>
                  <Input type="number" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data</Label>
                  <Input type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={newExpense.status} onValueChange={(v: any) => setNewExpense({ ...newExpense, status: v })}>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-background z-[100]">
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Fornecedor</Label>
                <Input value={newExpense.vendor} onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })} placeholder="Nome do fornecedor" />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} placeholder="Descrição do gasto" rows={3} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAdding(false)}>Cancelar</Button>
                <Button onClick={handleAdd}>Adicionar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {expenses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum gasto registado</h3>
            <p className="text-muted-foreground mb-4">Comece a registar os seus gastos para acompanhar o orçamento.</p>
          </CardContent>
        </Card>
      ) : (
        expenses.map((expense) => {
          const category = categories.find(c => c.id === expense.category_id);
          return (
            <Card key={expense.id}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{expense.name}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">
                      {category?.name} • {formatCurrency(expense.amount, currency)} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                    {expense.vendor && <p className="text-xs text-muted-foreground truncate">Fornecedor: {expense.vendor}</p>}
                    {expense.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{expense.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <Badge variant={expense.status === 'pago' ? 'default' : expense.status === 'pendente' ? 'secondary' : 'destructive'} className="text-xs">
                      {expense.status === 'pago' ? 'Pago' : expense.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(expense.id)} className="text-red-600 hover:text-red-700">
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
  );
};

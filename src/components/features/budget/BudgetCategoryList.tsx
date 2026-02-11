import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Download } from 'lucide-react';
import { formatCurrency } from '@/i18n';
import { useSettings } from '@/contexts/SettingsContext';
import { useWeddingData } from '@/contexts/WeddingContext';
import { exportBudgetPDF } from '@/utils/pdfExport';
import type { BudgetCategory, BudgetCategoryCreate, BudgetCategoryUpdate } from '@/types/budget.types';

interface BudgetCategoryListProps {
  categories: BudgetCategory[];
  weddingId: string;
  userId: string;
  onAdd: (category: BudgetCategoryCreate) => void;
  onUpdate: (category: BudgetCategoryUpdate) => void;
  onDelete: (categoryId: string) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'alta': return 'bg-red-100 text-red-800';
    case 'media': return 'bg-yellow-100 text-yellow-800';
    case 'baixa': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const BudgetCategoryList = ({ categories, weddingId, userId, onAdd, onUpdate, onDelete }: BudgetCategoryListProps) => {
  const { currency } = useSettings();
  const { weddingData } = useWeddingData();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    budgeted_amount: 0,
    priority: 'media' as const,
    description: '',
    icon: 'DollarSign',
    color: '#3b82f6'
  });

  const handleAdd = () => {
    if (!newCategory.name.trim()) return;
    onAdd({
      ...newCategory,
      user_id: userId,
      wedding_id: weddingId,
    });
    setNewCategory({ name: '', budgeted_amount: 0, priority: 'media', description: '', icon: 'DollarSign', color: '#3b82f6' });
    setIsAddingCategory(false);
  };

  const handleUpdate = () => {
    if (!editingCategory) return;
    onUpdate({
      id: editingCategory.id,
      name: editingCategory.name,
      budgeted_amount: editingCategory.budgeted_amount,
      priority: editingCategory.priority,
      description: editingCategory.description,
    });
    setEditingCategory(null);
  };

  const handleDelete = (categoryId: string) => {
    if (!confirm('Tem certeza que deseja remover esta categoria? Todos os gastos e opções associados serão também removidos.')) return;
    onDelete(categoryId);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Categorias de Orçamento</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => exportBudgetPDF(categories as any[], currency, {
              coupleName: weddingData?.couple.name,
              partnerName: weddingData?.couple.partnerName,
              weddingDate: weddingData?.wedding.date
            })}
            disabled={categories.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Nova Categoria</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Adicionar Categoria</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input id="name" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} placeholder="Nome da categoria" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Valor Orçamentado *</Label>
                    <Input id="amount" type="number" value={newCategory.budgeted_amount} onChange={(e) => setNewCategory({ ...newCategory, budgeted_amount: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                  </div>
                  <div>
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={newCategory.priority} onValueChange={(value: any) => setNewCategory({ ...newCategory, priority: value })}>
                      <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione prioridade" /></SelectTrigger>
                      <SelectContent className="bg-background z-[100]">
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} placeholder="Descrição opcional" rows={3} />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingCategory(false)}>Cancelar</Button>
                  <Button onClick={handleAdd}>Adicionar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{category.name}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">
                    Orçamentado: {formatCurrency(category.budgeted_amount, currency)} | 
                    Gasto: {formatCurrency(category.spent_amount, currency)}
                  </p>
                  {category.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <Badge className={`${getPriorityColor(category.priority || 'media')} text-xs`}>
                    {category.priority === 'alta' ? 'Alta' : category.priority === 'media' ? 'Média' : 'Baixa'}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => setEditingCategory(category)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Categoria</DialogTitle></DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome *</Label>
                <Input id="edit-name" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-amount">Valor Orçamentado *</Label>
                  <Input id="edit-amount" type="number" value={editingCategory.budgeted_amount} onChange={(e) => setEditingCategory({ ...editingCategory, budgeted_amount: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label htmlFor="edit-priority">Prioridade</Label>
                  <Select value={editingCategory.priority || 'media'} onValueChange={(value: any) => setEditingCategory({ ...editingCategory, priority: value })}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione prioridade" /></SelectTrigger>
                    <SelectContent className="bg-background z-[100]">
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea id="edit-description" value={editingCategory.description || ''} onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })} rows={3} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingCategory(null)}>Cancelar</Button>
                <Button onClick={handleUpdate}>Guardar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

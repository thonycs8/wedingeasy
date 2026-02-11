import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Star, Phone, Mail, Globe, MapPin, Heart, Target } from 'lucide-react';
import { formatCurrency } from '@/i18n';
import { useSettings } from '@/contexts/SettingsContext';
import type { BudgetCategory, BudgetOption, BudgetOptionCreate } from '@/types/budget.types';

interface BudgetOptionListProps {
  options: BudgetOption[];
  categories: BudgetCategory[];
  userId: string;
  onAdd: (option: BudgetOptionCreate) => void;
  onToggleFavorite: (params: { optionId: string; isFavorite: boolean }) => void;
  onUpdateStatus: (update: { id: string; status: string }) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'contratado': return 'bg-green-100 text-green-800';
    case 'cotacao': case 'reuniao_marcada': case 'proposta_recebida': return 'bg-blue-100 text-blue-800';
    case 'contactado': return 'bg-yellow-100 text-yellow-800';
    case 'considerando': return 'bg-gray-100 text-gray-800';
    case 'rejeitado': case 'descartado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const BudgetOptionList = ({ options, categories, userId, onAdd, onToggleFavorite, onUpdateStatus }: BudgetOptionListProps) => {
  const { currency } = useSettings();
  const [isAdding, setIsAdding] = useState(false);
  const [newOption, setNewOption] = useState({
    category_id: '', name: '', price_min: 0, price_max: 0, vendor: '',
    website: '', phone: '', email: '', address: '', notes: '', rating: 0,
    status: 'considerando' as const
  });

  const handleAdd = () => {
    if (!newOption.name.trim() || !newOption.category_id) return;
    onAdd({
      ...newOption,
      user_id: userId,
      price_min: newOption.price_min || null,
      price_max: newOption.price_max || null,
      vendor: newOption.vendor || null,
      website: newOption.website || null,
      phone: newOption.phone || null,
      email: newOption.email || null,
      address: newOption.address || null,
      notes: newOption.notes || null,
      rating: newOption.rating || null,
    });
    setNewOption({ category_id: '', name: '', price_min: 0, price_max: 0, vendor: '', website: '', phone: '', email: '', address: '', notes: '', rating: 0, status: 'considerando' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Opções e Fornecedores</h3>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Nova Opção</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Adicionar Opção</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Categoria *</Label>
                <Select value={newOption.category_id} onValueChange={(v) => setNewOption({ ...newOption, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nome *</Label><Input value={newOption.name} onChange={(e) => setNewOption({ ...newOption, name: e.target.value })} placeholder="Nome da opção" /></div>
                <div><Label>Fornecedor</Label><Input value={newOption.vendor} onChange={(e) => setNewOption({ ...newOption, vendor: e.target.value })} placeholder="Nome do fornecedor" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Preço Mínimo</Label><Input type="number" value={newOption.price_min} onChange={(e) => setNewOption({ ...newOption, price_min: parseFloat(e.target.value) || 0 })} /></div>
                <div><Label>Preço Máximo</Label><Input type="number" value={newOption.price_max} onChange={(e) => setNewOption({ ...newOption, price_max: parseFloat(e.target.value) || 0 })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Telefone</Label><Input value={newOption.phone} onChange={(e) => setNewOption({ ...newOption, phone: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" value={newOption.email} onChange={(e) => setNewOption({ ...newOption, email: e.target.value })} /></div>
              </div>
              <div><Label>Website</Label><Input value={newOption.website} onChange={(e) => setNewOption({ ...newOption, website: e.target.value })} /></div>
              <div><Label>Morada</Label><Input value={newOption.address} onChange={(e) => setNewOption({ ...newOption, address: e.target.value })} /></div>
              <div><Label>Notas</Label><Textarea value={newOption.notes} onChange={(e) => setNewOption({ ...newOption, notes: e.target.value })} rows={3} /></div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAdding(false)}>Cancelar</Button>
                <Button onClick={handleAdd}>Adicionar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {options.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma opção registada</h3>
            <p className="text-muted-foreground mb-4">Adicione opções e fornecedores para comparar preços.</p>
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
                      {category?.name}{option.vendor && ` • ${option.vendor}`}
                    </p>
                    {(option.price_min || option.price_max) && (
                      <p className="text-sm font-medium">
                        {option.price_min && option.price_max ? `${formatCurrency(option.price_min, currency)} - ${formatCurrency(option.price_max, currency)}` :
                         option.price_min ? `A partir de ${formatCurrency(option.price_min, currency)}` :
                         `Até ${formatCurrency(option.price_max!, currency)}`}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {option.phone && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{option.phone}</div>}
                      {option.email && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{option.email}</div>}
                      {option.website && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Globe className="w-3 h-3" />Website</div>}
                      {option.address && <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{option.address}</div>}
                    </div>
                    {option.notes && <p className="text-xs text-muted-foreground mt-2">{option.notes}</p>}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Badge className={getStatusColor(option.status)}>{option.status}</Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onToggleFavorite({ optionId: option.id, isFavorite: !option.is_favorite })} className={option.is_favorite ? 'text-yellow-500' : ''}>
                        <Heart className={`w-4 h-4 ${option.is_favorite ? 'fill-current' : ''}`} />
                      </Button>
                      <Select value={option.status} onValueChange={(v) => onUpdateStatus({ id: option.id, status: v })}>
                        <SelectTrigger className="w-8 h-8 p-1 bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-background z-[100]">
                          <SelectItem value="considerando">Considerando</SelectItem>
                          <SelectItem value="contactado">Contactado</SelectItem>
                          <SelectItem value="reuniao_marcada">Reunião Marcada</SelectItem>
                          <SelectItem value="proposta_recebida">Proposta Recebida</SelectItem>
                          <SelectItem value="contratado">Contratado</SelectItem>
                          <SelectItem value="descartado">Descartado</SelectItem>
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
  );
};

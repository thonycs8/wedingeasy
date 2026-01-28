import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users } from 'lucide-react';
import { useState, useEffect } from 'react';

interface GuestFormData {
  name: string;
  email: string;
  phone: string;
  category: string;
  side: 'noivo' | 'noiva' | '';
  age_band: string;
  confirmed: boolean;
  plus_one: boolean;
  dietary_restrictions: string;
  notes: string;
  printed_invitation: boolean;
  special_role: string;
  table_number: string;
  relationship: string;
}

interface GuestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingGuest?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    category: string;
    side?: string | null;
    age_band?: string | null;
    confirmed: boolean;
    plus_one: boolean;
    dietary_restrictions?: string | null;
    notes?: string | null;
    printed_invitation?: boolean;
    special_role?: string | null;
    table_number?: number | null;
    relationship?: string | null;
  } | null;
  onSubmit: (data: GuestFormData) => void;
  isLoading?: boolean;
}

const initialFormData: GuestFormData = {
  name: '',
  email: '',
  phone: '',
  category: 'family',
  side: '',
  age_band: 'adult',
  confirmed: false,
  plus_one: false,
  dietary_restrictions: '',
  notes: '',
  printed_invitation: false,
  special_role: '',
  table_number: '',
  relationship: ''
};

export function GuestForm({
  open,
  onOpenChange,
  editingGuest,
  onSubmit,
  isLoading = false
}: GuestFormProps) {
  const [formData, setFormData] = useState<GuestFormData>(initialFormData);

  useEffect(() => {
    if (editingGuest) {
      setFormData({
        name: editingGuest.name,
        email: editingGuest.email || '',
        phone: editingGuest.phone || '',
        category: editingGuest.category,
        side: (editingGuest.side || '') as 'noivo' | 'noiva' | '',
        age_band: editingGuest.age_band || 'adult',
        confirmed: editingGuest.confirmed,
        plus_one: editingGuest.plus_one,
        dietary_restrictions: editingGuest.dietary_restrictions || '',
        notes: editingGuest.notes || '',
        printed_invitation: editingGuest.printed_invitation || false,
        special_role: editingGuest.special_role || '',
        table_number: editingGuest.table_number?.toString() || '',
        relationship: editingGuest.relationship || ''
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingGuest, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {editingGuest ? 'Editar Convidado' : 'Adicionar Convidado'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione categoria" />
                </SelectTrigger>
                <SelectContent className="bg-background z-[100]">
                  <SelectItem value="family">Família</SelectItem>
                  <SelectItem value="friends">Amigos</SelectItem>
                  <SelectItem value="work">Trabalho</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                  <SelectItem value="groomsmen">Padrinhos do Noivo</SelectItem>
                  <SelectItem value="bridesmaids">Madrinhas da Noiva</SelectItem>
                  <SelectItem value="groomsman_friends">Amigos do Noivo</SelectItem>
                  <SelectItem value="bridesmaid_friends">Amigas da Noiva</SelectItem>
                  <SelectItem value="witnesses">Testemunhas</SelectItem>
                  <SelectItem value="officiant">Celebrante</SelectItem>
                  <SelectItem value="pastor">Pastor</SelectItem>
                  <SelectItem value="musicians">Músicos</SelectItem>
                  <SelectItem value="honor_guests">Convidados de Honra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="side">Lado</Label>
              <Select
                value={formData.side}
                onValueChange={(value: 'noivo' | 'noiva') => setFormData(prev => ({ ...prev, side: value }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione o lado" />
                </SelectTrigger>
                <SelectContent className="bg-background z-[100]">
                  <SelectItem value="noivo">Noivo</SelectItem>
                  <SelectItem value="noiva">Noiva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="age_band">Faixa etária</Label>
              <Select
                value={formData.age_band}
                onValueChange={(value) => setFormData(prev => ({ ...prev, age_band: value }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione a faixa" />
                </SelectTrigger>
                <SelectContent className="bg-background z-[100]">
                  <SelectItem value="0_4">Bebé (0–4) — 0%</SelectItem>
                  <SelectItem value="5_10">Criança (5–10) — 50%</SelectItem>
                  <SelectItem value="11_plus">Adolescente (11+) — 100%</SelectItem>
                  <SelectItem value="adult">Adulto — 100%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+351 123 456 789"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="relationship">Relação/Parentesco</Label>
              <Input
                id="relationship"
                value={formData.relationship}
                onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                placeholder="Ex: Irmão, Prima, Amigo..."
              />
            </div>

            <div>
              <Label htmlFor="special_role">Função Especial</Label>
              <Select 
                value={formData.special_role || undefined} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, special_role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma função" />
                </SelectTrigger>
                <SelectContent className="bg-background z-[100]">
                  <SelectItem value="best_man">Padrinho de Casamento</SelectItem>
                  <SelectItem value="maid_of_honor">Madrinha de Casamento</SelectItem>
                  <SelectItem value="groomsman">Padrinho</SelectItem>
                  <SelectItem value="bridesmaid">Madrinha</SelectItem>
                  <SelectItem value="witness">Testemunha</SelectItem>
                  <SelectItem value="officiant">Celebrante</SelectItem>
                  <SelectItem value="pastor">Pastor</SelectItem>
                  <SelectItem value="musician">Músico</SelectItem>
                  <SelectItem value="honor_guest">Convidado de Honra</SelectItem>
                  <SelectItem value="flower_girl">Menina das Flores</SelectItem>
                  <SelectItem value="ring_bearer">Menino das Alianças</SelectItem>
                  <SelectItem value="reader">Leitor</SelectItem>
                  <SelectItem value="usher">Recepcionista</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="table_number">Número da Mesa</Label>
            <Input
              id="table_number"
              type="number"
              value={formData.table_number}
              onChange={(e) => setFormData(prev => ({ ...prev, table_number: e.target.value }))}
              placeholder="Ex: 1, 2, 3..."
            />
          </div>

          <div>
            <Label htmlFor="dietary_restrictions">Restrições Alimentares</Label>
            <Input
              id="dietary_restrictions"
              value={formData.dietary_restrictions}
              onChange={(e) => setFormData(prev => ({ ...prev, dietary_restrictions: e.target.value }))}
              placeholder="Ex: Vegetariano, Sem glúten..."
            />
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="confirmed"
                checked={formData.confirmed}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, confirmed: checked }))}
              />
              <Label htmlFor="confirmed">Presença confirmada</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="plus_one"
                checked={formData.plus_one}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, plus_one: checked }))}
              />
              <Label htmlFor="plus_one">Traz acompanhante (+1)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="printed_invitation"
                checked={formData.printed_invitation}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, printed_invitation: checked }))}
              />
              <Label htmlFor="printed_invitation">Convite impresso entregue</Label>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-gradient" disabled={isLoading}>
              {isLoading ? 'A guardar...' : editingGuest ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

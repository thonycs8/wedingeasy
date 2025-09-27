import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  category: 'family' | 'friends' | 'work' | 'other';
  confirmed: boolean;
  plus_one: boolean;
  dietary_restrictions?: string;
  notes?: string;
}

export const GuestManager = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'friends' as Guest['category'],
    confirmed: false,
    plus_one: false,
    dietary_restrictions: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      loadGuests();
    }
  }, [user]);

  const loadGuests = async () => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      setGuests((data || []).map(guest => ({
        ...guest,
        category: guest.category as Guest['category']
      })));
    } catch (error) {
      console.error('Error loading guests:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os convidados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addGuest = async () => {
    if (!newGuest.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('guests')
        .insert([{
          ...newGuest,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setGuests([...guests, { ...data, category: data.category as Guest['category'] }]);
      setNewGuest({
        name: '',
        email: '',
        phone: '',
        category: 'friends',
        confirmed: false,
        plus_one: false,
        dietary_restrictions: '',
        notes: ''
      });
      setIsAddingGuest(false);
      
      toast({
        title: "Sucesso",
        description: "Convidado adicionado com sucesso!",
      });
    } catch (error) {
      console.error('Error adding guest:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o convidado.",
        variant: "destructive"
      });
    }
  };

  const updateGuest = async (guest: Guest) => {
    try {
      const { error } = await supabase
        .from('guests')
        .update(guest)
        .eq('id', guest.id);

      if (error) throw error;

      setGuests(guests.map(g => g.id === guest.id ? guest : g));
      setEditingGuest(null);
      
      toast({
        title: "Sucesso",
        description: "Convidado atualizado com sucesso!",
      });
    } catch (error) {
      console.error('Error updating guest:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o convidado.",
        variant: "destructive"
      });
    }
  };

  const deleteGuest = async (guestId: string) => {
    if (!confirm('Tem certeza que deseja remover este convidado?')) return;

    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', guestId);

      if (error) throw error;

      setGuests(guests.filter(g => g.id !== guestId));
      
      toast({
        title: "Sucesso",
        description: "Convidado removido com sucesso!",
      });
    } catch (error) {
      console.error('Error deleting guest:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o convidado.",
        variant: "destructive"
      });
    }
  };

  const toggleConfirmed = async (guest: Guest) => {
    await updateGuest({ ...guest, confirmed: !guest.confirmed });
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || guest.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'confirmed' && guest.confirmed) ||
                         (filterStatus === 'pending' && !guest.confirmed);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      family: 'bg-pink-100 text-pink-800',
      friends: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const exportGuestList = () => {
    const csv = [
      ['Nome', 'Email', 'Telefone', 'Categoria', 'Confirmado', '+1', 'Restrições', 'Notas'],
      ...filteredGuests.map(guest => [
        guest.name,
        guest.email || '',
        guest.phone || '',
        guest.category,
        guest.confirmed ? 'Sim' : 'Não',
        guest.plus_one ? 'Sim' : 'Não',
        guest.dietary_restrictions || '',
        guest.notes || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lista-convidados.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">A carregar convidados...</div>
        </CardContent>
      </Card>
    );
  }

  const confirmedCount = guests.filter(g => g.confirmed).length;
  const totalWithPlusOnes = guests.reduce((sum, g) => sum + 1 + (g.plus_one ? 1 : 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{guests.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
            <div className="text-sm text-muted-foreground">Confirmados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{guests.length - confirmedCount}</div>
            <div className="text-sm text-muted-foreground">Pendentes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalWithPlusOnes}</div>
            <div className="text-sm text-muted-foreground">Com +1</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar convidados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="family">Família</SelectItem>
                <SelectItem value="friends">Amigos</SelectItem>
                <SelectItem value="work">Trabalho</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="confirmed">Confirmados</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportGuestList} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Dialog open={isAddingGuest} onOpenChange={setIsAddingGuest}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Convidado</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={newGuest.name}
                      onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                      placeholder="Nome do convidado"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newGuest.email}
                        onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={newGuest.phone}
                        onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                        placeholder="+351 123 456 789"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={newGuest.category} onValueChange={(value: Guest['category']) => setNewGuest({ ...newGuest, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="family">Família</SelectItem>
                        <SelectItem value="friends">Amigos</SelectItem>
                        <SelectItem value="work">Trabalho</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="confirmed"
                        checked={newGuest.confirmed}
                        onCheckedChange={(checked) => setNewGuest({ ...newGuest, confirmed: checked })}
                      />
                      <Label htmlFor="confirmed">Confirmado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="plus_one"
                        checked={newGuest.plus_one}
                        onCheckedChange={(checked) => setNewGuest({ ...newGuest, plus_one: checked })}
                      />
                      <Label htmlFor="plus_one">+1</Label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dietary">Restrições Alimentares</Label>
                    <Input
                      id="dietary"
                      value={newGuest.dietary_restrictions}
                      onChange={(e) => setNewGuest({ ...newGuest, dietary_restrictions: e.target.value })}
                      placeholder="Vegetariano, alergia a nozes, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notas</Label>
                    <Textarea
                      id="notes"
                      value={newGuest.notes}
                      onChange={(e) => setNewGuest({ ...newGuest, notes: e.target.value })}
                      placeholder="Notas adicionais..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddingGuest(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={addGuest}>
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Guest List */}
      <div className="grid gap-4">
        {filteredGuests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum convidado encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {guests.length === 0 
                  ? "Comece a adicionar os seus convidados para organizar a lista."
                  : "Tente ajustar os filtros ou termo de pesquisa."
                }
              </p>
              {guests.length === 0 && (
                <Button onClick={() => setIsAddingGuest(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Convidado
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredGuests.map((guest) => (
            <Card key={guest.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{guest.name}</h3>
                      <Badge className={getCategoryColor(guest.category)}>
                        {guest.category === 'family' ? 'Família' :
                         guest.category === 'friends' ? 'Amigos' :
                         guest.category === 'work' ? 'Trabalho' : 'Outros'}
                      </Badge>
                      {guest.plus_one && (
                        <Badge variant="outline">+1</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleConfirmed(guest)}
                        className={guest.confirmed ? 'text-green-600' : 'text-orange-600'}
                      >
                        {guest.confirmed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {guest.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {guest.email}
                        </div>
                      )}
                      {guest.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {guest.phone}
                        </div>
                      )}
                    </div>
                    {guest.dietary_restrictions && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Restrições:</span> {guest.dietary_restrictions}
                      </div>
                    )}
                    {guest.notes && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {guest.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingGuest(guest)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGuest(guest.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingGuest} onOpenChange={() => setEditingGuest(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Convidado</DialogTitle>
          </DialogHeader>
          {editingGuest && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={editingGuest.name}
                  onChange={(e) => setEditingGuest({ ...editingGuest, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingGuest.email || ''}
                    onChange={(e) => setEditingGuest({ ...editingGuest, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Telefone</Label>
                  <Input
                    id="edit-phone"
                    value={editingGuest.phone || ''}
                    onChange={(e) => setEditingGuest({ ...editingGuest, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-category">Categoria</Label>
                <Select value={editingGuest.category} onValueChange={(value: Guest['category']) => setEditingGuest({ ...editingGuest, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Família</SelectItem>
                    <SelectItem value="friends">Amigos</SelectItem>
                    <SelectItem value="work">Trabalho</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-confirmed"
                    checked={editingGuest.confirmed}
                    onCheckedChange={(checked) => setEditingGuest({ ...editingGuest, confirmed: checked })}
                  />
                  <Label htmlFor="edit-confirmed">Confirmado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-plus_one"
                    checked={editingGuest.plus_one}
                    onCheckedChange={(checked) => setEditingGuest({ ...editingGuest, plus_one: checked })}
                  />
                  <Label htmlFor="edit-plus_one">+1</Label>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-dietary">Restrições Alimentares</Label>
                <Input
                  id="edit-dietary"
                  value={editingGuest.dietary_restrictions || ''}
                  onChange={(e) => setEditingGuest({ ...editingGuest, dietary_restrictions: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-notes">Notas</Label>
                <Textarea
                  id="edit-notes"
                  value={editingGuest.notes || ''}
                  onChange={(e) => setEditingGuest({ ...editingGuest, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingGuest(null)}>
                  Cancelar
                </Button>
                <Button onClick={() => updateGuest(editingGuest)}>
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
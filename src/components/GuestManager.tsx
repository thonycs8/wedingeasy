import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Download,
  Upload,
  FileText,
  Crown,
  Heart,
  Music,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { exportGuestListPDF } from '@/utils/pdfExport';
import { useSettings } from '@/contexts/SettingsContext';
import { useWeddingData } from '@/contexts/WeddingContext';

interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  category: 'family' | 'friends' | 'work' | 'other' | 'groomsmen' | 'bridesmaids' | 'groomsman_friends' | 'bridesmaid_friends' | 'witnesses' | 'officiant' | 'pastor' | 'musicians' | 'honor_guests';
  confirmed: boolean;
  plus_one: boolean;
  dietary_restrictions?: string;
  notes?: string;
  printed_invitation?: boolean;
  special_role?: string;
  table_number?: number;
  relationship?: string;
  side?: 'noivo' | 'noiva' | null;
  age_band?: '0_4' | '5_10' | '11_plus' | 'adult' | null;
}

export const GuestManager = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currency } = useSettings();
  const { weddingData } = useWeddingData();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSide, setFilterSide] = useState<'all' | 'noivo' | 'noiva' | 'none'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [bulkImportText, setBulkImportText] = useState('');
  const [importFormat, setImportFormat] = useState<'names' | 'csv'>('names');

  const [selectedGuestIds, setSelectedGuestIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [bulkDeleteConfirmText, setBulkDeleteConfirmText] = useState('');

  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkEditSide, setBulkEditSide] = useState<'noivo' | 'noiva' | 'none' | ''>('');
  const [bulkEditCategory, setBulkEditCategory] = useState<string>('');
  const [bulkEditAgeBand, setBulkEditAgeBand] = useState<'' | NonNullable<Guest['age_band']>>('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'family' as Guest['category'],
    side: '' as 'noivo' | 'noiva' | '',
    age_band: 'adult' as NonNullable<Guest['age_band']>,
    confirmed: false,
    plus_one: false,
    dietary_restrictions: '',
    notes: '',
    printed_invitation: false,
    special_role: '',
    table_number: '',
    relationship: ''
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
        .order('name');

      if (error) throw error;
      
      const guestsFromDb = (data || []) as Guest[];
      
      // Add couple as confirmed guests at the beginning
      const coupleGuests: Guest[] = [];
      
      if (weddingData?.couple?.name) {
        coupleGuests.push({
          id: 'groom-virtual',
          name: weddingData.couple.name,
          category: 'honor_guests' as Guest['category'],
          confirmed: true,
          plus_one: false,
          special_role: 'Noivo',
          side: 'noivo',
          age_band: 'adult'
        });
      }
      
      if (weddingData?.couple?.partnerName) {
        coupleGuests.push({
          id: 'bride-virtual',
          name: weddingData.couple.partnerName,
          category: 'honor_guests' as Guest['category'],
          confirmed: true,
          plus_one: false,
          special_role: 'Noiva',
          side: 'noiva',
          age_band: 'adult'
        });
      }
      
      setGuests([...coupleGuests, ...guestsFromDb]);
      setSelectedGuestIds(new Set());
    } catch (error) {
      console.error('Error loading guests:', error);
      toast.error('Erro ao carregar convidados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !user) return;

    try {
      const guestData = {
        name: formData.name.trim(),
        email: formData.email || null,
        phone: formData.phone || null,
        category: formData.category,
        side: formData.side || null,
        age_band: formData.age_band || 'adult',
        confirmed: formData.confirmed,
        plus_one: formData.plus_one,
        dietary_restrictions: formData.dietary_restrictions || null,
        notes: formData.notes || null,
        printed_invitation: formData.printed_invitation,
        special_role: formData.special_role || null,
        table_number: formData.table_number ? parseInt(formData.table_number) : null,
        relationship: formData.relationship || null,
        user_id: user.id
      };

      if (editingGuest) {
        const { error } = await supabase
          .from('guests')
          .update(guestData)
          .eq('id', editingGuest.id);

        if (error) throw error;
        toast.success('Convidado atualizado!');
      } else {
        const { error } = await supabase
          .from('guests')
          .insert([guestData]);

        if (error) throw error;
        toast.success('Convidado adicionado!');
      }

      resetForm();
      loadGuests();
    } catch (error) {
      console.error('Error saving guest:', error);
      toast.error('Erro ao guardar convidado');
    }
  };

  const handleBulkImport = async () => {
    if (!bulkImportText.trim() || !user) return;

    try {
      const lines = bulkImportText.trim().split('\n');
      const guestsToAdd: any[] = [];

      if (importFormat === 'names') {
        // Formato simples: um nome por linha
        lines.forEach(line => {
          const name = line.trim();
          if (name) {
            guestsToAdd.push({
              name,
              category: 'other',
              side: null,
              age_band: 'adult',
              confirmed: false,
              plus_one: false,
              user_id: user.id
            });
          }
        });
      } else if (importFormat === 'csv') {
        // Formato CSV: Nome,Email,Telefone,Categoria
        lines.forEach((line, index) => {
          if (index === 0 && line.toLowerCase().includes('nome')) return; // Skip header
          
          const parts = line.split(',').map(p => p.trim());
          if (parts.length >= 1 && parts[0]) {
            guestsToAdd.push({
              name: parts[0],
              email: parts[1] || null,
              phone: parts[2] || null,
              category: parts[3] || 'other',
              side: null,
              age_band: 'adult',
              confirmed: false,
              plus_one: false,
              user_id: user.id
            });
          }
        });
      }

      if (guestsToAdd.length === 0) {
        toast.error('Nenhum convidado válido encontrado');
        return;
      }

      const { error } = await supabase
        .from('guests')
        .insert(guestsToAdd);

      if (error) throw error;

      toast.success(`${guestsToAdd.length} convidados importados com sucesso!`);
      setBulkImportText('');
      setShowImportModal(false);
      loadGuests();
    } catch (error) {
      console.error('Error importing guests:', error);
      toast.error('Erro ao importar convidados');
    }
  };

  const toggleConfirmation = async (guest: Guest) => {
    // Prevent toggling virtual couple guests (already confirmed)
    if (guest.id.includes('-virtual')) return;

    try {
      const newConfirmedStatus = !guest.confirmed;
      
      const { error } = await supabase
        .from('guests')
        .update({ confirmed: newConfirmedStatus })
        .eq('id', guest.id);

      if (error) throw error;

      setGuests(prev => prev.map(g => 
        g.id === guest.id ? { ...g, confirmed: newConfirmedStatus } : g
      ));
      
      toast.success(newConfirmedStatus ? 'Presença confirmada' : 'Confirmação removida');
    } catch (error) {
      console.error('Error toggling confirmation:', error);
      toast.error('Erro ao atualizar confirmação');
    }
  };

  const deleteGuest = async (id: string) => {
    // Prevent deleting virtual couple guests
    if (id.includes('-virtual')) {
      toast.error('Os noivos não podem ser removidos da lista');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGuests(prev => prev.filter(g => g.id !== id));
      setSelectedGuestIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success('Convidado removido');
    } catch (error) {
      console.error('Error deleting guest:', error);
      toast.error('Erro ao remover convidado');
    }
  };

  const editGuest = (guest: Guest) => {
    // Prevent editing virtual couple guests
    if (guest.id.includes('-virtual')) {
      toast.error('Os dados dos noivos não podem ser editados aqui');
      return;
    }
    
    setFormData({
      name: guest.name,
      email: guest.email || '',
      phone: guest.phone || '',
      category: guest.category,
      side: (guest.side || '') as 'noivo' | 'noiva' | '',
      age_band: (guest.age_band || 'adult') as NonNullable<Guest['age_band']>,
      confirmed: guest.confirmed,
      plus_one: guest.plus_one,
      dietary_restrictions: guest.dietary_restrictions || '',
      notes: guest.notes || '',
      printed_invitation: guest.printed_invitation || false,
      special_role: guest.special_role || '',
      table_number: guest.table_number?.toString() || '',
      relationship: guest.relationship || ''
    });
    setEditingGuest(guest);
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
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
    });
    setEditingGuest(null);
    setShowAddModal(false);
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (guest.email && guest.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || guest.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'confirmed' && guest.confirmed) ||
                         (filterStatus === 'pending' && !guest.confirmed);

    const matchesSide =
      filterSide === 'all' ||
      (filterSide === 'none' && !guest.side) ||
      (filterSide !== 'none' && guest.side === filterSide);
    
    return matchesSearch && matchesCategory && matchesStatus && matchesSide;
  });

  const getAgeBandLabel = (ageBand?: Guest['age_band']) => {
    switch (ageBand) {
      case '0_4':
        return 'Bebés (0–4)';
      case '5_10':
        return 'Crianças (5–10)';
      case '11_plus':
        return 'Adolescentes (11+)';
      case 'adult':
      default:
        return 'Adultos';
    }
  };

  const getSideLabel = (side?: Guest['side']) => {
    if (side === 'noivo') return 'Lado do Noivo';
    if (side === 'noiva') return 'Lado da Noiva';
    return 'Sem lado';
  };

  const countByAgeBand = (list: Guest[]) => {
    const normalized = list.map((g) => ({ ...g, age_band: (g.age_band || 'adult') as NonNullable<Guest['age_band']> }));
    return {
      total: normalized.length,
      babies: normalized.filter((g) => g.age_band === '0_4').length,
      children: normalized.filter((g) => g.age_band === '5_10').length,
      teens: normalized.filter((g) => g.age_band === '11_plus').length,
      adults: normalized.filter((g) => g.age_band === 'adult').length,
    };
  };

  const groomGuests = filteredGuests.filter((g) => g.side === 'noivo');
  const brideGuests = filteredGuests.filter((g) => g.side === 'noiva');
  const unassignedGuests = filteredGuests.filter((g) => !g.side);

  const groomStats = countByAgeBand(groomGuests);
  const brideStats = countByAgeBand(brideGuests);

  const isGuestDeletable = (guest: Guest) => !guest.id.includes('-virtual');

  const toggleGuestSelection = (guestId: string, checked: boolean) => {
    setSelectedGuestIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(guestId);
      else next.delete(guestId);
      return next;
    });
  };

  const selectAllFilteredDeletable = () => {
    const ids = filteredGuests.filter(isGuestDeletable).map(g => g.id);
    if (ids.length === 0) {
      toast.error('Nenhum convidado nos filtros atuais');
      return;
    }
    setSelectedGuestIds(new Set(ids));
  };

  const selectAllUnassignedFilteredDeletable = () => {
    const ids = filteredGuests
      .filter(isGuestDeletable)
      .filter((g) => !g.side)
      .map((g) => g.id);

    if (ids.length === 0) {
      toast.error('Não há convidados "Sem lado" nos filtros atuais');
      return;
    }

    setSelectedGuestIds(new Set(ids));
  };

  const clearSelection = () => setSelectedGuestIds(new Set());

  const bulkDeleteSelected = async () => {
    if (!user) return;

    const ids = Array.from(selectedGuestIds).filter((id) => !id.includes('-virtual'));
    if (ids.length === 0) {
      toast.error('Nenhum convidado selecionado');
      return;
    }

    if (bulkDeleteConfirmText.trim().toUpperCase() !== 'APAGAR') {
      toast.error('Digite APAGAR para confirmar');
      return;
    }

    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .in('id', ids);

      if (error) throw error;

      setGuests(prev => prev.filter(g => !ids.includes(g.id)));
      clearSelection();
      setIsBulkDeleteOpen(false);
      setBulkDeleteConfirmText('');
      toast.success(`${ids.length} convidado(s) removido(s)`);
    } catch (error) {
      console.error('Error bulk deleting guests:', error);
      toast.error('Erro ao remover convidados');
    }
  };

  const bulkUpdateSelected = async () => {
    if (!user) return;

    const ids = Array.from(selectedGuestIds).filter((id) => !id.includes('-virtual'));
    if (ids.length === 0) {
      toast.error('Nenhum convidado selecionado');
      return;
    }

    const patch: Record<string, unknown> = {};
    if (bulkEditSide) patch.side = bulkEditSide === 'none' ? null : bulkEditSide;
    if (bulkEditCategory) patch.category = bulkEditCategory as Guest['category'];
    if (bulkEditAgeBand) patch.age_band = bulkEditAgeBand;

    if (Object.keys(patch).length === 0) {
      toast.error('Selecione pelo menos 1 campo para atualizar');
      return;
    }

    try {
      const { error } = await supabase
        .from('guests')
        .update(patch)
        .in('id', ids);

      if (error) throw error;

      toast.success(`Atualizado: ${ids.length} convidado(s)`);
      setIsBulkEditOpen(false);
      setBulkEditSide('');
      setBulkEditCategory('');
      setBulkEditAgeBand('');
      clearSelection();
      loadGuests();
    } catch (error) {
      console.error('Error bulk updating guests:', error);
      toast.error('Erro ao atualizar convidados');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'groomsmen':
      case 'bridesmaids':
        return Crown;
      case 'witnesses':
        return UserCheck;
      case 'officiant':
      case 'pastor':
        return Heart;
      case 'musicians':
        return Music;
      case 'honor_guests':
        return Sparkles;
      default:
        return Users;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      family: 'Família',
      friends: 'Amigos',
      work: 'Trabalho',
      other: 'Outros',
      groomsmen: 'Padrinhos do Noivo',
      bridesmaids: 'Madrinhas da Noiva',
      groomsman_friends: 'Amigos do Noivo',
      bridesmaid_friends: 'Amigas da Noiva',
      witnesses: 'Testemunhas',
      officiant: 'Celebrante',
      pastor: 'Pastor',
      musicians: 'Músicos',
      honor_guests: 'Convidados de Honra'
    };
    return labels[category] || category;
  };

  const getSpecialRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      best_man: 'Padrinho de Casamento',
      maid_of_honor: 'Madrinha de Casamento',
      groomsman: 'Padrinho',
      bridesmaid: 'Madrinha',
      witness: 'Testemunha',
      officiant: 'Celebrante',
      pastor: 'Pastor',
      musician: 'Músico',
      honor_guest: 'Convidado de Honra',
      flower_girl: 'Menina das Flores',
      ring_bearer: 'Menino das Alianças',
      reader: 'Leitor',
      usher: 'Recepcionista'
    };
    return labels[role] || role;
  };

  const specialCategories = guests.filter(g => 
    ['groomsmen', 'bridesmaids', 'witnesses', 'officiant', 'pastor', 'musicians', 'honor_guests'].includes(g.category)
  );

  return (
    <Card className="card-romantic">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          {t('guests.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-2">
            <p className="text-xl sm:text-2xl font-bold text-primary truncate">{guests.length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{t('guests.total')}</p>
          </div>
          <div className="text-center p-2">
            <p className="text-xl sm:text-2xl font-bold text-success truncate">{guests.filter(g => g.confirmed).length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{t('guests.confirmed')}</p>
          </div>
          <div className="text-center p-2">
            <p className="text-xl sm:text-2xl font-bold text-warning truncate">{guests.filter(g => g.plus_one).length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">Com Acompanhante</p>
          </div>
          <div className="text-center p-2">
            <p className="text-xl sm:text-2xl font-bold text-info truncate">{specialCategories.length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">Funções Especiais</p>
          </div>
        </div>

        {/* Side + Age breakdown */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">{getSideLabel('noivo')}</h3>
              <Badge variant="secondary">{groomStats.total}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between gap-2">
                <span>Bebés (0–4)</span>
                <span className="font-medium text-foreground">{groomStats.babies}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Crianças (5–10)</span>
                <span className="font-medium text-foreground">{groomStats.children}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Adolescentes (11+)</span>
                <span className="font-medium text-foreground">{groomStats.teens}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Adultos</span>
                <span className="font-medium text-foreground">{groomStats.adults}</span>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">{getSideLabel('noiva')}</h3>
              <Badge variant="secondary">{brideStats.total}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between gap-2">
                <span>Bebés (0–4)</span>
                <span className="font-medium text-foreground">{brideStats.babies}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Crianças (5–10)</span>
                <span className="font-medium text-foreground">{brideStats.children}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Adolescentes (11+)</span>
                <span className="font-medium text-foreground">{brideStats.teens}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Adultos</span>
                <span className="font-medium text-foreground">{brideStats.adults}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Primary Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Button className="btn-gradient flex-1 sm:flex-none">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('guests.addGuest')}
                </Button>
              </DialogTrigger>
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
                        onValueChange={(value: Guest['category']) => setFormData(prev => ({ ...prev, category: value }))}
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
                        onValueChange={(value: NonNullable<Guest['age_band']>) => setFormData(prev => ({ ...prev, age_band: value }))}
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
                        <SelectContent>
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
                      <Label htmlFor="plus_one">Vem com acompanhante</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="printed_invitation"
                        checked={formData.printed_invitation}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, printed_invitation: checked }))}
                      />
                      <Label htmlFor="printed_invitation">Recebe convite impresso</Label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="btn-gradient">
                      {editingGuest ? 'Atualizar' : 'Adicionar'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Importar Lista
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Importar Lista de Convidados
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Formato de Importação</Label>
                    <Select value={importFormat} onValueChange={(value: 'names' | 'csv') => setImportFormat(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecione formato" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-[100]">
                        <SelectItem value="names">Lista de Nomes (um por linha)</SelectItem>
                        <SelectItem value="csv">Formato CSV (Nome,Email,Telefone,Categoria)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bulk_import">
                      {importFormat === 'names' ? 'Lista de Nomes' : 'Dados CSV'}
                    </Label>
                    <Textarea
                      id="bulk_import"
                      value={bulkImportText}
                      onChange={(e) => setBulkImportText(e.target.value)}
                      placeholder={
                        importFormat === 'names' 
                          ? "João Silva\nMaria Santos\nCarlos Oliveira\n..."
                          : "Nome,Email,Telefone,Categoria\nJoão Silva,joao@email.com,123456789,family\nMaria Santos,maria@email.com,987654321,friends\n..."
                      }
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>

                  {importFormat === 'csv' && (
                    <Alert>
                      <FileText className="w-4 h-4" />
                      <AlertDescription>
                        <strong>Formato CSV:</strong> Nome,Email,Telefone,Categoria<br/>
                        <strong>Categorias válidas:</strong> family, friends, work, other, groomsmen, bridesmaids, witnesses, officiant, pastor, musicians, honor_guests
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleBulkImport} className="btn-gradient" disabled={!bulkImportText.trim()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Importar Convidados
                    </Button>
                    <Button variant="outline" onClick={() => {setBulkImportText(''); setShowImportModal(false);}}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <Upload className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Importar</span>
                  <span className="sm:hidden">Importar</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Importar Lista de Convidados
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Formato de Importação</Label>
                    <Select value={importFormat} onValueChange={(value: 'names' | 'csv') => setImportFormat(value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecione formato" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-[100]">
                        <SelectItem value="names">Lista de Nomes (um por linha)</SelectItem>
                        <SelectItem value="csv">Formato CSV (Nome,Email,Telefone,Categoria)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bulk_import">
                      {importFormat === 'names' ? 'Lista de Nomes' : 'Dados CSV'}
                    </Label>
                    <Textarea
                      id="bulk_import"
                      value={bulkImportText}
                      onChange={(e) => setBulkImportText(e.target.value)}
                      placeholder={
                        importFormat === 'names' 
                          ? "João Silva\nMaria Santos\nCarlos Oliveira\n..."
                          : "Nome,Email,Telefone,Categoria\nJoão Silva,joao@email.com,123456789,family\nMaria Santos,maria@email.com,987654321,friends\n..."
                      }
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>

                  {importFormat === 'csv' && (
                    <Alert>
                      <FileText className="w-4 h-4" />
                      <AlertDescription>
                        <strong>Formato CSV:</strong> Nome,Email,Telefone,Categoria<br/>
                        <strong>Categorias válidas:</strong> family, friends, work, other, groomsmen, bridesmaids, witnesses, officiant, pastor, musicians, honor_guests
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleBulkImport} className="btn-gradient" disabled={!bulkImportText.trim()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Importar Convidados
                    </Button>
                    <Button variant="outline" onClick={() => {setBulkImportText(''); setShowImportModal(false);}}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => exportGuestListPDF(guests, currency, {
                coupleName: weddingData?.couple.name,
                partnerName: weddingData?.couple.partnerName,
                weddingDate: weddingData?.wedding.date
              })}
              disabled={guests.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Exportar PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/guest-list')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Users className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Ver tabela</span>
              <span className="sm:hidden">Tabela</span>
            </Button>
          </div>
        </div>

        {/* Bulk Selection Actions */}
        {selectedGuestIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg border">
            <Badge variant="secondary" className="font-medium">
              {selectedGuestIds.size} selecionados
            </Badge>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsBulkEditOpen(true)}>
                Atualizar
              </Button>
              <Button size="sm" variant="outline" onClick={clearSelection}>
                Limpar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setIsBulkDeleteOpen(true)}>
                Excluir
              </Button>
            </div>

            <Dialog
              open={isBulkEditOpen}
              onOpenChange={(open) => {
                setIsBulkEditOpen(open);
                if (!open) {
                  setBulkEditSide('');
                  setBulkEditCategory('');
                  setBulkEditAgeBand('');
                }
              }}
            >
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Atualizar em massa</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Atualizar <strong>{selectedGuestIds.size}</strong> convidado(s). Campos vazios não serão alterados.
                  </p>

                  <div className="space-y-2">
                    <Label>Lado</Label>
                    <Select value={bulkEditSide} onValueChange={(v: typeof bulkEditSide) => setBulkEditSide(v)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Manter como está" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-[100]">
                        <SelectItem value="noivo">Noivo</SelectItem>
                        <SelectItem value="noiva">Noiva</SelectItem>
                        <SelectItem value="none">Sem lado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={bulkEditCategory}
                      onValueChange={(v) => setBulkEditCategory(v)}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Manter como está" />
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

                  <div className="space-y-2">
                    <Label>Faixa etária</Label>
                    <Select
                      value={bulkEditAgeBand}
                      onValueChange={(v: typeof bulkEditAgeBand) => setBulkEditAgeBand(v)}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Manter como está" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-[100]">
                        <SelectItem value="0_4">Bebés (0–4)</SelectItem>
                        <SelectItem value="5_10">Crianças (5–10)</SelectItem>
                        <SelectItem value="11_plus">Adolescentes (11+)</SelectItem>
                        <SelectItem value="adult">Adultos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button variant="outline" onClick={() => setIsBulkEditOpen(false)}>
                      Cancelar
                    </Button>
                    <Button className="btn-gradient" onClick={bulkUpdateSelected}>
                      Aplicar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isBulkDeleteOpen} onOpenChange={(open) => {
              setIsBulkDeleteOpen(open);
              if (!open) setBulkDeleteConfirmText('');
            }}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Excluir em massa</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Você está prestes a excluir <strong>{selectedGuestIds.size}</strong> convidado(s). Esta ação não pode ser desfeita.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="bulk-delete-confirm">Digite <strong>APAGAR</strong> para confirmar</Label>
                    <Input
                      id="bulk-delete-confirm"
                      value={bulkDeleteConfirmText}
                      onChange={(e) => setBulkDeleteConfirmText(e.target.value)}
                      placeholder="APAGAR"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsBulkDeleteOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={bulkDeleteSelected}>
                      Excluir
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Filters Section */}
        <div className="space-y-3">
          {/* Search and Selection */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar convidados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={selectAllFilteredDeletable}>
                Selecionar filtrados
              </Button>
              <Button size="sm" variant="ghost" onClick={selectAllUnassignedFilteredDeletable}>
                Selecionar sem lado
              </Button>
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-40 bg-background">
                <Filter className="w-4 h-4 mr-2 shrink-0" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-background z-[100]">
                <SelectItem value="all">Todas categorias</SelectItem>
                <SelectItem value="family">Família</SelectItem>
                <SelectItem value="friends">Amigos</SelectItem>
                <SelectItem value="work">Trabalho</SelectItem>
                <SelectItem value="groomsmen">Padrinhos do Noivo</SelectItem>
                <SelectItem value="bridesmaids">Madrinhas da Noiva</SelectItem>
                <SelectItem value="witnesses">Testemunhas</SelectItem>
                <SelectItem value="officiant">Celebrante</SelectItem>
                <SelectItem value="musicians">Músicos</SelectItem>
                <SelectItem value="honor_guests">Convidados de Honra</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSide} onValueChange={(v) => setFilterSide(v as typeof filterSide)}>
              <SelectTrigger className="w-full sm:w-32 bg-background">
                <Users className="w-4 h-4 mr-2 shrink-0" />
                <SelectValue placeholder="Lado" />
              </SelectTrigger>
              <SelectContent className="bg-background z-[100]">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="noivo">Noivo</SelectItem>
                <SelectItem value="noiva">Noiva</SelectItem>
                <SelectItem value="none">Sem lado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40 bg-background">
                <UserCheck className="w-4 h-4 mr-2 shrink-0" />
                <SelectValue placeholder="Confirmação" />
              </SelectTrigger>
              <SelectContent className="bg-background z-[100]">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="confirmed">Confirmados</SelectItem>
                <SelectItem value="pending">Não confirmados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Guests List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todos ({filteredGuests.length})</TabsTrigger>
            <TabsTrigger value="special">Funções Especiais ({specialCategories.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando convidados...</p>
              </div>
            ) : filteredGuests.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum convidado encontrado</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {([
                    { key: 'noivo' as const, title: 'Lado do Noivo', list: groomGuests },
                    { key: 'noiva' as const, title: 'Lado da Noiva', list: brideGuests },
                  ]).map((section) => (
                    <div key={section.key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{section.title}</h3>
                        <Badge variant="secondary">{section.list.length}</Badge>
                      </div>
                      {section.list.length === 0 ? (
                        <div className="p-4 border rounded-lg text-sm text-muted-foreground">
                          Nenhum convidado neste lado.
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {section.list.map((guest) => {
                            const CategoryIcon = getCategoryIcon(guest.category);
                            return (
                              <div key={guest.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 gap-3">
                                <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      checked={guest.confirmed}
                                      onCheckedChange={() => toggleConfirmation(guest)}
                                      disabled={guest.id.includes('-virtual')}
                                      className="mt-1"
                                    />
                                    <CategoryIcon className="w-5 h-5 text-primary flex-shrink-0" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-medium truncate">{guest.name}</h4>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                      <Badge variant="secondary" className="text-xs shrink-0">
                                        {getCategoryLabel(guest.category)}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs shrink-0">
                                        {getAgeBandLabel(guest.age_band)}
                                      </Badge>
                                      {guest.special_role && (
                                        <Badge
                                          variant={guest.special_role === 'Noivo' || guest.special_role === 'Noiva' ? 'couple' : 'outline'}
                                          className="text-xs shrink-0"
                                        >
                                          {getSpecialRoleLabel(guest.special_role)}
                                        </Badge>
                                      )}
                                      <div className="flex items-center gap-1 shrink-0">
                                        {guest.confirmed ? (
                                          <span className="text-success text-xs">Confirmado</span>
                                        ) : (
                                          <span className="text-muted-foreground text-xs">Pendente</span>
                                        )}
                                        {guest.plus_one && <span>+1</span>}
                                        {guest.printed_invitation && <span>📜</span>}
                                      </div>
                                    </div>
                                    {guest.email && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground truncate mt-1">
                                        <Mail className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{guest.email}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                  <div className="flex items-center gap-2 pr-1">
                                    <Checkbox
                                      checked={selectedGuestIds.has(guest.id)}
                                      onCheckedChange={(checked) => toggleGuestSelection(guest.id, Boolean(checked))}
                                      disabled={!isGuestDeletable(guest)}
                                      aria-label="Selecionar convidado"
                                    />
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => editGuest(guest)}
                                    disabled={guest.id.includes('-virtual')}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteGuest(guest.id)}
                                    disabled={guest.id.includes('-virtual')}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Unassigned (no side) guests */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Sem lado</h3>
                    <Badge variant="secondary">{unassignedGuests.length}</Badge>
                  </div>
                  {unassignedGuests.length === 0 ? (
                    <div className="p-4 border rounded-lg text-sm text-muted-foreground">
                      Nenhum convidado sem lado.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {unassignedGuests.map((guest) => {
                        const CategoryIcon = getCategoryIcon(guest.category);
                        return (
                          <div key={guest.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 gap-3">
                            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={guest.confirmed}
                                  onCheckedChange={() => toggleConfirmation(guest)}
                                  disabled={guest.id.includes('-virtual')}
                                  className="mt-1"
                                />
                                <CategoryIcon className="w-5 h-5 text-primary flex-shrink-0" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium truncate">{guest.name}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                  <Badge variant="secondary" className="text-xs shrink-0">
                                    {getCategoryLabel(guest.category)}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs shrink-0">
                                    {getAgeBandLabel(guest.age_band)}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs shrink-0">
                                    {getSideLabel(guest.side)}
                                  </Badge>
                                  <div className="flex items-center gap-1 shrink-0">
                                    {guest.confirmed ? (
                                      <span className="text-success text-xs">Confirmado</span>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">Pendente</span>
                                    )}
                                    {guest.plus_one && <span>+1</span>}
                                    {guest.printed_invitation && <span>📜</span>}
                                  </div>
                                </div>
                                {guest.email && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground truncate mt-1">
                                    <Mail className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{guest.email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                              <div className="flex items-center gap-2 pr-1">
                                <Checkbox
                                  checked={selectedGuestIds.has(guest.id)}
                                  onCheckedChange={(checked) => toggleGuestSelection(guest.id, Boolean(checked))}
                                  disabled={!isGuestDeletable(guest)}
                                  aria-label="Selecionar convidado"
                                />
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => editGuest(guest)}
                                disabled={guest.id.includes('-virtual')}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteGuest(guest.id)}
                                disabled={guest.id.includes('-virtual')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="special" className="space-y-6">
            {specialCategories.length === 0 ? (
              <div className="text-center py-8">
                <Crown className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhuma função especial definida</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Adicione padrinhos, madrinhas, testemunhas e outras funções especiais
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Group by category */}
                {['groomsmen', 'bridesmaids', 'witnesses', 'officiant', 'pastor', 'musicians', 'honor_guests'].map(category => {
                  const categoryGuests = specialCategories.filter(g => g.category === category);
                  if (categoryGuests.length === 0) return null;

                  const CategoryIcon = getCategoryIcon(category);
                  
                  return (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CategoryIcon className="w-5 h-5 text-primary shrink-0" />
                        <h3 className="font-semibold text-base sm:text-lg">{getCategoryLabel(category)}</h3>
                        <Badge variant="secondary" className="shrink-0">{categoryGuests.length}</Badge>
                      </div>
                      <div className="grid gap-3">
                        {categoryGuests.map(guest => (
                          <div key={guest.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg bg-primary/5 gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium truncate">{guest.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                {guest.special_role && (
                                  <Badge 
                                    variant={guest.special_role === 'Noivo' || guest.special_role === 'Noiva' ? 'couple' : 'outline'} 
                                    className="text-xs shrink-0"
                                  >
                                    {getSpecialRoleLabel(guest.special_role)}
                                  </Badge>
                                )}
                                {guest.confirmed ? (
                                  <span className="text-success">Confirmado</span>
                                ) : (
                                  <span className="text-muted-foreground">Pendente</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => editGuest(guest)}
                                disabled={guest.id.includes('-virtual')}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => deleteGuest(guest.id)}
                                disabled={guest.id.includes('-virtual')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

      </CardContent>
    </Card>
  );
};
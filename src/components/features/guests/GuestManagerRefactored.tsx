import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { exportGuestListPDF } from '@/utils/pdfExport';
import { useSettings } from '@/contexts/SettingsContext';
import { useWeddingData } from '@/contexts/WeddingContext';
import { useGuests } from '@/hooks/queries/useGuests';
import { useWeddingId } from '@/hooks/useWeddingId';
import { LoadingState, EmptyGuests } from '@/components/shared';
import { 
  GuestFilters, 
  GuestStats, 
  GuestCard, 
  GuestBulkActions, 
  GuestForm,
  calculateAgeBandStats,
  type FilterSide,
  type FilterStatus,
  type BulkUpdateData
} from '@/components/features/guests';

interface LocalGuest {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  category: string;
  confirmed: boolean;
  plus_one: boolean;
  dietary_restrictions?: string | null;
  notes?: string | null;
  printed_invitation?: boolean;
  special_role?: string[] | null;
  table_number?: number | null;
  relationship?: string | null;
  side?: string | null;
  age_band?: string | null;
}

export const GuestManagerRefactored = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currency } = useSettings();
  const { weddingData } = useWeddingData();
  const { weddingId } = useWeddingId();

  // React Query hook
  // React Query hook - usa weddingId em vez de userId
  const {
    guests: dbGuests,
    isLoading,
    addGuest,
    updateGuest,
    bulkUpdate,
    deleteGuest,
    bulkDelete
  } = useGuests(weddingId);

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterSide, setFilterSide] = useState<FilterSide>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<LocalGuest | null>(null);
  const [selectedGuestIds, setSelectedGuestIds] = useState<Set<string>>(new Set());

  // Add virtual couple guests
  const guests: LocalGuest[] = useMemo(() => {
    const coupleGuests: LocalGuest[] = [];
    
    if (weddingData?.couple?.name) {
      coupleGuests.push({
        id: 'groom-virtual',
        name: weddingData.couple.name,
        category: 'honor_guests',
        confirmed: true,
        plus_one: false,
        special_role: ['Noivo'],
        side: 'noivo',
        age_band: 'adult'
      });
    }
    
    if (weddingData?.couple?.partnerName) {
      coupleGuests.push({
        id: 'bride-virtual',
        name: weddingData.couple.partnerName,
        category: 'honor_guests',
        confirmed: true,
        plus_one: false,
        special_role: ['Noiva'],
        side: 'noiva',
        age_band: 'adult'
      });
    }
    
    return [...coupleGuests, ...(dbGuests as LocalGuest[])];
  }, [dbGuests, weddingData]);

  // Filtered guests
  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
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
  }, [guests, searchTerm, filterCategory, filterStatus, filterSide]);

  // Guests by side
  const groomGuests = filteredGuests.filter(g => g.side === 'noivo');
  const brideGuests = filteredGuests.filter(g => g.side === 'noiva');
  const unassignedGuests = filteredGuests.filter(g => !g.side);

  // Special categories
  const specialCategories = guests.filter(g => 
    ['groomsmen', 'bridesmaids', 'witnesses', 'officiant', 'pastor', 'musicians', 'honor_guests'].includes(g.category)
  );

  // Helper functions
  const isVirtual = (guest: LocalGuest) => guest.id.includes('-virtual');

  const handleToggleConfirmation = async (guest: LocalGuest) => {
    if (isVirtual(guest)) return;
    
    try {
      await updateGuest.mutateAsync({ 
        id: guest.id, 
        confirmed: !guest.confirmed 
      });
    } catch {
      // Error handled by hook
    }
  };

  const handleEdit = (guest: LocalGuest) => {
    if (isVirtual(guest)) {
      toast.error('Os dados dos noivos não podem ser editados aqui');
      return;
    }
    setEditingGuest(guest);
    setShowAddModal(true);
  };

  const handleDelete = async (guestId: string) => {
    if (guestId.includes('-virtual')) {
      toast.error('Os noivos não podem ser removidos da lista');
      return;
    }
    
    try {
      await deleteGuest.mutateAsync(guestId);
      setSelectedGuestIds(prev => {
        const next = new Set(prev);
        next.delete(guestId);
        return next;
      });
    } catch {
      // Error handled by hook
    }
  };

  const handleFormSubmit = async (formData: {
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
  }) => {
    if (!user || !weddingId) return;

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
      special_role: formData.special_role ? [formData.special_role] : null,
      table_number: formData.table_number ? parseInt(formData.table_number) : null,
      relationship: formData.relationship || null,
      user_id: user.id,
      wedding_id: weddingId
    };

    try {
      if (editingGuest) {
        await updateGuest.mutateAsync({ id: editingGuest.id, ...guestData });
      } else {
        await addGuest.mutateAsync(guestData);
      }
      setShowAddModal(false);
      setEditingGuest(null);
    } catch {
      // Error handled by hook
    }
  };

  const handleBulkUpdate = async (data: BulkUpdateData) => {
    const ids = Array.from(selectedGuestIds).filter(id => !id.includes('-virtual'));
    if (ids.length === 0) {
      toast.error('Nenhum convidado selecionado');
      return;
    }

    if (Object.keys(data).length === 0) {
      toast.error('Selecione pelo menos 1 campo para atualizar');
      return;
    }

    try {
      await bulkUpdate.mutateAsync({ ids, data });
      setSelectedGuestIds(new Set());
    } catch {
      // Error handled by hook
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedGuestIds).filter(id => !id.includes('-virtual'));
    if (ids.length === 0) return;

    try {
      await bulkDelete.mutateAsync(ids);
      setSelectedGuestIds(new Set());
    } catch {
      // Error handled by hook
    }
  };

  const selectAllFiltered = () => {
    const ids = filteredGuests.filter(g => !isVirtual(g)).map(g => g.id);
    if (ids.length === 0) {
      toast.error('Nenhum convidado nos filtros atuais');
      return;
    }
    setSelectedGuestIds(new Set(ids));
  };

  const selectAllUnassigned = () => {
    const ids = filteredGuests
      .filter(g => !isVirtual(g) && !g.side)
      .map(g => g.id);

    if (ids.length === 0) {
      toast.error('Não há convidados "Sem lado" nos filtros atuais');
      return;
    }
    setSelectedGuestIds(new Set(ids));
  };

  const toggleGuestSelection = (guestId: string, checked: boolean) => {
    setSelectedGuestIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(guestId);
      else next.delete(guestId);
      return next;
    });
  };

  const renderGuestList = (guestsList: LocalGuest[], title: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="secondary">{guestsList.length}</Badge>
      </div>
      {guestsList.length === 0 ? (
        <div className="p-4 border rounded-lg text-sm text-muted-foreground">
          Nenhum convidado {title === 'Sem lado' ? 'sem lado' : 'neste lado'}.
        </div>
      ) : (
        <div className="grid gap-3">
          {guestsList.map(guest => (
            <GuestCard
              key={guest.id}
              guest={guest}
              isSelected={selectedGuestIds.has(guest.id)}
              isVirtual={isVirtual(guest)}
              onToggleConfirmation={() => handleToggleConfirmation(guest)}
              onToggleSelection={(checked) => toggleGuestSelection(guest.id, checked)}
              onEdit={() => handleEdit(guest)}
              onDelete={() => handleDelete(guest.id)}
            />
          ))}
        </div>
      )}
    </div>
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
        <GuestStats
          totalGuests={guests.length}
          confirmedGuests={guests.filter(g => g.confirmed).length}
          withPlusOne={guests.filter(g => g.plus_one).length}
          specialRoles={specialCategories.length}
          groomStats={calculateAgeBandStats(groomGuests)}
          brideStats={calculateAgeBandStats(brideGuests)}
        />

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => exportGuestListPDF(guests as any[], currency, {
                coupleName: weddingData?.couple.name,
                partnerName: weddingData?.couple.partnerName,
                weddingDate: weddingData?.wedding.date
              })}
              disabled={guests.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button className="btn-gradient" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('guests.addGuest')}
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <GuestBulkActions
            selectedCount={selectedGuestIds.size}
            onSelectFiltered={selectAllFiltered}
            onSelectUnassigned={selectAllUnassigned}
            onClearSelection={() => setSelectedGuestIds(new Set())}
            onBulkUpdate={handleBulkUpdate}
            onBulkDelete={handleBulkDelete}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <GuestFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterCategory={filterCategory}
            onCategoryChange={setFilterCategory}
            filterSide={filterSide}
            onSideChange={setFilterSide}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
          />
          
          <Button
            variant="outline"
            onClick={() => navigate('/guest-list')}
            className="w-full lg:w-auto"
          >
            Abrir lista (tabela)
          </Button>
        </div>

        {/* Guests List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todos ({filteredGuests.length})</TabsTrigger>
            <TabsTrigger value="special">Funções Especiais ({specialCategories.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <LoadingState text="Carregando convidados..." />
            ) : filteredGuests.length === 0 ? (
              <EmptyGuests onAction={() => setShowAddModal(true)} />
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {renderGuestList(groomGuests, 'Lado do Noivo')}
                  {renderGuestList(brideGuests, 'Lado da Noiva')}
                </div>
                {renderGuestList(unassignedGuests, 'Sem lado')}
              </div>
            )}
          </TabsContent>

          <TabsContent value="special" className="space-y-4">
            {isLoading ? (
              <LoadingState text="Carregando..." />
            ) : specialCategories.length === 0 ? (
              <EmptyGuests onAction={() => setShowAddModal(true)} />
            ) : (
              <div className="grid gap-3">
                {specialCategories.map(guest => (
                  <GuestCard
                    key={guest.id}
                    guest={guest}
                    isSelected={selectedGuestIds.has(guest.id)}
                    isVirtual={isVirtual(guest)}
                    onToggleConfirmation={() => handleToggleConfirmation(guest)}
                    onToggleSelection={(checked) => toggleGuestSelection(guest.id, checked)}
                    onEdit={() => handleEdit(guest)}
                    onDelete={() => handleDelete(guest.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Guest Form Modal */}
        <GuestForm
          open={showAddModal}
          onOpenChange={(open) => {
            setShowAddModal(open);
            if (!open) setEditingGuest(null);
          }}
          editingGuest={editingGuest ? { ...editingGuest, special_role: editingGuest.special_role?.[0] || null } as any : null}
          onSubmit={handleFormSubmit}
          isLoading={addGuest.isPending || updateGuest.isPending}
        />
      </CardContent>
    </Card>
  );
};

export default GuestManagerRefactored;

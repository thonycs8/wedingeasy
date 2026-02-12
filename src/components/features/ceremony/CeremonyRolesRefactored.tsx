import { useState } from "react";
import { getPublicBaseUrl } from "@/utils/getPublicBaseUrl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Trash2, Check, X, Download, Pencil, Link2, Heart, Unlink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWeddingId } from "@/hooks/useWeddingId";
import { useWeddingData } from "@/contexts/WeddingContext";
import { useGuests } from "@/hooks/queries/useGuests";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/shared";
import { exportCeremonyRolesPDF } from "@/utils/pdfExport";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_ROLES = [
  "Padrinho", "Madrinha", "Pai do Noivo", "Mãe do Noivo", "Pai da Noiva", "Mãe da Noiva",
  "Irmão(ã)", "Dama de Honor", "Pajem", "Florista", "Portador das Alianças",
  "Amigo do Noivo", "Amiga da Noiva", "Celebrante", "Convidado de Honra",
];

const getRoleDefaultSide = (role: string): 'noivo' | 'noiva' | null => {
  const groomRoles = ["Amigo do Noivo", "Pai do Noivo", "Mãe do Noivo"];
  const brideRoles = ["Amiga da Noiva", "Dama de Honor", "Pai da Noiva", "Mãe da Noiva"];
  if (groomRoles.includes(role)) return "noivo";
  if (brideRoles.includes(role)) return "noiva";
  return null;
};

interface CeremonyRole {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  special_role: string | null;
  confirmed: boolean;
  side?: string | null;
  couple_pair_id?: string | null;
}

export const CeremonyRolesRefactored = () => {
  const { user } = useAuth();
  const { weddingId } = useWeddingId();
  const { weddingData } = useWeddingData();
  const { guests, isLoading, addGuest, updateGuest, deleteGuest } = useGuests(weddingId);
  const { toast } = useToast();

  // Fetch event_code for invite links
  const { data: eventCode } = useQuery({
    queryKey: ["wedding-event-code", weddingId],
    queryFn: async () => {
      if (!weddingId) return "";
      const { data } = await supabase
        .from("wedding_data")
        .select("event_code")
        .eq("id", weddingId)
        .single();
      return data?.event_code || "";
    },
    enabled: !!weddingId,
    staleTime: 1000 * 60 * 10,
  });

  const roles = (guests as CeremonyRole[]).filter(g => g.special_role);

  const [customRoles, setCustomRoles] = useState<string[]>(() => {
    const stored = localStorage.getItem(`custom_roles_${user?.id}`);
    return stored ? JSON.parse(stored) : [];
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isNewRoleDialogOpen, setIsNewRoleDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<CeremonyRole | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [bulkDeleteConfirmText, setBulkDeleteConfirmText] = useState("");
  const [newPerson, setNewPerson] = useState({ name: "", email: "", phone: "", special_role: "", side: "" as 'noivo' | 'noiva' | '' });
  const [newRoleName, setNewRoleName] = useState("");

  const allRoles = [...DEFAULT_ROLES, ...customRoles];
  const groomRoles = roles.filter(r => r.side === 'noivo');
  const brideRoles = roles.filter(r => r.side === 'noiva');

  const groupBySide = (sideRoles: CeremonyRole[]) => {
    return allRoles.reduce((acc, role) => {
      acc[role] = sideRoles.filter(r => r.special_role === role);
      return acc;
    }, {} as Record<string, CeremonyRole[]>);
  };

  const groomGrouped = groupBySide(groomRoles);
  const brideGrouped = groupBySide(brideRoles);
  const isPersonDeletable = (person: CeremonyRole) => !['Noivo', 'Noiva'].includes(person.special_role || '');

  const normalizeSlug = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "-");

  const getInviteLink = (person: CeremonyRole) => {
    if (!eventCode || !person.special_role) return "";
    const slug = normalizeSlug(person.name);
    const role = encodeURIComponent(normalizeSlug(person.special_role).replace(/-/g, " "));
    return `${getPublicBaseUrl()}/evento/${eventCode}?role=${role}&guest=${encodeURIComponent(slug)}`;
  };

  const getCoupleInviteLink = (person1: CeremonyRole, person2: CeremonyRole) => {
    if (!eventCode) return "";
    const slug1 = normalizeSlug(person1.name);
    const slug2 = normalizeSlug(person2.name);
    const role1 = encodeURIComponent(normalizeSlug(person1.special_role || "").replace(/-/g, " "));
    const role2 = encodeURIComponent(normalizeSlug(person2.special_role || "").replace(/-/g, " "));
    return `${getPublicBaseUrl()}/evento/${eventCode}?role=${role1},${role2}&guest=${encodeURIComponent(slug1)},${encodeURIComponent(slug2)}`;
  };

  const copyInviteLink = (person: CeremonyRole) => {
    // Check if person is in a couple
    const partner = person.couple_pair_id
      ? roles.find(r => r.couple_pair_id === person.couple_pair_id && r.id !== person.id)
      : null;
    const link = partner ? getCoupleInviteLink(person, partner) : getInviteLink(person);
    if (link) {
      navigator.clipboard.writeText(link);
      toast({ title: "Link copiado!", description: partner ? `Link de casal (${person.name} & ${partner.name})` : `Link de ${person.name}` });
    }
  };

  const getPartnerName = (person: CeremonyRole): string | null => {
    if (!person.couple_pair_id) return null;
    const partner = roles.find(r => r.couple_pair_id === person.couple_pair_id && r.id !== person.id);
    return partner?.name || null;
  };

  const handlePairAsCouple = async () => {
    const ids = Array.from(selectedRoleIds);
    if (ids.length !== 2) return;
    const pairId = crypto.randomUUID();
    try {
      await updateGuest.mutateAsync({ id: ids[0], couple_pair_id: pairId } as any);
      await updateGuest.mutateAsync({ id: ids[1], couple_pair_id: pairId } as any);
      setSelectedRoleIds(new Set());
      toast({ title: "Casal emparelhado!", description: "Os dois convidados foram ligados como casal." });
    } catch { /* handled by hook */ }
  };

  const handleUnpair = async (person: CeremonyRole) => {
    if (!person.couple_pair_id) return;
    const partner = roles.find(r => r.couple_pair_id === person.couple_pair_id && r.id !== person.id);
    try {
      await updateGuest.mutateAsync({ id: person.id, couple_pair_id: null } as any);
      if (partner) await updateGuest.mutateAsync({ id: partner.id, couple_pair_id: null } as any);
      toast({ title: "Desemparelhado", description: "O casal foi desfeito." });
    } catch { /* handled by hook */ }
  };

  const handleAddPerson = async () => {
    if (!user || !weddingId || !newPerson.name || !newPerson.special_role) return;
    const defaultSide = getRoleDefaultSide(newPerson.special_role);
    const finalSide = defaultSide || newPerson.side;
    if (!finalSide) return;

    try {
      await addGuest.mutateAsync({
        user_id: user.id, wedding_id: weddingId, name: newPerson.name,
        email: newPerson.email || null, phone: newPerson.phone || null,
        special_role: newPerson.special_role, category: "ceremony",
        confirmed: false, side: finalSide as string,
      } as any);
      setNewPerson({ name: "", email: "", phone: "", special_role: "", side: "" });
      setIsAddDialogOpen(false);
    } catch { /* handled by hook */ }
  };

  const handleAddCustomRole = () => {
    if (!newRoleName.trim()) return;
    const updated = [...customRoles, newRoleName.trim()];
    localStorage.setItem(`custom_roles_${user?.id}`, JSON.stringify(updated));
    setCustomRoles(updated);
    setNewRoleName("");
    setIsNewRoleDialogOpen(false);
  };

  const handleUpdatePerson = async () => {
    if (!editingPerson) return;
    const defaultSide = getRoleDefaultSide(editingPerson.special_role || '');
    const finalSide = defaultSide || editingPerson.side;
    if (!finalSide) return;

    try {
      await updateGuest.mutateAsync({
        id: editingPerson.id, name: editingPerson.name,
        email: editingPerson.email || null, phone: editingPerson.phone || null,
        special_role: editingPerson.special_role, side: finalSide,
      } as any);
      setIsEditDialogOpen(false);
      setEditingPerson(null);
    } catch { /* handled by hook */ }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedRoleIds).filter(id => {
      const person = roles.find(r => r.id === id);
      return person ? isPersonDeletable(person) : false;
    });
    if (ids.length === 0 || bulkDeleteConfirmText.trim().toUpperCase() !== 'APAGAR') return;

    for (const id of ids) {
      try { await deleteGuest.mutateAsync(id); } catch { /* handled */ }
    }
    setSelectedRoleIds(new Set());
    setIsBulkDeleteOpen(false);
    setBulkDeleteConfirmText('');
  };

  // Check if exactly 2 selected and both are pairable (not Noivo/Noiva, not already paired)
  const canPairSelected = () => {
    if (selectedRoleIds.size !== 2) return false;
    const selected = Array.from(selectedRoleIds).map(id => roles.find(r => r.id === id)).filter(Boolean) as CeremonyRole[];
    return selected.length === 2 
      && selected.every(p => isPersonDeletable(p)) 
      && selected.every(p => !p.couple_pair_id);
  };

  const renderSide = (title: string, grouped: Record<string, CeremonyRole[]>, sideRoles: CeremonyRole[]) => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">{title}</h2>
      <div className="space-y-6">
        {allRoles.map(roleName => {
          const people = grouped[roleName] || [];
          if (people.length === 0) return null;
          return (
            <div key={roleName} className="space-y-3">
              <h3 className="font-semibold text-lg">{roleName}</h3>
              <div className="grid gap-3">
                {people.map(person => {
                  const partnerName = getPartnerName(person);
                  return (
                    <div key={person.id} className="flex flex-col gap-3 p-3 sm:p-4 border rounded-lg bg-card overflow-hidden">
                      <div className="flex items-start gap-3 min-w-0">
                        <Checkbox checked={selectedRoleIds.has(person.id)} onCheckedChange={(checked) => {
                          setSelectedRoleIds(prev => {
                            const next = new Set(prev);
                            checked ? next.add(person.id) : next.delete(person.id);
                            return next;
                          });
                        }} disabled={!isPersonDeletable(person)} className="mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium truncate">{person.name}</p>
                            {person.confirmed && <Badge variant="default" className="gap-1 shrink-0"><Check className="h-3 w-3" /><span className="hidden sm:inline">Confirmado</span></Badge>}
                          </div>
                          {person.email && <p className="text-sm text-muted-foreground truncate">{person.email}</p>}
                          {person.phone && <p className="text-sm text-muted-foreground truncate">{person.phone}</p>}
                          {partnerName && (
                            <div className="flex items-center gap-1 mt-1">
                              <Heart className="h-3 w-3 text-primary" />
                              <span className="text-xs text-primary font-medium">Casal com: {partnerName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end flex-wrap">
                        <Button size="sm" variant="outline" onClick={() => copyInviteLink(person)} title="Copiar link de convite">
                          <Link2 className="h-4 w-4" />
                        </Button>
                        {person.couple_pair_id && (
                          <Button size="sm" variant="outline" onClick={() => handleUnpair(person)} title="Desemparelhar">
                            <Unlink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => { setEditingPerson(person); setIsEditDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant={person.confirmed ? "outline" : "default"} onClick={() => updateGuest.mutate({ id: person.id, confirmed: !person.confirmed })}>
                          {person.confirmed ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteGuest.mutate(person.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {sideRoles.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma pessoa adicionada</p>}
      </div>
    </div>
  );

  if (isLoading) return <LoadingState text="Carregando..." />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Papéis na Cerimônia</CardTitle>
              <CardDescription>Gerencie padrinhos, madrinhas e outros papéis especiais</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedRoleIds.size > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">Selecionados: {selectedRoleIds.size}</Badge>
                  {canPairSelected() && (
                    <Button variant="outline" size="sm" onClick={handlePairAsCouple}>
                      <Heart className="h-4 w-4 mr-2" />Emparelhar como Casal
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setSelectedRoleIds(new Set(roles.filter(isPersonDeletable).map(r => r.id)))}>Selecionar todos</Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedRoleIds(new Set())}>Limpar</Button>
                  <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleteOpen(true)}>Excluir selecionados</Button>
                </div>
              )}

              <Dialog open={isBulkDeleteOpen} onOpenChange={(open) => { setIsBulkDeleteOpen(open); if (!open) setBulkDeleteConfirmText(''); }}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Excluir em massa</DialogTitle>
                    <DialogDescription>Você está prestes a excluir {selectedRoleIds.size} pessoa(s). Esta ação não pode ser desfeita.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Label>Digite <strong>APAGAR</strong> para confirmar</Label>
                    <Input value={bulkDeleteConfirmText} onChange={(e) => setBulkDeleteConfirmText(e.target.value)} placeholder="APAGAR" />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBulkDeleteOpen(false)}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleBulkDelete}>Excluir</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" onClick={() => exportCeremonyRolesPDF(roles as any[], { coupleName: weddingData?.couple.name, partnerName: weddingData?.couple.partnerName, weddingDate: weddingData?.wedding.date })} disabled={roles.length === 0}>
                <Download className="h-4 w-4 mr-2" />Exportar PDF
              </Button>

              <Dialog open={isNewRoleDialogOpen} onOpenChange={setIsNewRoleDialogOpen}>
                <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" />Novo Papel</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Criar Novo Papel</DialogTitle><DialogDescription>Adicione um novo tipo de papel cerimonial personalizado</DialogDescription></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div><Label>Nome do Papel</Label><Input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="Ex: Leitura, Testemunha..." /></div>
                  </div>
                  <DialogFooter><Button onClick={handleAddCustomRole}>Criar Papel</Button></DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-2" />Adicionar Pessoa</Button></DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Adicionar Pessoa</DialogTitle><DialogDescription>Adicione uma pessoa a um papel especial na cerimônia</DialogDescription></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div><Label>Nome *</Label><Input value={newPerson.name} onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })} placeholder="Nome completo" /></div>
                    <div>
                      <Label>Papel *</Label>
                      <Select value={newPerson.special_role} onValueChange={(v) => setNewPerson({ ...newPerson, special_role: v })}>
                        <SelectTrigger><SelectValue placeholder="Selecione o papel" /></SelectTrigger>
                        <SelectContent>{allRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    {!getRoleDefaultSide(newPerson.special_role) && (
                      <div>
                        <Label>Lado *</Label>
                        <Select value={newPerson.side} onValueChange={(v: 'noivo' | 'noiva') => setNewPerson({ ...newPerson, side: v })}>
                          <SelectTrigger><SelectValue placeholder="Selecione o lado" /></SelectTrigger>
                          <SelectContent><SelectItem value="noivo">Noivo</SelectItem><SelectItem value="noiva">Noiva</SelectItem></SelectContent>
                        </Select>
                      </div>
                    )}
                    {getRoleDefaultSide(newPerson.special_role) && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground"><strong>Lado:</strong> {getRoleDefaultSide(newPerson.special_role) === 'noivo' ? 'Noivo' : 'Noiva'} (automático)</p>
                      </div>
                    )}
                    <div><Label>Email</Label><Input type="email" value={newPerson.email} onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })} placeholder="email@exemplo.com" /></div>
                    <div><Label>Telefone</Label><Input value={newPerson.phone} onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })} placeholder="+351 912 345 678" /></div>
                  </div>
                  <DialogFooter><Button onClick={handleAddPerson}>Adicionar</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            {renderSide('Lado do Noivo', groomGrouped, groomRoles)}
            {renderSide('Lado da Noiva', brideGrouped, brideRoles)}
          </div>
          {roles.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma pessoa adicionada ainda</p>
              <p className="text-sm">Clique em "Adicionar Pessoa" para começar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Person Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Pessoa</DialogTitle><DialogDescription>Altere o papel ou informações da pessoa</DialogDescription></DialogHeader>
          {editingPerson && (
            <div className="space-y-4 py-4">
              <div><Label>Nome *</Label><Input value={editingPerson.name} onChange={(e) => setEditingPerson({ ...editingPerson, name: e.target.value })} /></div>
              <div>
                <Label>Papel *</Label>
                <Select value={editingPerson.special_role || ''} onValueChange={(v) => setEditingPerson({ ...editingPerson, special_role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{allRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {!getRoleDefaultSide(editingPerson.special_role || '') && (
                <div>
                  <Label>Lado *</Label>
                  <Select value={editingPerson.side || ''} onValueChange={(v: 'noivo' | 'noiva') => setEditingPerson({ ...editingPerson, side: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="noivo">Noivo</SelectItem><SelectItem value="noiva">Noiva</SelectItem></SelectContent>
                  </Select>
                </div>
              )}
              {getRoleDefaultSide(editingPerson.special_role || '') && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground"><strong>Lado:</strong> {getRoleDefaultSide(editingPerson.special_role || '') === 'noivo' ? 'Noivo' : 'Noiva'} (automático)</p>
                </div>
              )}
              <div><Label>Email</Label><Input type="email" value={editingPerson.email || ''} onChange={(e) => setEditingPerson({ ...editingPerson, email: e.target.value })} /></div>
              <div><Label>Telefone</Label><Input value={editingPerson.phone || ''} onChange={(e) => setEditingPerson({ ...editingPerson, phone: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter><Button onClick={handleUpdatePerson}>Salvar Alterações</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CeremonyRolesRefactored;

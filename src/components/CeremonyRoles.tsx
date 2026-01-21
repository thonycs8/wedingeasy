import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Users, Plus, Trash2, Check, X, Download, Pencil } from "lucide-react";
import { exportCeremonyRolesPDF } from "@/utils/pdfExport";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWeddingData } from "@/contexts/WeddingContext";

interface CeremonyRole {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  special_role: string;
  confirmed: boolean;
  side?: 'noivo' | 'noiva' | null;
}

const DEFAULT_ROLES = [
  "Padrinho",
  "Madrinha",
  "Pai do Noivo",
  "Mãe do Noivo",
  "Pai da Noiva",
  "Mãe da Noiva",
  "Irmão(ã)",
  "Dama de Honor",
  "Pajem",
  "Florista",
  "Portador das Alianças",
  "Amigo do Noivo",
  "Amiga da Noiva",
  "Celebrante",
  "Convidado de Honra",
];

// Map roles to their automatic side assignment
const getRoleDefaultSide = (role: string): 'noivo' | 'noiva' | null => {
  const groomRoles = ["Amigo do Noivo", "Pai do Noivo", "Mãe do Noivo"];
  const brideRoles = ["Amiga da Noiva", "Dama de Honor", "Pai da Noiva", "Mãe da Noiva"];
  
  if (groomRoles.includes(role)) return "noivo";
  if (brideRoles.includes(role)) return "noiva";
  return null;
};

export const CeremonyRoles = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { weddingData } = useWeddingData();
  const [roles, setRoles] = useState<CeremonyRole[]>([]);
  const [customRoles, setCustomRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isNewRoleDialogOpen, setIsNewRoleDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<CeremonyRole | null>(null);

  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [bulkDeleteConfirmText, setBulkDeleteConfirmText] = useState("");
  
  const [newPerson, setNewPerson] = useState({
    name: "",
    email: "",
    phone: "",
    special_role: "",
    side: "" as 'noivo' | 'noiva' | '',
  });
  const [newRoleName, setNewRoleName] = useState("");

  useEffect(() => {
    if (user) {
      loadRoles();
      loadCustomRoles();
    }
  }, [user]);

  const loadRoles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("user_id", user.id)
        .not("special_role", "is", null)
        .order("special_role");

      if (error) throw error;
      setRoles((data || []) as CeremonyRole[]);
      setSelectedRoleIds(new Set());
    } catch (error: any) {
      toast({
        title: "Erro ao carregar papéis",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomRoles = () => {
    const stored = localStorage.getItem(`custom_roles_${user?.id}`);
    if (stored) {
      setCustomRoles(JSON.parse(stored));
    }
  };

  const saveCustomRoles = (roles: string[]) => {
    localStorage.setItem(`custom_roles_${user?.id}`, JSON.stringify(roles));
    setCustomRoles(roles);
  };

  const addPerson = async () => {
    if (!user || !newPerson.name || !newPerson.special_role) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome e papel",
        variant: "destructive",
      });
      return;
    }

    // Determine the side automatically if the role has a default side
    const defaultSide = getRoleDefaultSide(newPerson.special_role);
    const finalSide = defaultSide || newPerson.side;

    if (!finalSide) {
      toast({
        title: "Lado obrigatório",
        description: "Por favor, selecione o lado (noivo/noiva)",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("guests")
        .insert([
          {
            user_id: user.id,
            name: newPerson.name,
            email: newPerson.email || null,
            phone: newPerson.phone || null,
            special_role: newPerson.special_role,
            category: "ceremony",
            confirmed: false,
            side: finalSide,
          },
        ])
        .select();

      if (error) throw error;

      setRoles([...roles, ...(data || [])] as CeremonyRole[]);
      setNewPerson({ name: "", email: "", phone: "", special_role: "", side: "" });
      setIsAddDialogOpen(false);

      toast({
        title: "Pessoa adicionada",
        description: `${newPerson.name} foi adicionado(a) como ${newPerson.special_role}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar pessoa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addCustomRole = () => {
    if (!newRoleName.trim()) return;

    const updatedRoles = [...customRoles, newRoleName.trim()];
    saveCustomRoles(updatedRoles);
    setNewRoleName("");
    setIsNewRoleDialogOpen(false);
    loadRoles(); // Recarrega a tabela após adicionar novo papel

    toast({
      title: "Papel criado",
      description: `"${newRoleName}" foi adicionado à lista de papéis`,
    });
  };

  const deleteRole = async (id: string) => {
    try {
      const { error } = await supabase.from("guests").delete().eq("id", id);

      if (error) throw error;

      setRoles(roles.filter((r) => r.id !== id));
      setSelectedRoleIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast({
        title: "Pessoa removida",
        description: "A pessoa foi removida da lista",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleConfirmation = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("guests")
        .update({ confirmed: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setRoles(
        roles.map((r) => (r.id === id ? { ...r, confirmed: !currentStatus } : r))
      );

      toast({
        title: currentStatus ? "Confirmação removida" : "Confirmado",
        description: currentStatus
          ? "A confirmação foi removida"
          : "A pessoa confirmou presença",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (person: CeremonyRole) => {
    loadCustomRoles(); // Recarrega papéis personalizados antes de abrir
    setEditingPerson(person);
    setIsEditDialogOpen(true);
  };

  const updatePerson = async () => {
    if (!editingPerson || !editingPerson.name || !editingPerson.special_role) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome e papel",
        variant: "destructive",
      });
      return;
    }

    // Determine the side automatically if the role has a default side
    const defaultSide = getRoleDefaultSide(editingPerson.special_role);
    const finalSide = defaultSide || editingPerson.side;

    if (!finalSide) {
      toast({
        title: "Lado obrigatório",
        description: "Por favor, selecione o lado (noivo/noiva)",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("guests")
        .update({
          name: editingPerson.name,
          email: editingPerson.email || null,
          phone: editingPerson.phone || null,
          special_role: editingPerson.special_role,
          side: finalSide,
        })
        .eq("id", editingPerson.id);

      if (error) throw error;

      const updatedPerson = { ...editingPerson, side: finalSide };
      setRoles(roles.map(r => r.id === editingPerson.id ? updatedPerson : r));
      setIsEditDialogOpen(false);
      setEditingPerson(null);

      toast({
        title: "Pessoa atualizada",
        description: `${editingPerson.name} foi atualizado(a)`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar pessoa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const allRoles = [...DEFAULT_ROLES, ...customRoles];

  const groomRoles = roles.filter((r) => r.side === 'noivo');
  const brideRoles = roles.filter((r) => r.side === 'noiva');

  const groupBySide = (sideRoles: CeremonyRole[]) => {
    return allRoles.reduce((acc, role) => {
      acc[role] = sideRoles.filter((r) => r.special_role === role);
      return acc;
    }, {} as Record<string, CeremonyRole[]>);
  };

  const groomGrouped = groupBySide(groomRoles);
  const brideGrouped = groupBySide(brideRoles);

  const isPersonDeletable = (person: CeremonyRole) => !['Noivo', 'Noiva'].includes(person.special_role);

  const togglePersonSelection = (personId: string, checked: boolean) => {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(personId);
      else next.delete(personId);
      return next;
    });
  };

  const selectAllDeletable = () => {
    const ids = roles.filter(isPersonDeletable).map((r) => r.id);
    setSelectedRoleIds(new Set(ids));
  };

  const clearSelection = () => setSelectedRoleIds(new Set());

  const bulkDeleteSelected = async () => {
    const ids = Array.from(selectedRoleIds);
    const deletableIds = ids.filter((id) => {
      const person = roles.find((r) => r.id === id);
      return person ? isPersonDeletable(person) : false;
    });

    if (deletableIds.length === 0) {
      toast({
        title: "Nenhuma pessoa selecionada",
        description: "Selecione pelo menos 1 pessoa para excluir",
        variant: "destructive",
      });
      return;
    }

    if (bulkDeleteConfirmText.trim().toUpperCase() !== 'APAGAR') {
      toast({
        title: "Confirmação necessária",
        description: "Digite APAGAR para confirmar",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .in('id', deletableIds);

      if (error) throw error;

      setRoles((prev) => prev.filter((r) => !deletableIds.includes(r.id)));
      clearSelection();
      setIsBulkDeleteOpen(false);
      setBulkDeleteConfirmText('');
      toast({
        title: "Removido",
        description: `${deletableIds.length} pessoa(s) removida(s)`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Papéis na Cerimônia
              </CardTitle>
              <CardDescription>
                Gerencie padrinhos, madrinhas e outros papéis especiais na cerimônia
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedRoleIds.size > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">Selecionados: {selectedRoleIds.size}</Badge>
                  <Button variant="outline" size="sm" onClick={selectAllDeletable}>
                    Selecionar todos
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Limpar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleteOpen(true)}>
                    Excluir selecionados
                  </Button>
                </div>
              )}

              <Dialog open={isBulkDeleteOpen} onOpenChange={(open) => {
                setIsBulkDeleteOpen(open);
                if (!open) setBulkDeleteConfirmText('');
              }}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Excluir em massa</DialogTitle>
                    <DialogDescription>
                      Você está prestes a excluir {selectedRoleIds.size} pessoa(s). Esta ação não pode ser desfeita.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Label htmlFor="bulk-delete-ceremony-confirm">Digite <strong>APAGAR</strong> para confirmar</Label>
                    <Input
                      id="bulk-delete-ceremony-confirm"
                      value={bulkDeleteConfirmText}
                      onChange={(e) => setBulkDeleteConfirmText(e.target.value)}
                      placeholder="APAGAR"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBulkDeleteOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={bulkDeleteSelected}>
                      Excluir
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportCeremonyRolesPDF(roles, {
                  coupleName: weddingData?.couple.name,
                  partnerName: weddingData?.couple.partnerName,
                  weddingDate: weddingData?.wedding.date
                })}
                disabled={roles.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              
              <Dialog open={isNewRoleDialogOpen} onOpenChange={setIsNewRoleDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Papel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Papel</DialogTitle>
                    <DialogDescription>
                      Adicione um novo tipo de papel cerimonial personalizado
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="newRole">Nome do Papel</Label>
                      <Input
                        id="newRole"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        placeholder="Ex: Leitura, Testemunha..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addCustomRole}>Criar Papel</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Pessoa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Pessoa</DialogTitle>
                    <DialogDescription>
                      Adicione uma pessoa a um papel especial na cerimônia
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={newPerson.name}
                        onChange={(e) =>
                          setNewPerson({ ...newPerson, name: e.target.value })
                        }
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Papel *</Label>
                      <Select
                        value={newPerson.special_role}
                        onValueChange={(value) =>
                          setNewPerson({ ...newPerson, special_role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o papel" />
                        </SelectTrigger>
                        <SelectContent>
                          {allRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {!getRoleDefaultSide(newPerson.special_role) && (
                      <div>
                        <Label htmlFor="side">Lado *</Label>
                        <Select
                          value={newPerson.side}
                          onValueChange={(value: 'noivo' | 'noiva') =>
                            setNewPerson({ ...newPerson, side: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o lado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="noivo">Noivo</SelectItem>
                            <SelectItem value="noiva">Noiva</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {getRoleDefaultSide(newPerson.special_role) && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Lado:</strong> {getRoleDefaultSide(newPerson.special_role) === 'noivo' ? 'Noivo' : 'Noiva'} (automático)
                        </p>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newPerson.email}
                        onChange={(e) =>
                          setNewPerson({ ...newPerson, email: e.target.value })
                        }
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={newPerson.phone}
                        onChange={(e) =>
                          setNewPerson({ ...newPerson, phone: e.target.value })
                        }
                        placeholder="+351 912 345 678"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addPerson}>Adicionar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Lado do Noivo */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary">Lado do Noivo</h2>
            <div className="space-y-6">
              {allRoles.map((roleName) => {
                const peopleInRole = groomGrouped[roleName] || [];
                if (peopleInRole.length === 0) return null;

                return (
                  <div key={`groom-${roleName}`} className="space-y-3">
                    <h3 className="font-semibold text-lg">{roleName}</h3>
                    <div className="grid gap-3">
                      {peopleInRole.map((person) => (
                        <div
                          key={person.id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-card"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox
                              checked={selectedRoleIds.has(person.id)}
                              onCheckedChange={(checked) => togglePersonSelection(person.id, Boolean(checked))}
                              disabled={!isPersonDeletable(person)}
                              aria-label="Selecionar pessoa"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{person.name}</p>
                                {person.confirmed && (
                                  <Badge variant="default" className="gap-1">
                                    <Check className="h-3 w-3" />
                                    Confirmado
                                  </Badge>
                                )}
                              </div>
                              {person.email && (
                                <p className="text-sm text-muted-foreground">{person.email}</p>
                              )}
                              {person.phone && (
                                <p className="text-sm text-muted-foreground">{person.phone}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(person)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={person.confirmed ? "outline" : "default"}
                              onClick={() => toggleConfirmation(person.id, person.confirmed)}
                            >
                              {person.confirmed ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteRole(person.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {groomRoles.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma pessoa adicionada do lado do noivo</p>
              )}
            </div>
          </div>

          {/* Lado da Noiva */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary">Lado da Noiva</h2>
            <div className="space-y-6">
              {allRoles.map((roleName) => {
                const peopleInRole = brideGrouped[roleName] || [];
                if (peopleInRole.length === 0) return null;

                return (
                  <div key={`bride-${roleName}`} className="space-y-3">
                    <h3 className="font-semibold text-lg">{roleName}</h3>
                    <div className="grid gap-3">
                      {peopleInRole.map((person) => (
                        <div
                          key={person.id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-card"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox
                              checked={selectedRoleIds.has(person.id)}
                              onCheckedChange={(checked) => togglePersonSelection(person.id, Boolean(checked))}
                              disabled={!isPersonDeletable(person)}
                              aria-label="Selecionar pessoa"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{person.name}</p>
                                {person.confirmed && (
                                  <Badge variant="default" className="gap-1">
                                    <Check className="h-3 w-3" />
                                    Confirmado
                                  </Badge>
                                )}
                              </div>
                              {person.email && (
                                <p className="text-sm text-muted-foreground">{person.email}</p>
                              )}
                              {person.phone && (
                                <p className="text-sm text-muted-foreground">{person.phone}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(person)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={person.confirmed ? "outline" : "default"}
                              onClick={() => toggleConfirmation(person.id, person.confirmed)}
                            >
                              {person.confirmed ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteRole(person.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {brideRoles.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma pessoa adicionada do lado da noiva</p>
              )}
            </div>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pessoa</DialogTitle>
            <DialogDescription>
              Altere o papel ou informações da pessoa na cerimônia
            </DialogDescription>
          </DialogHeader>
          {editingPerson && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={editingPerson.name}
                  onChange={(e) =>
                    setEditingPerson({ ...editingPerson, name: e.target.value })
                  }
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Papel *</Label>
                <Select
                  value={editingPerson.special_role}
                  onValueChange={(value) =>
                    setEditingPerson({ ...editingPerson, special_role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o papel" />
                  </SelectTrigger>
                  <SelectContent>
                    {allRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!getRoleDefaultSide(editingPerson.special_role) && (
                <div>
                  <Label htmlFor="edit-side">Lado *</Label>
                  <Select
                    value={editingPerson.side || ''}
                    onValueChange={(value: 'noivo' | 'noiva') =>
                      setEditingPerson({ ...editingPerson, side: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o lado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="noivo">Noivo</SelectItem>
                      <SelectItem value="noiva">Noiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {getRoleDefaultSide(editingPerson.special_role) && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Lado:</strong> {getRoleDefaultSide(editingPerson.special_role) === 'noivo' ? 'Noivo' : 'Noiva'} (automático)
                  </p>
                </div>
              )}
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingPerson.email || ''}
                  onChange={(e) =>
                    setEditingPerson({ ...editingPerson, email: e.target.value })
                  }
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  value={editingPerson.phone || ''}
                  onChange={(e) =>
                    setEditingPerson({ ...editingPerson, phone: e.target.value })
                  }
                  placeholder="+351 912 345 678"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={updatePerson}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

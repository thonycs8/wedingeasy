import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Users, Plus, Trash2, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CeremonyRole {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  special_role: string;
  confirmed: boolean;
}

const DEFAULT_ROLES = [
  "Padrinho",
  "Madrinha",
  "Dama de Honor",
  "Pajem",
  "Florista",
  "Portador das Alianças",
];

export const CeremonyRoles = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [roles, setRoles] = useState<CeremonyRole[]>([]);
  const [customRoles, setCustomRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isNewRoleDialogOpen, setIsNewRoleDialogOpen] = useState(false);
  
  const [newPerson, setNewPerson] = useState({
    name: "",
    email: "",
    phone: "",
    special_role: "",
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
      setRoles(data || []);
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
        description: "Por favor, preencha o nome e o papel",
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
          },
        ])
        .select();

      if (error) throw error;

      setRoles([...roles, ...(data || [])]);
      setNewPerson({ name: "", email: "", phone: "", special_role: "" });
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

  const allRoles = [...DEFAULT_ROLES, ...customRoles];

  const groupedRoles = allRoles.reduce((acc, role) => {
    acc[role] = roles.filter((r) => r.special_role === role);
    return acc;
  }, {} as Record<string, CeremonyRole[]>);

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
            <div className="flex gap-2">
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
        <CardContent className="space-y-6">
          {allRoles.map((roleName) => {
            const peopleInRole = groupedRoles[roleName] || [];
            if (peopleInRole.length === 0) return null;

            return (
              <div key={roleName} className="space-y-3">
                <h3 className="font-semibold text-lg">{roleName}</h3>
                <div className="grid gap-3">
                  {peopleInRole.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-card"
                    >
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
                      <div className="flex gap-2">
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

          {roles.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma pessoa adicionada ainda</p>
              <p className="text-sm">Clique em "Adicionar Pessoa" para começar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

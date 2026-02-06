import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

interface AdminUser {
  role_id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  created_at: string;
}

export const AdminAdminsManager = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      // Get all admin roles
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("id, user_id, created_at")
        .eq("role", "admin")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get profiles for each admin
      const userIds = (roles || []).map((r: any) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email")
        .in("user_id", userIds);

      const profileMap = new Map<string, any>();
      (profiles || []).forEach((p: any) => profileMap.set(p.user_id, p));

      const enriched: AdminUser[] = (roles || []).map((r: any) => {
        const profile = profileMap.get(r.user_id);
        return {
          role_id: r.id,
          user_id: r.user_id,
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          email: profile?.email || null,
          created_at: r.created_at,
        };
      });

      setAdmins(enriched);
    } catch (error) {
      console.error("Erro ao carregar admins:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os administradores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingAdmin(true);

    try {
      // Find user by email in profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", newAdminEmail.trim().toLowerCase())
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        toast({
          title: "Utilizador não encontrado",
          description: "Não existe nenhum utilizador com esse email",
          variant: "destructive",
        });
        setAddingAdmin(false);
        return;
      }

      // Check if already admin
      const existing = admins.find((a) => a.user_id === profile.user_id);
      if (existing) {
        toast({
          title: "Já é admin",
          description: "Este utilizador já tem permissões de administrador",
          variant: "destructive",
        });
        setAddingAdmin(false);
        return;
      }

      // Add admin role
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: profile.user_id, role: "admin" });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Admin adicionado: ${newAdminEmail}`,
      });

      setIsDialogOpen(false);
      setNewAdminEmail("");
      fetchAdmins();
    } catch (error) {
      console.error("Erro ao adicionar admin:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o administrador",
        variant: "destructive",
      });
    } finally {
      setAddingAdmin(false);
    }
  };

  const removeAdmin = async (admin: AdminUser) => {
    if (admin.user_id === currentUser?.id) {
      toast({
        title: "Não permitido",
        description: "Não pode remover o seu próprio acesso de admin",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Remover admin: ${admin.email}?`)) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", admin.role_id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Administrador removido",
      });
      fetchAdmins();
    } catch (error) {
      console.error("Erro ao remover admin:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o administrador",
        variant: "destructive",
      });
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=reset`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado",
        description: `Pedido de redefinição de senha enviado para ${email}`,
      });
    } catch (error) {
      console.error("Erro ao enviar reset:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o pedido de redefinição de senha",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Administradores</CardTitle>
          <CardDescription>
            {admins.length} administrador{admins.length !== 1 ? "es" : ""}
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Administrador</DialogTitle>
              <DialogDescription>
                Introduza o email de um utilizador registado
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={addAdmin} className="space-y-4">
              <div>
                <Label htmlFor="admin-email">Email do utilizador</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={addingAdmin}>
                  {addingAdmin ? "Adicionando..." : "Adicionar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Desde</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhum administrador encontrado
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin.role_id}>
                  <TableCell className="font-medium">
                    {[admin.first_name, admin.last_name].filter(Boolean).join(" ") || "—"}
                    {admin.user_id === currentUser?.id && (
                      <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                    )}
                  </TableCell>
                  <TableCell>{admin.email || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {admin.created_at
                      ? format(new Date(admin.created_at), "dd MMM yyyy", { locale: pt })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => admin.email && sendPasswordReset(admin.email)}
                        disabled={!admin.email}
                        title="Enviar reset de senha"
                      >
                        <KeyRound className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAdmin(admin)}
                        disabled={admin.user_id === currentUser?.id}
                        title="Remover admin"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, ShieldBan, ShieldCheck, Trash2, UserX, UserCheck, MoreHorizontal, AlertTriangle, Mail, KeyRound, Copy, ExternalLink, Pencil } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface UserWithWedding {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  status_reason: string | null;
  created_at: string;
  wedding_name: string | null;
  wedding_id: string | null;
  plan_name: string | null;
  plan_id: string | null;
  subscription_id: string | null;
  preferred_language: string | null;
}

interface Plan {
  id: string;
  display_name: string;
  name: string;
}

type ConfirmAction = {
  type: "suspend" | "activate" | "block" | "unblock" | "delete";
  user: UserWithWedding;
};

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Ativo", variant: "default" },
  suspended: { label: "Suspenso", variant: "secondary" },
  blocked: { label: "Bloqueado", variant: "destructive" },
};

const LANGUAGES = [
  { value: "pt", label: "Português" },
  { value: "en", label: "English" },
];

export const AdminUsersManager = () => {
  const [users, setUsers] = useState<UserWithWedding[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Email change state
  const [emailDialogUser, setEmailDialogUser] = useState<UserWithWedding | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Profile edit state
  const [editProfileUser, setEditProfileUser] = useState<UserWithWedding | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLanguage, setEditLanguage] = useState("pt");
  const [editProfileLoading, setEditProfileLoading] = useState(false);

  // Password reset state
  const [resetLinkDialog, setResetLinkDialog] = useState<{ user: UserWithWedding; link: string; email: string } | null>(null);
  const [resetLoading, setResetLoading] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const [weddingsRes, subsRes, collabRes, plansRes] = await Promise.all([
        supabase.from("wedding_data").select("id, user_id, couple_name, partner_name"),
        supabase.from("wedding_subscriptions").select("id, wedding_id, plan_id, subscription_plans(display_name)"),
        supabase.from("wedding_collaborators").select("user_id, wedding_id, role"),
        supabase.from("subscription_plans").select("id, display_name, name").order("sort_order"),
      ]);

      setPlans(plansRes.data || []);

      // Build wedding maps
      const weddingIdNameMap = new Map<string, string>();
      (weddingsRes.data || []).forEach((w: any) => {
        const name = [w.partner_name, w.couple_name].filter(Boolean).join(" & ");
        weddingIdNameMap.set(w.id, name || "Sem nome");
      });

      // Map user_id -> { wedding_name, wedding_id }
      const weddingMap = new Map<string, { name: string; weddingId: string }>();
      (weddingsRes.data || []).forEach((w: any) => {
        const name = weddingIdNameMap.get(w.id) || "Sem nome";
        weddingMap.set(w.user_id, { name, weddingId: w.id });
      });
      (collabRes.data || []).forEach((c: any) => {
        if (!weddingMap.has(c.user_id)) {
          const name = weddingIdNameMap.get(c.wedding_id);
          if (name) {
            weddingMap.set(c.user_id, { name: `${name} (${c.role})`, weddingId: c.wedding_id });
          }
        }
      });

      // Map wedding_id -> subscription info
      const subMap = new Map<string, { plan_name: string; plan_id: string; subscription_id: string }>();
      (subsRes.data || []).forEach((s: any) => {
        subMap.set(s.wedding_id, {
          plan_name: s.subscription_plans?.display_name || "—",
          plan_id: s.plan_id,
          subscription_id: s.id,
        });
      });

      const enriched: UserWithWedding[] = (profiles || []).map((p: any) => {
        const wedding = weddingMap.get(p.user_id);
        const sub = wedding ? subMap.get(wedding.weddingId) : null;
        return {
          id: p.id,
          user_id: p.user_id,
          first_name: p.first_name,
          last_name: p.last_name,
          email: p.email,
          phone: p.phone,
          status: p.status || "active",
          status_reason: p.status_reason,
          created_at: p.created_at,
          wedding_name: wedding?.name || null,
          wedding_id: wedding?.weddingId || null,
          plan_name: sub?.plan_name || null,
          plan_id: sub?.plan_id || null,
          subscription_id: sub?.subscription_id || null,
          preferred_language: p.preferred_language || "pt",
        };
      });

      setUsers(enriched);
    } catch (error) {
      console.error("Erro ao carregar utilizadores:", error);
      toast({ title: "Erro", description: "Não foi possível carregar os utilizadores", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const changePlan = async (user: UserWithWedding, planId: string) => {
    if (!user.wedding_id) {
      toast({ title: "Sem evento", description: "Este utilizador não tem evento associado", variant: "destructive" });
      return;
    }
    try {
      if (user.subscription_id) {
        const { error } = await supabase
          .from("wedding_subscriptions")
          .update({ plan_id: planId })
          .eq("id", user.subscription_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("wedding_subscriptions")
          .insert({ wedding_id: user.wedding_id, plan_id: planId });
        if (error) throw error;
      }

      const plan = plans.find((p) => p.id === planId);
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === user.user_id ? { ...u, plan_id: planId, plan_name: plan?.display_name || null } : u
        )
      );

      toast({ title: "Sucesso", description: `Plano atualizado para ${plan?.display_name}` });
    } catch (error) {
      console.error("Erro ao alterar plano:", error);
      toast({ title: "Erro", description: "Não foi possível alterar o plano", variant: "destructive" });
    }
  };

  const updateUserStatus = async (user: UserWithWedding, newStatus: string, reason?: string) => {
    setActionLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("profiles")
        .update({
          status: newStatus,
          status_reason: reason || null,
          status_changed_at: new Date().toISOString(),
          status_changed_by: currentUser?.id || null,
        })
        .eq("user_id", user.user_id);

      if (error) throw error;

      if (newStatus === "blocked") {
        const { error: banError } = await supabase.functions.invoke("admin-manage-user", {
          body: { action: "ban", target_user_id: user.user_id },
        });
        if (banError) console.error("Ban error:", banError);
      }

      if (newStatus === "active" && user.status === "blocked") {
        const { error: unbanError } = await supabase.functions.invoke("admin-manage-user", {
          body: { action: "unban", target_user_id: user.user_id },
        });
        if (unbanError) console.error("Unban error:", unbanError);
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === user.user_id ? { ...u, status: newStatus, status_reason: reason || null } : u
        )
      );

      const statusLabels: Record<string, string> = {
        active: "ativado",
        suspended: "suspenso",
        blocked: "bloqueado",
      };

      toast({ title: "Sucesso", description: `Utilizador ${statusLabels[newStatus] || newStatus}` });
    } catch (error) {
      console.error("Erro ao atualizar estado:", error);
      toast({ title: "Erro", description: "Não foi possível atualizar o estado", variant: "destructive" });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
      setConfirmText("");
    }
  };

  const deleteUser = async (user: UserWithWedding) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-user", {
        body: { action: "delete", target_user_id: user.user_id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setUsers((prev) => prev.filter((u) => u.user_id !== user.user_id));
      toast({ title: "Utilizador eliminado", description: "Todos os dados foram removidos (RGPD)." });
    } catch (error: any) {
      console.error("Erro ao eliminar utilizador:", error);
      toast({ title: "Erro", description: error.message || "Não foi possível eliminar o utilizador", variant: "destructive" });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
      setConfirmText("");
    }
  };

  const handleUpdateEmail = async () => {
    if (!emailDialogUser || !newEmail.trim()) return;
    setEmailLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-user", {
        body: { action: "update_email", target_user_id: emailDialogUser.user_id, new_email: newEmail.trim() },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === emailDialogUser.user_id ? { ...u, email: newEmail.trim() } : u
        )
      );

      toast({ title: "Email atualizado", description: `Email alterado para ${newEmail.trim()}` });
      setEmailDialogUser(null);
      setNewEmail("");
    } catch (error: any) {
      console.error("Erro ao atualizar email:", error);
      toast({ title: "Erro", description: error.message || "Não foi possível atualizar o email", variant: "destructive" });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editProfileUser) return;
    setEditProfileLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: editFirstName.trim() || null,
          last_name: editLastName.trim() || null,
          phone: editPhone.trim() || null,
          preferred_language: editLanguage,
        })
        .eq("user_id", editProfileUser.user_id);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === editProfileUser.user_id
            ? { ...u, first_name: editFirstName.trim() || null, last_name: editLastName.trim() || null, phone: editPhone.trim() || null, preferred_language: editLanguage }
            : u
        )
      );

      toast({ title: "Perfil atualizado" });
      setEditProfileUser(null);
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast({ title: "Erro", description: error.message || "Não foi possível atualizar o perfil", variant: "destructive" });
    } finally {
      setEditProfileLoading(false);
    }
  };

  const openEditProfile = (user: UserWithWedding) => {
    setEditProfileUser(user);
    setEditFirstName(user.first_name || "");
    setEditLastName(user.last_name || "");
    setEditPhone(user.phone || "");
    setEditLanguage(user.preferred_language || "pt");
  };

  const handleGenerateResetLink = async (user: UserWithWedding) => {
    setResetLoading(user.user_id);
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-user", {
        body: { action: "generate_reset_link", target_user_id: user.user_id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResetLinkDialog({ user, link: data.reset_link, email: data.email });
    } catch (error: any) {
      console.error("Erro ao gerar link:", error);
      toast({ title: "Erro", description: error.message || "Não foi possível gerar o link de redefinição", variant: "destructive" });
    } finally {
      setResetLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "Link copiado para a área de transferência" });
  };

  const handleConfirm = () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case "suspend":
        updateUserStatus(confirmAction.user, "suspended", "Suspenso pelo administrador");
        break;
      case "activate":
        updateUserStatus(confirmAction.user, "active");
        break;
      case "block":
        updateUserStatus(confirmAction.user, "blocked", "Bloqueado pelo administrador");
        break;
      case "unblock":
        updateUserStatus(confirmAction.user, "active");
        break;
      case "delete":
        deleteUser(confirmAction.user);
        break;
    }
  };

  const getConfirmConfig = (action: ConfirmAction) => {
    const name = [action.user.first_name, action.user.last_name].filter(Boolean).join(" ") || action.user.email || "Utilizador";
    switch (action.type) {
      case "suspend":
        return {
          title: "Suspender Utilizador",
          description: `Tem a certeza que deseja suspender "${name}"? O utilizador não poderá aceder à plataforma enquanto estiver suspenso.`,
          confirmWord: "",
          buttonLabel: "Suspender",
          variant: "secondary" as const,
        };
      case "activate":
        return {
          title: "Ativar Utilizador",
          description: `Reativar o acesso de "${name}" à plataforma?`,
          confirmWord: "",
          buttonLabel: "Ativar",
          variant: "default" as const,
        };
      case "block":
        return {
          title: "Bloquear Utilizador",
          description: `Tem a certeza que deseja bloquear "${name}"? O utilizador será banido da plataforma e não poderá iniciar sessão.`,
          confirmWord: "",
          buttonLabel: "Bloquear",
          variant: "destructive" as const,
        };
      case "unblock":
        return {
          title: "Desbloquear Utilizador",
          description: `Desbloquear "${name}" e permitir o acesso novamente?`,
          confirmWord: "",
          buttonLabel: "Desbloquear",
          variant: "default" as const,
        };
      case "delete":
        return {
          title: "⚠️ Eliminar Utilizador (RGPD)",
          description: `ATENÇÃO: Esta ação é IRREVERSÍVEL. Todos os dados de "${name}" serão permanentemente eliminados: perfil, eventos, convidados, orçamento, cronograma, fotos e conta de autenticação. Escreva APAGAR para confirmar.`,
          confirmWord: "APAGAR",
          buttonLabel: "Eliminar Permanentemente",
          variant: "destructive" as const,
        };
    }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.wedding_name?.toLowerCase().includes(q) ||
      u.status.toLowerCase().includes(q)
    );
  });

  const activeCount = users.filter((u) => u.status === "active").length;
  const suspendedCount = users.filter((u) => u.status === "suspended").length;
  const blockedCount = users.filter((u) => u.status === "blocked").length;

  if (loading) {
    return <div className="text-muted-foreground">Carregando...</div>;
  }

  const config = confirmAction ? getConfirmConfig(confirmAction) : null;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
            <UserCheck className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suspensos</CardTitle>
            <UserX className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{suspendedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bloqueados</CardTitle>
            <ShieldBan className="w-5 h-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{blockedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Utilizadores</CardTitle>
              <CardDescription>{users.length} utilizadores registados</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, email, estado..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Idioma</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Nenhum utilizador encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((user) => {
                    const statusCfg = STATUS_CONFIG[user.status] || STATUS_CONFIG.active;
                    const langLabel = LANGUAGES.find(l => l.value === user.preferred_language)?.label || user.preferred_language || "—";
                    return (
                      <TableRow key={user.id} className={user.status !== "active" ? "opacity-70" : ""}>
                        <TableCell className="font-medium">
                          {[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}
                        </TableCell>
                        <TableCell className="text-sm">{user.email || "—"}</TableCell>
                        <TableCell>
                          {user.wedding_name ? (
                            <span className="text-sm">{user.wedding_name}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">Sem evento</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.wedding_id ? (
                            <Select
                              value={user.plan_id || ""}
                              onValueChange={(value) => changePlan(user, value)}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue placeholder="Sem plano" />
                              </SelectTrigger>
                              <SelectContent>
                                {plans.map((plan) => (
                                  <SelectItem key={plan.id} value={plan.id}>{plan.display_name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{langLabel}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusCfg.variant} className="text-xs">
                            {statusCfg.label}
                          </Badge>
                          {user.status_reason && (
                            <p className="text-xs text-muted-foreground mt-0.5 max-w-[120px] truncate" title={user.status_reason}>
                              {user.status_reason}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(user.created_at), "dd MMM yyyy", { locale: pt })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {/* Profile edit */}
                              <DropdownMenuItem onClick={() => openEditProfile(user)}>
                                <Pencil className="w-4 h-4 mr-2" /> Editar Perfil
                              </DropdownMenuItem>
                              {/* Email & Password support actions */}
                              <DropdownMenuItem onClick={() => { setEmailDialogUser(user); setNewEmail(user.email || ""); }}>
                                <Mail className="w-4 h-4 mr-2" /> Alterar Email
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleGenerateResetLink(user)}
                                disabled={resetLoading === user.user_id}
                              >
                                <KeyRound className="w-4 h-4 mr-2" />
                                {resetLoading === user.user_id ? "A gerar..." : "Gerar Link Redefinição Senha"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />

                              {/* Status actions */}
                              {user.status === "active" && (
                                <DropdownMenuItem onClick={() => setConfirmAction({ type: "suspend", user })}>
                                  <UserX className="w-4 h-4 mr-2" /> Suspender
                                </DropdownMenuItem>
                              )}
                              {user.status === "suspended" && (
                                <DropdownMenuItem onClick={() => setConfirmAction({ type: "activate", user })}>
                                  <UserCheck className="w-4 h-4 mr-2" /> Reativar
                                </DropdownMenuItem>
                              )}
                              {user.status !== "blocked" && (
                                <DropdownMenuItem onClick={() => setConfirmAction({ type: "block", user })}>
                                  <ShieldBan className="w-4 h-4 mr-2" /> Bloquear
                                </DropdownMenuItem>
                              )}
                              {user.status === "blocked" && (
                                <DropdownMenuItem onClick={() => setConfirmAction({ type: "unblock", user })}>
                                  <ShieldCheck className="w-4 h-4 mr-2" /> Desbloquear
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setConfirmAction({ type: "delete", user })}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Eliminar (RGPD)
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => { setConfirmAction(null); setConfirmText(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {config?.variant === "destructive" && <AlertTriangle className="w-5 h-5 text-destructive" />}
              {config?.title}
            </DialogTitle>
            <DialogDescription>{config?.description}</DialogDescription>
          </DialogHeader>

          {config?.confirmWord && (
            <div className="py-2">
              <Input
                placeholder={`Escreva "${config.confirmWord}" para confirmar`}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setConfirmAction(null); setConfirmText(""); }}>
              Cancelar
            </Button>
            <Button
              variant={config?.variant === "destructive" ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={actionLoading || (!!config?.confirmWord && confirmText !== config.confirmWord)}
            >
              {actionLoading ? "A processar..." : config?.buttonLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Email Dialog */}
      <Dialog open={!!emailDialogUser} onOpenChange={() => { setEmailDialogUser(null); setNewEmail(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" /> Alterar Email
            </DialogTitle>
            <DialogDescription>
              Alterar o email de {[emailDialogUser?.first_name, emailDialogUser?.last_name].filter(Boolean).join(" ") || "utilizador"}.
              O novo email será confirmado automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm text-muted-foreground">Email atual</Label>
              <p className="text-sm font-medium">{emailDialogUser?.email || "—"}</p>
            </div>
            <div>
              <Label htmlFor="new-email">Novo email</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="novo@email.com"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setEmailDialogUser(null); setNewEmail(""); }}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateEmail}
              disabled={emailLoading || !newEmail.trim() || newEmail.trim() === emailDialogUser?.email}
            >
              {emailLoading ? "A atualizar..." : "Atualizar Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={!!editProfileUser} onOpenChange={() => setEditProfileUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" /> Editar Perfil
            </DialogTitle>
            <DialogDescription>
              Editar dados de {[editProfileUser?.first_name, editProfileUser?.last_name].filter(Boolean).join(" ") || editProfileUser?.email || "utilizador"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-first-name">Primeiro Nome</Label>
                <Input
                  id="edit-first-name"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  placeholder="Nome"
                />
              </div>
              <div>
                <Label htmlFor="edit-last-name">Apelido</Label>
                <Input
                  id="edit-last-name"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  placeholder="Apelido"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+351 900 000 000"
              />
            </div>
            <div>
              <Label htmlFor="edit-language">Idioma Preferido</Label>
              <Select value={editLanguage} onValueChange={setEditLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditProfileUser(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateProfile} disabled={editProfileLoading}>
              {editProfileLoading ? "A guardar..." : "Guardar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Link Dialog */}
      <Dialog open={!!resetLinkDialog} onOpenChange={() => setResetLinkDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" /> Link de Redefinição de Senha
            </DialogTitle>
            <DialogDescription>
              Link gerado para <strong>{resetLinkDialog?.email}</strong>. Copie e envie ao utilizador para que possa redefinir a senha.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="p-3 rounded-lg border bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1 font-medium">Link de redefinição:</p>
              <p className="text-xs break-all font-mono select-all">{resetLinkDialog?.link}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => resetLinkDialog && copyToClipboard(resetLinkDialog.link)}
              >
                <Copy className="w-4 h-4 mr-2" /> Copiar Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => resetLinkDialog && window.open(resetLinkDialog.link, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" /> Abrir Link
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              ⚠️ Este link expira em 30 minutos. O utilizador terá de confirmar o seu email antes de redefinir a senha. Envie-o de forma segura.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={() => setResetLinkDialog(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, Trash2, MoreHorizontal, AlertTriangle, Calendar, CalendarOff, Users, ChevronDown, ChevronUp, Ban, RefreshCw } from "lucide-react";
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

interface Collaborator {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  is_suspended: boolean;
  profiles: { first_name: string | null; last_name: string | null; email: string | null } | null;
}

interface WeddingEvent {
  id: string;
  user_id: string;
  couple_name: string | null;
  partner_name: string | null;
  wedding_date: string | null;
  guest_count: number | null;
  is_active: boolean;
  is_setup_complete: boolean | null;
  event_code: string;
  created_at: string;
  plan_name: string | null;
  plan_id: string | null;
  subscription_id: string | null;
}

interface Plan {
  id: string;
  display_name: string;
  name: string;
}

export const AdminEventsManager = () => {
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<WeddingEvent | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [collabLoading, setCollabLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const loadCollaborators = async (weddingId: string) => {
    if (expandedEvent === weddingId) {
      setExpandedEvent(null);
      return;
    }
    setExpandedEvent(weddingId);
    setCollabLoading(true);
    try {
      const { data, error } = await supabase
        .from("wedding_collaborators")
        .select("id, user_id, role, joined_at, is_suspended, wedding_id")
        .eq("wedding_id", weddingId);
      if (error) throw error;
      // Fetch profiles separately
      const userIds = (data || []).map(c => c.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, first_name, last_name, email").in("user_id", userIds);
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      const enriched = (data || []).map(c => ({ ...c, profiles: profileMap.get(c.user_id) || null }));
      setCollaborators(enriched);
    } catch {
      toast({ title: "Erro ao carregar colaboradores", variant: "destructive" });
    } finally {
      setCollabLoading(false);
    }
  };

  const toggleSuspend = async (collab: Collaborator) => {
    const newState = !collab.is_suspended;
    const { error } = await supabase.from("wedding_collaborators").update({ is_suspended: newState }).eq("id", collab.id);
    if (error) { toast({ title: "Erro", variant: "destructive" }); return; }
    setCollaborators(prev => prev.map(c => c.id === collab.id ? { ...c, is_suspended: newState } : c));
    toast({ title: newState ? "Colaborador suspenso" : "Colaborador reativado" });
  };

  const removeCollab = async (collab: Collaborator) => {
    const { error } = await supabase.from("wedding_collaborators").delete().eq("id", collab.id);
    if (error) { toast({ title: "Erro ao remover", variant: "destructive" }); return; }
    setCollaborators(prev => prev.filter(c => c.id !== collab.id));
    toast({ title: "Colaborador removido" });
  };

  const fetchData = async () => {
    try {
      const [weddingsRes, subsRes, plansRes] = await Promise.all([
        supabase.from("wedding_data").select("*").order("created_at", { ascending: false }),
        supabase.from("wedding_subscriptions").select("id, wedding_id, plan_id, subscription_plans(display_name)"),
        supabase.from("subscription_plans").select("id, display_name, name").order("sort_order"),
      ]);

      if (weddingsRes.error) throw weddingsRes.error;

      const subMap = new Map<string, { plan_name: string; plan_id: string; subscription_id: string }>();
      (subsRes.data || []).forEach((s: any) => {
        subMap.set(s.wedding_id, {
          plan_name: s.subscription_plans?.display_name || "—",
          plan_id: s.plan_id,
          subscription_id: s.id,
        });
      });

      const enriched: WeddingEvent[] = (weddingsRes.data || []).map((w: any) => {
        const sub = subMap.get(w.id);
        return {
          ...w,
          is_active: w.is_active !== false,
          plan_name: sub?.plan_name || null,
          plan_id: sub?.plan_id || null,
          subscription_id: sub?.subscription_id || null,
        };
      });

      setEvents(enriched);
      setPlans(plansRes.data || []);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      toast({ title: "Erro", description: "Não foi possível carregar os eventos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (event: WeddingEvent) => {
    try {
      const { error } = await supabase
        .from("wedding_data")
        .update({ is_active: !event.is_active })
        .eq("id", event.id);

      if (error) throw error;

      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, is_active: !e.is_active } : e))
      );

      toast({ title: "Sucesso", description: `Evento ${!event.is_active ? "ativado" : "desativado"}` });
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      toast({ title: "Erro", description: "Não foi possível atualizar o evento", variant: "destructive" });
    }
  };

  const changePlan = async (event: WeddingEvent, planId: string) => {
    try {
      if (event.subscription_id) {
        const { error } = await supabase
          .from("wedding_subscriptions")
          .update({ plan_id: planId })
          .eq("id", event.subscription_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("wedding_subscriptions")
          .insert({ wedding_id: event.id, plan_id: planId });
        if (error) throw error;
      }

      const plan = plans.find((p) => p.id === planId);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, plan_id: planId, plan_name: plan?.display_name || null } : e
        )
      );

      toast({ title: "Sucesso", description: `Plano atualizado para ${plan?.display_name}` });
    } catch (error) {
      console.error("Erro ao alterar plano:", error);
      toast({ title: "Erro", description: "Não foi possível alterar o plano", variant: "destructive" });
    }
  };

  const deleteEvent = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const { error } = await supabase.rpc("admin_delete_wedding_cascade", {
        _wedding_id: deleteTarget.id,
      });

      if (error) throw error;

      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast({ title: "Evento eliminado", description: "Todos os dados do evento foram removidos permanentemente." });
    } catch (error: any) {
      console.error("Erro ao eliminar evento:", error);
      toast({ title: "Erro", description: error.message || "Não foi possível eliminar o evento", variant: "destructive" });
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
      setConfirmText("");
    }
  };

  const getEventLabel = (e: WeddingEvent) =>
    [e.partner_name, e.couple_name].filter(Boolean).join(" & ") || "Sem nome";

  const filtered = events.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.couple_name?.toLowerCase().includes(q) ||
      e.partner_name?.toLowerCase().includes(q) ||
      e.event_code?.toLowerCase().includes(q)
    );
  });

  const activeCount = events.filter((e) => e.is_active).length;

  if (loading) {
    return <div className="text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Eventos criados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
            <Calendar className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inativos</CardTitle>
            <CalendarOff className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground">{events.length - activeCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Eventos</CardTitle>
              <CardDescription>{events.length} eventos · {activeCount} ativos</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome ou código..."
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
                  <TableHead>Casal</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Convidados</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nenhum evento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((event) => (
                    <React.Fragment key={event.id}>
                    <TableRow className={!event.is_active ? "opacity-60" : ""}>
                      <TableCell className="font-medium">{getEventLabel(event)}</TableCell>
                      <TableCell>
                        {event.wedding_date
                          ? format(new Date(event.wedding_date), "dd MMM yyyy", { locale: pt })
                          : "—"}
                      </TableCell>
                      <TableCell>{event.guest_count ?? "—"}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{event.event_code}</code>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={event.plan_id || ""}
                          onValueChange={(value) => changePlan(event, value)}
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
                      </TableCell>
                      <TableCell>
                        <Switch checked={event.is_active} onCheckedChange={() => toggleActive(event)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => loadCollaborators(event.id)}>
                              <Users className="w-4 h-4 mr-2" /> Gerir Colaboradores
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleActive(event)}>
                              {event.is_active ? (
                                <><CalendarOff className="w-4 h-4 mr-2" /> Desativar</>
                              ) : (
                                <><Calendar className="w-4 h-4 mr-2" /> Ativar</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(event)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Eliminar Evento
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {/* Collaborators expandable row */}
                    {expandedEvent === event.id && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/30 p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Users className="w-4 h-4" /> Colaboradores
                              </h4>
                              <Button variant="ghost" size="sm" onClick={() => setExpandedEvent(null)}>
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                            </div>
                            {collabLoading ? (
                              <p className="text-sm text-muted-foreground">Carregando...</p>
                            ) : collaborators.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Nenhum colaborador</p>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Papel</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {collaborators.map(c => (
                                    <TableRow key={c.id} className={c.is_suspended ? "opacity-60" : ""}>
                                      <TableCell className="text-sm font-medium">
                                        {c.profiles ? `${c.profiles.first_name || ""} ${c.profiles.last_name || ""}`.trim() || "—" : "—"}
                                      </TableCell>
                                      <TableCell className="text-sm">{c.profiles?.email || "—"}</TableCell>
                                      <TableCell><Badge variant="outline" className="text-xs capitalize">{c.role}</Badge></TableCell>
                                      <TableCell>
                                        <Badge variant={c.is_suspended ? "destructive" : "default"} className="text-xs">
                                          {c.is_suspended ? "Suspenso" : "Ativo"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                          <Button variant="ghost" size="sm" onClick={() => toggleSuspend(c)} title={c.is_suspended ? "Reativar" : "Suspender"}>
                                            {c.is_suspended ? <RefreshCw className="w-4 h-4" /> : <Ban className="w-4 h-4 text-muted-foreground" />}
                                          </Button>
                                          <Button variant="ghost" size="sm" onClick={() => removeCollab(c)} title="Remover">
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => { setDeleteTarget(null); setConfirmText(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Eliminar Evento Permanentemente
            </DialogTitle>
            <DialogDescription>
              ATENÇÃO: Esta ação é IRREVERSÍVEL. Todos os dados do evento "{deleteTarget ? getEventLabel(deleteTarget) : ""}" serão permanentemente eliminados: convidados, orçamento, cronograma, fotos, landing page, domínios e colaboradores. Escreva <strong>APAGAR</strong> para confirmar.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Input
              placeholder='Escreva "APAGAR" para confirmar'
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setDeleteTarget(null); setConfirmText(""); }}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={deleteEvent}
              disabled={deleteLoading || confirmText !== "APAGAR"}
            >
              {deleteLoading ? "A eliminar..." : "Eliminar Permanentemente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

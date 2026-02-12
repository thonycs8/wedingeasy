import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Search, ArrowLeft, Save, Users, DollarSign, Clock, CheckSquare, Heart, UserPlus,
  CreditCard, Pencil, Plus, Trash2, RefreshCw, CalendarDays
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WeddingItem {
  id: string;
  couple_name: string | null;
  partner_name: string | null;
  wedding_date: string | null;
  event_code: string;
  estimated_budget: number | null;
  guest_count: number | null;
  style: string | null;
  region: string | null;
  is_active: boolean | null;
}

export const AdminEventSupport = () => {
  const [weddings, setWeddings] = useState<WeddingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<WeddingItem | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Sub-tab data
  const [guests, setGuests] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [choices, setChoices] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [editDetails, setEditDetails] = useState<WeddingItem | null>(null);

  useEffect(() => { fetchWeddings(); }, []);

  const fetchWeddings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("wedding_data")
        .select("id, couple_name, partner_name, wedding_date, event_code, estimated_budget, guest_count, style, region, is_active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setWeddings(data || []);
    } catch {
      toast({ title: "Erro ao carregar casamentos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const selectWedding = async (w: WeddingItem) => {
    setSelected(w);
    setEditDetails({ ...w });
    // Load all sub-data in parallel
    const [gRes, cRes, eRes, tRes, chRes, colRes, subRes, plRes] = await Promise.all([
      supabase.from("guests").select("*").eq("wedding_id", w.id).order("name"),
      supabase.from("budget_categories").select("*").eq("wedding_id", w.id).order("name"),
      supabase.from("budget_expenses").select("*, budget_categories(name, color)").eq("wedding_id", w.id).order("date", { ascending: false }),
      supabase.from("timeline_tasks").select("*").eq("wedding_id", w.id).order("due_date"),
      supabase.from("wedding_choices").select("*").eq("wedding_id", w.id).order("category"),
      supabase.from("wedding_collaborators").select("*, profiles:user_id(first_name, last_name, email)").eq("wedding_id", w.id),
      supabase.from("wedding_subscriptions").select("*, subscription_plans(name, display_name)").eq("wedding_id", w.id).maybeSingle(),
      supabase.from("subscription_plans").select("*").eq("is_active", true).order("sort_order"),
    ]);
    setGuests(gRes.data || []);
    setCategories(cRes.data || []);
    setExpenses(eRes.data || []);
    setTasks(tRes.data || []);
    setChoices(chRes.data || []);
    setCollaborators(colRes.data || []);
    setSubscription(subRes.data);
    setPlans(plRes.data || []);
  };

  const saveDetails = async () => {
    if (!editDetails || !selected) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("wedding_data").update({
        couple_name: editDetails.couple_name,
        partner_name: editDetails.partner_name,
        wedding_date: editDetails.wedding_date,
        estimated_budget: editDetails.estimated_budget,
        guest_count: editDetails.guest_count,
        style: editDetails.style,
        region: editDetails.region,
      }).eq("id", selected.id);
      if (error) throw error;
      setSelected({ ...editDetails });
      toast({ title: "Detalhes guardados!" });
    } catch {
      toast({ title: "Erro ao guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    const { error } = await supabase.from("timeline_tasks").update({
      completed, completed_date: completed ? new Date().toISOString().split("T")[0] : null,
    }).eq("id", taskId);
    if (error) { toast({ title: "Erro", variant: "destructive" }); return; }
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed, completed_date: completed ? new Date().toISOString().split("T")[0] : null } : t));
  };

  const toggleGuestConfirmation = async (guestId: string, confirmed: boolean) => {
    const { error } = await supabase.from("guests").update({ confirmed }).eq("id", guestId);
    if (error) { toast({ title: "Erro", variant: "destructive" }); return; }
    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, confirmed } : g));
  };

  const changePlan = async (planId: string) => {
    if (!selected) return;
    try {
      if (subscription) {
        const { error } = await supabase.from("wedding_subscriptions").update({ plan_id: planId }).eq("id", subscription.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("wedding_subscriptions").insert({ wedding_id: selected.id, plan_id: planId });
        if (error) throw error;
      }
      toast({ title: "Plano atualizado!" });
      selectWedding(selected);
    } catch {
      toast({ title: "Erro ao mudar plano", variant: "destructive" });
    }
  };

  const getCoupleLabel = (w: WeddingItem) => [w.partner_name, w.couple_name].filter(Boolean).join(" & ") || "Sem nome";

  const filteredWeddings = weddings.filter(w => {
    if (!search) return true;
    const q = search.toLowerCase();
    return getCoupleLabel(w).toLowerCase().includes(q) || w.event_code.toLowerCase().includes(q);
  });

  if (loading) return <div className="text-muted-foreground">Carregando...</div>;

  // Wedding list view
  if (!selected) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Suporte ao Evento</h3>
          <p className="text-sm text-muted-foreground">Selecione um casamento para gerir todos os seus dados</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar por casal ou código..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" size="sm" onClick={fetchWeddings}><RefreshCw className="w-4 h-4 mr-1" /> Atualizar</Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Casal</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWeddings.map(w => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{getCoupleLabel(w)}</TableCell>
                    <TableCell>{w.wedding_date ? new Date(w.wedding_date).toLocaleDateString("pt-PT") : "—"}</TableCell>
                    <TableCell><code className="text-xs bg-muted px-2 py-0.5 rounded">{w.event_code}</code></TableCell>
                    <TableCell><Badge variant={w.is_active ? "default" : "outline"}>{w.is_active ? "Ativo" : "Inativo"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => selectWedding(w)}>Gerir</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Wedding detail view
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setSelected(null)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div>
          <h3 className="text-lg font-semibold">{getCoupleLabel(selected)}</h3>
          <p className="text-sm text-muted-foreground">Código: {selected.event_code}</p>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="details" className="text-xs"><Heart className="w-3 h-3 mr-1" /> Detalhes</TabsTrigger>
          <TabsTrigger value="guests" className="text-xs"><Users className="w-3 h-3 mr-1" /> Convidados ({guests.length})</TabsTrigger>
          <TabsTrigger value="budget" className="text-xs"><DollarSign className="w-3 h-3 mr-1" /> Orçamento</TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs"><Clock className="w-3 h-3 mr-1" /> Cronograma ({tasks.length})</TabsTrigger>
          <TabsTrigger value="choices" className="text-xs"><CheckSquare className="w-3 h-3 mr-1" /> Escolhas ({choices.length})</TabsTrigger>
          <TabsTrigger value="collaborators" className="text-xs"><UserPlus className="w-3 h-3 mr-1" /> Colaboradores ({collaborators.length})</TabsTrigger>
          <TabsTrigger value="subscription" className="text-xs"><CreditCard className="w-3 h-3 mr-1" /> Subscrição</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          {editDetails && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome (Noivo/a)</Label>
                    <Input value={editDetails.couple_name || ""} onChange={(e) => setEditDetails({ ...editDetails, couple_name: e.target.value || null })} />
                  </div>
                  <div>
                    <Label>Nome (Parceiro/a)</Label>
                    <Input value={editDetails.partner_name || ""} onChange={(e) => setEditDetails({ ...editDetails, partner_name: e.target.value || null })} />
                  </div>
                  <div>
                    <Label>Data do Casamento</Label>
                    <Input type="date" value={editDetails.wedding_date || ""} onChange={(e) => setEditDetails({ ...editDetails, wedding_date: e.target.value || null })} />
                  </div>
                  <div>
                    <Label>Orçamento Estimado</Label>
                    <Input type="number" value={editDetails.estimated_budget || ""} onChange={(e) => setEditDetails({ ...editDetails, estimated_budget: Number(e.target.value) || null })} />
                  </div>
                  <div>
                    <Label>Nº Convidados</Label>
                    <Input type="number" value={editDetails.guest_count || ""} onChange={(e) => setEditDetails({ ...editDetails, guest_count: Number(e.target.value) || null })} />
                  </div>
                  <div>
                    <Label>Estilo</Label>
                    <Input value={editDetails.style || ""} onChange={(e) => setEditDetails({ ...editDetails, style: e.target.value || null })} />
                  </div>
                  <div>
                    <Label>Região</Label>
                    <Input value={editDetails.region || ""} onChange={(e) => setEditDetails({ ...editDetails, region: e.target.value || null })} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={saveDetails} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" /> {saving ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Guests Tab */}
        <TabsContent value="guests">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Lado</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Confirmado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map(g => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.name}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{g.category}</Badge></TableCell>
                      <TableCell className="text-sm capitalize">{g.side || "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(g.special_role || []).map((r: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{r}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch checked={g.confirmed || false} onCheckedChange={(v) => toggleGuestConfirmation(g.id, v)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Orçamentado</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">€{categories.reduce((s: number, c: any) => s + (c.budgeted_amount || 0), 0).toLocaleString()}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Gasto</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">€{categories.reduce((s: number, c: any) => s + (c.spent_amount || 0), 0).toLocaleString()}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Categorias</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{categories.length}</div></CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Orçamentado</TableHead>
                      <TableHead>Gasto</TableHead>
                      <TableHead>Diferença</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                            <span className="font-medium">{c.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>€{(c.budgeted_amount || 0).toLocaleString()}</TableCell>
                        <TableCell>€{(c.spent_amount || 0).toLocaleString()}</TableCell>
                        <TableCell className={(c.budgeted_amount || 0) - (c.spent_amount || 0) < 0 ? "text-red-500" : "text-green-600"}>
                          €{((c.budgeted_amount || 0) - (c.spent_amount || 0)).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarefa</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Concluída</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((t: any) => (
                    <TableRow key={t.id} className={t.completed ? "opacity-60" : ""}>
                      <TableCell>
                        <div>
                          <p className={`font-medium ${t.completed ? "line-through" : ""}`}>{t.title}</p>
                          {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(t.due_date).toLocaleDateString("pt-PT")}</TableCell>
                      <TableCell>
                        <Badge variant={t.priority === "alta" ? "destructive" : t.priority === "media" ? "default" : "secondary"} className="text-xs">
                          {t.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch checked={t.completed} onCheckedChange={(v) => toggleTask(t.id, v)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Choices Tab */}
        <TabsContent value="choices">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Decisão</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Opções</TableHead>
                    <TableHead>Selecionado</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {choices.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{c.category}</Badge></TableCell>
                      <TableCell className="text-sm">{(c.options || []).join(", ") || "—"}</TableCell>
                      <TableCell className="text-sm font-medium">{c.selected || "—"}</TableCell>
                      <TableCell><Badge variant={c.status === "decided" ? "default" : "outline"} className="text-xs">{c.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collaborators Tab */}
        <TabsContent value="collaborators">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Desde</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collaborators.map((c: any) => {
                    const profile = c.profiles;
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">
                          {profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "—" : "—"}
                        </TableCell>
                        <TableCell className="text-sm">{profile?.email || "—"}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs capitalize">{c.role}</Badge></TableCell>
                        <TableCell className="text-sm">{new Date(c.joined_at).toLocaleDateString("pt-PT")}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Plano Atual</Label>
                <p className="text-lg font-semibold mt-1">
                  {subscription?.subscription_plans?.display_name || "Sem subscrição"}
                </p>
                {subscription && (
                  <p className="text-sm text-muted-foreground">
                    Estado: {subscription.status} • Desde: {new Date(subscription.starts_at).toLocaleDateString("pt-PT")}
                  </p>
                )}
              </div>
              <div>
                <Label>Mudar Plano</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                  {plans.map((p: any) => (
                    <Card
                      key={p.id}
                      className={`cursor-pointer transition-colors ${subscription?.plan_id === p.id ? "border-primary" : "hover:border-primary/50"}`}
                      onClick={() => changePlan(p.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <p className="font-semibold">{p.display_name}</p>
                        <p className="text-sm text-muted-foreground">€{p.price || 0}/mês</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {p.max_guests} convidados • {p.max_collaborators} colaboradores
                        </p>
                        {subscription?.plan_id === p.id && (
                          <Badge variant="default" className="mt-2 text-xs">Atual</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

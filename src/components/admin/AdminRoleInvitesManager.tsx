import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, RefreshCw, Copy, ExternalLink, Heart, Crown, Star, Eye, Link2, Save, Pencil, Plus, Trash2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPublicBaseUrl } from "@/utils/getPublicBaseUrl";
import { encodeInviteToken } from "@/utils/inviteToken";

interface GuestWithRole {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  special_role: string[];
  side: string | null;
  confirmed: boolean | null;
  couple_pair_id: string | null;
  wedding_id: string;
  category: string;
  wedding_data: {
    couple_name: string | null;
    partner_name: string | null;
    event_code: string;
    wedding_date: string | null;
    is_active: boolean | null;
  } | null;
}

interface RoleInviteConfig {
  id?: string;
  wedding_id: string;
  role_key: string;
  icon_name: string;
  label: string | null;
  invite_message: string | null;
  accept_message: string | null;
  family_message: string | null;
  theme_color_override: string | null;
  accept_button_text: string;
  show_accept_button: boolean;
  show_celebration: boolean;
}

const AVAILABLE_ROLES = [
  "padrinho", "madrinha", "celebrante", "dama de honor", "pajem", "florista",
  "portador das alianças", "convidado de honra", "amigo do noivo", "amiga da noiva",
  "pai do noivo", "mãe do noivo", "pai da noiva", "mãe da noiva", "irmão(ã)"
];

const ICON_OPTIONS = ["Crown", "Star", "Heart", "Users", "Sparkles", "Baby", "Mic", "Flower2", "Shield"];

const normalizeSlug = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "-");

function generateInviteLink(eventCode: string, guestName: string, roles: string[]) {
  const roleSlug = roles.map(r => normalizeSlug(r).replace(/-/g, " ")).join(",");
  const guestSlug = normalizeSlug(guestName);
  const token = encodeInviteToken(roleSlug, guestSlug);
  return `${getPublicBaseUrl()}/evento/${eventCode}?invite=${token}`;
}

function generateCoupleInviteLink(eventCode: string, g1: GuestWithRole, g2: GuestWithRole) {
  const roles1 = g1.special_role.map(r => normalizeSlug(r).replace(/-/g, " ")).join(",");
  const roles2 = g2.special_role.map(r => normalizeSlug(r).replace(/-/g, " ")).join(",");
  const guest1 = normalizeSlug(g1.name);
  const guest2 = normalizeSlug(g2.name);
  const token = encodeInviteToken(`${roles1},${roles2}`, `${guest1},${guest2}`);
  return `${getPublicBaseUrl()}/evento/${eventCode}?invite=${token}`;
}

export const AdminRoleInvitesManager = () => {
  const [guests, setGuests] = useState<GuestWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<GuestWithRole | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string | null>(null);
  const [roleConfigs, setRoleConfigs] = useState<RoleInviteConfig[]>([]);
  const [editConfig, setEditConfig] = useState<RoleInviteConfig | null>(null);
  const { toast } = useToast();

  useEffect(() => { fetchGuests(); }, []);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("id, name, email, phone, special_role, side, confirmed, couple_pair_id, wedding_id, category, wedding_data:wedding_id(couple_name, partner_name, event_code, wedding_date, is_active)")
        .not("special_role", "is", null)
        .order("name", { ascending: true });
      if (error) throw error;
      const filtered = ((data as unknown as GuestWithRole[]) || []).filter(
        (g) => g.special_role && g.special_role.length > 0
      );
      setGuests(filtered);
    } catch (error) {
      console.error("Erro ao carregar convites por papel:", error);
      toast({ title: "Erro", description: "Não foi possível carregar os dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleConfigs = async (weddingId: string) => {
    const { data } = await supabase
      .from("wedding_role_invite_config")
      .select("*")
      .eq("wedding_id", weddingId);
    setRoleConfigs((data as RoleInviteConfig[]) || []);
  };

  const saveGuest = async () => {
    if (!selectedGuest) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("guests")
        .update({
          name: selectedGuest.name,
          special_role: selectedGuest.special_role,
          side: selectedGuest.side,
          confirmed: selectedGuest.confirmed,
          couple_pair_id: selectedGuest.couple_pair_id || null,
        })
        .eq("id", selectedGuest.id);
      if (error) throw error;
      setGuests(prev => prev.map(g => g.id === selectedGuest.id ? selectedGuest : g));
      toast({ title: "Guardado!", description: "Convidado atualizado com sucesso." });
      setEditOpen(false);
    } catch {
      toast({ title: "Erro ao guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveRoleConfig = async () => {
    if (!editConfig) return;
    setSaving(true);
    try {
      const payload = {
        wedding_id: editConfig.wedding_id,
        role_key: editConfig.role_key,
        icon_name: editConfig.icon_name,
        label: editConfig.label,
        invite_message: editConfig.invite_message,
        accept_message: editConfig.accept_message,
        family_message: editConfig.family_message,
        theme_color_override: editConfig.theme_color_override,
        accept_button_text: editConfig.accept_button_text,
        show_accept_button: editConfig.show_accept_button,
        show_celebration: editConfig.show_celebration,
      };

      if (editConfig.id) {
        const { error } = await supabase
          .from("wedding_role_invite_config")
          .update(payload)
          .eq("id", editConfig.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("wedding_role_invite_config")
          .upsert(payload, { onConflict: "wedding_id,role_key" });
        if (error) throw error;
      }
      toast({ title: "Configuração guardada!" });
      if (selectedWeddingId) fetchRoleConfigs(selectedWeddingId);
      setEditConfig(null);
    } catch {
      toast({ title: "Erro ao guardar configuração", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!" });
  };

  const getCoupleLabel = (g: GuestWithRole) => {
    const w = g.wedding_data;
    if (!w) return "—";
    return [w.partner_name, w.couple_name].filter(Boolean).join(" & ") || "Sem nome";
  };

  const getInviteLink = (g: GuestWithRole) => {
    const code = g.wedding_data?.event_code;
    if (!code) return "";
    return generateInviteLink(code, g.name, g.special_role);
  };

  const entries = useMemo(() => {
    type Entry = {
      id: string;
      label: string;
      guests: GuestWithRole[];
      roles: string;
      link: string;
      isCouple: boolean;
      weddingLabel: string;
      eventCode: string;
      weddingId: string;
      side: string | null;
      confirmed: boolean | null;
    };
    const result: Entry[] = [];
    const processedPairIds = new Set<string>();

    for (const g of guests) {
      const code = g.wedding_data?.event_code || "";
      if (g.couple_pair_id) {
        if (processedPairIds.has(g.couple_pair_id)) continue;
        processedPairIds.add(g.couple_pair_id);
        const partner = guests.find(x => x.couple_pair_id === g.couple_pair_id && x.id !== g.id);
        if (partner && code) {
          result.push({
            id: g.couple_pair_id, label: `${g.name} & ${partner.name}`, guests: [g, partner],
            roles: [...g.special_role, ...partner.special_role].join(", "),
            link: generateCoupleInviteLink(code, g, partner), isCouple: true,
            weddingLabel: getCoupleLabel(g), eventCode: code, weddingId: g.wedding_id,
            side: g.side,
            confirmed: g.confirmed && partner.confirmed ? true : g.confirmed === false || partner.confirmed === false ? false : null,
          });
        } else {
          result.push({
            id: g.id, label: g.name, guests: [g], roles: g.special_role.join(", "),
            link: code ? generateInviteLink(code, g.name, g.special_role) : "",
            isCouple: false, weddingLabel: getCoupleLabel(g), eventCode: code, weddingId: g.wedding_id,
            side: g.side, confirmed: g.confirmed,
          });
        }
      } else {
        result.push({
          id: g.id, label: g.name, guests: [g], roles: g.special_role.join(", "),
          link: code ? generateInviteLink(code, g.name, g.special_role) : "",
          isCouple: false, weddingLabel: getCoupleLabel(g), eventCode: code, weddingId: g.wedding_id,
          side: g.side, confirmed: g.confirmed,
        });
      }
    }
    return result;
  }, [guests]);

  const filteredEntries = entries.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.label.toLowerCase().includes(q) || e.roles.toLowerCase().includes(q) || e.weddingLabel.toLowerCase().includes(q) || e.eventCode.toLowerCase().includes(q);
  });

  const totalRoles = entries.length;
  const confirmedCount = entries.filter((e) => e.confirmed === true).length;
  const pendingCount = entries.filter((e) => e.confirmed !== true).length;

  const byWedding = filteredEntries.reduce<Record<string, typeof filteredEntries>>((acc, e) => {
    const key = e.weddingLabel;
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  const toggleRole = (role: string) => {
    if (!selectedGuest) return;
    const roles = selectedGuest.special_role.includes(role)
      ? selectedGuest.special_role.filter(r => r !== role)
      : [...selectedGuest.special_role, role];
    setSelectedGuest({ ...selectedGuest, special_role: roles });
  };

  const openConfigForWedding = (weddingId: string) => {
    setSelectedWeddingId(weddingId);
    fetchRoleConfigs(weddingId);
    setConfigOpen(true);
  };

  if (loading) {
    return <div className="text-muted-foreground">Carregando convites por papel...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Convites</CardTitle>
            <Users className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRoles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aceites</CardTitle>
            <Heart className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{confirmedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
            <Users className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" size="sm" onClick={fetchGuests}>
          <RefreshCw className="w-4 h-4 mr-1" /> Atualizar
        </Button>
      </div>

      {/* Grouped by Wedding */}
      {Object.keys(byWedding).length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum convidado com papel especial</CardContent></Card>
      ) : (
        Object.entries(byWedding).map(([weddingLabel, weddingEntries]) => (
          <Card key={weddingLabel}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                {weddingLabel}
                <Badge variant="secondary" className="text-xs ml-2">{weddingEntries[0]?.eventCode}</Badge>
                <Button
                  size="sm" variant="outline" className="ml-auto"
                  onClick={() => openConfigForWedding(weddingEntries[0]?.weddingId)}
                >
                  <Settings className="w-4 h-4 mr-1" /> Configurar Papéis
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Convidado</TableHead>
                      <TableHead>Papel</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weddingEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {entry.isCouple && <Heart className="w-3 h-3 text-primary shrink-0" />}
                            <span className="font-medium">{entry.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {entry.roles.split(", ").map((r, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{r}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={entry.confirmed === true ? "default" : "outline"} className="text-xs">
                            {entry.confirmed === true ? "Aceite" : "Pendente"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="outline" onClick={() => { setSelectedGuest(entry.guests[0]); setEditOpen(true); }}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {entry.link && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => copyLink(entry.link)}>
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => window.open(entry.link, "_blank")}>
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Guest Edit Dialog - Multi-tab */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Pencil className="w-5 h-5" /> Editar Convidado</DialogTitle>
            <DialogDescription>{selectedGuest?.name}</DialogDescription>
          </DialogHeader>
          {selectedGuest && (
            <Tabs defaultValue="data" className="mt-2">
              <TabsList className="mb-4">
                <TabsTrigger value="data">Dados</TabsTrigger>
                <TabsTrigger value="invite">Convite</TabsTrigger>
                <TabsTrigger value="couple">Casal</TabsTrigger>
              </TabsList>

              <TabsContent value="data" className="space-y-4">
                <div>
                  <Label>Nome</Label>
                  <Input value={selectedGuest.name} onChange={(e) => setSelectedGuest({ ...selectedGuest, name: e.target.value })} />
                </div>
                <div>
                  <Label>Lado</Label>
                  <Select value={selectedGuest.side || "sem_lado"} onValueChange={(v) => setSelectedGuest({ ...selectedGuest, side: v === "sem_lado" ? null : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="noivo">Noivo</SelectItem>
                      <SelectItem value="noiva">Noiva</SelectItem>
                      <SelectItem value="sem_lado">Sem lado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">Confirmação</p>
                    <p className="text-xs text-muted-foreground">{selectedGuest.confirmed ? "Aceite" : "Pendente"}</p>
                  </div>
                  <Switch checked={selectedGuest.confirmed || false} onCheckedChange={(v) => setSelectedGuest({ ...selectedGuest, confirmed: v })} />
                </div>
                <div>
                  <Label>Papéis Especiais</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {AVAILABLE_ROLES.map((role) => (
                      <Badge
                        key={role}
                        variant={selectedGuest.special_role.includes(role) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleRole(role)}
                      >
                        {selectedGuest.special_role.includes(role) ? "✓ " : ""}{role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="invite" className="space-y-4">
                <div className="space-y-2">
                  <Label>Link do Convite</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Link2 className="w-4 h-4 text-primary shrink-0" />
                    <code className="text-xs break-all flex-1">{getInviteLink(selectedGuest)}</code>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => copyLink(getInviteLink(selectedGuest))}>
                      <Copy className="w-4 h-4 mr-1" /> Copiar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => window.open(getInviteLink(selectedGuest), "_blank")}>
                      <ExternalLink className="w-4 h-4 mr-1" /> Abrir
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm border-t pt-4">
                  <div>
                    <p className="text-muted-foreground">Casamento</p>
                    <p className="font-medium">{getCoupleLabel(selectedGuest)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Código</p>
                    <code className="text-xs bg-muted px-2 py-0.5 rounded">{selectedGuest.wedding_data?.event_code}</code>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="couple" className="space-y-4">
                <div>
                  <Label>ID do Par (couple_pair_id)</Label>
                  <Input
                    value={selectedGuest.couple_pair_id || ""}
                    onChange={(e) => setSelectedGuest({ ...selectedGuest, couple_pair_id: e.target.value || null })}
                    placeholder="UUID do par (deixe vazio para remover)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Para emparelhar, coloque o mesmo UUID em ambos os convidados.
                  </p>
                </div>
                {selectedGuest.couple_pair_id && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedGuest({ ...selectedGuest, couple_pair_id: null })}>
                    <Trash2 className="w-4 h-4 mr-1" /> Remover Emparelhamento
                  </Button>
                )}
              </TabsContent>

              <div className="flex justify-end pt-4 border-t mt-4">
                <Button onClick={saveGuest} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" /> {saving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Role Config Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Settings className="w-5 h-5" /> Configuração de Papéis</DialogTitle>
            <DialogDescription>Personalizar ícones, mensagens e comportamento dos convites por papel</DialogDescription>
          </DialogHeader>

          {editConfig ? (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setEditConfig(null)}>← Voltar à lista</Button>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Papel</Label>
                  <Input value={editConfig.role_key} disabled />
                </div>
                <div>
                  <Label>Ícone</Label>
                  <Select value={editConfig.icon_name} onValueChange={(v) => setEditConfig({ ...editConfig, icon_name: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Label Personalizado</Label>
                <Input value={editConfig.label || ""} onChange={(e) => setEditConfig({ ...editConfig, label: e.target.value || null })} placeholder="Ex: Padrinho de Honra" />
              </div>
              <div>
                <Label>Mensagem de Convite</Label>
                <Textarea value={editConfig.invite_message || ""} onChange={(e) => setEditConfig({ ...editConfig, invite_message: e.target.value || null })} placeholder="Você foi convidado(a) para ser..." rows={2} />
              </div>
              <div>
                <Label>Mensagem de Aceitação</Label>
                <Textarea value={editConfig.accept_message || ""} onChange={(e) => setEditConfig({ ...editConfig, accept_message: e.target.value || null })} placeholder="Obrigado por aceitar..." rows={2} />
              </div>
              <div>
                <Label>Mensagem Familiar</Label>
                <Textarea value={editConfig.family_message || ""} onChange={(e) => setEditConfig({ ...editConfig, family_message: e.target.value || null })} placeholder="Texto especial para papéis familiares..." rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cor Override</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={editConfig.theme_color_override || "#e11d48"} onChange={(e) => setEditConfig({ ...editConfig, theme_color_override: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-border" />
                    <Input value={editConfig.theme_color_override || ""} onChange={(e) => setEditConfig({ ...editConfig, theme_color_override: e.target.value || null })} className="w-28" />
                  </div>
                </div>
                <div>
                  <Label>Texto do Botão</Label>
                  <Input value={editConfig.accept_button_text} onChange={(e) => setEditConfig({ ...editConfig, accept_button_text: e.target.value })} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <p className="text-sm font-medium">Mostrar Botão Aceitar</p>
                  <Switch checked={editConfig.show_accept_button} onCheckedChange={(v) => setEditConfig({ ...editConfig, show_accept_button: v })} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <p className="text-sm font-medium">Animação de Celebração</p>
                  <Switch checked={editConfig.show_celebration} onCheckedChange={(v) => setEditConfig({ ...editConfig, show_celebration: v })} />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={saveRoleConfig} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" /> {saving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {AVAILABLE_ROLES.map((role) => {
                const config = roleConfigs.find(c => c.role_key === role);
                return (
                  <div key={role} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm capitalize">{config?.label || role}</p>
                      <p className="text-xs text-muted-foreground">Ícone: {config?.icon_name || "Crown"}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setEditConfig(config || {
                      wedding_id: selectedWeddingId!, role_key: role, icon_name: "Crown", label: null,
                      invite_message: null, accept_message: null, family_message: null,
                      theme_color_override: null, accept_button_text: "Aceitar Convite",
                      show_accept_button: true, show_celebration: true,
                    })}>
                      <Pencil className="w-4 h-4 mr-1" /> Editar
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Globe, Save, Trash2, Eye, CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────

interface DomainRow {
  id: string;
  wedding_id: string;
  domain: string;
  desired_domain: string | null;
  status: string;
  ssl_status: string;
  order_status: string;
  price: number | null;
  admin_notes: string | null;
  request_message: string | null;
  requested_by: string | null;
  expires_at: string | null;
  created_at: string;
}

const ORDER_STATUSES = [
  { value: "requested", label: "Pedido recebido", icon: Clock, variant: "outline" as const },
  { value: "processing", label: "Em processamento", icon: Clock, variant: "secondary" as const },
  { value: "purchased", label: "Domínio comprado", icon: CheckCircle, variant: "default" as const },
  { value: "configuring", label: "A configurar DNS", icon: Clock, variant: "secondary" as const },
  { value: "active", label: "Activo", icon: CheckCircle, variant: "default" as const },
  { value: "rejected", label: "Rejeitado", icon: XCircle, variant: "destructive" as const },
];

// ── Platform URL Section ──────────────────────────────────────────

function PlatformUrlSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");

  const { data: currentUrl, isLoading } = useQuery({
    queryKey: ["platform-settings", "published_url"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "published_url")
        .maybeSingle();
      if (error) throw error;
      return data?.value as string | null;
    },
  });

  useEffect(() => {
    if (currentUrl) setUrl(currentUrl);
  }, [currentUrl]);

  const saveMutation = useMutation({
    mutationFn: async (newUrl: string) => {
      const cleanUrl = newUrl.replace(/\/+$/, "");
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("platform_settings")
        .upsert(
          { key: "published_url", value: cleanUrl, updated_at: new Date().toISOString(), updated_by: user?.id },
          { onConflict: "key" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      toast({ title: "Domínio guardado", description: "O URL da plataforma foi actualizado." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível guardar o domínio.", variant: "destructive" });
    },
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Domínio da Plataforma</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Este é o URL principal usado para gerar todos os links de convite e páginas de evento.
      </p>
      {currentUrl && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Activo:</span>
          <Badge variant="secondary">{currentUrl}</Badge>
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="platform-url" className="sr-only">URL da plataforma</Label>
          <Input
            id="platform-url"
            placeholder="https://wedingeasy.lovable.app"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button onClick={() => saveMutation.mutate(url)} disabled={!url || saveMutation.isPending}>
          <Save className="w-4 h-4 mr-1" /> Guardar
        </Button>
      </div>
    </Card>
  );
}

// ── Domain Orders Management ──────────────────────────────────────

function DomainOrdersSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingDomain, setEditingDomain] = useState<DomainRow | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editDomain, setEditDomain] = useState("");

  const { data: domains = [], isLoading } = useQuery({
    queryKey: ["admin-custom-domains"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_domains")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DomainRow[];
    },
  });

  const { data: weddings = [] } = useQuery({
    queryKey: ["all-weddings-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wedding_data")
        .select("id, couple_name, partner_name")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles-for-domains"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, first_name, last_name, email");
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingDomain) return;
      const { error } = await supabase
        .from("custom_domains")
        .update({
          order_status: editStatus,
          domain: editDomain.toLowerCase().trim() || editingDomain.domain,
          price: editPrice ? parseFloat(editPrice) : null,
          admin_notes: editNotes.trim() || null,
          status: editStatus === "active" ? "active" : editingDomain.status,
        } as any)
        .eq("id", editingDomain.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-custom-domains"] });
      setEditingDomain(null);
      toast({ title: "Domínio actualizado" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível actualizar.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("custom_domains").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-custom-domains"] });
      toast({ title: "Domínio removido" });
    },
  });

  const openEdit = (d: DomainRow) => {
    setEditingDomain(d);
    setEditStatus(d.order_status || "requested");
    setEditPrice(d.price?.toString() || "");
    setEditNotes(d.admin_notes || "");
    setEditDomain(d.domain);
  };

  const getWeddingLabel = (weddingId: string) => {
    const w = weddings.find((w) => w.id === weddingId);
    if (!w) return "—";
    return `${w.couple_name || "Sem nome"}${w.partner_name ? ` & ${w.partner_name}` : ""}`;
  };

  const getRequesterName = (userId: string | null) => {
    if (!userId) return "—";
    const p = profiles.find((p) => p.user_id === userId);
    if (!p) return "—";
    return `${p.first_name || ""} ${p.last_name || ""}`.trim() || p.email || "—";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-1">
        <Globe className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Pedidos de Domínios Personalizados</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Gira os pedidos de domínios dos casais. Processa a compra manualmente e actualiza o estado.
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">A carregar...</p>
      ) : domains.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum pedido de domínio recebido.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domínio</TableHead>
              <TableHead>Casamento</TableHead>
              <TableHead>Pedido por</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead className="text-right">Acções</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {domains.map((d) => {
              const statusInfo = ORDER_STATUSES.find((s) => s.value === d.order_status) ?? ORDER_STATUSES[0];
              return (
                <TableRow key={d.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{d.desired_domain || d.domain}</p>
                      {d.request_message && (
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">
                          {d.request_message}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{getWeddingLabel(d.wedding_id)}</TableCell>
                  <TableCell className="text-sm">{getRequesterName(d.requested_by)}</TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {d.price ? `€${d.price}` : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="outline" size="sm" onClick={() => openEdit(d)}>
                        <Eye className="w-3 h-3 mr-1" /> Gerir
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(d.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingDomain} onOpenChange={(open) => !open && setEditingDomain(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerir Pedido de Domínio</DialogTitle>
          </DialogHeader>
          {editingDomain && (
            <div className="space-y-4">
              {editingDomain.request_message && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Mensagem do casal:</p>
                  <p className="text-sm">{editingDomain.request_message}</p>
                </div>
              )}

              <div>
                <Label>Domínio desejado</Label>
                <p className="text-sm font-medium">{editingDomain.desired_domain || editingDomain.domain}</p>
              </div>

              <div>
                <Label htmlFor="edit-domain">Domínio final (após compra)</Label>
                <Input
                  id="edit-domain"
                  value={editDomain}
                  onChange={(e) => setEditDomain(e.target.value)}
                  placeholder="dominio-final.com"
                />
              </div>

              <div>
                <Label htmlFor="edit-status">Estado do pedido</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-price">Preço (€)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="12.99"
                />
              </div>

              <div>
                <Label htmlFor="edit-notes">Notas para o casal</Label>
                <Textarea
                  id="edit-notes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="O domínio foi comprado e estará activo em 24h..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingDomain(null)}>Cancelar</Button>
                <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                  <Save className="w-4 h-4 mr-1" /> Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ── Main Export ────────────────────────────────────────────────────

export function AdminDomainsManager() {
  return (
    <div className="space-y-6">
      <PlatformUrlSection />
      <DomainOrdersSection />
    </div>
  );
}

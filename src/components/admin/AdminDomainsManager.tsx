import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Globe, Save, Plus, Settings, Trash2 } from "lucide-react";

// ── Platform URL Section ──────────────────────────────────────────

function PlatformUrlSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");

  const { data: currentUrl, isLoading } = useQuery({
    queryKey: ["platform-settings", "published_url"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings" as any)
        .select("value")
        .eq("key", "published_url")
        .maybeSingle();
      if (error) throw error;
      return (data as any)?.value as string | null;
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
        .from("platform_settings" as any)
        .upsert(
          { key: "published_url", value: cleanUrl, updated_at: new Date().toISOString(), updated_by: user?.id } as any,
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
        <Button
          onClick={() => saveMutation.mutate(url)}
          disabled={!url || saveMutation.isPending}
        >
          <Save className="w-4 h-4 mr-1" />
          Guardar
        </Button>
      </div>
    </Card>
  );
}

// ── Custom Domains Section ────────────────────────────────────────

interface CustomDomain {
  id: string;
  wedding_id: string;
  domain: string;
  status: string;
  ssl_status: string;
  expires_at: string | null;
  created_at: string;
  notes: string | null;
}

const STATUS_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "outline" },
  verifying: { label: "A verificar", variant: "secondary" },
  active: { label: "Activo", variant: "default" },
  expired: { label: "Expirado", variant: "destructive" },
  failed: { label: "Falhou", variant: "destructive" },
};

function CustomDomainsSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newDomain, setNewDomain] = useState("");
  const [selectedWedding, setSelectedWedding] = useState("");

  const { data: domains = [], isLoading } = useQuery({
    queryKey: ["custom-domains"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_domains" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as CustomDomain[];
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

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("custom_domains" as any)
        .insert({ domain: newDomain.toLowerCase().trim(), wedding_id: selectedWedding } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-domains"] });
      setNewDomain("");
      setSelectedWedding("");
      toast({ title: "Domínio registado", description: "O domínio foi adicionado com sucesso." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível registar o domínio.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("custom_domains" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-domains"] });
      toast({ title: "Domínio removido" });
    },
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-1">
        <Settings className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Domínios Personalizados</h3>
        <Badge variant="secondary" className="ml-2">Em breve</Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Registe domínios personalizados por casamento. A integração DNS e SSL será activada futuramente.
      </p>

      {/* Add form */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Select value={selectedWedding} onValueChange={setSelectedWedding}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Seleccionar casamento" />
          </SelectTrigger>
          <SelectContent>
            {weddings.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.couple_name || "Sem nome"} {w.partner_name ? `& ${w.partner_name}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="dominio.com"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          className="w-[220px]"
        />
        <Button
          onClick={() => addMutation.mutate()}
          disabled={!newDomain || !selectedWedding || addMutation.isPending}
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">A carregar...</p>
      ) : domains.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum domínio personalizado registado.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domínio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>SSL</TableHead>
              <TableHead>Expira</TableHead>
              <TableHead className="text-right">Acções</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {domains.map((d) => {
              const badge = STATUS_BADGES[d.status] ?? STATUS_BADGES.pending;
              return (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.domain}</TableCell>
                  <TableCell>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{d.ssl_status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {d.expires_at ? new Date(d.expires_at).toLocaleDateString("pt-PT") : "—"}
                  </TableCell>
                  <TableCell className="text-right flex gap-1 justify-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" disabled>
                          Configurar DNS
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Em breve</TooltipContent>
                    </Tooltip>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(d.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

// ── Main Export ────────────────────────────────────────────────────

export function AdminDomainsManager() {
  return (
    <div className="space-y-6">
      <PlatformUrlSection />
      <CustomDomainsSection />
    </div>
  );
}

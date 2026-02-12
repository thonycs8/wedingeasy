import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Search, RefreshCw, Copy, ExternalLink, Heart, Crown, Star, Eye, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPublicBaseUrl } from "@/utils/getPublicBaseUrl";
import { encodeInviteToken } from "@/utils/inviteToken";

interface GuestWithRole {
  id: string;
  name: string;
  special_role: string[];
  side: string | null;
  confirmed: boolean | null;
  couple_pair_id: string | null;
  wedding_id: string;
  wedding_data: {
    couple_name: string | null;
    partner_name: string | null;
    event_code: string;
    wedding_date: string | null;
    is_active: boolean | null;
  } | null;
}

const ROLE_ICONS: Record<string, typeof Crown> = {
  padrinho: Crown,
  madrinha: Crown,
  celebrante: Crown,
  "dama de honor": Star,
  pajem: Star,
  florista: Star,
  "portador das alianças": Heart,
  "convidado de honra": Star,
};

function getRoleIcon(role: string) {
  return ROLE_ICONS[role.toLowerCase()] || Users;
}

const normalizeSlug = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "-");

function generateInviteLink(eventCode: string, guestName: string, roles: string[]) {
  const roleSlug = roles.map(r => normalizeSlug(r).replace(/-/g, " ")).join(",");
  const guestSlug = normalizeSlug(guestName);
  const token = encodeInviteToken(roleSlug, guestSlug);
  return `${getPublicBaseUrl()}/evento/${eventCode}?invite=${token}`;
}

function generateCouplInviteLink(eventCode: string, g1: GuestWithRole, g2: GuestWithRole) {
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
  const [detailOpen, setDetailOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("id, name, special_role, side, confirmed, couple_pair_id, wedding_id, wedding_data:wedding_id(couple_name, partner_name, event_code, wedding_date, is_active)")
        .not("special_role", "is", null)
        .order("name", { ascending: true });

      if (error) throw error;

      // Filter guests that actually have roles (non-empty array)
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

  // Build entries grouping couples
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

        const partner = guests.find(
          (x) => x.couple_pair_id === g.couple_pair_id && x.id !== g.id
        );

        if (partner && code) {
          result.push({
            id: g.couple_pair_id,
            label: `${g.name} & ${partner.name}`,
            guests: [g, partner],
            roles: [...g.special_role, ...partner.special_role].join(", "),
            link: generateCouplInviteLink(code, g, partner),
            isCouple: true,
            weddingLabel: getCoupleLabel(g),
            eventCode: code,
            side: g.side,
            confirmed: g.confirmed && partner.confirmed ? true : g.confirmed === false || partner.confirmed === false ? false : null,
          });
        } else {
          result.push({
            id: g.id,
            label: g.name,
            guests: [g],
            roles: g.special_role.join(", "),
            link: code ? generateInviteLink(code, g.name, g.special_role) : "",
            isCouple: false,
            weddingLabel: getCoupleLabel(g),
            eventCode: code,
            side: g.side,
            confirmed: g.confirmed,
          });
        }
      } else {
        result.push({
          id: g.id,
          label: g.name,
          guests: [g],
          roles: g.special_role.join(", "),
          link: code ? generateInviteLink(code, g.name, g.special_role) : "",
          isCouple: false,
          weddingLabel: getCoupleLabel(g),
          eventCode: code,
          side: g.side,
          confirmed: g.confirmed,
        });
      }
    }

    return result;
  }, [guests]);

  const filteredEntries = entries.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.label.toLowerCase().includes(q) ||
      e.roles.toLowerCase().includes(q) ||
      e.weddingLabel.toLowerCase().includes(q) ||
      e.eventCode.toLowerCase().includes(q)
    );
  });

  // Stats
  const totalRoles = entries.length;
  const confirmedCount = entries.filter((e) => e.confirmed === true).length;
  const pendingCount = entries.filter((e) => e.confirmed !== true).length;

  // Group by wedding
  const byWedding = filteredEntries.reduce<Record<string, typeof filteredEntries>>((acc, e) => {
    const key = e.weddingLabel;
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

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
            <p className="text-xs text-muted-foreground mt-1">Convidados com papel especial</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aceites</CardTitle>
            <Heart className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{confirmedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Confirmaram presença</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
            <Users className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardam confirmação</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Refresh */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome, papel, casal ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={fetchGuests}>
          <RefreshCw className="w-4 h-4 mr-1" /> Atualizar
        </Button>
      </div>

      {/* Grouped by Wedding */}
      {Object.keys(byWedding).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {search ? "Nenhum resultado encontrado" : "Nenhum convidado com papel especial encontrado"}
          </CardContent>
        </Card>
      ) : (
        Object.entries(byWedding).map(([weddingLabel, weddingEntries]) => (
          <Card key={weddingLabel}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                {weddingLabel}
                <Badge variant="secondary" className="text-xs ml-auto">{weddingEntries[0]?.eventCode}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Convidado</TableHead>
                      <TableHead>Papel</TableHead>
                      <TableHead>Lado</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weddingEntries.map((entry) => {
                      const RoleIcon = getRoleIcon(entry.guests[0]?.special_role?.[0] || "");
                      return (
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
                                <Badge key={i} variant="outline" className="text-xs">
                                  {r}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {entry.side ? (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {entry.side}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={entry.confirmed === true ? "default" : "outline"}
                              className="text-xs"
                            >
                              {entry.confirmed === true ? "Aceite" : "Pendente"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedGuest(entry.guests[0]);
                                  setDetailOpen(true);
                                }}
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {entry.link && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyLink(entry.link)}
                                    title="Copiar link"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(entry.link, "_blank")}
                                    title="Abrir convite"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Convite por Papel</DialogTitle>
            <DialogDescription>
              {selectedGuest?.name || ""}
            </DialogDescription>
          </DialogHeader>

          {selectedGuest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedGuest.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Casamento</p>
                  <p className="font-medium">{getCoupleLabel(selectedGuest)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Código do Evento</p>
                  <code className="text-xs bg-muted px-2 py-0.5 rounded">
                    {selectedGuest.wedding_data?.event_code || "—"}
                  </code>
                </div>
                <div>
                  <p className="text-muted-foreground">Lado</p>
                  <p className="font-medium capitalize">{selectedGuest.side || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Papéis</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {selectedGuest.special_role.map((r, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{r}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Estado</p>
                  <Badge variant={selectedGuest.confirmed ? "default" : "outline"}>
                    {selectedGuest.confirmed ? "Aceite" : "Pendente"}
                  </Badge>
                </div>
              </div>

              {selectedGuest.wedding_data?.event_code && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Link do Convite</p>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Link2 className="w-4 h-4 text-primary shrink-0" />
                    <code className="text-xs text-foreground break-all flex-1">
                      {getInviteLink(selectedGuest)}
                    </code>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => copyLink(getInviteLink(selectedGuest))}
                    >
                      <Copy className="w-4 h-4 mr-1" /> Copiar Link
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(getInviteLink(selectedGuest), "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" /> Abrir Convite
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWeddingData } from "@/contexts/WeddingContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Guest {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  category:
    | "family"
    | "friends"
    | "work"
    | "other"
    | "groomsmen"
    | "bridesmaids"
    | "groomsman_friends"
    | "bridesmaid_friends"
    | "witnesses"
    | "officiant"
    | "pastor"
    | "musicians"
    | "honor_guests";
  confirmed: boolean;
  plus_one: boolean;
  printed_invitation?: boolean | null;
  table_number?: number | null;
  side?: "noivo" | "noiva" | null;
  age_band?: "0_4" | "5_10" | "11_plus" | "adult" | null;
}

const isVirtualGuest = (id: string) => id.includes("-virtual");

const getAgeBandLabel = (ageBand?: Guest["age_band"]) => {
  switch (ageBand) {
    case "0_4":
      return "Bebés (0–4)";
    case "5_10":
      return "Crianças (5–10)";
    case "11_plus":
      return "Adolescentes (11+)";
    case "adult":
    default:
      return "Adultos";
  }
};

const GuestListManager = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { weddingData } = useWeddingData();

  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState<Guest[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSide, setFilterSide] = useState<"all" | "noivo" | "noiva" | "none">("all");

  const [selectedGuestIds, setSelectedGuestIds] = useState<Set<string>>(new Set());

  const loadGuests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .order("name");

      if (error) throw error;

      const guestsFromDb = (data || []) as Guest[];

      const coupleGuests: Guest[] = [];
      if (weddingData?.couple?.name) {
        coupleGuests.push({
          id: "groom-virtual",
          name: weddingData.couple.name,
          category: "honor_guests",
          confirmed: true,
          plus_one: false,
          side: "noivo",
          age_band: "adult",
          printed_invitation: false,
          table_number: null,
        });
      }

      if (weddingData?.couple?.partnerName) {
        coupleGuests.push({
          id: "bride-virtual",
          name: weddingData.couple.partnerName,
          category: "honor_guests",
          confirmed: true,
          plus_one: false,
          side: "noiva",
          age_band: "adult",
          printed_invitation: false,
          table_number: null,
        });
      }

      setGuests([...coupleGuests, ...guestsFromDb]);
      setSelectedGuestIds(new Set());
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar convidados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) void loadGuests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const matchesSearch =
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (!!guest.email && guest.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = filterCategory === "all" || guest.category === filterCategory;

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "confirmed" && guest.confirmed) ||
        (filterStatus === "pending" && !guest.confirmed);

      const matchesSide =
        filterSide === "all" ||
        (filterSide === "none" && !guest.side) ||
        (filterSide !== "none" && guest.side === filterSide);

      return matchesSearch && matchesCategory && matchesStatus && matchesSide;
    });
  }, [filterCategory, filterSide, filterStatus, guests, searchTerm]);

  const toggleGuestSelection = (guestId: string, checked: boolean) => {
    setSelectedGuestIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(guestId);
      else next.delete(guestId);
      return next;
    });
  };

  const selectAllFiltered = () => {
    const ids = filteredGuests.filter((g) => !isVirtualGuest(g.id)).map((g) => g.id);
    if (ids.length === 0) {
      toast.error("Nenhum convidado nos filtros atuais");
      return;
    }
    setSelectedGuestIds(new Set(ids));
  };

  const selectAllUnassigned = () => {
    const ids = filteredGuests
      .filter((g) => !isVirtualGuest(g.id))
      .filter((g) => !g.side)
      .map((g) => g.id);

    if (ids.length === 0) {
      toast.error('Não há convidados "Sem lado" nos filtros atuais');
      return;
    }
    setSelectedGuestIds(new Set(ids));
  };

  const updateGuest = async (guestId: string, patch: Partial<Guest>) => {
    if (!user) return;
    if (isVirtualGuest(guestId)) return;

    // optimistic
    setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, ...patch } : g)));

    const dbPatch: Record<string, unknown> = { ...patch };
    if ("email" in patch) dbPatch.email = patch.email || null;
    if ("phone" in patch) dbPatch.phone = patch.phone || null;
    if ("table_number" in patch) dbPatch.table_number = patch.table_number ?? null;
    if ("side" in patch) dbPatch.side = patch.side ?? null;
    if ("age_band" in patch) dbPatch.age_band = patch.age_band ?? null;
    if ("printed_invitation" in patch) dbPatch.printed_invitation = patch.printed_invitation ?? false;

    try {
      const { error } = await supabase.from("guests").update(dbPatch).eq("id", guestId);
      if (error) throw error;
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar convidado");
      // rollback by reloading (safer than diffing)
      void loadGuests();
    }
  };

  const bulkUpdateSelected = async (patch: Partial<Guest>) => {
    if (!user) return;
    const ids = Array.from(selectedGuestIds).filter((id) => !isVirtualGuest(id));
    if (ids.length === 0) {
      toast.error("Nenhum convidado selecionado");
      return;
    }

    const dbPatch: Record<string, unknown> = { ...patch };
    if ("email" in patch) dbPatch.email = patch.email || null;
    if ("phone" in patch) dbPatch.phone = patch.phone || null;
    if ("table_number" in patch) dbPatch.table_number = patch.table_number ?? null;
    if ("side" in patch) dbPatch.side = patch.side ?? null;
    if ("age_band" in patch) dbPatch.age_band = patch.age_band ?? null;
    if ("printed_invitation" in patch) dbPatch.printed_invitation = patch.printed_invitation ?? false;

    try {
      const { error } = await supabase.from("guests").update(dbPatch).in("id", ids);
      if (error) throw error;

      toast.success(`${ids.length} convidado(s) atualizado(s)`);
      await loadGuests();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar em massa");
    }
  };

  const selectionCount = selectedGuestIds.size;

  return (
    <Card className="card-romantic">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Gestão rápida (tabela)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Altere valores direto na lista — as mudanças são salvas automaticamente.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto">
              Voltar ao dashboard
            </Button>
            <Button variant="outline" onClick={loadGuests} className="w-full sm:w-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-2 lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button variant="outline" onClick={selectAllFiltered} className="w-full sm:w-auto">
              Selecionar filtrados
            </Button>

            <Button variant="outline" onClick={selectAllUnassigned} className="w-full sm:w-auto">
              Selecionar sem lado
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-44 bg-background">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-background z-[100]">
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="family">Família</SelectItem>
                <SelectItem value="friends">Amigos</SelectItem>
                <SelectItem value="work">Trabalho</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
                <SelectItem value="groomsmen">Padrinhos do Noivo</SelectItem>
                <SelectItem value="bridesmaids">Madrinhas da Noiva</SelectItem>
                <SelectItem value="witnesses">Testemunhas</SelectItem>
                <SelectItem value="officiant">Celebrante</SelectItem>
                <SelectItem value="musicians">Músicos</SelectItem>
                <SelectItem value="honor_guests">Convidados de Honra</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSide} onValueChange={(v) => setFilterSide(v as typeof filterSide)}>
              <SelectTrigger className="w-full sm:w-40 bg-background">
                <Users className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Lado" />
              </SelectTrigger>
              <SelectContent className="bg-background z-[100]">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="noivo">Noivo</SelectItem>
                <SelectItem value="noiva">Noiva</SelectItem>
                <SelectItem value="none">Sem lado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-44 bg-background">
                <SelectValue placeholder="Confirmação" />
              </SelectTrigger>
              <SelectContent className="bg-background z-[100]">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="confirmed">Confirmados</SelectItem>
                <SelectItem value="pending">Não confirmados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectionCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 justify-between border rounded-lg p-3">
            <div className="text-sm text-muted-foreground">
              Selecionados: <strong>{selectionCount}</strong>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => bulkUpdateSelected({ side: "noivo" })}
              >
                Lado: Noivo
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => bulkUpdateSelected({ side: "noiva" })}
              >
                Lado: Noiva
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => bulkUpdateSelected({ side: null })}
              >
                Lado: Sem lado
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedGuestIds(new Set())}>
                Limpar
              </Button>
            </div>
          </div>
        )}

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Lado</TableHead>
                <TableHead>Faixa</TableHead>
                <TableHead className="text-center">Conf.</TableHead>
                <TableHead className="text-center">+1</TableHead>
                <TableHead className="text-center">Conv.</TableHead>
                <TableHead className="w-24">Mesa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="py-10 text-center text-muted-foreground">
                    A carregar convidados...
                  </TableCell>
                </TableRow>
              ) : filteredGuests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="py-10 text-center text-muted-foreground">
                    Nenhum convidado encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredGuests.map((guest) => {
                  const disabled = isVirtualGuest(guest.id);

                  return (
                    <TableRow key={guest.id} className={disabled ? "opacity-75" : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={selectedGuestIds.has(guest.id)}
                          onCheckedChange={(checked) => toggleGuestSelection(guest.id, Boolean(checked))}
                          disabled={disabled}
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          value={guest.name}
                          onChange={(e) => setGuests((prev) => prev.map((g) => (g.id === guest.id ? { ...g, name: e.target.value } : g)))}
                          onBlur={(e) => updateGuest(guest.id, { name: e.target.value.trim() || guest.name })}
                          disabled={disabled}
                          className="min-w-[12rem] bg-background"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          value={guest.email || ""}
                          onChange={(e) => setGuests((prev) => prev.map((g) => (g.id === guest.id ? { ...g, email: e.target.value } : g)))}
                          onBlur={(e) => updateGuest(guest.id, { email: e.target.value })}
                          disabled={disabled}
                          className="min-w-[12rem] bg-background"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          value={guest.phone || ""}
                          onChange={(e) => setGuests((prev) => prev.map((g) => (g.id === guest.id ? { ...g, phone: e.target.value } : g)))}
                          onBlur={(e) => updateGuest(guest.id, { phone: e.target.value })}
                          disabled={disabled}
                          className="min-w-[10rem] bg-background"
                        />
                      </TableCell>

                      <TableCell>
                        <Select
                          value={guest.category}
                          onValueChange={(v) => updateGuest(guest.id, { category: v as Guest["category"] })}
                          disabled={disabled}
                        >
                          <SelectTrigger className="w-44 bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-[100]">
                            <SelectItem value="family">Família</SelectItem>
                            <SelectItem value="friends">Amigos</SelectItem>
                            <SelectItem value="work">Trabalho</SelectItem>
                            <SelectItem value="other">Outros</SelectItem>
                            <SelectItem value="groomsmen">Padrinhos do Noivo</SelectItem>
                            <SelectItem value="bridesmaids">Madrinhas da Noiva</SelectItem>
                            <SelectItem value="witnesses">Testemunhas</SelectItem>
                            <SelectItem value="officiant">Celebrante</SelectItem>
                            <SelectItem value="pastor">Pastor</SelectItem>
                            <SelectItem value="musicians">Músicos</SelectItem>
                            <SelectItem value="honor_guests">Convidados de Honra</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell>
                        <Select
                          value={guest.side || "none"}
                          onValueChange={(v) => updateGuest(guest.id, { side: v === "none" ? null : (v as Guest["side"]) })}
                          disabled={disabled}
                        >
                          <SelectTrigger className="w-40 bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-[100]">
                            <SelectItem value="noivo">Noivo</SelectItem>
                            <SelectItem value="noiva">Noiva</SelectItem>
                            <SelectItem value="none">Sem lado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell>
                        <Select
                          value={guest.age_band || "adult"}
                          onValueChange={(v) => updateGuest(guest.id, { age_band: v as Guest["age_band"] })}
                          disabled={disabled}
                        >
                          <SelectTrigger className="w-44 bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-[100]">
                            <SelectItem value="0_4">{getAgeBandLabel("0_4")}</SelectItem>
                            <SelectItem value="5_10">{getAgeBandLabel("5_10")}</SelectItem>
                            <SelectItem value="11_plus">{getAgeBandLabel("11_plus")}</SelectItem>
                            <SelectItem value="adult">{getAgeBandLabel("adult")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell className="text-center">
                        <Switch
                          checked={guest.confirmed}
                          onCheckedChange={(checked) => updateGuest(guest.id, { confirmed: checked })}
                          disabled={disabled}
                        />
                      </TableCell>

                      <TableCell className="text-center">
                        <Switch
                          checked={guest.plus_one}
                          onCheckedChange={(checked) => updateGuest(guest.id, { plus_one: checked })}
                          disabled={disabled}
                        />
                      </TableCell>

                      <TableCell className="text-center">
                        <Switch
                          checked={Boolean(guest.printed_invitation)}
                          onCheckedChange={(checked) => updateGuest(guest.id, { printed_invitation: checked })}
                          disabled={disabled}
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          value={guest.table_number ?? ""}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const next = raw === "" ? null : Number(raw);
                            if (raw !== "" && Number.isNaN(next)) return;
                            setGuests((prev) => prev.map((g) => (g.id === guest.id ? { ...g, table_number: next } : g)));
                          }}
                          onBlur={(e) => {
                            const raw = e.target.value;
                            const next = raw === "" ? null : Number(raw);
                            updateGuest(guest.id, { table_number: raw === "" ? null : (Number.isNaN(next) ? guest.table_number ?? null : next) });
                          }}
                          disabled={disabled}
                          className="w-20 bg-background"
                          inputMode="numeric"
                        />
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
  );
};

export default GuestListManager;

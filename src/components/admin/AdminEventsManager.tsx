import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [weddingsRes, subsRes, plansRes] = await Promise.all([
        supabase
          .from("wedding_data")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("wedding_subscriptions")
          .select("id, wedding_id, plan_id, subscription_plans(display_name)"),
        supabase
          .from("subscription_plans")
          .select("id, display_name, name")
          .order("sort_order"),
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
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eventos",
        variant: "destructive",
      });
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
        prev.map((e) =>
          e.id === event.id ? { ...e, is_active: !e.is_active } : e
        )
      );

      toast({
        title: "Sucesso",
        description: `Evento ${!event.is_active ? "ativado" : "desativado"}`,
      });
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o evento",
        variant: "destructive",
      });
    }
  };

  const changePlan = async (event: WeddingEvent, planId: string) => {
    try {
      if (event.subscription_id) {
        // Update existing subscription
        const { error } = await supabase
          .from("wedding_subscriptions")
          .update({ plan_id: planId })
          .eq("id", event.subscription_id);
        if (error) throw error;
      } else {
        // Create new subscription
        const { error } = await supabase
          .from("wedding_subscriptions")
          .insert({ wedding_id: event.id, plan_id: planId });
        if (error) throw error;
      }

      const plan = plans.find((p) => p.id === planId);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, plan_id: planId, plan_name: plan?.display_name || null }
            : e
        )
      );

      toast({
        title: "Sucesso",
        description: `Plano atualizado para ${plan?.display_name}`,
      });
    } catch (error) {
      console.error("Erro ao alterar plano:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o plano",
        variant: "destructive",
      });
    }
  };

  const filtered = events.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.couple_name?.toLowerCase().includes(q) ||
      e.partner_name?.toLowerCase().includes(q) ||
      e.event_code?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <div className="text-muted-foreground">Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Eventos</CardTitle>
            <CardDescription>
              {events.length} eventos · {events.filter((e) => e.is_active).length} ativos
            </CardDescription>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhum evento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((event) => (
                  <TableRow key={event.id} className={!event.is_active ? "opacity-60" : ""}>
                    <TableCell className="font-medium">
                      {[event.partner_name, event.couple_name].filter(Boolean).join(" & ") || "Sem nome"}
                    </TableCell>
                    <TableCell>
                      {event.wedding_date
                        ? format(new Date(event.wedding_date), "dd MMM yyyy", { locale: pt })
                        : "—"}
                    </TableCell>
                    <TableCell>{event.guest_count ?? "—"}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {event.event_code}
                      </code>
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
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.display_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={event.is_active}
                        onCheckedChange={() => toggleActive(event)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

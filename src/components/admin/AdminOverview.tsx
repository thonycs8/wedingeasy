import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Crown, Activity, ExternalLink } from "lucide-react";


interface OverviewStats {
  totalUsers: number;
  totalEvents: number;
  activeEvents: number;
  inactiveEvents: number;
  totalAdmins: number;
  planBreakdown: { plan_name: string; count: number }[];
}

export const AdminOverview = () => {
  const [stats, setStats] = useState<OverviewStats>({
    totalUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
    inactiveEvents: 0,
    totalAdmins: 0,
    planBreakdown: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [profilesRes, weddingsRes, adminsRes, subsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("wedding_data").select("id, is_active"),
        supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin"),
        supabase
          .from("wedding_subscriptions")
          .select("plan_id, subscription_plans(display_name)")
      ]);

      const weddings = weddingsRes.data || [];
      const activeEvents = weddings.filter((w: any) => w.is_active !== false).length;

      // Count subscriptions by plan
      const planCounts: Record<string, number> = {};
      (subsRes.data || []).forEach((sub: any) => {
        const name = sub.subscription_plans?.display_name || "Sem plano";
        planCounts[name] = (planCounts[name] || 0) + 1;
      });

      setStats({
        totalUsers: profilesRes.count || 0,
        totalEvents: weddings.length,
        activeEvents,
        inactiveEvents: weddings.length - activeEvents,
        totalAdmins: adminsRes.count || 0,
        planBreakdown: Object.entries(planCounts).map(([plan_name, count]) => ({
          plan_name,
          count,
        })),
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Carregando...</div>;
  }

  const cards = [
    {
      title: "Utilizadores",
      value: stats.totalUsers,
      icon: Users,
      description: "Total registados",
      color: "text-blue-500",
    },
    {
      title: "Eventos",
      value: stats.totalEvents,
      icon: Calendar,
      description: `${stats.activeEvents} ativos · ${stats.inactiveEvents} inativos`,
      color: "text-green-500",
    },
    {
      title: "Administradores",
      value: stats.totalAdmins,
      icon: Crown,
      description: "Com acesso admin",
      color: "text-amber-500",
    },
    {
      title: "Subscrições",
      value: stats.planBreakdown.reduce((sum, p) => sum + p.count, 0),
      icon: Activity,
      description: stats.planBreakdown.map((p) => `${p.plan_name}: ${p.count}`).join(" · ") || "Nenhuma",
      color: "text-purple-500",
    },
  ];

  const baseUrl = window.location.origin;
  const featuresUrl = `${baseUrl}/features`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Links para investidores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Links para Investidores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Página de Funcionalidades</p>
              <p className="text-xs text-muted-foreground break-all">{featuresUrl}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(featuresUrl);
              }}
            >
              <ExternalLink className="w-4 h-4 mr-1" /> Copiar
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Página de Planos</p>
              <p className="text-xs text-muted-foreground break-all">{baseUrl}/pricing</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(`${baseUrl}/pricing`);
              }}
            >
              <ExternalLink className="w-4 h-4 mr-1" /> Copiar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

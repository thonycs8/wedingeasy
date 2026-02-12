import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PartnersManager } from "@/components/admin/PartnersManager";
import { ServicesManager } from "@/components/admin/ServicesManager";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminUsersManager } from "@/components/admin/AdminUsersManager";
import { AdminEventsManager } from "@/components/admin/AdminEventsManager";
import { AdminAdminsManager } from "@/components/admin/AdminAdminsManager";
import { AdminModulesManager } from "@/components/admin/AdminModulesManager";
import { AdminDomainsManager } from "@/components/admin/AdminDomainsManager";
import { AdminLandingPagesManager } from "@/components/admin/AdminLandingPagesManager";
import { AdminEventSupport } from "@/components/admin/AdminEventSupport";
import { AdminBillingManager } from "@/components/admin/AdminBillingManager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LayoutDashboard, Users, Calendar, Shield, Puzzle, Handshake, ShoppingBag, Globe, FileText, HeadsetIcon, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Erro ao verificar permissões:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const tabs = [
    { value: "overview", label: "Visão Geral", icon: LayoutDashboard },
    { value: "users", label: "Utilizadores", icon: Users },
    { value: "events", label: "Eventos", icon: Calendar },
    { value: "admins", label: "Admins", icon: Shield },
    { value: "modules", label: "Módulos", icon: Puzzle },
    { value: "partners", label: "Parceiros", icon: Handshake },
    { value: "services", label: "Serviços", icon: ShoppingBag },
    { value: "domains", label: "Domínios", icon: Globe },
    { value: "landing-pages", label: "Landing Pages", icon: FileText },
    { value: "event-support", label: "Suporte Evento", icon: HeadsetIcon },
    { value: "billing", label: "Faturação", icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-1">
            Gestão completa da plataforma WeddingEasy
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-auto flex-wrap gap-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-1.5 text-xs sm:text-sm"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsersManager />
          </TabsContent>

          <TabsContent value="events">
            <AdminEventsManager />
          </TabsContent>

          <TabsContent value="admins">
            <AdminAdminsManager />
          </TabsContent>

          <TabsContent value="modules">
            <AdminModulesManager />
          </TabsContent>

          <TabsContent value="partners">
            <PartnersManager />
          </TabsContent>

          <TabsContent value="services">
            <ServicesManager />
          </TabsContent>

          <TabsContent value="domains">
            <AdminDomainsManager />
          </TabsContent>

          <TabsContent value="landing-pages">
            <AdminLandingPagesManager />
          </TabsContent>

          <TabsContent value="event-support">
            <AdminEventSupport />
          </TabsContent>

          <TabsContent value="billing">
            <AdminBillingManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

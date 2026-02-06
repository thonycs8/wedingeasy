import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Plan {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  price: number;
  max_guests: number;
  max_collaborators: number;
  is_active: boolean;
  sort_order: number;
}

interface Feature {
  id: string;
  feature_key: string;
  display_name: string;
  description: string | null;
  category: string;
  sort_order: number;
}

interface PlanFeature {
  id: string;
  plan_id: string;
  feature_id: string;
  enabled: boolean;
}

export const AdminModulesManager = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [planFeatures, setPlanFeatures] = useState<PlanFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState({
    display_name: "",
    description: "",
    price: "",
    max_guests: "",
    max_collaborators: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, featuresRes, pfRes] = await Promise.all([
        supabase
          .from("subscription_plans")
          .select("*")
          .order("sort_order"),
        supabase
          .from("app_features")
          .select("*")
          .order("sort_order"),
        supabase
          .from("plan_features")
          .select("*"),
      ]);

      if (plansRes.error) throw plansRes.error;
      if (featuresRes.error) throw featuresRes.error;
      if (pfRes.error) throw pfRes.error;

      setPlans(plansRes.data || []);
      setFeatures(featuresRes.data || []);
      setPlanFeatures(pfRes.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os módulos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isFeatureEnabled = (planId: string, featureId: string): boolean => {
    const pf = planFeatures.find(
      (p) => p.plan_id === planId && p.feature_id === featureId
    );
    return pf?.enabled ?? false;
  };

  const toggleFeature = async (planId: string, featureId: string) => {
    const existing = planFeatures.find(
      (p) => p.plan_id === planId && p.feature_id === featureId
    );

    try {
      if (existing) {
        const { error } = await supabase
          .from("plan_features")
          .update({ enabled: !existing.enabled })
          .eq("id", existing.id);

        if (error) throw error;

        setPlanFeatures((prev) =>
          prev.map((pf) =>
            pf.id === existing.id ? { ...pf, enabled: !pf.enabled } : pf
          )
        );
      } else {
        const { data, error } = await supabase
          .from("plan_features")
          .insert({ plan_id: planId, feature_id: featureId, enabled: true })
          .select()
          .single();

        if (error) throw error;
        setPlanFeatures((prev) => [...prev, data]);
      }
    } catch (error) {
      console.error("Erro ao atualizar feature:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a funcionalidade",
        variant: "destructive",
      });
    }
  };

  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanForm({
      display_name: plan.display_name,
      description: plan.description || "",
      price: plan.price.toString(),
      max_guests: plan.max_guests.toString(),
      max_collaborators: plan.max_collaborators.toString(),
    });
  };

  const savePlan = async () => {
    if (!editingPlan) return;

    try {
      const { error } = await supabase
        .from("subscription_plans")
        .update({
          display_name: planForm.display_name,
          description: planForm.description || null,
          price: parseFloat(planForm.price),
          max_guests: parseInt(planForm.max_guests),
          max_collaborators: parseInt(planForm.max_collaborators),
        })
        .eq("id", editingPlan.id);

      if (error) throw error;

      setPlans((prev) =>
        prev.map((p) =>
          p.id === editingPlan.id
            ? {
                ...p,
                display_name: planForm.display_name,
                description: planForm.description || null,
                price: parseFloat(planForm.price),
                max_guests: parseInt(planForm.max_guests),
                max_collaborators: parseInt(planForm.max_collaborators),
              }
            : p
        )
      );

      setEditingPlan(null);
      toast({ title: "Sucesso", description: "Plano atualizado" });
    } catch (error) {
      console.error("Erro ao atualizar plano:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o plano",
        variant: "destructive",
      });
    }
  };

  const togglePlanActive = async (plan: Plan) => {
    try {
      const { error } = await supabase
        .from("subscription_plans")
        .update({ is_active: !plan.is_active })
        .eq("id", plan.id);

      if (error) throw error;

      setPlans((prev) =>
        prev.map((p) =>
          p.id === plan.id ? { ...p, is_active: !p.is_active } : p
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar plano:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o plano",
        variant: "destructive",
      });
    }
  };

  // Group features by category
  const featuresByCategory = features.reduce<Record<string, Feature[]>>((acc, f) => {
    const cat = f.category || "Geral";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  if (loading) {
    return <div className="text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Plans Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Planos de Subscrição</CardTitle>
          <CardDescription>Configure os planos disponíveis e os seus limites</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${!plan.is_active ? "opacity-60" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.display_name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={plan.is_active}
                        onCheckedChange={() => togglePlanActive(plan)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditPlan(plan)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {plan.price === 0 ? "Grátis" : `€${plan.price}/mês`}
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Badge variant="outline" className="text-xs">
                        {plan.max_guests === -1 ? "∞" : plan.max_guests} convidados
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {plan.max_collaborators === -1 ? "∞" : plan.max_collaborators} colaborador{plan.max_collaborators !== 1 ? "es" : ""}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {planFeatures.filter((pf) => pf.plan_id === plan.id && pf.enabled).length} funcionalidades
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Funcionalidades</CardTitle>
          <CardDescription>
            Ative ou desative funcionalidades para cada plano usando as caixas de seleção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Funcionalidade</TableHead>
                  {plans.map((plan) => (
                    <TableHead key={plan.id} className="text-center min-w-[120px]">
                      {plan.display_name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
                  <>
                    <TableRow key={`cat-${category}`}>
                      <TableCell
                        colSpan={plans.length + 1}
                        className="bg-muted/50 font-semibold text-sm"
                      >
                        {category}
                      </TableCell>
                    </TableRow>
                    {categoryFeatures.map((feature) => (
                      <TableRow key={feature.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{feature.display_name}</div>
                            {feature.description && (
                              <div className="text-xs text-muted-foreground">
                                {feature.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        {plans.map((plan) => (
                          <TableCell key={`${plan.id}-${feature.id}`} className="text-center">
                            <Checkbox
                              checked={isFeatureEnabled(plan.id, feature.id)}
                              onCheckedChange={() => toggleFeature(plan.id, feature.id)}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Plan Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={(open) => !open && setEditingPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Plano</DialogTitle>
            <DialogDescription>
              Altere os detalhes e limites do plano
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="plan-name">Nome do Plano</Label>
              <Input
                id="plan-name"
                value={planForm.display_name}
                onChange={(e) =>
                  setPlanForm({ ...planForm, display_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="plan-desc">Descrição</Label>
              <Input
                id="plan-desc"
                value={planForm.description}
                onChange={(e) =>
                  setPlanForm({ ...planForm, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="plan-price">Preço (€/mês)</Label>
              <Input
                id="plan-price"
                type="number"
                step="0.01"
                value={planForm.price}
                onChange={(e) =>
                  setPlanForm({ ...planForm, price: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="plan-guests">
                Máx. Convidados (-1 = ilimitado)
              </Label>
              <Input
                id="plan-guests"
                type="number"
                value={planForm.max_guests}
                onChange={(e) =>
                  setPlanForm({ ...planForm, max_guests: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="plan-collabs">
                Máx. Colaboradores (-1 = ilimitado)
              </Label>
              <Input
                id="plan-collabs"
                type="number"
                value={planForm.max_collaborators}
                onChange={(e) =>
                  setPlanForm({ ...planForm, max_collaborators: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingPlan(null)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={savePlan}>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

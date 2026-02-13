import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Heart, Check, X, ArrowLeft, Sparkles, Crown, Zap } from "lucide-react";
import Footer from "@/components/Footer";
import { LanguageCurrencySelector } from "@/components/LanguageCurrencySelector";
import { formatCurrency } from "@/i18n";
import { useSettings } from "@/contexts/SettingsContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlanData {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  price: number | null;
  one_time_price: number | null;
  billing_type: string;
  max_guests: number | null;
  max_collaborators: number | null;
  sort_order: number | null;
}

interface FeatureRow {
  feature_key: string;
  display_name: string;
  category: string | null;
  plans: Record<string, boolean>;
}

const planIcons: Record<string, typeof Heart> = {
  basic: Heart,
  advanced: Zap,
  professional: Crown,
};

export default function Pricing() {
  const navigate = useNavigate();
  const { currency } = useSettings();
  const isMobile = useIsMobile();
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [plansRes, pfRes, afRes] = await Promise.all([
          supabase.from("subscription_plans").select("*").eq("is_active", true).order("sort_order"),
          supabase.from("plan_features").select("plan_id, feature_id, enabled"),
          supabase.from("app_features").select("id, feature_key, display_name, category").order("sort_order"),
        ]);

        const plansData = plansRes.data || [];
        const pfData = pfRes.data || [];
        const afData = afRes.data || [];

        setPlans(plansData);

        // Build feature matrix
        const featureMap = new Map<string, FeatureRow>();
        for (const af of afData) {
          const planStatus: Record<string, boolean> = {};
          for (const plan of plansData) {
            const pf = pfData.find(p => p.plan_id === plan.id && p.feature_id === af.id);
            planStatus[plan.name] = pf?.enabled || false;
          }
          featureMap.set(af.feature_key, {
            feature_key: af.feature_key,
            display_name: af.display_name,
            category: af.category,
            plans: planStatus,
          });
        }
        setFeatures(Array.from(featureMap.values()));
      } catch (error) {
        console.error("Error loading pricing:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Group features by category
  const groupedFeatures = features.reduce<Record<string, FeatureRow[]>>((acc, f) => {
    const cat = f.category || "Outros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando planos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-7 h-7 text-primary" />
            <span className="text-lg font-bold text-primary">WeddingEasy</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/faq")}>FAQ</Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>Entrar</Button>
            {!isMobile && <LanguageCurrencySelector />}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24 text-center">
        <div className="container mx-auto px-6">
          <Badge className="mb-6 text-sm px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" /> Planos simples e transparentes
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Escolha o plano ideal
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comece gratuitamente e evolua conforme as necessidades do seu casamento.
            Sem surpresas, sem compromissos.
          </p>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, idx) => {
              const Icon = planIcons[plan.name] || Heart;
              const isPopular = plan.name === "advanced";
              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden transition-all hover:shadow-lg ${
                    isPopular ? "border-primary shadow-md scale-[1.02]" : ""
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center text-xs py-1.5 font-medium">
                      ⭐ Mais Popular
                    </div>
                  )}
                  <CardHeader className={`text-center ${isPopular ? "pt-10" : "pt-6"}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                      isPopular ? "bg-primary text-primary-foreground" : "bg-primary/10"
                    }`}>
                      <Icon className={`w-7 h-7 ${isPopular ? "" : "text-primary"}`} />
                    </div>
                    <CardTitle className="text-2xl">{plan.display_name}</CardTitle>
                    <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    {/* Pricing */}
                    <div>
                      {plan.price === 0 || plan.price === null ? (
                        <div>
                          <span className="text-4xl font-bold">Grátis</span>
                          <p className="text-sm text-muted-foreground mt-1">Para sempre</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div>
                            <span className="text-4xl font-bold">{formatCurrency(plan.price!, currency)}</span>
                            <span className="text-muted-foreground">/mês</span>
                          </div>
                          {plan.one_time_price && (
                            <p className="text-sm text-muted-foreground">
                              ou <strong>{formatCurrency(plan.one_time_price, currency)}</strong> pagamento único (2 anos)
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Limits */}
                    <div className="border-t pt-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Convidados</span>
                        <strong>{plan.max_guests === null ? "Ilimitados" : `Até ${plan.max_guests}`}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Colaboradores</span>
                        <strong>{plan.max_collaborators === null ? "Ilimitados" : `Até ${plan.max_collaborators}`}</strong>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => navigate("/auth")}
                    >
                      {plan.price === 0 ? "Começar Grátis" : "Escolher Plano"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Comparação Detalhada</h2>
            <p className="text-muted-foreground">Veja exatamente o que cada plano inclui</p>
          </div>
          <div className="max-w-5xl mx-auto overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Funcionalidade</TableHead>
                  {plans.map(p => (
                    <TableHead key={p.id} className="text-center min-w-[120px]">
                      <span className="font-semibold">{p.display_name}</span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Limits rows */}
                <TableRow className="bg-muted/30">
                  <TableCell className="font-medium" colSpan={plans.length + 1}>
                    Limites
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Máx. Convidados</TableCell>
                  {plans.map(p => (
                    <TableCell key={p.id} className="text-center font-medium">
                      {p.max_guests === null ? "Ilimitados" : p.max_guests}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Máx. Colaboradores</TableCell>
                  {plans.map(p => (
                    <TableCell key={p.id} className="text-center font-medium">
                      {p.max_collaborators === null ? "Ilimitados" : p.max_collaborators}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Feature rows grouped by category */}
                {Object.entries(groupedFeatures).map(([category, feats]) => (
                  <>
                    <TableRow key={`cat-${category}`} className="bg-muted/30">
                      <TableCell className="font-medium" colSpan={plans.length + 1}>
                        {category}
                      </TableCell>
                    </TableRow>
                    {feats.map(f => (
                      <TableRow key={f.feature_key}>
                        <TableCell>{f.display_name}</TableCell>
                        {plans.map(p => (
                          <TableCell key={p.id} className="text-center">
                            {f.plans[p.name] ? (
                              <Check className="w-5 h-5 text-primary mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Comece a planear o seu casamento hoje
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
            Registe-se gratuitamente e descubra todas as funcionalidades da plataforma.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-4 h-auto bg-background text-primary hover:bg-background/90"
            onClick={() => navigate("/auth")}
          >
            Criar Conta Gratuita
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

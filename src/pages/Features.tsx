import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart, Users, DollarSign, Calendar, Globe, Crown, Send, Palette,
  Target, Shield, BarChart3, Camera, Bell, Zap, FileText, ShoppingBag,
  ArrowRight, CheckCircle, Sparkles, TrendingUp, Lock, Smartphone,
  Clock, Map, Video, Image, BookOpen, UserPlus, Settings, Layers,
  Star, ArrowLeft
} from "lucide-react";
import heroImage from "@/assets/wedding-hero.jpg";

const featuresSections = [
  {
    category: "Planeamento Inteligente",
    icon: Target,
    color: "from-primary to-accent",
    features: [
      {
        icon: Target,
        title: "Calculadora de Orçamento Inteligente",
        description: "Estimativa automática baseada na região, estilo, número de convidados e estação do ano. Preços reais do mercado português.",
        highlight: true,
      },
      {
        icon: Calendar,
        title: "Cronograma Automatizado",
        description: "Timeline personalizada com tarefas sugeridas baseadas na data do casamento. Prioridades, categorias e lembretes automáticos.",
      },
      {
        icon: Palette,
        title: "Escolhas & Decisões",
        description: "Organize todas as decisões: paleta de cores, menu, música, flores, fotografia e transporte. Compare opções lado a lado.",
      },
    ],
  },
  {
    category: "Gestão de Convidados",
    icon: Users,
    color: "from-accent to-primary",
    features: [
      {
        icon: Users,
        title: "Lista de Convidados Completa",
        description: "Gestão com filtros por categoria, lado (noivo/noiva), faixa etária, restrições alimentares, mesas e confirmações.",
        highlight: true,
      },
      {
        icon: UserPlus,
        title: "Importação & Exportação",
        description: "Importe convidados em massa e exporte listas em PDF para fornecedores com todas as informações relevantes.",
      },
      {
        icon: DollarSign,
        title: "Custo por Convidado",
        description: "Cálculo automático do custo por pessoa com base na faixa etária (crianças, adultos) e percentuais configuráveis.",
      },
    ],
  },
  {
    category: "Orçamento Profissional",
    icon: DollarSign,
    color: "from-primary to-accent",
    features: [
      {
        icon: DollarSign,
        title: "Categorias Personalizáveis",
        description: "Crie categorias ilimitadas com orçamentos individuais, ícones e cores. Acompanhe gastos vs. planeado em tempo real.",
        highlight: true,
      },
      {
        icon: BarChart3,
        title: "Gráficos & Relatórios",
        description: "Visualizações interativas com gráficos de pizza, barras e progresso. Identifique rapidamente onde está a gastar mais.",
      },
      {
        icon: ShoppingBag,
        title: "Comparação de Fornecedores",
        description: "Compare opções de fornecedores por categoria com preços, avaliações, contactos e notas. Marque favoritos.",
      },
    ],
  },
  {
    category: "Página do Evento",
    icon: Globe,
    color: "from-accent to-primary",
    features: [
      {
        icon: Globe,
        title: "Landing Page Pública",
        description: "Página personalizada com countdown, mapa interativo, detalhes do local, dress code e RSVP online.",
        highlight: true,
      },
      {
        icon: Video,
        title: "Multimédia",
        description: "Integração com YouTube/Vimeo, galeria de fotos e textos personalizados incluindo versos e poemas.",
      },
      {
        icon: Layers,
        title: "6 Temas Premium",
        description: "Romântico, Rústico, Clássico, Moderno, Jardim e Praia — cada um com paleta de cores e tipografia única.",
      },
    ],
  },
  {
    category: "Colaboração & Papéis",
    icon: Send,
    color: "from-primary to-accent",
    features: [
      {
        icon: Send,
        title: "Gestão de Colaboradores",
        description: "Convide noivos, celebrantes, padrinhos, organizadores. Cada papel tem permissões e acesso adequados.",
        highlight: true,
      },
      {
        icon: Crown,
        title: "Convites de Papel Personalizados",
        description: "Convites únicos para cada papel especial com mensagens personalizadas, manual interativo e animações.",
      },
      {
        icon: BookOpen,
        title: "Guia Interativo de Papéis",
        description: "Manual completo para cada papel: responsabilidades, do's & don'ts, FAQ — tudo configurável pelo admin.",
      },
    ],
  },
  {
    category: "Segurança & Infraestrutura",
    icon: Shield,
    color: "from-accent to-primary",
    features: [
      {
        icon: Shield,
        title: "Segurança de Nível Empresarial",
        description: "Row-Level Security, encriptação SSL/TLS, autenticação robusta e conformidade RGPD completa.",
      },
      {
        icon: Zap,
        title: "Sincronização em Tempo Real",
        description: "Atualizações instantâneas para todos os colaboradores. Mudanças refletidas em milissegundos.",
      },
      {
        icon: Smartphone,
        title: "100% Responsivo",
        description: "Funciona perfeitamente em desktop, tablet e telemóvel. Progressive Web App com suporte offline parcial.",
      },
    ],
  },
];

const metrics = [
  { value: "15+", label: "Funcionalidades Core" },
  { value: "6", label: "Temas Premium" },
  { value: "9", label: "Papéis de Colaboração" },
  { value: "3", label: "Planos de Subscrição" },
  { value: "2", label: "Idiomas (PT/EN)" },
  { value: "3", label: "Moedas (€/$​/R$)" },
];

export default function Features() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Admin
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="font-bold text-primary">WeddingEasy</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Wedding" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-accent/80" />
        </div>
        <div className="relative z-10 container mx-auto px-6 text-center">
          <Badge className="mb-6 bg-background/20 text-primary-foreground text-sm px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" /> Plataforma Completa de Planeamento de Casamentos
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            WeddingEasy
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
            A solução SaaS mais completa para planeamento de casamentos em Portugal.
            Automatize, colabore e realize o casamento perfeito.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-primary-foreground/80 text-sm">
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Multi-idioma</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Multi-moeda</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Tempo Real</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> RGPD Compliant</div>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="py-12 bg-card border-b">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {metrics.map((m, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{m.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      {featuresSections.map((section, sIdx) => (
        <section key={sIdx} className={`py-16 md:py-24 ${sIdx % 2 === 0 ? "bg-background" : "bg-card"}`}>
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                <section.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">{section.category}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {section.features.map((f, fIdx) => (
                <Card key={fIdx} className={`relative overflow-hidden transition-all hover:shadow-lg ${f.highlight ? "border-primary/30 bg-primary/5" : ""}`}>
                  <CardContent className="p-6">
                    {f.highlight && (
                      <Badge variant="secondary" className="absolute top-4 right-4 text-xs">Destaque</Badge>
                    )}
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <f.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Tech Stack */}
      <section className="py-16 bg-card border-t">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Stack Tecnológica</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["React 18", "TypeScript", "Tailwind CSS", "Supabase", "Stripe", "i18next", "React Query", "Radix UI", "Vite", "RLS Security"].map((t) => (
              <Badge key={t} variant="outline" className="text-sm px-4 py-2">{t}</Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Teaser */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Preparado Para Escalar</h2>
          <p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto mb-8">
            Arquitetura multi-tenant, modelo de receita híbrido (subscrições + pagamentos únicos),
            marketplace de fornecedores e sistema de domínios personalizados.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-background/20 text-primary-foreground px-4 py-2"><TrendingUp className="w-4 h-4 mr-2" /> SaaS B2C</Badge>
            <Badge className="bg-background/20 text-primary-foreground px-4 py-2"><ShoppingBag className="w-4 h-4 mr-2" /> Marketplace</Badge>
            <Badge className="bg-background/20 text-primary-foreground px-4 py-2"><Globe className="w-4 h-4 mr-2" /> Domínios Custom</Badge>
            <Badge className="bg-background/20 text-primary-foreground px-4 py-2"><Lock className="w-4 h-4 mr-2" /> Enterprise Ready</Badge>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} WeddingEasy — Documento confidencial para investidores</p>
        </div>
      </footer>
    </div>
  );
}

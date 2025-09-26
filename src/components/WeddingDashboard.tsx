import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Users, 
  DollarSign, 
  Calendar, 
  CheckCircle,
  Plus,
  Minus,
  Target,
  TrendingUp
} from "lucide-react";
import heroImage from "@/assets/wedding-hero.jpg";

interface Guest {
  id: string;
  name: string;
  category: 'familia' | 'amigos' | 'trabalho';
  confirmed: boolean;
}

interface BudgetItem {
  id: string;
  category: string;
  budgeted: number;
  spent: number;
  priority: 'alta' | 'media' | 'baixa';
}

const WeddingDashboard = () => {
  const [guests, setGuests] = useState<Guest[]>([
    { id: '1', name: 'Maria Silva', category: 'familia', confirmed: true },
    { id: '2', name: 'João Santos', category: 'amigos', confirmed: false },
    { id: '3', name: 'Ana Costa', category: 'trabalho', confirmed: true },
  ]);

  const [budget, setBudget] = useState<BudgetItem[]>([
    { id: '1', category: 'Local da Cerimônia', budgeted: 8000, spent: 7500, priority: 'alta' },
    { id: '2', category: 'Vestido de Noiva', budgeted: 3000, spent: 2800, priority: 'alta' },
    { id: '3', category: 'Catering', budgeted: 12000, spent: 0, priority: 'alta' },
    { id: '4', category: 'Flores & Decoração', budgeted: 4000, spent: 1200, priority: 'media' },
    { id: '5', category: 'Fotografia', budgeted: 5000, spent: 5000, priority: 'alta' },
    { id: '6', category: 'Música', budgeted: 2000, spent: 0, priority: 'media' },
  ]);

  const [guestCount, setGuestCount] = useState(120);
  
  const totalBudget = budget.reduce((sum, item) => sum + item.budgeted, 0);
  const totalSpent = budget.reduce((sum, item) => sum + item.spent, 0);
  const budgetProgress = (totalSpent / totalBudget) * 100;
  
  const confirmedGuests = guests.filter(g => g.confirmed).length;
  const guestProgress = (confirmedGuests / guests.length) * 100;

  const checklistItems = [
    { task: 'Escolher local da cerimônia', completed: true },
    { task: 'Comprar vestido de noiva', completed: true },
    { task: 'Contratar fotógrafo', completed: true },
    { task: 'Enviar convites', completed: false },
    { task: 'Escolher cardápio', completed: false },
    { task: 'Definir decoração', completed: false },
  ];

  const completedTasks = checklistItems.filter(item => item.completed).length;
  const progressPercentage = (completedTasks / checklistItems.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden rounded-b-3xl">
        <img 
          src={heroImage} 
          alt="Wedding Planning" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/60" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Nosso Casamento dos Sonhos
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Planeje cada detalhe do seu dia especial
            </p>
            <div className="flex items-center justify-center gap-6">
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                <Heart className="w-5 h-5 mr-2" />
                {guests.length} Convidados
              </Badge>
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                <Calendar className="w-5 h-5 mr-2" />
                6 meses restantes
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="card-romantic animate-scale-in">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{guests.length}</h3>
              <p className="text-muted-foreground">Convidados</p>
            </CardContent>
          </Card>

          <Card className="card-romantic animate-scale-in" style={{animationDelay: '0.1s'}}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                R$ {totalBudget.toLocaleString()}
              </h3>
              <p className="text-muted-foreground">Orçamento Total</p>
            </CardContent>
          </Card>

          <Card className="card-romantic animate-scale-in" style={{animationDelay: '0.2s'}}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{completedTasks}</h3>
              <p className="text-muted-foreground">Tarefas Concluídas</p>
            </CardContent>
          </Card>

          <Card className="card-romantic animate-scale-in" style={{animationDelay: '0.3s'}}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{Math.round(progressPercentage)}%</h3>
              <p className="text-muted-foreground">Progresso Geral</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Guest Management */}
          <Card className="card-romantic animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Gerenciar Convidados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total de convidados</span>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setGuestCount(Math.max(0, guestCount - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="counter-badge">{guestCount}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setGuestCount(guestCount + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Confirmados</span>
                  <span>{confirmedGuests}/{guests.length}</span>
                </div>
                <Progress value={guestProgress} className="h-2" />
              </div>

              <div className="space-y-3">
                {['familia', 'amigos', 'trabalho'].map((category) => {
                  const categoryGuests = guests.filter(g => g.category === category);
                  const categoryCount = categoryGuests.length;
                  
                  return (
                    <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="capitalize font-medium">{category}</span>
                      <Badge variant="secondary">{categoryCount}</Badge>
                    </div>
                  );
                })}
              </div>

              <Button className="btn-gradient w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Convidado
              </Button>
            </CardContent>
          </Card>

          {/* Budget Overview */}
          <Card className="card-romantic animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-accent" />
                Controle de Orçamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Gasto atual</span>
                  <span>R$ {totalSpent.toLocaleString()} / R$ {totalBudget.toLocaleString()}</span>
                </div>
                <Progress value={budgetProgress} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {budgetProgress < 80 ? '✅ Dentro do orçamento' : '⚠️ Atenção ao orçamento'}
                </p>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {budget.map((item) => {
                  const progress = (item.spent / item.budgeted) * 100;
                  const isOverBudget = progress > 100;
                  
                  return (
                    <div key={item.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm">{item.category}</h4>
                          <p className="text-xs text-muted-foreground">
                            R$ {item.spent.toLocaleString()} / R$ {item.budgeted.toLocaleString()}
                          </p>
                        </div>
                        <Badge 
                          variant={item.priority === 'alta' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      <Progress 
                        value={Math.min(progress, 100)} 
                        className={`h-1 ${isOverBudget ? 'bg-destructive/20' : ''}`}
                      />
                    </div>
                  );
                })}
              </div>

              <Button className="btn-gradient w-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                Adicionar Despesa
              </Button>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="card-romantic animate-fade-in-up lg:col-span-2" style={{animationDelay: '0.4s'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Timeline de Preparação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm text-muted-foreground">Progresso geral</span>
                  <span className="font-semibold">{Math.round(progressPercentage)}% concluído</span>
                </div>
                <Progress value={progressPercentage} className="h-3 mb-6" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {checklistItems.map((item, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                        item.completed 
                          ? 'bg-success/10 text-success-foreground' 
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <CheckCircle 
                        className={`w-5 h-5 ${
                          item.completed ? 'text-success' : 'text-muted-foreground'
                        }`}
                      />
                      <span className={item.completed ? 'line-through' : ''}>{item.task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WeddingDashboard;
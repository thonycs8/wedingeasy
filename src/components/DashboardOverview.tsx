import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { formatCurrency } from "@/i18n";
import { useSettings } from "@/contexts/SettingsContext";
import { useWeddingData } from "@/contexts/WeddingContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { differenceInDays, format, isBefore } from "date-fns";
import { pt } from "date-fns/locale";
import { BudgetCharts } from "./BudgetCharts";

interface Task {
  id: string;
  title: string;
  due_date: string;
  completed: boolean;
  priority: string;
  category: string;
}

interface BudgetCategory {
  id: string;
  name: string;
  budgeted_amount: number;
  spent_amount: number;
  priority: 'alta' | 'media' | 'baixa';
  color: string;
}

export const DashboardOverview = ({ onNavigateToTab }: { onNavigateToTab: (tab: string) => void }) => {
  const { t } = useTranslation();
  const { currency } = useSettings();
  const { weddingData } = useWeddingData();
  const { user } = useAuth();
  
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [guestCount, setGuestCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    // Load tasks
    const { data: tasks } = await supabase
      .from('timeline_tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (tasks) {
      const now = new Date();
      const upcoming = tasks
        .filter(t => !t.completed && isBefore(new Date(t.due_date), new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)))
        .slice(0, 5);
      const overdue = tasks.filter(t => !t.completed && isBefore(new Date(t.due_date), now));
      
      setUpcomingTasks(upcoming);
      setOverdueTasks(overdue);
      setTotalTasks(tasks.length);
      setCompletedTasks(tasks.filter(t => t.completed).length);
    }

    // Load budget data
    const { data: budgetCategories } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('user_id', user.id);

    if (budgetCategories) {
      setCategories(budgetCategories as BudgetCategory[]);
      const total = budgetCategories.reduce((sum, cat) => sum + Number(cat.budgeted_amount), 0);
      const spent = budgetCategories.reduce((sum, cat) => sum + Number(cat.spent_amount), 0);
      setTotalBudget(total);
      setTotalSpent(spent);
    }

    // Load guest data
    const { data: guests } = await supabase
      .from('guests')
      .select('*')
      .eq('user_id', user.id);

    if (guests) {
      setGuestCount(guests.length);
      setConfirmedCount(guests.filter(g => g.confirmed).length);
    }
  };

  const weddingDate = weddingData?.wedding.date ? new Date(weddingData.wedding.date) : null;
  const daysUntilWedding = weddingDate ? differenceInDays(weddingDate, new Date()) : null;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'text-destructive bg-destructive/10';
      case 'media': return 'text-warning bg-warning/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Days Until Wedding */}
        <Card className="card-romantic overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <Badge variant="outline" className="bg-background/50">
                {weddingDate ? format(weddingDate, "dd MMM", { locale: pt }) : 'N/A'}
              </Badge>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">
              {daysUntilWedding !== null ? daysUntilWedding : '--'}
            </h3>
            <p className="text-muted-foreground text-sm">dias até o grande dia</p>
          </CardContent>
        </Card>

        {/* Budget Status */}
        <Card className="card-romantic overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-transparent rounded-bl-full" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <Badge 
                variant="outline" 
                className={budgetProgress > 90 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}
              >
                {budgetProgress.toFixed(0)}%
              </Badge>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">
              {formatCurrency(totalSpent, currency)}
            </h3>
            <p className="text-muted-foreground text-sm">de {formatCurrency(totalBudget, currency)}</p>
          </CardContent>
        </Card>

        {/* Guest Status */}
        <Card className="card-romantic overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-success/20 to-transparent rounded-bl-full" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-success" />
              </div>
              <Badge variant="outline" className="bg-background/50">
                {guestCount > 0 ? `${((confirmedCount / guestCount) * 100).toFixed(0)}%` : '0%'}
              </Badge>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">
              {confirmedCount}
            </h3>
            <p className="text-muted-foreground text-sm">de {guestCount} confirmados</p>
          </CardContent>
        </Card>

        {/* Tasks Progress */}
        <Card className="card-romantic overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <Badge variant="outline" className="bg-background/50">
                {progressPercentage.toFixed(0)}%
              </Badge>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">
              {completedTasks}
            </h3>
            <p className="text-muted-foreground text-sm">de {totalTasks} tarefas</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="card-romantic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Progresso Geral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Planeamento do Casamento</span>
              <span className="text-sm font-semibold text-primary">{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedTasks} de {totalTasks} tarefas concluídas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">Concluídas</span>
              </div>
              <p className="text-2xl font-bold">{completedTasks}</p>
            </div>

            <div className="p-4 rounded-lg bg-warning/10">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium">Próximas</span>
              </div>
              <p className="text-2xl font-bold">{upcomingTasks.length}</p>
            </div>

            <div className="p-4 rounded-lg bg-destructive/10">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium">Atrasadas</span>
              </div>
              <p className="text-2xl font-bold">{overdueTasks.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Charts */}
      {categories.length > 0 && (
        <BudgetCharts 
          categories={categories}
          totalBudget={totalBudget}
          totalSpent={totalSpent}
        />
      )}

      {/* Upcoming Tasks & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card className="card-romantic">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Próximas Tarefas
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigateToTab('timeline')}
              >
                Ver todas
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(task.due_date), "dd MMM", { locale: pt })}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Sem tarefas próximas</p>
                <p className="text-sm mt-1">Está tudo em dia!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts & Overdue */}
        <Card className="card-romantic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Alertas e Tarefas Atrasadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueTasks.length > 0 || budgetProgress > 90 ? (
              <div className="space-y-3">
                {budgetProgress > 100 && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-destructive text-sm">Orçamento ultrapassado</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ultrapassou em {formatCurrency(totalSpent - totalBudget, currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {budgetProgress > 90 && budgetProgress <= 100 && (
                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-warning text-sm">Orçamento quase esgotado</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Restam apenas {formatCurrency(totalBudget - totalSpent, currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {overdueTasks.slice(0, 3).map((task) => (
                  <div 
                    key={task.id}
                    className="p-4 rounded-lg bg-destructive/10 border border-destructive/20"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-destructive text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Atrasada desde {format(new Date(task.due_date), "dd MMM", { locale: pt })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {overdueTasks.length > 3 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => onNavigateToTab('timeline')}
                  >
                    Ver mais {overdueTasks.length - 3} tarefas atrasadas
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-success opacity-50" />
                <p className="text-success font-medium">Tudo em ordem!</p>
                <p className="text-sm mt-1">Sem alertas ou tarefas atrasadas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

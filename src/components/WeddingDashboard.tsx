import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Users, 
  DollarSign, 
  Calendar, 
  CheckCircle,
  Target,
  Palette,
  Settings
} from "lucide-react";
import heroImage from "@/assets/wedding-hero.jpg";
import { LanguageCurrencySelector } from "@/components/LanguageCurrencySelector";
import { useWeddingData } from "@/contexts/WeddingContext";
import { BudgetManager } from "@/components/BudgetManager";
import { TimelineManager } from "@/components/TimelineManager";
import { WeddingChoices } from "@/components/WeddingChoices";

interface Guest {
  id: string;
  name: string;
  category: 'family' | 'friends' | 'work';
  confirmed: boolean;
}

const WeddingDashboard = () => {
  const { t } = useTranslation();
  const { weddingData } = useWeddingData();
  
  // Use data from questionnaire if available, otherwise use defaults
  const [guests] = useState<Guest[]>([
    { id: '1', name: 'Maria Silva', category: 'family', confirmed: true },
    { id: '2', name: 'João Santos', category: 'friends', confirmed: false },
    { id: '3', name: 'Ana Costa', category: 'work', confirmed: true },
  ]);

  // Use questionnaire data if available
  const coupleNames = weddingData ? `${weddingData.couple.name} & ${weddingData.couple.partnerName}` : t('hero.title');

  const confirmedGuests = guests.filter(g => g.confirmed).length;

  const checklistItems = [
    { task: t('tasks.chooseVenue'), completed: true },
    { task: t('tasks.buyDress'), completed: true },
    { task: t('tasks.hirePhotographer'), completed: true },
    { task: t('tasks.sendInvites'), completed: false },
    { task: t('tasks.chooseMenu'), completed: false },
    { task: t('tasks.defineDecoration'), completed: false },
  ];

  const completedTasks = checklistItems.filter(item => item.completed).length;
  const progressPercentage = (completedTasks / checklistItems.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header with Language/Currency Selector and Wedding Data Actions */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {weddingData && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (confirm(t('dashboard.reset.confirm'))) {
                window.location.href = '/';
              }
            }}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {t('dashboard.reset.button')}
          </Button>
        )}
        <LanguageCurrencySelector />
      </div>

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
              {coupleNames}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {t('hero.subtitle')}
            </p>
            <div className="flex items-center justify-center gap-6">
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                <Heart className="w-5 h-5 mr-2" />
                {guests.length} {t('hero.guests')}
              </Badge>
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                <Calendar className="w-5 h-5 mr-2" />
                6 {t('hero.remaining')}
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
              <p className="text-muted-foreground">{t('stats.guests')}</p>
            </CardContent>
          </Card>

          <Card className="card-romantic animate-scale-in" style={{animationDelay: '0.1s'}}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                {weddingData?.wedding.estimatedBudget ? `€${weddingData.wedding.estimatedBudget.toLocaleString()}` : '€34.000'}
              </h3>
              <p className="text-muted-foreground">{t('stats.totalBudget')}</p>
            </CardContent>
          </Card>

          <Card className="card-romantic animate-scale-in" style={{animationDelay: '0.2s'}}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{completedTasks}</h3>
              <p className="text-muted-foreground">{t('stats.completedTasks')}</p>
            </CardContent>
          </Card>

          <Card className="card-romantic animate-scale-in" style={{animationDelay: '0.3s'}}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{Math.round(progressPercentage)}%</h3>
              <p className="text-muted-foreground">{t('stats.overallProgress')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="budget" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {t('budget.title')}
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t('timeline.title')}
            </TabsTrigger>
            <TabsTrigger value="choices" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              {t('choices.title')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="budget" className="space-y-6">
            <BudgetManager />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <TimelineManager />
          </TabsContent>

          <TabsContent value="choices" className="space-y-6">
            <WeddingChoices />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WeddingDashboard;
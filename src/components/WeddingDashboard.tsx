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
  Palette,
  Settings,
  LogOut,
  Camera,
  LayoutDashboard,
  UserPlus
} from "lucide-react";
import heroImage from "@/assets/wedding-hero.jpg";
import { LanguageCurrencySelector } from "@/components/LanguageCurrencySelector";
import { useWeddingData } from "@/contexts/WeddingContext";
import { useAuth } from "@/hooks/useAuth";
import { BudgetManager } from "@/components/BudgetManager";
import { TimelineManager } from "@/components/TimelineManager";
import { WeddingChoices } from "@/components/WeddingChoices";
import { GuestManager } from "@/components/GuestManager";
import { PhotoGallery } from "@/components/PhotoGallery";
import { NotificationCenter } from "@/components/NotificationCenter";
import { DashboardOverview } from "@/components/DashboardOverview";
import { CollaboratorsManager } from "@/components/CollaboratorsManager";
import { useToast } from "@/hooks/use-toast";

const WeddingDashboard = () => {
  const { t } = useTranslation();
  const { weddingData, clearWeddingData } = useWeddingData();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCollaborators, setShowCollaborators] = useState(false);
  
  // Use questionnaire data if available
  const coupleNames = weddingData ? `${weddingData.couple.name} & ${weddingData.couple.partnerName}` : t('hero.title');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header with Language/Currency Selector and Wedding Data Actions */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowCollaborators(true)}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {t('collaborators.manage')}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={async () => {
            await signOut();
            toast({
              title: "Sessão terminada",
              description: "Até breve!",
            });
          }}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
        {weddingData && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (confirm(t('dashboard.reset.confirm'))) {
                clearWeddingData();
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

      <CollaboratorsManager 
        open={showCollaborators} 
        onOpenChange={setShowCollaborators} 
      />

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
                {t('hero.subtitle')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
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
            <TabsTrigger value="guests" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Convidados
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Galeria
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Notificações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview onNavigateToTab={setActiveTab} />
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <BudgetManager />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <TimelineManager />
          </TabsContent>

          <TabsContent value="choices" className="space-y-6">
            <WeddingChoices />
          </TabsContent>

          <TabsContent value="guests" className="space-y-6">
            <GuestManager />
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <PhotoGallery />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WeddingDashboard;
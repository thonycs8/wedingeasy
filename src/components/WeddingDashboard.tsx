import { useState, createElement } from "react";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
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
  UserPlus,
  Menu,
  ShoppingBag
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { ServicesMarketplace } from "@/components/ServicesMarketplace";
import { CeremonyRoles } from "@/components/CeremonyRoles";
import { useToast } from "@/hooks/use-toast";

const WeddingDashboard = () => {
  const { t } = useTranslation();
  const { weddingData, clearWeddingData } = useWeddingData();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Use questionnaire data if available
  const coupleNames = weddingData ? `${weddingData.couple.name} & ${weddingData.couple.partnerName}` : t('hero.title');

  const tabs = [
    { value: "overview", icon: LayoutDashboard, label: "Visão Geral" },
    { value: "budget", icon: DollarSign, label: t('budget.title') },
    { value: "timeline", icon: Calendar, label: t('timeline.title') },
    { value: "choices", icon: Palette, label: t('choices.title') },
    { value: "guests", icon: Users, label: "Convidados" },
    { value: "ceremony", icon: Heart, label: "Cerimônia" },
    { value: "services", icon: ShoppingBag, label: "Serviços" },
    { value: "photos", icon: Camera, label: "Galeria" },
    { value: "notifications", icon: Settings, label: "Notificações" },
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header with Language/Currency Selector and Wedding Data Actions */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border py-3 px-4">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-foreground">Wedding Plan</h2>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCollaborators(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('collaborators.manage')}</span>
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
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sair</span>
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
              >
                <span className="hidden sm:inline">{t('dashboard.reset.button')}</span>
                <span className="sm:hidden">Reset</span>
              </Button>
            )}
            <LanguageCurrencySelector />
          </div>
        </div>
      </div>

      <CollaboratorsManager 
        open={showCollaborators} 
        onOpenChange={setShowCollaborators} 
      />

      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {isMobile ? (
            <div className="mb-8">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      {tabs.find(tab => tab.value === activeTab)?.icon && 
                        createElement(tabs.find(tab => tab.value === activeTab)!.icon, { className: "w-4 h-4" })}
                      {tabs.find(tab => tab.value === activeTab)?.label}
                    </span>
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-2">
                    {tabs.map((tab) => (
                      <Button
                        key={tab.value}
                        variant={activeTab === tab.value ? "default" : "ghost"}
                        className="w-full justify-start gap-2"
                        onClick={() => handleTabChange(tab.value)}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <TabsList className="grid w-full grid-cols-8 mb-8">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          )}

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

          <TabsContent value="ceremony" className="space-y-6">
            <CeremonyRoles />
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <ServicesMarketplace />
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <PhotoGallery />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter />
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default WeddingDashboard;
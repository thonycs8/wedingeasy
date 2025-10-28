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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
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
import { WeddingDashboardSidebar } from "@/components/WeddingDashboardSidebar";
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
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted w-full flex">
        {/* Sidebar for Desktop */}
        {!isMobile && (
          <WeddingDashboardSidebar 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with Language/Currency Selector and Wedding Data Actions */}
          <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border py-3 px-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {!isMobile && <SidebarTrigger />}
                <h2 className="text-lg font-semibold text-foreground">Wedding Plan</h2>
              </div>
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
          <div className="relative h-48 md:h-64 overflow-hidden">
            <img 
              src={heroImage}
              alt="Wedding Planning" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/60" />
            <div className="absolute inset-0 flex items-center justify-center text-center px-4">
              <div className="animate-fade-in-up">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                  {coupleNames}
                </h1>
                <p className="text-lg text-white/90">
                  {t('hero.subtitle')}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-8">
            {/* Mobile Menu */}
            {isMobile && (
              <div className="mb-6">
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
            )}

            {/* Content Area */}
            <div className="space-y-6">
              {activeTab === "overview" && <DashboardOverview onNavigateToTab={setActiveTab} />}
              {activeTab === "budget" && <BudgetManager />}
              {activeTab === "timeline" && <TimelineManager />}
              {activeTab === "choices" && <WeddingChoices />}
              {activeTab === "guests" && <GuestManager />}
              {activeTab === "ceremony" && <CeremonyRoles />}
              {activeTab === "services" && <ServicesMarketplace />}
              {activeTab === "photos" && <PhotoGallery />}
              {activeTab === "notifications" && <NotificationCenter />}
            </div>
          </div>
          
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default WeddingDashboard;
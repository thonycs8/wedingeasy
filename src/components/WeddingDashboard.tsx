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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header with Language/Currency Selector and Wedding Data Actions */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border py-3 px-4 shadow-sm">
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

      {/* Navigation Bar */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-[60px] z-40">
        <div className="container mx-auto">
          {isMobile ? (
            <div className="p-4">
              <Select value={activeTab} onValueChange={handleTabChange}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      {tabs.find(tab => tab.value === activeTab)?.icon && 
                        createElement(tabs.find(tab => tab.value === activeTab)!.icon, { className: "w-4 h-4" })}
                      {tabs.find(tab => tab.value === activeTab)?.label}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {tabs.map((tab) => (
                    <SelectItem key={tab.value} value={tab.value}>
                      <span className="flex items-center gap-2">
                        {createElement(tab.icon, { className: "w-4 h-4" })}
                        {tab.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <nav className="flex items-center overflow-x-auto py-2 px-4">
              {tabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={activeTab === tab.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleTabChange(tab.value)}
                  className={`
                    flex items-center gap-2 whitespace-nowrap
                    ${activeTab === tab.value 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"}
                  `}
                >
                  {createElement(tab.icon, { className: "w-4 h-4" })}
                  <span className="hidden lg:inline">{tab.label}</span>
                </Button>
              ))}
            </nav>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">

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
  );
};

export default WeddingDashboard;
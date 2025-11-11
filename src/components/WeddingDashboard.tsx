import { useState, createElement, useEffect } from "react";
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
  // Camera,
  LayoutDashboard,
  UserPlus,
  Menu,
  ShoppingBag,
  Bell,
  User
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
// import { PhotoGallery } from "@/components/PhotoGallery";
import { NotificationCenter } from "@/components/NotificationCenter";
import { DashboardOverview } from "@/components/DashboardOverview";
import { CollaboratorsManager } from "@/components/CollaboratorsManager";
import { ServicesMarketplace } from "@/components/ServicesMarketplace";
import { CeremonyRoles } from "@/components/CeremonyRoles";
import { UserProfile } from "@/components/UserProfile";
import { WeddingDetailsEditor } from "@/components/WeddingDetailsEditor";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const WeddingDashboard = () => {
  const { t } = useTranslation();
  const { weddingData, clearWeddingData } = useWeddingData();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showWeddingDetails, setShowWeddingDetails] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [coupleNames, setCoupleNames] = useState<string>(t('hero.title'));
  const [userName, setUserName] = useState<string>("");
  const isMobile = useIsMobile();

  const loadCoupleNames = async () => {
    if (!user) return;

    // Get user name first
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (userProfile) {
      // Get only first and last name
      const firstName = userProfile.first_name?.trim() || '';
      const lastName = userProfile.last_name?.trim() || '';
      setUserName(firstName && lastName ? `${firstName} ${lastName}` : firstName || 'Perfil');
    }

    // Try to get wedding data where user is owner
    let { data: weddingData } = await supabase
      .from('wedding_data')
      .select('couple_name, partner_name')
      .eq('user_id', user.id)
      .maybeSingle();

    // If not owner, check if user is collaborator
    if (!weddingData) {
      const { data: collabData } = await supabase
        .from('wedding_collaborators')
        .select('wedding_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (collabData) {
        // Get wedding data
        const { data: wedding } = await supabase
          .from('wedding_data')
          .select('couple_name, partner_name')
          .eq('id', collabData.wedding_id)
          .single();

        weddingData = wedding;
      }
    }

    // Set couple names from wedding_data fields - Noiva primeiro
    if (weddingData) {
      const couple = weddingData.couple_name?.trim() || '';
      const partner = weddingData.partner_name?.trim() || '';

      if (partner && couple) {
        setCoupleNames(`${partner} & ${couple}`);
      } else if (partner) {
        setCoupleNames(partner);
      } else if (couple) {
        setCoupleNames(couple);
      } else {
        setCoupleNames(t('hero.title'));
      }
    }
  };

  useEffect(() => {
    if (!user) return;

    const loadUnreadCount = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (!error && data) {
        setUnreadCount(data.length);
      }
    };

    loadUnreadCount();
    loadCoupleNames();

    // Subscribe to real-time updates for notifications
    const notificationChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    // Subscribe to real-time updates for wedding_data and profiles
    const weddingChannel = supabase
      .channel('wedding-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wedding_data'
        },
        () => {
          loadCoupleNames();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          loadCoupleNames();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
      supabase.removeChannel(weddingChannel);
    };
  }, [user]);

  const tabs = [
    { value: "overview", icon: LayoutDashboard, label: "Início", fullLabel: "Visão Geral" },
    { value: "budget", icon: DollarSign, label: "Orçamento", fullLabel: t('budget.title') },
    { value: "timeline", icon: Calendar, label: "Cronograma", fullLabel: t('timeline.title') },
    { value: "choices", icon: Palette, label: "Escolhas", fullLabel: t('choices.title') },
    { value: "guests", icon: Users, label: "Convidados", fullLabel: "Convidados" },
    { value: "ceremony", icon: Heart, label: "Cerimônia", fullLabel: "Cerimônia" },
    { value: "services", icon: ShoppingBag, label: "Serviços", fullLabel: "Serviços" },
    // { value: "photos", icon: Camera, label: "Galeria", fullLabel: "Galeria" },
    { value: "notifications", icon: Settings, label: "Configurações", fullLabel: "Notificações" },
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted w-full">
      {/* Header with Language/Currency Selector and Wedding Data Actions */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border py-2 px-3 sm:py-3 sm:px-4 shadow-sm">
        <div className="container mx-auto flex items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">weddingeasy</h2>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Wedding Details */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowWeddingDetails(true)}
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
              title="Detalhes do Casamento"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline sm:ml-2">Detalhes</span>
            </Button>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setActiveTab("notifications")}
              className="relative h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline sm:ml-2">Alertas</span>
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center px-1 text-[10px]"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* Collaborators */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowCollaborators(true)}
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline sm:ml-2">{t('collaborators.manage')}</span>
            </Button>

            {/* User Profile */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowProfile(true)}
              className="h-8 px-2 sm:h-9 sm:px-3"
            >
              <User className="w-4 h-4" />
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm">{userName || 'Perfil'}</span>
            </Button>

            {/* Logout */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={async () => {
                await signOut();
                toast({
                  title: "Sessão terminada",
                  description: "Até breve!",
                });
              }}
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline sm:ml-2">Sair</span>
            </Button>
          </div>
        </div>
      </div>

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

      {/* Navigation Bar - Global/Sticky */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border shadow-sm sticky top-[73px] z-40">
        <div className="container mx-auto">
          {isMobile ? (
            <div className="p-3">
              <Select value={activeTab} onValueChange={handleTabChange}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      {tabs.find(tab => tab.value === activeTab)?.icon && 
                        createElement(tabs.find(tab => tab.value === activeTab)!.icon, { className: "w-4 h-4" })}
                      {tabs.find(tab => tab.value === activeTab)?.fullLabel}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {tabs.map((tab) => (
                    <SelectItem key={tab.value} value={tab.value}>
                      <span className="flex items-center gap-2">
                        {createElement(tab.icon, { className: "w-4 h-4" })}
                        {tab.fullLabel}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <nav className="flex items-center gap-1 py-3 px-4">
              <div className="flex items-center justify-center gap-1 flex-1">
                {tabs.map((tab) => (
                  <Button
                    key={tab.value}
                    variant={activeTab === tab.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleTabChange(tab.value)}
                    className={`
                      flex items-center gap-1.5 whitespace-nowrap text-xs
                      ${activeTab === tab.value 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "hover:bg-muted"}
                    `}
                  >
                    {createElement(tab.icon, { className: "w-3.5 h-3.5" })}
                    <span>{tab.label}</span>
                  </Button>
                ))}
              </div>
            </nav>
          )}
        </div>
      </div>

      {/* Main Content Area - No Sidebar */}
      <div className="flex-1 container mx-auto px-6 py-8">
        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === "overview" && <DashboardOverview onNavigateToTab={setActiveTab} />}
          {activeTab === "budget" && <BudgetManager />}
          {activeTab === "timeline" && <TimelineManager />}
          {activeTab === "choices" && <WeddingChoices />}
          {activeTab === "guests" && <GuestManager />}
          {activeTab === "ceremony" && <CeremonyRoles />}
          {activeTab === "services" && <ServicesMarketplace />}
          {/* {activeTab === "photos" && <PhotoGallery />} */}
          {activeTab === "notifications" && <NotificationCenter />}
        </div>
      </div>
      
      <Footer />

      <WeddingDetailsEditor
        open={showWeddingDetails}
        onOpenChange={setShowWeddingDetails}
        onUpdate={loadCoupleNames}
      />

      <CollaboratorsManager 
        open={showCollaborators} 
        onOpenChange={setShowCollaborators} 
      />

      <UserProfile 
        open={showProfile} 
        onOpenChange={setShowProfile} 
      />
    </div>
  );
};

export default WeddingDashboard;

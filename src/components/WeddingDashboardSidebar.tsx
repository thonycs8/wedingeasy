import { createElement } from "react";
import { useTranslation } from "react-i18next";
import { 
  LayoutDashboard,
  DollarSign,
  Calendar,
  Palette,
  Users,
  Heart,
  ShoppingBag,
  Camera,
  Settings
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface WeddingDashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function WeddingDashboardSidebar({ activeTab, onTabChange }: WeddingDashboardSidebarProps) {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

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

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "text-center" : ""}>
            {isCollapsed ? "Menu" : "Planejamento"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tabs.map((tab) => (
                <SidebarMenuItem key={tab.value}>
                  <SidebarMenuButton
                    isActive={activeTab === tab.value}
                    onClick={() => onTabChange(tab.value)}
                    className={`
                      ${activeTab === tab.value 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "hover:bg-muted/50"}
                    `}
                  >
                    {createElement(tab.icon, { className: "h-4 w-4" })}
                    {!isCollapsed && <span>{tab.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

// Tipos de notificação
export const NOTIFICATION_TYPES = [
  'info',
  'success',
  'warning',
  'error',
  'reminder',
  'task_due',
  'guest_confirmed',
  'budget_alert'
] as const;

export type NotificationType = typeof NOTIFICATION_TYPES[number];

// Tipo base da Notification alinhado com o schema Supabase
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType | string;
  read: boolean;
  scheduled_for: string | null;
  created_at: string;
}

// Tipo para criação de Notification
export interface NotificationCreate {
  user_id: string;
  title: string;
  message: string;
  type?: NotificationType | string;
  read?: boolean;
  scheduled_for?: string | null;
}

// Tipo para atualização de Notification
export interface NotificationUpdate extends Partial<Omit<Notification, 'id' | 'user_id' | 'created_at'>> {
  id: string;
}

// Filtros para notificações
export interface NotificationFilters {
  type?: NotificationType | string | 'all';
  read?: boolean | 'all';
  dateRange?: {
    start: string;
    end: string;
  };
}

// Estatísticas de notificações
export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

// Preferências de notificação do usuário
export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  taskReminders: boolean;
  guestUpdates: boolean;
  budgetAlerts: boolean;
  reminderDaysBefore: number;
}

// Labels para tipos
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  info: 'Informação',
  success: 'Sucesso',
  warning: 'Aviso',
  error: 'Erro',
  reminder: 'Lembrete',
  task_due: 'Tarefa Próxima',
  guest_confirmed: 'Confirmação de Convidado',
  budget_alert: 'Alerta de Orçamento'
};

// Ícones para tipos (Lucide icon names)
export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  info: 'Info',
  success: 'CheckCircle',
  warning: 'AlertTriangle',
  error: 'XCircle',
  reminder: 'Bell',
  task_due: 'Clock',
  guest_confirmed: 'UserCheck',
  budget_alert: 'DollarSign'
};

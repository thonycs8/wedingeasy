import { supabase } from '@/integrations/supabase/client';
import type { 
  Notification, 
  NotificationCreate, 
  NotificationUpdate,
  NotificationStats 
} from '@/types/notification.types';

/**
 * API layer para operações de Notifications no Supabase
 */
export const notificationsApi = {
  /**
   * Busca todas as notificações de um usuário
   */
  async fetchAll(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Notification[];
  },

  /**
   * Busca notificações não lidas
   */
  async fetchUnread(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Notification[];
  },

  /**
   * Cria uma nova notificação
   */
  async create(notification: NotificationCreate): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  },

  /**
   * Marca notificação como lida
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  },

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  /**
   * Atualiza uma notificação
   */
  async update({ id, ...updates }: NotificationUpdate): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  },

  /**
   * Deleta uma notificação
   */
  async delete(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  },

  /**
   * Deleta todas as notificações lidas
   */
  async deleteAllRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('read', true);

    if (error) throw error;
  },

  /**
   * Busca estatísticas de notificações
   */
  async fetchStats(userId: string): Promise<NotificationStats> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const notifications = (data || []) as Notification[];
    const unread = notifications.filter(n => !n.read).length;

    const byType: Record<string, number> = {};
    notifications.forEach(n => {
      byType[n.type] = (byType[n.type] || 0) + 1;
    });

    return {
      total: notifications.length,
      unread,
      byType
    };
  }
};

import { supabase } from '@/integrations/supabase/client';
import type { 
  Notification, 
  NotificationCreate, 
  NotificationUpdate,
} from '@/types/notification.types';

/**
 * API layer para operações de Notifications no Supabase
 * Migrado para usar wedding_id em vez de user_id
 */
export const notificationsApi = {
  /**
   * Busca todas as notificações de um wedding
   */
  async fetchAll(weddingId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Notification[];
  },

  /**
   * Busca notificações não lidas de um wedding
   */
  async fetchUnread(weddingId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('wedding_id', weddingId)
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
   * Marca todas as notificações como lidas para um wedding
   */
  async markAllAsRead(weddingId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('wedding_id', weddingId)
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
   * Deleta todas as notificações lidas de um wedding
   */
  async deleteAllRead(weddingId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('wedding_id', weddingId)
      .eq('read', true);

    if (error) throw error;
  },
};

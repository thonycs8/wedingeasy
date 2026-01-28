import { supabase } from '@/integrations/supabase/client';
import type { Guest, GuestCreate, GuestUpdate, GuestBulkUpdate } from '@/types/guest.types';

/**
 * API layer para operações de Guests no Supabase
 * Funções puras que retornam dados ou lançam erros
 */
export const guestsApi = {
  /**
   * Busca todos os guests de um usuário
   */
  async fetchAll(userId: string): Promise<Guest[]> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;
    return (data || []) as Guest[];
  },

  /**
   * Busca um guest específico por ID
   */
  async fetchById(guestId: string): Promise<Guest | null> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('id', guestId)
      .maybeSingle();

    if (error) throw error;
    return data as Guest | null;
  },

  /**
   * Cria um novo guest
   */
  async create(guest: GuestCreate): Promise<Guest> {
    const { data, error } = await supabase
      .from('guests')
      .insert([guest])
      .select()
      .single();

    if (error) throw error;
    return data as Guest;
  },

  /**
   * Atualiza um guest existente
   */
  async update({ id, ...updates }: GuestUpdate): Promise<Guest> {
    const { data, error } = await supabase
      .from('guests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Guest;
  },

  /**
   * Atualiza múltiplos guests de uma vez
   */
  async bulkUpdate({ ids, data: updates }: GuestBulkUpdate): Promise<Guest[]> {
    const { data, error } = await supabase
      .from('guests')
      .update(updates)
      .in('id', ids)
      .select();

    if (error) throw error;
    return (data || []) as Guest[];
  },

  /**
   * Deleta um guest
   */
  async delete(guestId: string): Promise<void> {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', guestId);

    if (error) throw error;
  },

  /**
   * Deleta múltiplos guests de uma vez
   */
  async bulkDelete(guestIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('guests')
      .delete()
      .in('id', guestIds);

    if (error) throw error;
  },

  /**
   * Busca guests com papel especial (para cerimónia)
   */
  async fetchWithSpecialRoles(userId: string): Promise<Guest[]> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('user_id', userId)
      .not('special_role', 'is', null)
      .order('special_role', { ascending: true });

    if (error) throw error;
    return (data || []) as Guest[];
  },

  /**
   * Atualiza papel especial de um guest
   */
  async updateSpecialRole(guestId: string, role: string | null, side?: string | null): Promise<Guest> {
    const updates: Partial<Guest> = { special_role: role };
    if (side !== undefined) {
      updates.side = side as Guest['side'];
    }

    const { data, error } = await supabase
      .from('guests')
      .update(updates)
      .eq('id', guestId)
      .select()
      .single();

    if (error) throw error;
    return data as Guest;
  },

  /**
   * Busca contagem de guests por status de confirmação
   */
  async fetchConfirmationStats(userId: string): Promise<{ confirmed: number; pending: number; total: number }> {
    const { data, error } = await supabase
      .from('guests')
      .select('confirmed')
      .eq('user_id', userId);

    if (error) throw error;

    const guests = data || [];
    const confirmed = guests.filter(g => g.confirmed).length;
    
    return {
      total: guests.length,
      confirmed,
      pending: guests.length - confirmed
    };
  }
};

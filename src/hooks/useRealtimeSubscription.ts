import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

type TableName = 'guests' | 'budget_categories' | 'budget_expenses' | 'timeline_tasks' | 'notifications';

/**
 * Hook para subscrever a mudanças em tempo real de uma tabela
 * Invalida queries automaticamente quando há mudanças
 */
export function useRealtimeSubscription(
  weddingId: string | null,
  tables: TableName[],
  enabled: boolean = true
) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!weddingId || !enabled || tables.length === 0) {
      return;
    }

    // Create a unique channel name
    const channelName = `wedding-${weddingId}-${tables.join('-')}`;

    // Subscribe to changes
    const channel = supabase.channel(channelName);

    tables.forEach((table) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: `wedding_id=eq.${weddingId}`,
        },
        (payload) => {
          console.log(`[Realtime] ${table} changed:`, payload.eventType);
          
          // Invalidate relevant queries based on table
          switch (table) {
            case 'guests':
              queryClient.invalidateQueries({ queryKey: ['guests-paginated', weddingId] });
              queryClient.invalidateQueries({ queryKey: ['guests-infinite', weddingId] });
              queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', weddingId] });
              break;
            case 'budget_categories':
              queryClient.invalidateQueries({ queryKey: ['budget-categories', weddingId] });
              queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', weddingId] });
              break;
            case 'budget_expenses':
              queryClient.invalidateQueries({ queryKey: ['budget-expenses-paginated', weddingId] });
              queryClient.invalidateQueries({ queryKey: ['budget-expenses-infinite', weddingId] });
              queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', weddingId] });
              break;
            case 'timeline_tasks':
              queryClient.invalidateQueries({ queryKey: ['timeline', weddingId] });
              queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', weddingId] });
              break;
            case 'notifications':
              queryClient.invalidateQueries({ queryKey: ['notifications', weddingId] });
              queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', weddingId] });
              break;
          }
        }
      );
    });

    channel.subscribe((status) => {
      console.log(`[Realtime] Subscription status for ${channelName}:`, status);
    });

    channelRef.current = channel;

    // Cleanup on unmount or dependency change
    return () => {
      console.log(`[Realtime] Unsubscribing from ${channelName}`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [weddingId, tables.join(','), enabled, queryClient]);

  return {
    isSubscribed: !!channelRef.current,
  };
}

/**
 * Hook de conveniência para subscrever a todas as tabelas principais
 */
export function useWeddingRealtime(weddingId: string | null) {
  return useRealtimeSubscription(
    weddingId,
    ['guests', 'budget_categories', 'budget_expenses', 'timeline_tasks', 'notifications'],
    true
  );
}

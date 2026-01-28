import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos - dados considerados frescos
      gcTime: 1000 * 60 * 30,   // 30 minutos - tempo de garbage collection
      retry: 2,                  // 2 tentativas em caso de erro
      refetchOnWindowFocus: false, // Não refetch ao focar na janela
      refetchOnReconnect: true,    // Refetch ao reconectar
    },
    mutations: {
      retry: 1, // 1 tentativa em caso de erro
    },
  },
});

// Query Keys centralizadas para consistência
export const queryKeys = {
  guests: (userId: string) => ['guests', userId] as const,
  guest: (userId: string, guestId: string) => ['guests', userId, guestId] as const,
  timeline: (userId: string) => ['timeline', userId] as const,
  task: (userId: string, taskId: string) => ['timeline', userId, taskId] as const,
  budget: {
    categories: (userId: string) => ['budget', 'categories', userId] as const,
    expenses: (userId: string) => ['budget', 'expenses', userId] as const,
    options: (userId: string) => ['budget', 'options', userId] as const,
  },
  ceremony: (userId: string) => ['ceremony', userId] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
  wedding: (userId: string) => ['wedding', userId] as const,
  collaborators: (weddingId: string) => ['collaborators', weddingId] as const,
} as const;

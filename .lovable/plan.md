
# 🚀 Plano de Refatoração Avançado - WeddingEasy MVP

## 📊 Análise do Estado Atual

### Métricas de Complexidade Identificadas
| Componente | Linhas | Responsabilidades | Prioridade |
|------------|--------|-------------------|------------|
| GuestManager.tsx | 1505 | 8+ (CRUD, filtros, bulk ops, export, forms) | 🔴 Crítico |
| BudgetManager.tsx | 1165 | 7+ (categorias, expenses, options, charts) | 🔴 Crítico |
| CeremonyRoles.tsx | 887 | 5+ (roles, bulk, export) | 🟡 Alto |
| TimelineManager.tsx | 625 | 5+ (tasks, suggestions, progress) | 🟡 Alto |
| GuestListManager.tsx | 560 | 4+ (tabela, inline edit, bulk) | 🟢 Moderado |

### Problemas Arquiteturais Identificados

1. **React Query instalado mas NÃO UTILIZADO** - O QueryClient está configurado no App.tsx mas NENHUM componente usa `useQuery` ou `useMutation`

2. **Estado local duplicado** - Cada componente tem seu próprio `useState` para dados similares (guests, loading, etc.)

3. **Lógica de negócio acoplada à UI** - Funções como `loadGuests`, `bulkUpdateSelected` estão diretamente nos componentes

4. **Ausência de tipos centralizados** - Interface `Guest` definida em 3 locais diferentes (GuestManager, GuestListManager, CeremonyRoles)

5. **Sem camada de serviços** - Chamadas diretas ao Supabase espalhadas em cada componente

---

## 🏗️ Arquitetura Proposta

```text
src/
├── api/                         # Camada de API/Services
│   ├── guests.api.ts           # CRUD Supabase para guests
│   ├── timeline.api.ts         # CRUD Supabase para timeline
│   ├── budget.api.ts           # CRUD Supabase para budget
│   ├── ceremony.api.ts         # CRUD Supabase para ceremony
│   └── notifications.api.ts    # CRUD Supabase para notifications
│
├── hooks/
│   ├── queries/                 # React Query hooks
│   │   ├── useGuests.ts        # Query + Mutations para guests
│   │   ├── useTimeline.ts      # Query + Mutations para timeline
│   │   ├── useBudget.ts        # Query + Mutations para budget
│   │   ├── useCeremony.ts      # Query + Mutations para ceremony
│   │   └── useNotifications.ts # Query + Mutations para notifications
│   ├── useAuth.tsx             # (existente)
│   └── use-mobile.tsx          # (existente)
│
├── types/
│   ├── guest.types.ts          # Guest, GuestFilters, GuestStats
│   ├── timeline.types.ts       # TimelineTask, TaskCategory
│   ├── budget.types.ts         # BudgetCategory, Expense, Option
│   ├── ceremony.types.ts       # CeremonyRole
│   └── common.types.ts         # Tipos compartilhados
│
├── components/
│   ├── features/
│   │   ├── guests/
│   │   │   ├── GuestManager.tsx      # Container principal (refatorado)
│   │   │   ├── GuestFilters.tsx      # Filtros e busca
│   │   │   ├── GuestTable.tsx        # Tabela de convidados
│   │   │   ├── GuestForm.tsx         # Formulário add/edit
│   │   │   ├── GuestStats.tsx        # Estatísticas
│   │   │   ├── GuestBulkActions.tsx  # Ações em massa
│   │   │   └── GuestImport.tsx       # Importação CSV
│   │   │
│   │   ├── timeline/
│   │   │   ├── TimelineManager.tsx   # Container principal
│   │   │   ├── TimelineList.tsx      # Lista de tarefas
│   │   │   ├── TimelineItem.tsx      # Item individual
│   │   │   ├── TimelineForm.tsx      # Formulário
│   │   │   ├── TimelineProgress.tsx  # Barra de progresso
│   │   │   └── TimelineSuggestions.tsx # Sugestões inteligentes
│   │   │
│   │   ├── budget/
│   │   │   ├── BudgetManager.tsx     # Container principal
│   │   │   ├── BudgetOverview.tsx    # Visão geral
│   │   │   ├── BudgetCategories.tsx  # Gestão de categorias
│   │   │   ├── BudgetExpenses.tsx    # Lista de despesas
│   │   │   ├── BudgetOptions.tsx     # Opções de fornecedores
│   │   │   └── BudgetCharts.tsx      # (existente)
│   │   │
│   │   ├── ceremony/
│   │   │   ├── CeremonyRoles.tsx     # Container principal
│   │   │   ├── CeremonyRoleList.tsx  # Lista de papéis
│   │   │   ├── CeremonyRoleForm.tsx  # Formulário
│   │   │   └── CeremonyBySide.tsx    # Agrupamento por lado
│   │   │
│   │   └── notifications/
│   │       ├── NotificationCenter.tsx # Container
│   │       ├── NotificationList.tsx   # Lista
│   │       └── NotificationItem.tsx   # Item individual
│   │
│   ├── shared/
│   │   ├── LoadingState.tsx         # Estado de loading reutilizável
│   │   ├── EmptyState.tsx           # Estado vazio reutilizável
│   │   ├── ErrorState.tsx           # Estado de erro reutilizável
│   │   ├── ConfirmDialog.tsx        # Diálogo de confirmação
│   │   ├── BulkDeleteDialog.tsx     # Diálogo de exclusão em massa
│   │   └── ExportButton.tsx         # Botão de exportação PDF
│   │
│   └── ui/                          # (shadcn - sem alterações)
│
├── lib/
│   ├── utils.ts                     # (existente)
│   ├── query-client.ts              # Configuração otimizada do QueryClient
│   └── constants.ts                 # Constantes globais
│
└── contexts/
    ├── SettingsContext.tsx          # (existente)
    └── WeddingContext.tsx           # (existente)
```

---

## 📋 Fases de Implementação

### **Fase 1: Fundação (Quick Wins)**
**Duração estimada: 2-3 mensagens**

#### 1.1 Configuração do QueryClient Otimizado
- Criar `src/lib/query-client.ts` com configurações de cache e retry
- Atualizar `App.tsx` para usar a configuração otimizada

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30,   // 30 minutos (cacheTime renomeado)
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

#### 1.2 Tipos Centralizados
- Criar `src/types/guest.types.ts`, `timeline.types.ts`, etc.
- Remover definições duplicadas dos componentes

#### 1.3 Camada de API
- Criar `src/api/guests.api.ts` com todas as funções de acesso ao Supabase
- Padrão: funções puras que retornam dados ou lançam erros

---

### **Fase 2: React Query Hooks**
**Duração estimada: 3-4 mensagens**

#### 2.1 Hook useGuests

```typescript
// src/hooks/queries/useGuests.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestsApi } from '@/api/guests.api';
import type { Guest, GuestFilters } from '@/types/guest.types';

export const useGuests = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const guestsQuery = useQuery({
    queryKey: ['guests', userId],
    queryFn: () => guestsApi.fetchAll(userId!),
    enabled: !!userId,
  });

  const addGuestMutation = useMutation({
    mutationFn: guestsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', userId] });
    },
  });

  const updateGuestMutation = useMutation({
    mutationFn: guestsApi.update,
    onMutate: async (updatedGuest) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['guests', userId] });
      const previousGuests = queryClient.getQueryData(['guests', userId]);
      queryClient.setQueryData(['guests', userId], (old: Guest[]) =>
        old.map(g => g.id === updatedGuest.id ? { ...g, ...updatedGuest } : g)
      );
      return { previousGuests };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['guests', userId], context?.previousGuests);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', userId] });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: guestsApi.bulkUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', userId] });
    },
  });

  const deleteGuestMutation = useMutation({
    mutationFn: guestsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', userId] });
    },
  });

  return {
    guests: guestsQuery.data ?? [],
    isLoading: guestsQuery.isLoading,
    isError: guestsQuery.isError,
    error: guestsQuery.error,
    addGuest: addGuestMutation,
    updateGuest: updateGuestMutation,
    bulkUpdate: bulkUpdateMutation,
    deleteGuest: deleteGuestMutation,
  };
};
```

#### 2.2 Hooks para Timeline, Budget, Ceremony, Notifications
- Mesma estrutura do useGuests
- Cada hook encapsula toda a lógica de dados da feature

---

### **Fase 3: Componentização**
**Duração estimada: 4-5 mensagens**

#### 3.1 Componentes Shared
- `LoadingState.tsx` - Skeleton/Spinner reutilizável
- `EmptyState.tsx` - Estado vazio com ícone e mensagem
- `ErrorState.tsx` - Estado de erro com retry
- `ConfirmDialog.tsx` - AlertDialog padronizado
- `BulkDeleteDialog.tsx` - Diálogo de exclusão em massa

#### 3.2 Refatoração do GuestManager
- Extrair `GuestFilters.tsx` (busca, categoria, status, lado)
- Extrair `GuestStats.tsx` (estatísticas por lado/faixa etária)
- Extrair `GuestBulkActions.tsx` (seleção, update, delete em massa)
- Extrair `GuestForm.tsx` (formulário de add/edit)
- Container principal usa o hook `useGuests`

#### 3.3 Refatoração dos outros componentes
- Seguir o mesmo padrão de extração
- Cada container usa seu respectivo hook

---

### **Fase 4: Performance e UX**
**Duração estimada: 2-3 mensagens**

#### 4.1 Virtualização de Listas
- Instalar `react-window` ou `@tanstack/react-virtual`
- Aplicar em GuestTable para listas 500+ convidados

#### 4.2 Estados Consistentes
- Loading skeletons em todos os componentes
- Error boundaries por feature
- Toast feedback padronizado

#### 4.3 Mobile First
- Revisar layouts responsivos
- Testar todas as features em viewport móvel

---

## 🔧 Detalhes Técnicos

### Padrão de Nomenclatura
| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `GuestFilters.tsx` |
| Hooks | camelCase + use | `useGuests.ts` |
| API | camelCase + .api | `guests.api.ts` |
| Types | camelCase + .types | `guest.types.ts` |
| Constantes | UPPER_SNAKE_CASE | `DEFAULT_ROLES` |

### Padrão de Query Keys
```typescript
// Consistência nas query keys
['guests', userId]           // Lista de convidados
['guests', userId, guestId]  // Convidado específico
['timeline', userId]         // Lista de tarefas
['budget', userId]           // Dados de orçamento
['ceremony', userId]         // Papéis de cerimônia
['notifications', userId]    // Notificações
```

### Padrão de Error Handling
```typescript
// Em cada mutation
onError: (error) => {
  console.error('Mutation error:', error);
  toast.error('Erro ao realizar operação');
},
onSuccess: () => {
  toast.success('Operação realizada com sucesso!');
},
```

---

## 📊 Benefícios Esperados

### Performance
- **Cache automático** via React Query (menos chamadas à API)
- **Optimistic updates** para UX instantânea
- **Virtualização** para listas grandes (10x mais rápido)

### Manutenibilidade
- **Componentes 80% menores** (de 1500 para ~200-300 linhas)
- **Tipos centralizados** (uma única fonte de verdade)
- **Lógica de dados isolada** (hooks testáveis)

### Escalabilidade
- **Adicionar features** sem tocar em componentes existentes
- **Reutilizar hooks** em novos contextos
- **Substituir Supabase** alterando apenas a camada de API

### Developer Experience
- **Autocomplete** melhorado com tipos centralizados
- **Debugging** facilitado com React Query DevTools
- **Testes** mais simples com hooks isolados

---

## 🎯 Ordem de Execução Recomendada

1. **Fase 1.1** - QueryClient otimizado
2. **Fase 1.2** - Tipos centralizados (guest.types.ts)
3. **Fase 1.3** - API layer (guests.api.ts)
4. **Fase 2.1** - Hook useGuests
5. **Fase 3.1** - Componentes shared
6. **Fase 3.2** - Refatorar GuestManager
7. Repetir para Timeline, Budget, Ceremony, Notifications
8. **Fase 4** - Performance e Mobile

Cada fase pode ser implementada de forma incremental, mantendo o app funcional durante todo o processo.

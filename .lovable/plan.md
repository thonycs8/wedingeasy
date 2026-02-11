

# Fase 3: Migrar APIs/Hooks para wedding_id e Componentizar

## Resumo

Todos os hooks e APIs actuais filtram por `user_id`, mas o backend (RLS, RPCs, indices) ja esta preparado para `wedding_id`. Os 4 componentes principais (GuestManager 1593 linhas, BudgetManager 1165 linhas, TimelineManager 625 linhas, CeremonyRoles ~890 linhas) fazem chamadas directas ao Supabase. Este plano conecta tudo ao sistema optimizado, reduzindo queries e custos server-side.

## O que muda para o utilizador

Visualmente nada muda. A interface continua identica. Mas internamente:
- Menos queries ao servidor (1 RPC agregado no dashboard em vez de 4+ queries separadas)
- Paginacao server-side em vez de carregar tudo de uma vez
- Cache inteligente (5 min staleTime, optimistic updates)
- Preparado para escalar sem aumentar custos

---

## Etapa 1 -- Migrar API layer de user_id para wedding_id

Actualizar os 4 ficheiros de API:

- **guests.api.ts**: Todas as funcoes passam a aceitar `weddingId` e filtrar por `.eq('wedding_id', weddingId)`. Create passa a incluir `wedding_id`.
- **budget.api.ts**: Idem para categories, expenses e options. Remover `fetchStats` (ja existe RPC `get_wedding_dashboard_metrics`).
- **timeline.api.ts**: Idem para tasks. Remover `fetchStats`.
- **notifications.api.ts**: Idem para notifications. Remover `fetchStats`.

---

## Etapa 2 -- Migrar hooks de user_id para wedding_id

Actualizar os 4 hooks React Query para receber `weddingId` em vez de `userId`:

- **useGuests.ts**: Query key muda para `['guests', weddingId]`. Remove `calculateStats` (dashboard usa RPC).
- **useBudget.ts**: Idem. Query keys: `['budget-categories', weddingId]`, `['budget-expenses', weddingId]`.
- **useTimeline.ts**: Idem. Remove `statsQuery` local.
- **useNotifications.ts**: Idem. Remove `statsQuery` local.

O hook `useDashboardMetrics` ja existe e usa o RPC agregado -- sera o unico ponto de stats.

---

## Etapa 3 -- Refatorar GuestManager (1593 linhas)

O `GuestManagerRefactored` ja existe com 458 linhas e sub-componentes em `src/components/features/guests/`. Falta:
1. Migrar de `useGuests(user?.id)` para `useGuests(weddingId)` (apos Etapa 2)
2. Substituir o import no `WeddingDashboard.tsx` de `GuestManager` para `GuestManagerRefactored`
3. Remover o ficheiro antigo `GuestManager.tsx` (1593 linhas)

---

## Etapa 4 -- Refatorar BudgetManager (1165 linhas -> ~5 ficheiros)

Criar `src/components/features/budget/`:

| Ficheiro | Responsabilidade |
|---|---|
| BudgetOverview.tsx | Resumo total vs gasto, barra de progresso |
| BudgetCategoryList.tsx | Lista de categorias com add/edit/delete |
| BudgetExpenseList.tsx | Despesas por categoria com paginacao |
| BudgetOptionList.tsx | Opcoes de fornecedores |
| BudgetManagerRefactored.tsx | Orquestrador (~200 linhas) usando hooks migrados |

O `WeddingDashboard.tsx` passa a importar `BudgetManagerRefactored`. O antigo `BudgetManager.tsx` e removido.

---

## Etapa 5 -- Refatorar TimelineManager (625 linhas -> ~4 ficheiros)

Criar `src/components/features/timeline/`:

| Ficheiro | Responsabilidade |
|---|---|
| TimelineList.tsx | Lista filtrada de tarefas |
| TimelineForm.tsx | Formulario de adicionar/editar tarefa |
| TimelineProgress.tsx | Barra de progresso global |
| TimelineManagerRefactored.tsx | Orquestrador usando useTimeline(weddingId) |

---

## Etapa 6 -- Refatorar CeremonyRoles (~890 linhas -> ~3 ficheiros)

Criar `src/components/features/ceremony/`:

| Ficheiro | Responsabilidade |
|---|---|
| CeremonyRoleList.tsx | Lista agrupada por lado (noivo/noiva) |
| CeremonyRoleForm.tsx | Formulario de atribuicao de papel |
| CeremonyRolesRefactored.tsx | Orquestrador |

---

## Detalhes tecnicos

### Impacto no servidor

```text
ANTES (por tab aberta):
  Dashboard: 4-6 queries separadas (guests, budget, timeline, notifications)
  GuestManager: select * from guests where user_id = X (carrega TUDO)
  BudgetManager: 3 queries (categories + expenses + options) com select *
  TimelineManager: 2 queries (tasks + stats calculados no cliente)
  Total por sessao: ~12-15 queries

DEPOIS:
  Dashboard: 1 RPC get_wedding_dashboard_metrics (ja existe)
  GuestManager: 1 RPC paginado get_guests_paginated (ja existe)
  BudgetManager: 1 RPC paginado get_budget_paginated + 1 query categories
  TimelineManager: 1 query com wedding_id (indexado)
  Total por sessao: ~4-5 queries
  Cache: 5 min staleTime = 0 queries se navegar entre tabs
```

### Hooks paginados ja existentes (prontos a usar)

- `useGuestsPaginated` -- chama RPC `get_guests_paginated`
- `useGuestMutations` -- mutations com invalidacao de cache correto
- `useBudgetExpensesPaginated` -- chama RPC `get_budget_paginated`
- `useBudgetMutations` -- mutations para categories e expenses
- `useDashboardMetrics` -- chama RPC `get_wedding_dashboard_metrics`

### Ordem de execucao

1. **Etapas 1+2** (APIs + hooks) -- base para tudo, sem mudanca visual
2. **Etapa 3** (GuestManager) -- apenas trocar import, refactored ja existe
3. **Etapa 4** (BudgetManager) -- maior esforco de componentizacao
4. **Etapa 5** (TimelineManager)
5. **Etapa 6** (CeremonyRoles)

Cada etapa mantem o app 100% funcional. A interface nao muda.

### Ficheiros afectados

- 4 APIs: `guests.api.ts`, `budget.api.ts`, `timeline.api.ts`, `notifications.api.ts`
- 4 hooks: `useGuests.ts`, `useBudget.ts`, `useTimeline.ts`, `useNotifications.ts`
- 1 query-client: `query-client.ts` (limpar legacy keys)
- ~15 novos sub-componentes em `src/components/features/`
- 1 ficheiro dashboard: `WeddingDashboard.tsx` (trocar imports)
- 4 ficheiros antigos removidos apos migracao

### Componentes shared ja prontos

`LoadingState`, `LoadingSkeleton`, `LoadingCard`, `LoadingTable`, `EmptyState`, `EmptyGuests`, `EmptyTimeline`, `EmptyBudget`, `EmptyNotifications`, `ErrorState`, `ConfirmDialog`, `DeleteConfirmDialog` -- todos em `src/components/shared/`.

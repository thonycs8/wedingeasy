
# Casais na Cerimonia + Links de Convite nos Cards

## Resumo

Duas melhorias na tab Cerimonia:
1. Permitir relacionar dois convidados como casal (ex: Padrinho + Madrinha que sao parceiros) usando um campo `couple_pair_id` na tabela `guests`
2. Mostrar o link de convite personalizado directamente no card de cada pessoa na tab Cerimonia

## O que muda para o utilizador

- No card de cada pessoa com papel de cerimonia, aparece um botao para copiar o link de convite (icone de link)
- Quando selecciona exactamente 2 pessoas com os checkboxes, aparece um botao "Emparelhar como Casal" na barra de accoes
- Casais emparelhados mostram um icone visual de ligacao e o nome do parceiro(a)
- Botao para desemparelhar tambem disponivel

---

## Etapa 1 -- Migracao DB

Adicionar coluna `couple_pair_id` (uuid, nullable) a tabela `guests`:

```sql
ALTER TABLE guests ADD COLUMN couple_pair_id uuid DEFAULT NULL;
```

Sem RLS adicional -- herda as policies existentes.

---

## Etapa 2 -- Botao de link no card (CeremonyRolesRefactored)

No `renderSide`, cada card de pessoa passa a incluir:
- Botao com icone Link2 que copia o link de convite para o clipboard
- O link e gerado com a mesma logica do `RoleLinkGenerator`: `/evento/{eventCode}?role={role}&guest={slug}`
- Para gerar o link, o componente precisa de obter o `event_code` do casamento (query simples ao `wedding_data`)
- Toast de confirmacao ao copiar

---

## Etapa 3 -- Emparelhamento de casais

Logica no `CeremonyRolesRefactored`:
- Quando `selectedRoleIds.size === 2`, mostrar botao "Emparelhar como Casal" na barra de accoes (junto ao "Excluir selecionados")
- Ao clicar, gera um UUID no cliente e actualiza ambos os guests com o mesmo `couple_pair_id` via `updateGuest`
- No card, se a pessoa tem `couple_pair_id`, mostrar um pequeno Badge ou texto "Casal com: [nome do parceiro]"
- Botao "Desemparelhar" no card (define `couple_pair_id = null` para ambos)
- Restricao: Noivo/Noiva nao podem ser emparelhados (ja sao casal implicito)

---

## Etapa 4 -- Actualizar RoleLinkGenerator para casais

No `LandingPageEditor.tsx`, casais emparelhados (mesmo `couple_pair_id`) aparecem juntos com um unico link partilhado usando parametros separados por virgula:
`?role=padrinho,madrinha&guest=joao,maria`

Pessoas sem par mantem link individual.

---

## Detalhes tecnicos

### Ficheiros modificados

- `src/components/features/ceremony/CeremonyRolesRefactored.tsx` -- botao copiar link + emparelhamento de casais + indicador visual
- `src/components/event/LandingPageEditor.tsx` -- RoleLinkGenerator agrupa casais com link unico
- `src/components/event/WeddingEventRoleInvite.tsx` -- suportar multiplos nomes/papeis no convite publico
- `src/pages/WeddingEvent.tsx` -- parsear parametros com virgula

### Migracao DB

Uma coluna: `couple_pair_id uuid` na tabela `guests`

### Impacto no servidor

Uma query adicional leve no CeremonyRolesRefactored para obter o `event_code` (cached). O emparelhamento reutiliza o `updateGuest` existente.


# Convites por Papel -- Links automaticos a partir da Cerimonia

## Resumo

Substituir o gerador manual de links (input de nome + select de papel) por uma lista automatica baseada nos convidados que ja tem `special_role` na tab Cerimonia. Padrinhos solteiros recebem link individual, sem necessidade de emparelhamento. Sem alteracoes no banco de dados.

## O que muda para o utilizador

- A tab "Convites por Papel" no editor da landing page mostra automaticamente todos os convidados com papel de cerimonia cadastrado
- Cada pessoa tem um link pronto para copiar
- Padrinhos solteiros, madrinhas solteiras, celebrantes, etc. -- todos recebem link individual
- Nao e preciso digitar nomes manualmente

---

## Alteracoes

### 1. Refazer RoleLinkGenerator no LandingPageEditor.tsx

Substituir o componente `RoleLinkGenerator` actual (que usa inputs manuais) por um que:

1. Recebe a lista de `guests` do hook `useGuests(weddingId)` (ja disponivel no contexto)
2. Filtra apenas os que tem `special_role` preenchido (mesma logica do CeremonyRolesRefactored)
3. Agrupa por papel (Padrinho, Madrinha, etc.)
4. Para cada pessoa, mostra:
   - Nome + badge do papel + lado (Noivo/Noiva)
   - Link gerado automaticamente: `/evento/CODE?role=padrinho&guest=joao-silva`
   - Botao de copiar
5. Se nao ha ninguem com papel, mostra mensagem: "Adicione pessoas na tab Cerimonia para gerar links"

### 2. Actualizar WeddingEventRoleInvite para normalizar nomes

O componente ja funciona para individuais. Apenas garantir que o `displayName` reconstroi correctamente nomes com hifens (ja faz isto: `.replace(/-/g, " ")`).

### 3. Adicionar useGuests ao LandingPageEditor

Importar `useGuests` e `useWeddingId` no `LandingPageEditor` para ter acesso a lista de convidados com papeis.

---

## Detalhes tecnicos

### Ficheiros modificados

- `src/components/event/LandingPageEditor.tsx` -- refazer `RoleLinkGenerator` para usar dados reais de guests com special_role, adicionar imports de useGuests

### Ficheiros sem alteracao

- Nenhuma migracao DB necessaria
- `CeremonyRolesRefactored.tsx` -- sem alteracoes (ja funciona correctamente)
- `WeddingEventRoleInvite.tsx` -- sem alteracoes (ja suporta individuais)
- `WeddingEvent.tsx` -- sem alteracoes (ja parseia role + guest params)

### Impacto no servidor

Zero queries adicionais. O `useGuests(weddingId)` ja esta em cache com 5 min staleTime. O `LandingPageEditor` apenas filtra os dados em memoria.

### Logica de geracao de link

```text
Para cada guest com special_role:
  slug = guest.name.toLowerCase().replace(/\s+/g, "-")
  role = guest.special_role.toLowerCase()
  link = /evento/{eventCode}?role={role}&guest={slug}
```

Exemplos:
- Joao Silva (Padrinho, Noivo) -> `?role=padrinho&guest=joao-silva`
- Maria Santos (Madrinha, Noiva) -> `?role=madrinha&guest=maria-santos`
- Pedro Costa (Celebrante, Noivo) -> `?role=celebrante&guest=pedro-costa`

Todos individuais. Sem complexidade de casais. Cada pessoa = 1 link.

## Melhorar exibição de papéis em convites de casal

### Problema

Quando um casal (ex: Wanderson e Bruna) recebe um convite conjunto, os badges de papel podem mostrar informação redundante:

- Se ambos são "Celebrante", aparece "Celebrante" + "Celebrante" (duplicado)
- Se um é "Padrinho" e outra é "Madrinha", mostra dois badges separados quando podia ser mais elegante

### Solução

Criar uma função `deduplicateRoleLabels` no `WeddingEventRoleInvite.tsx` que agrupa papéis inteligentemente:


| Cenário                | Papéis recebidos         | Exibição                                     |
| ---------------------- | ------------------------ | -------------------------------------------- |
| Mesmo papel (2x)       | Celebrante, Celebrante   | **Celebrantes**                              |
| Mesmo papel (2x)       | Padrinho, Padrinho       | **Padrinhos**                                |
| Par masculino/feminino | Padrinho, Madrinha       | **Padrinho & Madrinha**                      |
| Papéis diferentes      | Celebrante, Pai da Noiva | **Celebrante** + **Pai da Noiva** (2 badges) |


### Regras de agrupamento

1. Se todos os papéis forem iguais, mostrar apenas 1 badge no plural (ex: "Celebrantes", "Padrinhos")
2. Se forem pares gendered conhecidos (Padrinho/Madrinha, Dama de Honor/Pajem), mostrar 1 badge com "&"
3. Caso contrário, manter badges separados
4. o manual de cada papel so aparece depois de aceitar o convite e aparece no final da pagina isso precisa ser mudado e o tom do manual tem que ficar mais amigavel e menos impositivo

### Detalhes técnicos

**Ficheiro a alterar:** `src/components/event/WeddingEventRoleInvite.tsx`

1. Adicionar mapa de plurais e pares conhecidos:
  - `Celebrante` -> `Celebrantes`
  - `Padrinho` -> `Padrinhos`
  - `Padrinho` + `Madrinha` -> `Padrinho & Madrinha`
2. Criar função `smartRoleLabels(roleLabels: string[], isCouple: boolean)` que retorna um array reduzido de labels para os badges
3. Aplicar nos dois locais onde os badges são renderizados (vista pendente e vista aceite)

Alteracao simples e localizada -- apenas 1 ficheiro.
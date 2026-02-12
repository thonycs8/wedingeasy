
# Plano Completo: Administracao Total do WeddingEasy

## Resumo

Este plano cobre 3 areas de desenvolvimento e 1 pesquisa de mercado:

1. **Editor Admin para Landing Pages de Convites por Papel** -- controlo total sobre cada secao, icones, mensagens, configuracoes dos convites personalizados
2. **Editor Admin para Manuais por Papel** -- gerir o conteudo dos guias (responsabilidades, dicas, cuidados, FAQ) para cada papel
3. **Auditoria de funcionalidades que faltam no Admin** -- identificar e adicionar tudo o que so existe do lado do cliente
4. **Pesquisa de mercado e avaliacao do app**

---

## 1. Editor Admin de Landing Pages de Convites por Papel

O componente `AdminRoleInvitesManager.tsx` atual e apenas de leitura (ver detalhes, copiar link). Precisa de ser transformado num editor completo.

### O que sera editavel por convite/convidado:
- **Nome do convidado** (campo editavel)
- **Papeis especiais** (adicionar/remover papeis do array `special_role`)
- **Lado** (noivo/noiva/nenhum)
- **Estado de confirmacao** (marcar como aceite/pendente manualmente)
- **Couple pair** (associar/desassociar casais)

### Configuracoes globais dos convites por papel (por casamento):
- **Icones por papel** -- editar qual icone aparece para cada papel (Crown, Star, Heart, etc.)
- **Labels/nomes dos papeis** -- personalizar o texto que aparece no badge
- **Mensagem de convite** -- o texto "Voce foi convidado(a) para ser..."
- **Mensagem de aceitacao** -- o texto apos aceitar
- **Mensagem familiar** -- textos personalizados para papeis familiares
- **Cor do tema** (herda da landing page mas pode ser override)
- **Botao de aceitar** -- texto e visibilidade
- **Animacao de celebracao** -- ativar/desativar

### Implementacao tecnica:
- Expandir o `Dialog` de detalhes em `AdminRoleInvitesManager.tsx` para um editor multi-tab
- Tab "Dados" -- editar nome, papeis, lado, confirmacao
- Tab "Convite" -- preview e configuracao da aparencia do convite
- Tab "Casal" -- gerir emparelhamento
- Salvar alteracoes via `supabase.from("guests").update(...)` 
- Para configuracoes globais por casamento, criar uma nova tabela `wedding_role_invite_config` ou usar JSON em `wedding_landing_pages`

### Ficheiros afetados:
- `src/components/admin/AdminRoleInvitesManager.tsx` -- refatorar completamente
- Possivel migracao SQL para tabela de configuracao

---

## 2. Editor Admin para Manuais por Papel

Atualmente os manuais estao hardcoded em `WeddingEventRoleGuide.tsx` no objeto `ROLE_GUIDES`. O admin precisa de poder editar cada secao.

### O que sera editavel por papel:
- **Titulo do guia** (ex: "Guia do Padrinho")
- **Intro** -- texto de introducao
- **Responsabilidades** -- lista editavel (adicionar/remover/reordenar)
- **Dicas Uteis** -- lista editavel
- **Cuidados a Ter** -- lista editavel
- **FAQ** -- pares pergunta/resposta editaveis

### Abordagem:
- **Opcao escolhida**: Criar uma tabela `role_guides` no banco de dados para armazenar os guias personalizaveis, com fallback para os defaults hardcoded
- Novo componente `AdminRoleGuidesManager.tsx`
- Interface: lista dos papeis com botao de editar, abrindo dialog com formulario para cada secao
- O componente `WeddingEventRoleGuide.tsx` passa a consultar primeiro a BD e so usa os defaults se nao houver dados

### Tabela `role_guides`:
```text
id          uuid PK
role_key    text (padrinho, madrinha, celebrante, etc.)
title       text
intro       text
responsibilities  text[] (array)
dos         text[] (array)
donts       text[] (array)
faq         jsonb (array de {q, a})
updated_at  timestamptz
updated_by  uuid
```

### Ficheiros afetados:
- Novo: `src/components/admin/AdminRoleGuidesManager.tsx`
- Editar: `src/components/event/WeddingEventRoleGuide.tsx` (buscar dados da BD)
- Editar: `src/components/admin/AdminLandingPagesManager.tsx` (adicionar tab "Manuais")
- Migracao SQL para criar tabela + RLS

---

## 3. Auditoria: Funcionalidades que faltam no Admin

Apos analisar o dashboard do cliente vs o painel admin, aqui esta o que **ja existe** e o que **falta**:

### Ja existe no Admin:
- Visao Geral (stats)
- Gestao de Utilizadores (suspender, bloquear, eliminar RGPD)
- Gestao de Eventos (ativar/desativar, eliminar RGPD)
- Gestao de Admins
- Gestao de Modulos/Planos
- Gestao de Parceiros e Servicos
- Gestao de Dominios
- Editor de Landing Pages (5 tabs)
- Convites por Papel (leitura)

### Falta no Admin (existe so do lado do cliente):
| Funcionalidade | Componente Cliente | Prioridade |
|---|---|---|
| **Gerir Convidados** por casamento | `GuestManagerRefactored` | Alta |
| **Gerir Orcamento** por casamento | `BudgetManagerRefactored` | Alta |
| **Gerir Cronograma/Tarefas** por casamento | `TimelineManagerRefactored` | Alta |
| **Gerir Escolhas do Casamento** | `WeddingChoices` | Media |
| **Gerir Colaboradores** por casamento | `CollaboratorsManager` | Media |
| **Gerir Detalhes do Casamento** (nomes, data) | `WeddingDetailsEditor` | Alta |
| **Gerir Notificacoes** | `NotificationCenter` | Baixa |
| **Gerir Reservas de Servicos** | `ServicesMarketplace` | Media |
| **Gerir Subscricoes/Planos** por casamento | Parcial em Modulos | Media |

### Proposta de implementacao:
Criar um novo tab no Admin chamado **"Suporte ao Evento"** que, ao selecionar um casamento da lista, abre um painel com sub-tabs para gerir cada area desse casamento especifico:

- Sub-tab **Detalhes** -- editar nomes do casal, data, orcamento estimado, regiao, estilo
- Sub-tab **Convidados** -- ver/editar/adicionar/remover convidados
- Sub-tab **Orcamento** -- ver/editar categorias e despesas
- Sub-tab **Cronograma** -- ver/editar/marcar tarefas como concluidas
- Sub-tab **Escolhas** -- ver/editar decisoes do casamento
- Sub-tab **Colaboradores** -- ver/adicionar/remover colaboradores
- Sub-tab **Subscricao** -- ver/mudar plano do casamento

### Ficheiros novos:
- `src/components/admin/AdminEventSupport.tsx` (componente principal)
- Integrado como novo tab no `AdminPanel.tsx`

---

## 4. Pesquisa de Mercado: Valor do WeddingEasy

### Analise do Mercado de Wedding Planning Apps

**Concorrentes diretos:**
- **Zola** (EUA) -- avaliado em ~600M USD (2023), mas inclui registry e e-commerce
- **The Knot / WeddingWire** (Knot Worldwide) -- avaliado em ~1B USD, marketplace focus
- **Zankyou** (Europa) -- presente em 23 paises, modelo freemium + marketplace
- **Casamentos.pt** (Portugal) -- diretorio de fornecedores, sem ferramenta de planeamento robusta
- **Joy** (EUA) -- app gratuito de planeamento + website, financiado em ~25M USD

**Diferenciadores do WeddingEasy:**
- Sistema de convites personalizados por papel (unico no mercado)
- Landing page publica com RSVP integrado
- Manuais interativos por papel da cerimonia
- Gestao multi-casamento com colaboradores
- Sistema de papeis familiares com mensagens personalizadas
- Marketplace de servicos integrado
- Multi-idioma (PT/EN) com foco no mercado lusofono
- Sistema de planos e subscricoes ja implementado

**Modelos de receita possiveis:**
- Freemium (plano basico gratuito + planos pagos com mais funcionalidades)
- Comissao sobre marketplace de servicos (10-15%)
- Dominios personalizados (venda de dominios .wedding, etc.)
- Templates premium para landing pages

**Estimativa de valor:**

Para um MVP funcional com esta amplitude de funcionalidades, considerando:
- Mercado de casamentos em Portugal: ~35.000 casamentos/ano
- Mercado lusofono (PT + BR + PALOP): ~1.2M casamentos/ano
- Ticket medio de casamento PT: 15.000-25.000 EUR

| Cenario | Premissa | Valor Estimado |
|---|---|---|
| Venda da tecnologia (acqui-hire) | Stack moderna, codigo limpo, features unicas | 50.000 - 150.000 EUR |
| Venda com base de utilizadores (1.000+ casamentos ativos) | Receita recorrente comprovada | 200.000 - 500.000 EUR |
| Venda com tracao no mercado (5.000+ casamentos, marketplace ativo) | MRR comprovado de 5-10k EUR | 500.000 - 2.000.000 EUR |
| Escala internacional (multi-pais) | Produto validado em varios mercados | 2.000.000 - 10.000.000 EUR |

**Nota:** Estes valores sao estimativas baseadas em comparaveis do mercado europeu de SaaS vertical. O valor real depende de metricas como MRR, crescimento, retencao e base de utilizadores ativos.

---

## Sequencia de Implementacao

1. **Fase 1** -- Editor de Convites por Papel no Admin (AdminRoleInvitesManager upgrade)
2. **Fase 2** -- Tabela + Editor de Manuais por Papel (role_guides + AdminRoleGuidesManager)
3. **Fase 3** -- Modulo "Suporte ao Evento" no Admin (AdminEventSupport com todas as sub-tabs)
4. **Fase 4** -- Integracao final e testes

### Estimativa: 3-4 iteracoes de desenvolvimento para cobrir tudo.

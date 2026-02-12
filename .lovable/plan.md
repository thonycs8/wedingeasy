
# Plano: Sistema de Pagamentos com Stripe + Perfil de Pagamento + Recorrencia de Servicos

## Resumo

Implementar um sistema completo de pagamentos usando **Stripe** que inclui:
1. Integracao Stripe no projeto
2. Perfil de pagamento do utilizador (dados de faturacao + metodos de pagamento)
3. Modelo hibrido: assinaturas mensais + compra unica (2 anos acesso vitalicio)
4. Pagamento no momento de criar evento (escolha de plano)
5. Pergunta sobre dominio personalizado durante a criacao do evento
6. Sistema de recorrencia para servicos (ex: dominio anual com renovacao automatica ou manual)

---

## Fase 1: Ativar Stripe

- Usar a integracao nativa do Lovable com Stripe (tool `enable_stripe`)
- Isto vai configurar os secrets e disponibilizar as ferramentas de Stripe
- Apos ativacao, teremos acesso a criacao de produtos, precos, clientes e checkout sessions

---

## Fase 2: Base de Dados - Novas Tabelas e Alteracoes

### 2.1 Tabela `billing_profiles` (dados de faturacao do utilizador)
```text
id              uuid PK
user_id         uuid NOT NULL (ref auth.users)
stripe_customer_id  text (ID do cliente no Stripe)
billing_name    text
billing_email   text
tax_id          text (NIF/VAT)
billing_address jsonb (morada, cidade, codigo postal, pais)
created_at      timestamptz
updated_at      timestamptz
```
- RLS: utilizador so ve/edita o seu proprio perfil; admins veem todos

### 2.2 Tabela `payment_history` (historico de pagamentos)
```text
id                  uuid PK
user_id             uuid NOT NULL
wedding_id          uuid (nullable, para pagamentos associados a eventos)
stripe_payment_id   text
stripe_invoice_id   text
amount              numeric
currency            text DEFAULT 'eur'
status              text (succeeded, pending, failed, refunded)
description         text
payment_type        text (subscription, one_time, service, domain_renewal)
created_at          timestamptz
```
- RLS: utilizador ve os seus; admins veem todos

### 2.3 Tabela `service_subscriptions` (recorrencia de servicos como dominios)
```text
id              uuid PK
user_id         uuid NOT NULL
wedding_id      uuid NOT NULL
service_type    text (domain, premium_template, etc.)
reference_id    uuid (ID do dominio ou servico associado)
stripe_subscription_id  text
auto_renew      boolean DEFAULT true
amount          numeric
interval        text (yearly, monthly)
current_period_start  timestamptz
current_period_end    timestamptz
status          text (active, cancelled, expired, past_due)
created_at      timestamptz
updated_at      timestamptz
```
- RLS: utilizador gere os seus; admins gerem todos

### 2.4 Alterar `subscription_plans`
- Adicionar coluna `one_time_price` numeric (preco de compra unica para 2 anos)
- Adicionar coluna `billing_type` text DEFAULT 'both' (monthly, one_time, both)

### 2.5 Alterar `wedding_subscriptions`
- Adicionar coluna `stripe_subscription_id` text
- Adicionar coluna `billing_type` text (monthly, one_time)
- Adicionar coluna `paid_amount` numeric
- Adicionar coluna `payment_date` timestamptz

---

## Fase 3: Edge Functions para Stripe

### 3.1 `create-checkout-session`
- Recebe: plan_id, billing_type (monthly/one_time), wedding_id (opcional), include_domain (boolean)
- Cria/recupera Stripe Customer baseado no billing_profile
- Cria Stripe Checkout Session com:
  - Mode `subscription` para mensal
  - Mode `payment` para compra unica
  - Line items adicionais para dominio se solicitado
- Retorna URL do Stripe Checkout

### 3.2 `stripe-webhook`
- Recebe eventos do Stripe (checkout.session.completed, invoice.paid, subscription.cancelled, etc.)
- Atualiza `wedding_subscriptions`, `payment_history`, `service_subscriptions`
- Ativa o plano automaticamente apos pagamento confirmado

### 3.3 `manage-billing`
- Cria Stripe Customer Portal session para o utilizador gerir metodos de pagamento, faturas, cancelar subscricoes

### 3.4 `create-domain-subscription`
- Cria uma subscricao Stripe recorrente anual para dominio personalizado
- Associa ao `service_subscriptions`

---

## Fase 4: Frontend - Perfil de Pagamento

### 4.1 Expandir `UserProfile.tsx`
Adicionar nova seccao "Dados de Faturacao" com:
- Nome de faturacao
- Email de faturacao
- NIF/VAT
- Morada de faturacao (rua, cidade, codigo postal, pais)
- Botao "Gerir Metodos de Pagamento" (abre Stripe Customer Portal)
- Historico de pagamentos (lista de transacoes)

---

## Fase 5: Frontend - Escolha de Plano ao Criar Evento

### 5.1 Modificar `WeddingQuestionnaireModal.tsx`
Adicionar novo step apos o resumo do orcamento:

**Step 7: Escolha o Seu Plano**
- 3 cards (Basico gratuito, Avancado, Profissional)
- Cada card mostra: features incluidas, preco mensal E preco unico (2 anos)
- Toggle "Mensal" / "Pagamento Unico (2 anos)"
- Destaque no melhor valor (preco unico)

**Step 8: Dominio Personalizado**
- Pergunta "Deseja um dominio personalizado para o seu evento?"
- Input para o dominio desejado (ex: joana-e-pedro.wedding)
- Info sobre preco anual do dominio
- Toggle "Renovacao automatica"
- Opcao "Agora nao, talvez depois"

**Step 9: Checkout**
- Se escolheu plano pago ou dominio, redireciona para Stripe Checkout
- Se escolheu plano gratuito sem dominio, vai direto para dashboard

### 5.2 Atualizar `UpgradeModal.tsx`
- Remover "Em breve" dos botoes
- Adicionar logica de checkout real com redirecionamento para Stripe
- Mostrar precos atualizados da BD (nao hardcoded)
- Opcao mensal e pagamento unico

---

## Fase 6: Sistema de Recorrencia para Servicos

### 6.1 Componente `ServiceSubscriptions.tsx`
Seccao no perfil do utilizador ou dashboard com:
- Lista de servicos recorrentes ativos (dominios, etc.)
- Status de cada subscricao
- Toggle de renovacao automatica (on/off)
- Data da proxima renovacao
- Botao para cancelar

### 6.2 Logica de Renovacao
- **Automatica**: Stripe cobra automaticamente na data de renovacao
- **Manual**: Stripe envia email de lembrete, utilizador tem X dias para pagar manualmente
- Webhook `invoice.payment_failed` marca como `past_due`
- Webhook `customer.subscription.deleted` marca como `expired`
- Admin ve tudo no painel de Dominios e pode intervir

---

## Fase 7: Admin - Gestao de Pagamentos

### 7.1 Novo tab "Faturacao" no AdminPanel
- Overview de receita (MRR, pagamentos unicos, dominios)
- Lista de todos os pagamentos
- Filtros por tipo, estado, periodo
- Ver detalhes de subscricao de qualquer casamento
- Capacidade de atribuir plano manualmente (upgrade/downgrade gratis para suporte)

---

## Detalhes Tecnicos

### Precos Sugeridos (ajustaveis no admin)
| Plano | Mensal | Compra Unica (2 anos) |
|---|---|---|
| Basico | Gratis | Gratis |
| Avancado | 19.99 EUR/mes | 149.99 EUR |
| Profissional | 78.99 EUR/mes | 499.99 EUR |
| Dominio | - | ~15-25 EUR/ano |

### Fluxo de Pagamento
```text
Criar Evento -> Questionario -> Escolher Plano -> Dominio? -> Stripe Checkout -> Webhook -> Ativar Plano -> Dashboard
```

### Seguranca
- Stripe secrets armazenados como edge function secrets (nunca no frontend)
- Webhook verificado com assinatura Stripe
- Dados de cartao NUNCA passam pelo nosso servidor (Stripe Checkout hosted)
- RLS em todas as tabelas de billing

### Ficheiros a Criar/Modificar
**Novos:**
- `supabase/functions/create-checkout-session/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/manage-billing/index.ts`
- Migracao SQL para novas tabelas

**Modificados:**
- `src/components/UserProfile.tsx` (seccao faturacao)
- `src/components/WeddingQuestionnaireModal.tsx` (steps de plano + dominio)
- `src/components/shared/UpgradeModal.tsx` (checkout real)
- `src/pages/AdminPanel.tsx` (tab Faturacao)
- `subscription_plans` (novos campos)
- `wedding_subscriptions` (novos campos)

### Sequencia de Implementacao
1. Ativar Stripe (tool)
2. Migracoes de BD (tabelas + alteracoes)
3. Edge functions (checkout, webhook, billing)
4. Frontend do questionario (escolha de plano + dominio)
5. Perfil de pagamento do utilizador
6. UpgradeModal funcional
7. Recorrencia de servicos
8. Admin tab Faturacao

**Estimativa: 3-4 iteracoes de desenvolvimento.**

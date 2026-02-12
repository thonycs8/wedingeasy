
# Plano: Sistema de Pagamentos com Stripe + Perfil de Pagamento + Recorrencia de Servicos

## Estado de Implementação

### ✅ Concluído
- **Fase 1**: Stripe ativado com integração nativa
- **Fase 2**: Migrações BD (billing_profiles, payment_history, service_subscriptions, alterações a subscription_plans e wedding_subscriptions)
- **Fase 3**: Edge functions criadas e deployed (create-checkout-session, stripe-webhook, manage-billing)
- **Fase 5.2**: UpgradeModal funcional com checkout real Stripe (preços da BD, toggle mensal/2 anos)
- **Fase 4 parcial**: Secção de faturação no UserProfile (dados, NIF, morada, portal Stripe, histórico)

### Produtos Stripe Criados
| Produto | Price ID (Mensal) | Price ID (2 Anos) |
|---|---|---|
| Avançado | price_1SzqFJLZND1FWlrBYTJ92Ci0 | price_1SzqFaLZND1FWlrB8Zs8Smus |
| Profissional | price_1SzqFoLZND1FWlrBbhitQ4tx | price_1SzqG4LZND1FWlrBeAFMq4sr |
| Domínio | price_1SzqGaLZND1FWlrBkkfqaZKs | — |

### 🔲 Pendente
- **Fase 5.1**: Steps de escolha de plano + domínio no WeddingQuestionnaireModal
- **Fase 6**: Componente ServiceSubscriptions (recorrência de domínios, toggle auto-renew)
- **Fase 7**: Admin tab "Faturação" (overview receita, lista pagamentos, gestão manual de planos)
- Configurar STRIPE_WEBHOOK_SECRET no Stripe Dashboard e adicionar como secret

# Modulo Landing Page de Convite de Casamento

## Resumo

Criar uma landing page publica para cada casamento, acessivel via link unico (ex: `wedingeasy.lovable.app/evento/WEPLAN-ABC123`), onde os convidados podem ver detalhes do evento e confirmar presenca. O modulo inclui tambem convites personalizados por papel de cerimonia (padrinho, madrinha, etc).

## O que muda para o utilizador

Os noivos ganham uma pagina exclusiva do seu casamento que podem partilhar com convidados. Os convidados abrem o link e veem: countdown, local, mapa, e podem confirmar presenca. Convidados com papeis especiais (padrinho, madrinha) recebem um convite personalizado com destaque para a sua funcao.

---

## Etapa 1 -- Tabela de configuracao da landing page

Criar tabela `wedding_landing_pages` para guardar as personalizacoes:


| Coluna          | Tipo    | Descricao                               |
| --------------- | ------- | --------------------------------------- |
| id              | uuid    | PK                                      |
| wedding_id      | uuid    | FK para wedding_data                    |
| is_published    | boolean | Se a pagina esta ativa                  |
| hero_message    | text    | Mensagem principal (ex: "Vamos casar!") |
| venue_name      | text    | Nome do local                           |
| venue_address   | text    | Morada completa                         |
| venue_lat       | numeric | Latitude para mapa                      |
| venue_lng       | numeric | Longitude para mapa                     |
| ceremony_time   | time    | Hora da cerimonia                       |
| party_time      | time    | Hora da festa                           |
| dress_code      | text    | Codigo de vestimenta                    |
| custom_message  | text    | Mensagem personalizada                  |
| show_countdown  | boolean | Mostrar timer                           |
| show_map        | boolean | Mostrar mapa                            |
| show_rsvp       | boolean | Permitir confirmacao                    |
| theme_color     | text    | Cor principal                           |
| cover_image_url | text    | Imagem de capa                          |


RLS: Admins do casamento podem gerir. Leitura publica quando `is_published = true`.

Adicionar `wedding_landing` como nova feature_key na tabela `app_features`, habilitada apenas para planos Avancado e Pro.

---

## Etapa 2 -- Rota publica e componente da landing page

Criar rota `/evento/:eventCode` no App.tsx -- sem autenticacao necessaria.

Componente `WeddingEventPage.tsx` com as seguintes seccoes:

1. **Hero** -- Nomes do casal, data, mensagem personalizada, imagem de capa
2. **Countdown** -- Timer ate a data do casamento (dias, horas, minutos, segundos)
3. **Detalhes** -- Local, hora da cerimonia, hora da festa, dress code
4. **Mapa** -- Embed Google Maps com a localizacao (usando iframe, sem API key)
5. **RSVP** -- Formulario simples: nome do convidado + confirmar/nao confirmar
6. **Mensagem** -- Texto livre dos noivos

O componente busca dados com 1 unica query:

- `wedding_data` JOIN `wedding_landing_pages` filtrado por `event_code`

A confirmacao de presenca faz 1 update:

- `guests.confirmed = true` WHERE `name ILIKE` e `wedding_id`

---

## Etapa 3 -- Convite personalizado por papel de cerimonia

Quando o link inclui um parametro de papel (ex: `/evento/WEPLAN-ABC?role=padrinho&guest=joao-silva`):

- A landing page mostra uma seccao especial no topo: "Joao, voce foi convidado para ser Padrinho neste casamento!"
- Design diferenciado com badge do papel
- O convidado pode aceitar/recusar o papel diretamente

Papeis suportados (ja existem no DB): Padrinho, Madrinha, Dama de Honor, Pajem, Florista, Portador das Aliancas, Celebrante, Convidado de Honra.

---

## Etapa 4 -- Editor da landing page no dashboard

Novo tab ou seccao dentro do dashboard: "Pagina do Evento"

Componente `LandingPageEditor.tsx` com:

- Preview em tempo real (lado a lado no desktop)
- Campos de configuracao (venue, horarios, mensagens, imagens)
- Toggle para publicar/despublicar
- Link copiavel para partilhar
- Botao para enviar convite por email (reutiliza edge function existente)
- Gerador de links personalizados por papel de cerimonia

Protegido pelo FeatureGate com feature_key `wedding_landing`.

---

## Etapa 5 -- Integracao com feature gating

Adicionar na tabela `app_features`:

- feature_key: `wedding_landing`
- display_name: "Pagina do Evento"
- category: "Evento"

Adicionar na tabela `plan_features`:

- Basico: desabilitado
- Avancado: habilitado
- Pro: habilitado

Actualizar o tipo `FeatureKey` no hook `useFeatureGating.ts`.

---

## Detalhes tecnicos

### Impacto no servidor

A landing page publica e extremamente leve:

- 1 SELECT para carregar dados do casamento + landing page config
- 1 UPDATE para confirmar presenca (quando o convidado submete RSVP)
- Sem autenticacao = sem overhead de sessao
- Cache no React Query com staleTime alto (a pagina raramente muda)

### RLS para acesso publico

A tabela `wedding_landing_pages` precisa de uma policy SELECT para `anon`:

```
CREATE POLICY "Public can view published landing pages"
ON wedding_landing_pages FOR SELECT
USING (is_published = true);
```

Para o RSVP publico, criar uma funcao RPC `public_rsvp` com SECURITY DEFINER que:

1. Recebe event_code + guest_name
2. Valida que a landing page esta publicada e show_rsvp = true
3. Actualiza `guests.confirmed` para o convidado correspondente
4. Nao expoe dados sensiveis

### Ficheiros novos

- `src/pages/WeddingEvent.tsx` -- pagina publica do evento
- `src/components/WeddingEventPage.tsx` -- componente principal da landing
- `src/components/WeddingEventCountdown.tsx` -- countdown timer
- `src/components/WeddingEventRSVP.tsx` -- formulario RSVP
- `src/components/WeddingEventMap.tsx` -- mapa do local
- `src/components/LandingPageEditor.tsx` -- editor no dashboard

### Ficheiros modificados

- `src/App.tsx` -- adicionar rota `/evento/:eventCode`
- `src/components/WeddingDashboard.tsx` -- adicionar tab "Pagina do Evento"
- `src/hooks/useFeatureGating.ts` -- adicionar `wedding_landing` ao tipo FeatureKey

### Seguranca

- A landing page publica so mostra dados que os noivos escolheram partilhar
- O RSVP publico usa RPC com SECURITY DEFINER para evitar bypass de RLS
- Nenhum dado sensivel (emails, telefones, notas) e exposto na pagina publica
- O event_code (16 chars hex) serve como "senha" -- dificil de adivinhar

### Ordem de execucao

1. Etapa 1 -- Tabela + feature gating (base)
2. Etapa 2 -- Landing page publica (valor imediato)
3. Etapa 3 -- Convites por papel (diferenciador)
4. Etapa 4 -- Editor no dashboard (experiencia completa)
5. Etapa 5 -- Integracao com planos (monetizacao)
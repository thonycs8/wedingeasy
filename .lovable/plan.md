
# Gestao de Dominios no Painel Administrativo

## Resumo

Criar uma nova tab "Dominios" no painel de administracao que permita:
1. Definir o dominio publicado da plataforma (usado para gerar links de convite)
2. Preparar a infraestrutura para gestao de dominios personalizados por casamento (revenda futura)

## O que muda para o utilizador (admin)

- Nova tab "Dominios" no painel administrativo com icone Globe
- Seccao "Dominio da Plataforma" onde o admin define o URL principal (ex: `https://wedingeasy.lovable.app`) -- este valor e guardado no banco de dados e usado por `getPublicBaseUrl()` para gerar todos os links
- Seccao "Dominios Personalizados" (preparacao futura) com tabela para registar dominios custom por casamento, com campos para dominio, estado (pendente, activo, expirado), casamento associado, e data de expiracao
- Badge "Em breve" na seccao de dominios personalizados, indicando que a funcionalidade de revenda sera activada futuramente

---

## Alteracoes Tecnicas

### 1. Migracao DB -- tabela `platform_settings` + `custom_domains`

**`platform_settings`** (key-value para configuracoes globais):
- `id` uuid PK
- `key` text UNIQUE NOT NULL (ex: `published_url`)
- `value` text
- `updated_at` timestamptz
- `updated_by` uuid (referencia ao admin que alterou)

RLS: apenas admins podem ler e escrever.

**`custom_domains`** (preparacao para revenda):
- `id` uuid PK
- `wedding_id` uuid NOT NULL
- `domain` text NOT NULL UNIQUE
- `status` text DEFAULT 'pending' (pending, verifying, active, expired, failed)
- `ssl_status` text DEFAULT 'pending'
- `expires_at` timestamptz
- `created_at` timestamptz
- `updated_at` timestamptz
- `notes` text

RLS: apenas admins podem gerir; owners do casamento podem ver o seu.

### 2. Novo componente `AdminDomainsManager.tsx`

Duas seccoes:

**Seccao 1 -- Dominio da Plataforma:**
- Input para URL publicado
- Botao "Guardar"
- Ao guardar, insere/actualiza `platform_settings` com key `published_url`
- Mostra o dominio activo actual

**Seccao 2 -- Dominios Personalizados (Futuro):**
- Tabela com dominios registados (ou mensagem vazia)
- Formulario para adicionar dominio: seleccionar casamento, inserir dominio
- Badge de estado (Pendente, Activo, Expirado)
- Botao desactivado "Configurar DNS" com tooltip "Em breve"
- Esta seccao ja funciona para registar dominios no DB mas sem integracao DNS real

### 3. Actualizar `getPublicBaseUrl.ts`

Alterar a logica para:
1. Primeiro verificar se ha um valor em `platform_settings` (cached via query com staleTime longo)
2. Fallback para `VITE_PUBLIC_URL` env var
3. Fallback para `window.location.origin`

Criar um hook `usePlatformUrl()` que faz o fetch do `platform_settings` e exporta o URL. O `getPublicBaseUrl()` continua a existir como funcao sincrona para compatibilidade, mas usa um valor global que e populado pelo hook na inicializacao da app.

### 4. Actualizar `AdminPanel.tsx`

- Adicionar tab "Dominios" com icone Globe
- Importar e renderizar `AdminDomainsManager`

### 5. Inicializar o URL na App

No `App.tsx` ou no `WeddingDashboard`, chamar o hook `usePlatformUrl()` uma vez para popular o cache global, garantindo que `getPublicBaseUrl()` retorna o valor correcto desde o inicio.

---

## Ficheiros a criar

- `src/components/admin/AdminDomainsManager.tsx`
- `src/hooks/usePlatformSettings.ts`

## Ficheiros a modificar

- `src/pages/AdminPanel.tsx` -- nova tab
- `src/utils/getPublicBaseUrl.ts` -- usar platform_settings
- `src/App.tsx` ou `src/components/WeddingDashboard.tsx` -- inicializar cache

## Migracao DB

- Criar tabelas `platform_settings` e `custom_domains` com RLS
- Inserir valor inicial: `published_url` = `https://wedingeasy.lovable.app`

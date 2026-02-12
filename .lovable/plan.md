

# Manual Interativo por Papel na Pagina de Convite

## Resumo

Adicionar uma seccao de "Manual" logo apos o convite por papel (e antes do botao "Aceitar"), com dicas, etiqueta e FAQ personalizados para cada funcao da cerimonia. O conteudo e estatico (sem base de dados), organizado num accordion interactivo com icones, seccoes de "Fazer" e "Nao Fazer", e perguntas frequentes.

## Papeis Cobertos

Cada papel tera conteudo especifico:

- **Padrinho / Madrinha** -- responsabilidades, presentes, discurso, apoio aos noivos
- **Dama de Honor** -- apoio a noiva, dia do casamento, look coordenado
- **Celebrante** -- preparacao da cerimonia, tom, ensaio
- **Pajem / Florista** -- instrucoes simples para criancas e pais
- **Convidado de Honra** -- etiqueta especial, lugar reservado

## Layout Visual

```text
+------------------------------------------+
|        [Convite por Papel]               |
|        Querido Joao, Padrinho            |
|                                          |
|  ┌────────────────────────────────────┐  |
|  │  📖 Manual do Padrinho             │  |
|  │                                    │  |
|  │  [v] As Suas Responsabilidades     │  |
|  │      * Apoiar o noivo...           │  |
|  │      * Guardar as aliancas...      │  |
|  │                                    │  |
|  │  [v] O Que Fazer                   │  |
|  │      ✓ Chegar cedo ao ensaio       │  |
|  │      ✓ Preparar um brinde          │  |
|  │      ✓ Ajudar com convidados       │  |
|  │                                    │  |
|  │  [v] O Que Nao Fazer              │  |
|  │      ✗ Chegar atrasado             │  |
|  │      ✗ Discurso demasiado longo    │  |
|  │      ✗ Esquecer as aliancas!       │  |
|  │                                    │  |
|  │  [v] Perguntas Frequentes          │  |
|  │      > Preciso levar presente?     │  |
|  │      > Como deve ser o discurso?   │  |
|  └────────────────────────────────────┘  |
|                                          |
|        [ Aceitar Convite ]               |
+------------------------------------------+
```

## Abordagem Tecnica

### Novo componente: `WeddingEventRoleGuide.tsx`

Ficheiro dedicado com todo o conteudo e logica do manual. Recebe o papel como prop e renderiza o guia correspondente.

**Estrutura interna:**

1. **ROLE_GUIDES** -- objecto estatico com conteudo por papel, cada um contendo:
   - `title`: titulo do manual (ex: "Manual do Padrinho")
   - `icon`: icone Lucide correspondente
   - `intro`: breve descricao do papel
   - `responsibilities`: lista de responsabilidades com icones
   - `dos`: lista de "O Que Fazer" (com icone CheckCircle verde)
   - `donts`: lista de "O Que Nao Fazer" (com icone XCircle vermelho)
   - `faq`: array de pares pergunta/resposta

2. **UI**: Usa `Accordion` do shadcn/ui para organizar as 4 seccoes (Responsabilidades, Fazer, Nao Fazer, FAQ). Cada seccao abre/fecha independentemente. A primeira seccao abre por defeito.

3. **Fallback**: Para papeis sem guia especifico, mostra um guia generico de "Convidado Especial" com dicas de etiqueta gerais.

### Integracao no `WeddingEventRoleInvite.tsx`

- Importar `WeddingEventRoleGuide`
- Renderizar entre os badges de papel e o botao "Aceitar Convite"
- Passar o papel principal (`roles[0]`) como prop
- Tambem mostrar na view de "Aceite" (apos a confirmacao) para referencia futura

### Ficheiros

**Criar:**
- `src/components/event/WeddingEventRoleGuide.tsx` -- componente do manual com conteudo estatico

**Modificar:**
- `src/components/event/WeddingEventRoleInvite.tsx` -- importar e renderizar o guia

### Conteudo dos Manuais

**Padrinho:**
- Responsabilidades: apoiar o noivo, guardar aliancas, testemunha, brinde
- Fazer: chegar cedo, preparar discurso curto, ajudar convidados
- Nao fazer: chegar atrasado, discurso longo, esquecer aliancas
- FAQ: presente, roupa, discurso

**Madrinha:**
- Responsabilidades: apoiar a noiva, ajudar com o vestido, buque, emocoes
- Fazer: estar disponivel, levar kit de emergencia, coordenar damas
- Nao fazer: usar branco, chamar mais atencao que a noiva, atrasar
- FAQ: cor do vestido, maquilhagem, despedida de solteira

**Dama de Honor:**
- Responsabilidades: apoiar a madrinha e noiva, caminhar no cortejo
- Fazer: seguir dress code, ajudar na organizacao, sorrir
- Nao fazer: usar branco, chegar atrasada, usar telemovel na cerimonia
- FAQ: buque, sapatos, posicao no altar

**Celebrante:**
- Responsabilidades: conduzir a cerimonia, preparar texto, ensaio
- Fazer: reunir com os noivos, ensaiar, manter tom adequado
- Nao fazer: improvisar sem aprovacao, ultrapassar o tempo, piadas inadequadas
- FAQ: duracao, microfone, votos personalizados

**Pajem / Florista:**
- Responsabilidades: caminhar no cortejo, levar almofada ou petalas
- Fazer (para pais): ensaiar com a crianca, levar snacks, ter plano B
- Nao fazer: forcar a crianca nervosa, esquecer ensaio
- FAQ: roupa, idade ideal, e se chorar

**Convidado de Honra / Generico:**
- Dicas gerais de etiqueta, dress code, pontualidade, telemovel

### Dependencias

Nenhuma nova dependencia. Usa apenas:
- `Accordion` do shadcn/ui (ja instalado)
- Icones Lucide (ja instalado)
- `Card` do shadcn/ui (ja instalado)

### Sem alteracoes na base de dados

Todo o conteudo e estatico no frontend. Nao requer migracoes SQL.


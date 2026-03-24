

## Landing Page do Evento — Melhorias (Best Practices)

Analisei toda a página `/evento/:eventCode` e os seus componentes. Aqui estão as melhorias que proponho, organizadas por impacto:

---

### 1. Scroll Reveal Animations (Alto Impacto Visual)
Cada secção (Verso, Countdown, Detalhes, Galeria, Mapa, RSVP) aparece de forma estática. Aplicar o hook `useScrollReveal` já existente no projeto para que cada secção anime suavemente ao entrar no viewport.

**Ficheiros:** `WeddingEvent.tsx`, `index.css` (adicionar classe `.scroll-reveal` com opacity/transform transition)

---

### 2. Hero Section — Parallax Suave + Scroll Indicator
- Adicionar efeito parallax suave na imagem de fundo do hero (CSS `background-attachment: fixed` ou transform com scroll listener leve).
- Adicionar um indicador de scroll animado (seta/chevron a pulsar) no fundo do hero para guiar o utilizador.

**Ficheiro:** `WeddingEvent.tsx`

---

### 3. Event Details — Cards com Ícones Maiores
Transformar os detalhes do evento (cerimónia, copo d'água, dress code) em cards individuais com ícones maiores e estilizados com a `themeColor`, em vez de simples linhas de texto. Layout em grid responsivo com hover sutil.

**Ficheiro:** `WeddingEvent.tsx`

---

### 4. Countdown — Animação de Flip/Pulse nos Números
Adicionar uma transição suave quando os segundos mudam (pulse ou scale micro-animation), tornando o countdown mais dinâmico sem ser distrativo.

**Ficheiro:** `WeddingEventCountdown.tsx`, `index.css`

---

### 5. Gallery — Lightbox ao Clicar
Actualmente as imagens da galeria não são clicáveis. Adicionar um lightbox/modal simples para ver cada foto em tamanho completo com navegação.

**Ficheiro:** `WeddingEventGallery.tsx`

---

### 6. RSVP — Feedback Visual Melhorado
- Adicionar animação de confetti/hearts ao confirmar presença (reutilizar o `CelebrationOverlay` do RoleInvite).
- Transição suave entre o formulário e o estado de sucesso.

**Ficheiro:** `WeddingEventRSVP.tsx`

---

### 7. Footer — Mais Elegante
- Adicionar os nomes do casal e a data no footer.
- Separador decorativo (ornamento SVG ou linha ondulada) antes do footer.
- Manter o logo K&A mas integrar melhor com o branding do tema.

**Ficheiro:** `WeddingEvent.tsx`

---

### 8. Meta Tags / SEO Social
Adicionar `<title>` dinâmico e `og:image` meta tags via `react-helmet-async` para que o link partilhado no WhatsApp/Instagram mostre preview com os nomes do casal e imagem de capa.

**Ficheiros:** `WeddingEvent.tsx` (novo), `index.html` (base tags)

---

### 9. Separadores Decorativos
Substituir os `<Separator>` genéricos por ornamentos temáticos (um pequeno SVG de coração/folha/floral) que se alinhem com o tema do casamento.

**Ficheiro:** `WeddingEvent.tsx` (novo componente inline ou SVG)

---

### Resumo de Prioridades

| Melhoria | Impacto | Esforço |
|----------|---------|---------|
| Scroll reveal animations | Alto | Baixo |
| Hero parallax + scroll indicator | Alto | Baixo |
| Event details como cards | Médio | Baixo |
| Countdown pulse animation | Médio | Baixo |
| Gallery lightbox | Alto | Médio |
| RSVP celebration feedback | Médio | Baixo |
| Footer elegante | Médio | Baixo |
| Meta tags / OG preview | Alto | Médio |
| Separadores decorativos | Médio | Baixo |

### Notas Técnicas
- O hook `useScrollReveal` já existe em `src/hooks/useScrollReveal.ts` — será reutilizado.
- O `CelebrationOverlay` do `WeddingEventRoleInvite.tsx` será extraído para componente partilhado.
- Todas as animações respeitam `prefers-reduced-motion`.
- Nenhuma alteração de base de dados necessária.


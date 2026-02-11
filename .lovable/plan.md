
# Plano Consolidado -- Landing Page do Evento

Este plano combina as tres aprovacoes anteriores num unico bloco de implementacao.

---

## 1. Migracao de Base de Dados

Adicionar colunas a `wedding_landing_pages`:

| Coluna | Tipo | Default | Descricao |
|--------|------|---------|-----------|
| same_venue | boolean | true | Cerimonia e recepcao no mesmo local |
| reception_venue_name | text | null | Nome do local do Copo d'Agua (se diferente) |
| reception_venue_address | text | null | Morada do Copo d'Agua (se diferente) |
| theme_preset | text | null | Tema pre-definido (romantic, rustic, etc.) |
| video_url | text | null | URL de video YouTube/Vimeo |
| gallery_urls | text[] | '{}' | Array de URLs de imagens |
| show_gallery | boolean | true | Mostrar galeria |
| show_video | boolean | true | Mostrar video |
| verse_text | text | null | Texto do verso/poema |
| show_verse | boolean | true | Mostrar verso apos hero |
| font_family | text | null | Fonte do tema |

---

## 2. Temas Pre-definidos

Criar `src/config/weddingThemes.ts` com 6 temas: Romantico, Rustico, Classico, Moderno, Jardim, Praia. Cada tema define primaryColor, secondaryColor, fontFamily, heroOverlay.

---

## 3. Galeria de Capas Pre-definidas

Criar `src/config/coverImages.ts` com 12-18 imagens Unsplash tematicas (amor, casamento) organizadas por estilo. Usadas tanto no editor como no hero do dashboard.

---

## 4. Novos Componentes

| Componente | Descricao |
|-----------|-----------|
| `src/config/weddingThemes.ts` | Configuracao dos 6 temas |
| `src/config/coverImages.ts` | Galeria de imagens pre-definidas |
| `src/components/event/ThemePresetSelector.tsx` | Grid visual de seleccao de tema |
| `src/components/event/CoverImageSelector.tsx` | Galeria visual de seleccao de capa |
| `src/components/event/WeddingEventVerse.tsx` | Verso/poema estilizado apos o hero |
| `src/components/event/WeddingEventVideo.tsx` | Embed responsivo YouTube/Vimeo |
| `src/components/event/WeddingEventGallery.tsx` | Grid responsivo de imagens |

---

## 5. Editor Reorganizado (LandingPageEditor.tsx)

Tabs reestruturadas:

- **Tema** -- Selector de tema pre-definido + cor personalizada
- **Conteudo** -- Hero message, verso/poema, mensagem personalizada, dress code
- **Multimidia** -- Selector de capa (galeria pre-definida + URL custom), video URL, galeria de imagens (URLs)
- **Local** -- Switch "Mesmo local" + campos condicionais. Renomear "Hora da Festa" para "Hora do Copo d'Agua". Se `same_venue = true`, esconder campos de recepcao e mostrar apenas horario da cerimonia
- **Opcoes** -- Switches existentes + novos (mostrar verso, galeria, video)
- **Convites por Papel** -- Mantido

Interface `LandingPageData` sera expandida com todos os novos campos.

---

## 6. Dashboard (WeddingDashboard.tsx)

O hero do dashboard passara a usar a `cover_image_url` guardada na landing page, com fallback para a imagem estatica `wedding-hero.jpg`.

---

## 7. Pagina Publica (WeddingEvent.tsx)

Nova ordem das seccoes com logica condicional:

1. **Hero** -- Com tema aplicado (cores, fonte, imagem de capa)
2. **Verso/Poema** -- Texto estilizado com aspas decorativas (se `show_verse` e `verse_text`)
3. **Convite por Papel** (se URL params)
4. **Countdown**
5. **Video** (se `show_video` e `video_url`)
6. **Detalhes do Evento** -- Logica `same_venue`: se true, so mostra cerimonia; se false, mostra cerimonia + "Copo d'Agua" com horario e morada separados
7. **Galeria** (se `show_gallery` e `gallery_urls`)
8. **Mapa** (cerimonia + segundo mapa se local diferente)
9. **Mensagem Personalizada**
10. **RSVP**
11. **Footer**

---

## 8. RSVP Simplificado (WeddingEventRSVP.tsx)

- Placeholder: "Primeiro e ultimo nome"
- Descricao: "Insira o seu primeiro e ultimo nome"

---

## 9. Terminologia Corrigida

- "Festa" --> "Copo d'Agua" em todo o editor e pagina publica
- Logica especifica: para o casamento Karina & Anthony (same_venue = true), mostrar apenas horario da cerimonia

---

## Resumo de Ficheiros

**Criar:**
- `src/config/weddingThemes.ts`
- `src/config/coverImages.ts`
- `src/components/event/ThemePresetSelector.tsx`
- `src/components/event/CoverImageSelector.tsx`
- `src/components/event/WeddingEventVerse.tsx`
- `src/components/event/WeddingEventVideo.tsx`
- `src/components/event/WeddingEventGallery.tsx`

**Modificar:**
- `src/components/event/LandingPageEditor.tsx` -- Reorganizar tabs, novos campos, terminologia
- `src/pages/WeddingEvent.tsx` -- Nova ordem, temas, novos componentes, logica same_venue
- `src/components/event/WeddingEventRSVP.tsx` -- Simplificar para primeiro e ultimo nome
- `src/components/event/WeddingEventMap.tsx` -- Suportar segundo local
- `src/components/WeddingDashboard.tsx` -- Usar cover_image_url no hero

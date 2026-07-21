# LUME — Design System v2

Tema Shopify (Horizon OS 2.0 como chassi) para o smart ring **Lume**. Recria a
*experiência* de navegação de referências premium (Oura, Apple, Nothing, Tesla)
com identidade, textos e imagens 100% próprios — nada é copiado da referência.

## Registro

Brand-first. A página É o produto: storytelling cinematográfico no scroll,
uma ideia dominante por dobra, muito espaço negativo.

## Arquitetura da experiência (análise da referência)

Padrões observados na PDP do Oura Ring 5 (via inspeção real com Playwright):

1. Hero fullscreen com fotografia macro escura + headline serifada curta
2. Declaração de produto ("o menor do mundo...") em tela cheia
3. Estágio **pinado** (`position: sticky`, seção alta) com mídia que
   transforma conforme o progresso do scroll; textos trocam por faixas
4. Número gigante como seção inteira (40%)
5. Trio de métricas de precisão com fontes de prova
6. Faixa escura de bateria (1 semana)
7. Materiais (titânio, água) com macro
8. Recursos em abas por pilar de saúde (Sono/Atividade/Prontidão/…)
9. O que vem na caixa → Especificações técnicas (accordion)
10. Seletor de acabamentos com preço por acabamento
11. Prova social, FAQ, CTA final

Mecânica: header flutuante de vidro; sticky + progress-scrub; reveals sutis;
easing desacelerado; zero bounce.

## Paleta (fixa — não improvisar)

| Papel | Hex |
|---|---|
| Background principal | `#F5F0E8` |
| Background secundário | `#EDE6DB` |
| Marrom (marca/CTA) | `#6F4E37` |
| Marrom escuro (hover/superfícies) | `#4A3326` |
| Preto (seções cinematográficas) | `#181818` |
| Texto | `#2D2D2D` |
| Accent (dourado) | `#C9A97A` |

Gradientes sutilíssimos. Nada saturado/neon. Fotos recebem grade quente para
entrar na paleta.

## Tipografia

- **Display/headings:** Instrument Serif (Google Fonts) — pedido explícito do
  cliente; serifada elegante, uso em tamanho grande, weight 400.
- **Corpo/UI:** Inter — pedido explícito do cliente.
- Escala fluida com `clamp()`, razão ≥1.25 entre degraus.
- Corpo máx. 70ch. Eyebrows: caps, tracking .2em+, Inter 600.

## Layout

Grid 12 colunas, container máx. **1440px** (`--maxw`), padding lateral fluido
`clamp(20px, 5vw, 80px)`. Seções de storytelling = ~1 viewport cada.
Backgrounds alternam: escuro → claro → secundário para ritmo.

## Motion

- Motor próprio (rAF + `getBoundingClientRect`) — agnóstico ao scroller.
  **Não usar GSAP/ScrollTrigger:** o Horizon rola em `.page-wrapper`, não na
  window; o motor próprio já resolve isso e pesa 0 dependências (Lighthouse).
- Scrub com amortecimento (lerp ~0.085). Reveals via IntersectionObserver.
- Easing: `cubic-bezier(.25,1,.5,1)` (quart-out) e `(.16,1,.3,1)` (expo-out).
- Durações: entradas 500–800ms; micro 150–300ms. `prefers-reduced-motion`
  sempre respeitado (conteúdo nunca fica oculto).

## Componentes

- **Nav:** pílula de vidro flutuante (blur 20px, raio 999, top 14px), alvo
  `header-component.header` (o `#header-group` é `display:contents`).
- **Botões:** pill 999px; primário marrom `#6F4E37` → hover `#4A3326`;
  fantasma com borda; sticky buy na PDP.
- **Cards:** raio 20–24px, borda 1px `rgba(45,45,45,.10)`, sem sombras duras.
- **Accordion:** linhas 1px, ícone +/− animado, um aberto por vez.
- **Swatches de acabamento:** anel em gradiente cônico até haver render real.

## Assets (Gravyx)

Todos os slots de mídia têm `image_picker` + fallback. Quando houver tokens:
renders do anel (frontal/lateral/traseiro/macros), sequência de ângulos para o
scrollytelling, lifestyle (dormir/treinar/trabalhar/viajar), mockups do app.
Usar `imagens_referencia` para manter o MESMO anel entre renders.

## Regras duras

- Nunca `#000`/`#fff` puros fora do preto `#181818` da paleta.
- Sem gradient text, sem glassmorphism decorativo fora da nav, sem bounce.
- Copiar da Oura: NUNCA (texto, imagem, ícone, marca). Só a mecânica.

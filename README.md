# Lume — Smart Ring · Landing Page premium

Landing page cinematográfica de alta conversão para o smart ring **Lume**, com estética premium no nível de Apple, Oura e Nothing. Dark mode quente, tipografia grande e animações de scroll suaves.

**Demo local:** abra `index.html` ou rode um servidor estático na pasta.

```bash
# opção rápida
python -m http.server 8080
# depois acesse http://localhost:8080
```

## Stack

- **HTML semântico** + SEO (meta tags, Open Graph, Twitter Card, Schema.org `Product`)
- **CSS puro** — sem framework. Paleta e tipografia via CSS custom properties
- **GSAP + ScrollTrigger** — reveals, pin, parallax, scroll horizontal, count-up
- **Lenis** — smooth scroll
- **Zero imagens externas** — anel, dashboards, mockups de app e ícones são feitos em CSS/SVG (carregamento instantâneo, nada quebra)

Bibliotecas carregadas via CDN com `defer`; o JS degrada graciosamente se elas não carregarem e respeita `prefers-reduced-motion`.

## Seções

1. **Hero** — anel girando, glow bege, headline com text-reveal, zoom no scroll
2. **O smartwatch ficou no passado** — transição relógio → anel (sticky/pin)
3. **Tecnologia** — 6 sensores em cards com glassmorphism
4. **Sono** — céu estrelado + dashboard com barras animadas e score count-up
5. **Monitoramento 24h** — métricas com números animados
6. **Materiais** — anel macro com parallax
7. **Lifestyle** — scroll horizontal pinado
8. **App** — mockups de iPhone com parallax e gráfico circular
9. **Comparação** — tabela Lume × Smartwatch × Pulseira
10. **Depoimentos** — cards 5 estrelas
11. **FAQ** — accordion animado
12. **CTA de compra** — preço, parcelamento, garantias, escassez discreta

## Paleta

| Uso | Cor |
|---|---|
| Fundo | `#171411` |
| Seções | `#1D1814` |
| Cards | `#241F1A` |
| Detalhes | `#2D2620` |
| Principal (bege) | `#D7C3A3` |
| Secundária (marrom) | `#B28B67` |
| Texto | `#F7F4EF` |
| Texto secundário | `#BFB5AA` |

## Performance & acessibilidade

- Animações via `transform`/`opacity` (composição na GPU)
- `will-change` nos elementos animados continuamente
- `prefers-reduced-motion` respeitado (mostra tudo estático)
- Cursor customizado desativado em telas touch
- Sem overflow horizontal; responsivo desktop / tablet / mobile

## Estrutura

```
lume-landing/
├─ index.html
├─ assets/
│  ├─ css/style.css
│  └─ js/main.js
└─ README.md
```

## Deploy

100% estático — publique em GitHub Pages, Vercel, Netlify ou qualquer CDN. Sem build.

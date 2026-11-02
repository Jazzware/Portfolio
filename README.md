# Portafolio de Iván López Villegas

Sitio estático en [Astro](https://astro.build), en español (`/`) e inglés (`/en/`). Enlaza a
[PaleoSharp](https://paleosharp.pages.dev), el juego para aprender C# que corre en el navegador.

## Trabajar en local

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # genera dist/
npm run preview
```

## Qué editar

| Archivo | Qué contiene |
| --- | --- |
| `src/config.ts` | Dominio, correo, LinkedIn, GitHub, CV y enlaces del juego. Un campo en `null` oculta su enlace. |
| `src/data/experience.ts` | Los trabajos, del más reciente al más antiguo. `pending: true` marca datos de ejemplo (se ven punteados); quítalo al poner los reales. |
| `src/data/content.ts` | Todos los textos, en español e inglés. |
| `src/assets/` | Capturas del juego (Astro las convierte a WebP en varios tamaños). |
| `public/` | Archivos que se sirven tal cual: el CV en PDF, el ícono, `_headers`. |

La experiencia se dibuja como una columna estratigráfica: cada trabajo es una capa con grosor proporcional a su
duración y la más reciente queda arriba. Al llegar a esa sección, las capas se depositan de abajo hacia arriba
(no se anima si el sistema pide reducir el movimiento).

## Publicar en Cloudflare Pages

1. Sube este repositorio a GitHub.
2. En Cloudflare, *Workers & Pages → Create → Pages → Connect to Git*, elige el repositorio.
   Framework preset: **Astro**. Build command: `npm run build`. Output: `dist`.
3. Cada push a `main` publica. Queda en `https://<proyecto>.pages.dev`.
4. Con dominio propio: *Custom domains* → agrega `tudominio` (y `www` si quieres). Pon esa dirección en
   `site.url` de `src/config.ts`. El juego va en `paleosharp.tudominio`, en su propio proyecto de Pages.

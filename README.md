# Portafolio de Iván López Villegas

Publicado en https://jazzware.dev.

Sitio estático en [Astro](https://astro.build), en español (`/`) e inglés (`/en/`). Enlaza a
[PaleoSharp](https://paleosharp.jazzware.dev), el juego para aprender C# que corre en el navegador.

## Trabajar en local

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # genera dist/
npm run preview
npm test           # pruebas de la función del formulario
```

El formulario «Contáctame» no funciona con `npm run dev` (la función solo existe en Cloudflare). Para probarlo
en local: `npm run build && npx wrangler pages dev dist`.

## Qué editar

| Archivo | Qué contiene |
| --- | --- |
| `src/config.ts` | Dominio, LinkedIn, GitHub, CV, enlaces del juego y la clave pública del captcha. Un campo en `null` oculta su enlace. |
| `functions/api/contacto.ts` | Recibe el formulario «Contáctame» y te lo manda por correo (Resend). |
| `src/data/experience.ts` | Los trabajos, del más reciente al más antiguo. `pending: true` marca datos de ejemplo (se ven en gris, con una etiqueta); quítalo al poner los reales. |
| `src/data/content.ts` | Todos los textos, en español e inglés. |
| `src/assets/` | Capturas del juego. El diseño actual no las usa; sirven si agregas una imagen de vista previa (`og:image`). |
| `public/` | Archivos que se sirven tal cual: el CV en PDF, el ícono, `_headers`. |

La trayectoria se dibuja como una línea del Metro de la Ciudad de México. En la portada, cada trabajo es una
estación, del más antiguo al actual y a la misma distancia (como en un mapa de transporte), y un tramo punteado
lleva a la siguiente estación: el puesto que buscas, que enlaza al formulario. Cada estación lleva a su parada en
la sección de experiencia, donde la misma línea corre hacia abajo.

Movimiento (todo se desactiva si el sistema pide reducir el movimiento, y sin JavaScript la página se ve completa):
al cargar, un tren entra por la orilla, se detiene en cada estación y se estaciona en la actual; luego el tramo
punteado avanza hacia la siguiente. En la sección de experiencia, la línea se enciende conforme lees.

## Publicar en Cloudflare Pages

1. Sube este repositorio a GitHub.
2. En Cloudflare, *Workers & Pages → Create → Pages → Connect to Git*, elige el repositorio.
   Framework preset: **Astro**. Build command: `npm run build`. Output: `dist`.
3. Cada push a `main` publica. Queda en `https://<proyecto>.pages.dev`.
4. Dominio: en el proyecto, *Custom domains* → `jazzware.dev` (y `www.jazzware.dev` si quieres; Cloudflare lo
   redirige). Ya está en `site.url` de `src/config.ts`. El juego vive en `paleosharp.jazzware.dev`, en su propio
   proyecto de Pages.

## Formulario «Contáctame»

Los mensajes te llegan por correo y puedes responder directo a quien escribió; tu dirección no aparece en la página.
Lo envía [Resend](https://resend.com) (gratis hasta 3,000 correos al mes).

1. Crea una cuenta en Resend **con el correo donde quieres recibir los mensajes** y genera una API key.
   Sin dominio propio, Resend solo deja enviar a ese mismo correo, que es justo lo que se necesita.
2. En Cloudflare, proyecto de Pages → *Settings → Variables and Secrets*, agrega:
   - `RESEND_API_KEY` (tipo *Secret*): la API key.
   - `CONTACT_TO`: tu correo.
3. Vuelve a desplegar (un push basta). Mientras falten, el formulario dice que no está disponible y sugiere LinkedIn.

Para que los correos salgan de tu dominio (mejor entrega, menos spam): en Resend, *Domains → Add domain* →
`jazzware.dev`; como el DNS está en Cloudflare, Resend agrega los registros solo (o los copias a mano). Luego agrega
`CONTACT_FROM` = `Portafolio <contacto@jazzware.dev>` en Cloudflare. No necesitas un buzón real en esa dirección.

**Contra spam:** hay un campo trampa que los bots llenan y las personas no ven. Si empieza a llegar spam, activa
[Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) (gratis): pon la *site key* en
`turnstileSiteKey` de `src/config.ts` y la *secret key* como `TURNSTILE_SECRET_KEY` en Cloudflare.

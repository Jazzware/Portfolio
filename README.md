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
| `src/config.ts` | Dominio, correo visible, LinkedIn, GitHub y enlaces del juego. El captcha usa `PUBLIC_TURNSTILE_SITE_KEY` al construir; sin ella el formulario queda deshabilitado. |
| `functions/api/contacto.ts` | Recibe el formulario «Contáctame» y te lo manda por correo (Resend). |
| `src/data/experience.ts` | Los trabajos, del más reciente al más antiguo. Las fechas (`from` y `to`, en `AAAA-MM`; `to: null` si sigue vigente) dan la altura de cada rollo de la vasija. |
| `src/data/content.ts` | Todos los textos, en español e inglés, incluida la carrera que muestra la base de la vasija (`experience.vessel.base`). |
| `MASTER.md` | El sistema de diseño: paleta, tipografía, espaciado, movimiento, componentes, estructura de la página, recompensas ocultas y accesibilidad. |
| `src/styles/tokens.css` | Los valores de `MASTER.md` como variables CSS: colores, tamaños de texto, espacios y duraciones. |
| `src/assets/` | Capturas del juego. La Fig. 2 usa `paleosharp-yacimiento.png`. |
| `public/` | Archivos que se sirven tal cual: el ícono, `_headers`. |

## Diseño

El sitio se dibuja con la convención de la ilustración arqueológica: las vasijas de las figuras 1 y 3 van mitad en
corte (rayado) y mitad por fuera. El cobalto marca lo del ingeniero y el rojo óxido lo del creador. La tipografía es
IBM Plex Sans y Mono, servida desde el propio sitio (`@fontsource`); el sitio no hace peticiones a terceros, salvo
Turnstile si lo activas. La guía completa está en `MASTER.md`.

- **Fig. 1, portada** (`Jarra.astro`): una jarra torneada en corte y exterior.
- **Fig. 2, PaleoSharp** (`FiguraPaleo.astro`): una captura real de un nivel, montada como espécimen y rotulada
  con líneas guía.
- **Fig. 3, experiencia** (`Vasija.astro`): la trayectoria como vasija de rollos. Un rollo por puesto, el más
  antiguo en la base; la altura de cada rollo sigue los meses en el puesto. Al elegir un rollo, el panel de al lado
  muestra el puesto. Arriba, un rollo punteado para el siguiente puesto. En pantallas de menos de 1000 px, o sin
  JavaScript, la vasija se reemplaza por un catálogo de filas que se abren.

Atajos de teclado: `1` a `4` llevan a cada sección y `?` muestra la lista. Hay cuatro recompensas ocultas con un
contador; están descritas en `MASTER.md` §9. Por debajo de 1000 px, sin la vasija, el contador cuenta dos.

Movimiento (`src/scripts/movimiento.ts`): las figuras se trazan una vez al entrar en pantalla y los bloques suben
8 px mientras aparecen. Si el sistema pide reducir el movimiento, las figuras aparecen ya dibujadas y los bloques
solo hacen un fundido corto. Sin JavaScript, o si el script no llega en 2.5 s, la página se ve completa y quieta.

## Publicar en Cloudflare Pages

1. Sube este repositorio a GitHub.
2. En Cloudflare, *Workers & Pages → Create → Pages → Connect to Git*, elige el repositorio.
   Framework preset: **Astro**. Build command: `npm run build`. Output: `dist`.
3. Cada push a `main` publica. Queda en `https://<proyecto>.pages.dev`.
4. Dominio: en el proyecto, *Custom domains* → `jazzware.dev` (y `www.jazzware.dev` si quieres; Cloudflare lo
   redirige). Ya está en `site.url` de `src/config.ts`. El juego vive en `paleosharp.jazzware.dev`, en su propio
   proyecto de Pages.

Sin Git, `npm run deploy` construye y sube `dist/` con Wrangler. El proyecto de Pages debe llamarse `portafolio`; la
primera vez, Wrangler pide iniciar sesión en Cloudflare.

## Formulario «Contáctame»

Los mensajes te llegan por correo y puedes responder directo a quien escribió; tu dirección no aparece en la página.
Lo envía [Resend](https://resend.com); consulta en tu cuenta la cuota vigente.

1. Crea una cuenta en Resend **con el correo donde quieres recibir los mensajes** y genera una API key.
   Sin dominio propio, Resend solo deja enviar a ese mismo correo, que es justo lo que se necesita.
2. En Cloudflare, proyecto de Pages → *Settings → Variables and Secrets*, agrega:
   - `RESEND_API_KEY` (tipo *Secret*): la API key.
   - `CONTACT_TO`: tu correo.
   - `TURNSTILE_SECRET_KEY` (tipo *Secret*): la clave secreta de Turnstile.
   - `PUBLIC_TURNSTILE_SITE_KEY`: la clave pública del widget, disponible durante el build.
3. Sigue [SECURITY.md](SECURITY.md) para crear el widget y la regla de límite de solicitudes.
4. Vuelve a desplegar después de configurar las variables. Mientras falte la clave pública, el botón está
   deshabilitado; si falta una variable obligatoria del servidor, la función no envía correos.

Para que los correos salgan de tu dominio (mejor entrega, menos spam): en Resend, *Domains → Add domain* →
`jazzware.dev`; como el DNS está en Cloudflare, Resend agrega los registros solo (o los copias a mano). Luego agrega
`CONTACT_FROM` = `Portafolio <contacto@jazzware.dev>` en Cloudflare. No necesitas un buzón real en esa dirección.

**Contra spam:** Turnstile es obligatorio y se valida en el servidor, incluido el dominio y la acción `contact`.
También hay un campo trampa. El límite de solicitudes se configura en Cloudflare; no está activo por cambiar
el código. Las instrucciones y pendientes de publicación están en [SECURITY.md](SECURITY.md).

Para desarrollo, copia `.env.example` a `.env` y `.dev.vars.example` a `.dev.vars`. Completa únicamente las
copias locales con Resend de pruebas y un widget Turnstile de desarrollo que autorice `localhost`. Los archivos
con valores reales están ignorados. Los tests automatizados simulan Siteverify; las claves dummy no garantizan
el dominio y la acción que exige este servidor.

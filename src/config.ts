// Todo lo que cambia cuando tengas dominio, correo o CV está aquí.
// Un campo en null oculta su enlace en la página.
export const site = {
  /** Dirección final del portafolio (para enlaces canónicos y el mapa del sitio). */
  url: 'https://portafolio.pages.dev',
  name: 'Iván López Villegas',
  /** Correo público de contacto. */
  email: null as string | null,
  linkedin: null as string | null,
  github: null as string | null,
  /** Ruta o URL del CV en PDF; por ejemplo '/cv-ivan-lopez.pdf' si lo pones en public/. */
  cv: { es: null as string | null, en: null as string | null },
  paleosharp: {
    play: 'https://paleosharp.pages.dev',
    /** Repositorio público del juego, si decides abrirlo. */
    source: null as string | null,
  },
};

// Todo lo que cambia cuando tengas dominio o correo está aquí.
// Un campo en null oculta su enlace en la página.
export const site = {
  /** Dirección final del portafolio (para enlaces canónicos y el mapa del sitio). */
  url: 'https://jazzware.dev',
  name: 'Iván López Villegas',
  /**
   * Correo visible en la página. En null, la gente te escribe solo con el formulario «Contáctame»
   * (los mensajes llegan al correo de CONTACT_TO, configurado en Cloudflare; ver README).
   */
  email: null as string | null,
  /** Clave pública de Turnstile, configurada al construir; sin ella el formulario queda deshabilitado. */
  turnstileSiteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || null,
  linkedin: 'https://www.linkedin.com/in/ivan-lopezv/' as string | null,
  github: null as string | null,
  paleosharp: {
    play: 'https://paleosharp.jazzware.dev',
    /** Repositorio público del juego, si decides abrirlo. */
    source: null as string | null,
  },
};

// Todo lo que cambia cuando tengas dominio, correo o CV está aquí.
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
  /** Clave pública (site key) de Cloudflare Turnstile para el formulario; null = sin captcha. */
  turnstileSiteKey: null as string | null,
  linkedin: 'https://www.linkedin.com/in/ivan-lopezv/' as string | null,
  github: null as string | null,
  /** Ruta o URL del CV en PDF; por ejemplo '/cv-ivan-lopez.pdf' si lo pones en public/. */
  cv: { es: '/cv/CV_SEIII_Ivan_Lopez_Villegas_ES.pdf' as string | null, en: '/cv/CV_SEIII_Ivan_Lopez_Villegas_EN.pdf' as string | null },
  paleosharp: {
    play: 'https://paleosharp.jazzware.dev',
    /** Repositorio público del juego, si decides abrirlo. */
    source: null as string | null,
  },
};

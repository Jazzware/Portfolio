import { defineConfig } from 'astro/config';
import { site } from './src/config.ts';

export default defineConfig({
  site: site.url,
  // Astro 7 cambia el valor por defecto a 'jsx', que puede pegar palabras separadas por espacios entre etiquetas.
  compressHTML: true,
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});

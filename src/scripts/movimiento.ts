// Movimiento del sitio. Reglas en MASTER.md §6: solo transform, opacity y stroke-dashoffset;
// entradas una vez por carga; con movimiento reducido, el texto solo funde y las figuras aparecen completas.
// Los valores salen de tokens.css para que no haya números sueltos.

const raiz = document.documentElement;
const css = getComputedStyle(raiz);
const ms = (nombre: string) => parseFloat(css.getPropertyValue(nombre)) || 0;
const valor = (nombre: string) => css.getPropertyValue(nombre).trim();

export const T = {
  rapida: ms('--d-rapida'),
  base: ms('--d-base'),
  salida: ms('--d-salida'),
  coccion: ms('--d-coccion'),
  trazo: ms('--d-trazo'),
  escalonado: ms('--escalonado'),
  reparto: ms('--reparto-trazo'),
  aviso: ms('--d-aviso'),
  exacta: valor('--curva-exacta'),
  curvaTrazo: valor('--curva-trazo'),
};

const consulta = matchMedia('(prefers-reduced-motion: reduce)');
export const reducido = () => consulta.matches;
/** false si el script llegó tarde y el <head> ya dejó todo visible. */
export const anima = () => raiz.classList.contains('anima');

const reinicia = (el: Element, cuadros: Keyframe[], opciones: KeyframeAnimationOptions) => {
  el.getAnimations().forEach((a) => a.cancel());
  return el.animate(cuadros, opciones);
};

/** Entrada de texto o bloque: sube 8 px y aparece. Reducido: solo funde. */
export function sube(el: Element, retraso = 0) {
  el.classList.add('visto');
  if (!anima()) return;
  if (reducido()) {
    reinicia(el, [{ opacity: 0 }, { opacity: 1 }], { duration: T.rapida, easing: T.exacta, fill: 'backwards' });
  } else {
    reinicia(el, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], {
      duration: T.base, delay: retraso, easing: T.exacta, fill: 'backwards',
    });
  }
}

/** Barra de medida: se traza desde la izquierda con la curva de las figuras. */
export function mide(el: Element, retraso = 0) {
  if (!anima() || reducido()) return;
  reinicia(el, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
    duration: T.trazo, delay: retraso, easing: T.curvaTrazo, fill: 'backwards',
  });
}

/** Sale: baja 4 px y desaparece. Devuelve una promesa para ocultar al final. Se queda en el estado final
 *  (fill: forwards) y quien la llama decide cuándo cancelarla; un reloj de respaldo la resuelve aunque el
 *  navegador pause las animaciones (pestaña en segundo plano), para que nada se quede esperando. */
export function sale(el: Element): Promise<void> {
  if (!anima() || reducido()) return Promise.resolve();
  const a = reinicia(el, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(4px)' }], {
    duration: T.salida, easing: T.exacta, fill: 'forwards',
  });
  const respaldo = new Promise<void>((listo) => window.setTimeout(listo, T.salida + T.escalonado));
  return Promise.race([a.finished.then(() => undefined, () => undefined), respaldo]);
}

/** Traza una línea SVG desde su inicio. */
export function trazaLinea(l: SVGGeometryElement, retraso = 0) {
  if (!anima() || reducido()) { l.getAnimations().forEach((a) => a.cancel()); l.style.strokeDasharray = ''; return; }
  const largo = l.getTotalLength();
  l.style.strokeDasharray = `${largo} ${largo}`;
  reinicia(l, [{ strokeDashoffset: largo }, { strokeDashoffset: 0 }], {
    duration: T.trazo, delay: retraso, easing: T.curvaTrazo, fill: 'backwards',
  }).finished.then(() => { l.style.strokeDasharray = ''; }, () => {});
}

/** Traza las líneas (.trazo) de una figura; lo demás (.despues) funde al final. */
export function traza(figura: Element) {
  figura.classList.add('listo');
  const lineas = [...figura.querySelectorAll<SVGGeometryElement>('.trazo')];
  const despues = [...figura.querySelectorAll('.despues')];
  if (!anima() || reducido()) {
    lineas.forEach((l) => trazaLinea(l));
    despues.forEach((d) => d.getAnimations().forEach((a) => a.cancel()));
    return;
  }
  const n = lineas.length;
  const retraso = (i: number) => (n > 16 ? (i / (n - 1)) * T.reparto : i * T.escalonado);
  lineas.forEach((l, i) => trazaLinea(l, retraso(i)));
  const fin = T.trazo + (n ? retraso(n - 1) : 0);
  despues.forEach((d, i) => reinicia(d, [{ opacity: 0 }, { opacity: 1 }], {
    duration: T.base, delay: Math.max(0, fin - T.base) + Math.min(i, 5) * T.escalonado, easing: T.exacta, fill: 'backwards',
  }));
}

/** Llama a `alEntrar` una sola vez, cuando el elemento entra en vista. */
export function unaVez(elementos: Iterable<Element>, alEntrar: (el: Element, orden: number) => void, umbral = 0.2) {
  const io = new IntersectionObserver((entradas) => {
    let orden = 0;
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      alEntrar(e.target, orden++);
    }
  }, { threshold: umbral });
  for (const el of elementos) io.observe(el);
}

/** Anuncia una recompensa oculta. El aviso (Avisos.astro) la cuenta una sola vez. */
export function descubre(id: string, texto: string) {
  document.dispatchEvent(new CustomEvent('descubrimiento', { detail: { id, texto } }));
}

// Entradas genéricas de la página.
unaVez(document.querySelectorAll('[data-revela]'), (el, orden) => {
  sube(el, orden * T.escalonado);
  el.querySelectorAll('.mide').forEach((m) => mide(m, orden * T.escalonado));
}, 0.15);
unaVez(document.querySelectorAll('[data-traza]'), (el) => traza(el), 0.3);
raiz.dataset.movimiento = 'listo';

// Anquilosaurio colapsado, dibujado como ilustración de línea (recompensa 3, MASTER.md §9).
// Los trazos vienen de src/data/anquilosaurio-trazos.ts y se cargan solo cuando alguien excava:
// así la página no paga su peso mientras nadie llega a la excavación.
// Coordenadas en unidades del viewBox 1200×160; movimiento.ts traza cada `.trazo` al terminar de excavar.

const NS = 'http://www.w3.org/2000/svg';

export async function construyeEsqueleto(raiz: SVGGElement) {
  const { TRAZOS } = await import('../data/anquilosaurio-trazos');
  for (const d of TRAZOS) {
    const e = document.createElementNS(NS, 'path');
    e.setAttribute('d', d);
    e.setAttribute('class', 'trazo esq-linea');
    raiz.appendChild(e);
  }
}

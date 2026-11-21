// Binder: secciones como pestañas, filtros, fuente de precio (TCGplayer o Star City), moneda con tipo de cambio
// editable y orden por número o valor. Lee los precios de los atributos data- que pone Binder.astro.
// Sin este script la página ya está completa en USD con TCGplayer.

type Fuente = 'tcg' | 'scg';
const raiz = document.querySelector<HTMLElement>('.binder');
if (raiz) iniciar(raiz);

function iniciar(raiz: HTMLElement) {
  const $ = <T extends Element>(s: string) => document.querySelector<T>(s)!;
  const $$ = <T extends Element>(s: string, en: ParentNode = document) => [...en.querySelectorAll<T>(s)];
  const tasasDefecto: Record<string, number> = JSON.parse(raiz.dataset.tasas ?? '{}');
  const DECIMALES: Record<string, number> = { USD: 2, MXN: 2, COP: 0, CLP: 0, PEN: 2, ARS: 0, EUR: 2, CAD: 2 };
  const SECCIONES = ['set', 'promos', 'epics', 'enchanted'];

  // Preferencias del visitante (solo comodidad; si el almacenamiento falla, todo sigue igual).
  const recuerdo: { fuente?: Fuente; moneda?: string; orden?: string; tasas?: Record<string, number> } = (() => {
    try { return JSON.parse(localStorage.getItem('binder') ?? '{}'); } catch { return {}; }
  })();
  const guardar = () => { try { localStorage.setItem('binder', JSON.stringify(recuerdo)); } catch { /* sin almacenamiento */ } };

  const estado = {
    seccion: 'set', fuente: (recuerdo.fuente ?? 'tcg') as Fuente, moneda: recuerdo.moneda ?? 'USD', tasa: 1,
    orden: recuerdo.orden ?? 'num', texto: '', set: '', tintas: new Set<string>(), sinPlayset: false, conFoil: false,
  };
  estado.tasa = estado.moneda === 'USD' ? 1 : recuerdo.tasas?.[estado.moneda] ?? tasasDefecto[estado.moneda] ?? 1;

  interface Carta { el: HTMLElement; i: number; set: string; tinta: string; nombre: string; n: number; f: number;
    precio: Record<Fuente, [number | null, number | null]>; cond: [string, string]; seccion: string }
  const num = (v?: string) => (v == null || v === '' ? null : Number(v));
  const cartas: Carta[] = $$<HTMLElement>('.c').map((el) => ({
    el, i: Number(el.dataset.i), set: el.dataset.s!, tinta: el.dataset.ink!,
    // Nombre y versión: la celda .carta en las tablas; el título y la versión en las placas.
    nombre: (el.querySelector('.carta')?.textContent ?? `${el.querySelector('h4')?.textContent ?? ''} ${el.querySelector('.ver')?.textContent ?? ''}`).toLowerCase(),
    n: Number(el.dataset.n), f: Number(el.dataset.f),
    precio: { tcg: [num(el.dataset.tn), num(el.dataset.tf)], scg: [num(el.dataset.sn), num(el.dataset.sf)] },
    cond: [el.dataset.scn ?? '', el.dataset.scf ?? ''],
    seccion: el.closest<HTMLElement>('[data-seccion]')!.dataset.seccion!,
  }));

  const unitario = (c: Carta, k: 0 | 1) => c.precio[estado.fuente][k];
  const valor = (c: Carta) => c.n * (unitario(c, 0) ?? 0) + c.f * (unitario(c, 1) ?? 0);
  const falta = (c: Carta) => (c.n > 0 && unitario(c, 0) == null) || (c.f > 0 && unitario(c, 1) == null);
  const dinero = (usd: number | null, largo = false) => {
    if (usd == null) return '—';
    const v = usd * estado.tasa;
    const d = !largo && v >= 1000 ? 0 : DECIMALES[estado.moneda] ?? 2;
    return (largo ? '' : '$') + v.toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d }) + (largo ? ` ${estado.moneda}` : '');
  };

  function pasa(c: Carta) {
    if (estado.texto && !c.nombre.includes(estado.texto)) return false;
    if (estado.set && c.set !== estado.set) return false;
    if (estado.tintas.size && !c.tinta.split(' ').some((t) => estado.tintas.has(t))) return false;
    if (estado.conFoil && !c.f) return false;
    if (estado.sinPlayset && c.seccion === 'set' && c.n + c.f >= 4) return false;
    return true;
  }

  /** Reescribe precios, totales, barras y nota con la fuente y la moneda actuales. */
  function precios() {
    for (const c of cartas) {
      $$<HTMLElement>('[data-unitario]', c.el).forEach((u) => {
        const k = u.dataset.unitario === 'f' ? 1 : 0;
        const cond = estado.fuente === 'scg' ? c.cond[k] : '';
        u.textContent = dinero(unitario(c, k));
        if (cond) { const s = document.createElement('span'); s.className = 'cond'; s.title = `Star City solo la lista en ${cond}`; s.textContent = cond; u.append(s); }
      });
      const v = c.el.querySelector<HTMLElement>('[data-valor]')!;
      v.textContent = falta(c) && !valor(c) ? (c.el.tagName === 'TR' ? '—' : 'Sin precio') : dinero(valor(c));
    }
    const total = (l: Carta[]) => l.reduce((a, c) => a + valor(c), 0);
    $('[data-total]').textContent = dinero(total(cartas), true);
    $('[data-etq-total]').textContent = `Valor en ${estado.fuente === 'tcg' ? 'TCGplayer' : 'Star City'}`;
    for (const s of SECCIONES) {
      const l = cartas.filter((c) => c.seccion === s);
      $(`[data-total-sec="${s}"]`).textContent = `${l.length.toLocaleString('es-MX')} · ${dinero(total(l))}`;
    }
    const grupos = $$<HTMLElement>('[data-grupo]').map((g) => ({ g, v: total(cartas.filter((c) => g.contains(c.el))) }));
    const max = Math.max(...grupos.filter((x) => x.g.matches('.set')).map((x) => x.v), 1);
    for (const { g, v } of grupos) {
      g.querySelector('[data-total-grupo]')!.textContent = dinero(v);
      const barra = g.querySelector<HTMLElement>('[data-barra]');
      if (barra) { barra.style.transform = `scaleX(${v / max})`; g.querySelector('[data-pct]')!.textContent = `${Math.round((v / max) * 100)}%`; }
    }
    const sin = cartas.filter(falta).length;
    const nota = $('[data-nota]');
    nota.replaceChildren();
    const b = document.createElement('strong');
    b.textContent = estado.fuente === 'tcg' ? 'Precio de mercado de TCGplayer' : 'Precio de venta de Star City, en NM cuando lo tienen';
    nota.append(b, ` al ${raiz.dataset[estado.fuente === 'tcg' ? 'fechaTcg' : 'fechaScg']}.`,
      estado.moneda !== 'USD' ? ` 1 USD = ${estado.tasa} ${estado.moneda}.` : '', sin ? ` ${sin} cartas sin precio en esta fuente.` : '');
  }

  let ordenActual = 'num'; // El HTML llega ordenado por número.
  /** Aplica la pestaña, los filtros y el orden. */
  function vista() {
    const filtrando = !!(estado.texto || estado.set || estado.tintas.size || estado.sinPlayset || estado.conFoil);
    for (const s of SECCIONES) $(`[data-seccion="${s}"]`).hidden = s !== estado.seccion;
    $$<HTMLAnchorElement>('.secciones a').forEach((a) => a.setAttribute('aria-current', String(a.dataset.sec === estado.seccion)));
    for (const c of cartas) c.el.hidden = !pasa(c);
    for (const g of $$<HTMLElement>('[data-grupo]')) {
      const visibles = cartas.filter((c) => !c.el.hidden && g.contains(c.el));
      g.hidden = visibles.length === 0;
      if (g instanceof HTMLDetailsElement) {
        if (filtrando && !g.dataset.abiertoAntes) { g.dataset.abiertoAntes = String(g.open); g.open = true; }
        if (!filtrando && g.dataset.abiertoAntes) { g.open = g.dataset.abiertoAntes === 'true'; delete g.dataset.abiertoAntes; }
        g.querySelector('[data-coinciden]')!.textContent = filtrando ? ` · ${visibles.length} coinciden` : '';
      }
    }
    for (const s of SECCIONES) {
      const sec = $(`[data-seccion="${s}"]`);
      sec.querySelector<HTMLElement>('.vacio')!.hidden = $$('[data-grupo]:not([hidden])', sec).length > 0;
    }
    // Reordenar solo cuando cambia el criterio (o los valores, si se ordena por valor).
    const criterio = estado.orden === 'val' ? `val-${estado.fuente}` : 'num';
    if (criterio === ordenActual) return;
    ordenActual = criterio;
    for (const lista of $$<HTMLElement>('[data-lista]')) {
      const hijos = cartas.filter((c) => c.el.parentElement === lista);
      hijos.sort(estado.orden === 'val' ? (a, b) => valor(b) - valor(a) || a.i - b.i : (a, b) => a.i - b.i);
      lista.append(...hijos.map((c) => c.el));
    }
  }

  // Controles
  const moneda = $<HTMLSelectElement>('#moneda');
  const tasa = $<HTMLInputElement>('#tasa');
  const grupoTasa = $<HTMLElement>('#grupo-tasa');
  const pintarMoneda = () => {
    moneda.value = estado.moneda;
    grupoTasa.hidden = estado.moneda === 'USD';
    tasa.value = estado.moneda === 'USD' ? '' : String(estado.tasa);
  };
  const pintarFuente = () => $$<HTMLButtonElement>('[data-fuente]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.fuente === estado.fuente)));

  $$<HTMLButtonElement>('[data-fuente]').forEach((b) => b.addEventListener('click', () => {
    estado.fuente = b.dataset.fuente as Fuente; recuerdo.fuente = estado.fuente; guardar(); pintarFuente(); precios(); if (estado.orden === 'val') vista();
  }));
  moneda.addEventListener('change', () => {
    estado.moneda = moneda.value;
    estado.tasa = estado.moneda === 'USD' ? 1 : recuerdo.tasas?.[estado.moneda] ?? tasasDefecto[estado.moneda] ?? 1;
    recuerdo.moneda = estado.moneda; guardar(); pintarMoneda(); precios();
  });
  tasa.addEventListener('input', () => {
    const v = parseFloat(tasa.value);
    tasa.setAttribute('aria-invalid', String(!(v > 0)));
    if (!(v > 0)) return;
    estado.tasa = v; recuerdo.tasas = { ...recuerdo.tasas, [estado.moneda]: v }; guardar(); precios();
  });
  $('#tasa-hoy').addEventListener('click', () => {
    estado.tasa = tasasDefecto[estado.moneda] ?? 1;
    if (recuerdo.tasas) delete recuerdo.tasas[estado.moneda];
    guardar(); pintarMoneda(); precios();
  });

  let espera: number | undefined;
  $<HTMLInputElement>('#buscar').addEventListener('input', (e) => {
    clearTimeout(espera);
    espera = window.setTimeout(() => { estado.texto = (e.target as HTMLInputElement).value.trim().toLowerCase(); vista(); }, 150);
  });
  $<HTMLSelectElement>('#filtro-set').addEventListener('change', (e) => { estado.set = (e.target as HTMLSelectElement).value; vista(); });
  $<HTMLInputElement>('#sin-playset').addEventListener('change', (e) => { estado.sinPlayset = (e.target as HTMLInputElement).checked; vista(); });
  $<HTMLInputElement>('#con-foil').addEventListener('change', (e) => { estado.conFoil = (e.target as HTMLInputElement).checked; vista(); });
  const orden = $<HTMLSelectElement>('#orden');
  orden.value = estado.orden;
  orden.addEventListener('change', () => { estado.orden = orden.value; recuerdo.orden = estado.orden; guardar(); vista(); });
  $$<HTMLButtonElement>('[data-tinta]').forEach((b) => b.addEventListener('click', () => {
    const t = b.dataset.tinta!;
    if (estado.tintas.has(t)) estado.tintas.delete(t); else estado.tintas.add(t);
    $$<HTMLButtonElement>('[data-tinta]').forEach((x) => {
      const si = estado.tintas.has(x.dataset.tinta!);
      x.setAttribute('aria-pressed', String(si));
      x.classList.toggle('apagada', estado.tintas.size > 0 && !si);
    });
    vista();
  }));
  const mas = $<HTMLButtonElement>('#mas-filtros');
  mas.addEventListener('click', () => {
    const abierta = !$('#barra').classList.contains('abierta');
    $('#barra').classList.toggle('abierta', abierta);
    mas.setAttribute('aria-expanded', String(abierta));
  });

  // Pestañas con enlace propio: /binder/#promos abre esa sección.
  const desdeHash = () => { const h = location.hash.slice(1); if (SECCIONES.includes(h)) estado.seccion = h; };
  $$<HTMLAnchorElement>('.secciones a').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    estado.seccion = a.dataset.sec!;
    history.replaceState(null, '', `#${estado.seccion}`);
    vista();
  }));
  window.addEventListener('hashchange', () => { desdeHash(); vista(); });

  desdeHash();
  pintarFuente();
  pintarMoneda();
  if (estado.fuente !== 'tcg' || estado.moneda !== 'USD') precios();
  vista();
}

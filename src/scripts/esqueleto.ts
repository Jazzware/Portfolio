// Terópodo pequeño en postura de muerte, dibujado como ilustración paleontológica (recompensa 3, MASTER.md §9).
// Se genera en el navegador solo cuando alguien excava: las vértebras siguen la columna con getPointAtLength
// y el punteado usa isPointInFill. Coordenadas del dibujo: x 190–606, y 36–324.

const NS = 'http://www.w3.org/2000/svg';
type Punto = [number, number];

export function construyeEsqueleto(raiz: SVGGElement) {
  let semilla = 7;
  const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
  const p = (x: number, y: number) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  const agrega = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string>, padre: Element = raiz) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    padre.appendChild(e);
    return e;
  };
  const LINEA = 'trazo esq-linea', FINA = 'trazo esq-fina', LEJANA = 'trazo esq-lejana';
  const oculta = (d: string) => agrega('path', { d, class: 'esq-guia' });
  const hueso = (a: Punto, b: Punto, w: number, clase = LINEA) => {
    const [ax, ay] = a, [bx, by] = b;
    const dx = bx - ax, dy = by - ay, largo = Math.hypot(dx, dy), tx = dx / largo, ty = dy / largo, nx = -ty, ny = tx;
    const e = w * 0.62, m = w * 0.3, mx = (ax + bx) / 2, my = (ay + by) / 2;
    return agrega('path', { class: clase, d: `M ${p(ax + nx * e, ay + ny * e)} Q ${p(mx + nx * m, my + ny * m)} ${p(bx + nx * e, by + ny * e)} A ${e} ${e} 0 0 0 ${p(bx - nx * e, by - ny * e)} Q ${p(mx - nx * m, my - ny * m)} ${p(ax - nx * e, ay - ny * e)} A ${e} ${e} 0 0 0 ${p(ax + nx * e, ay + ny * e)} Z` });
  };
  const puntea = (forma: SVGGeometryElement, huecos: SVGGeometryElement[], caja: number[], n: number, peso: (x: number, y: number) => number, padre: Element) => {
    for (let i = 0; i < n; i++) {
      const x = caja[0] + azar() * (caja[2] - caja[0]), y = caja[1] + azar() * (caja[3] - caja[1]);
      const punto = new DOMPoint(x, y);
      if (!forma.isPointInFill(punto) || huecos.some((h) => h.isPointInFill(punto)) || azar() > peso(x, y)) continue;
      agrega('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: '1.1', class: 'esq-punto' }, padre);
    }
  };
  const puntos = agrega('g', { class: 'despues' });

  // Cráneo, echado hacia atrás sobre los hombros.
  const craneo = agrega('g', { transform: 'translate(250 74) rotate(-20)' });
  const caja = agrega('path', { class: LINEA, d: 'M 0 -6 C 2 -16 12 -22 26 -22 C 50 -22 76 -16 98 -6 C 102 -4 103 0 100 3 L 86 6 L 60 8 L 34 10 L 20 14 L 8 20 C 2 16 -1 6 0 -6 Z' }, craneo);
  const huecos = [
    'M 19.5 -10 A 6.5 6.5 0 1 0 32.5 -10 A 6.5 6.5 0 1 0 19.5 -10 Z',
    'M 38 -8 C 46 -15 60 -15 72 -8 C 66 -2 50 2 40 0 Z',
    'M 88 -6 C 92 -8 96 -6 96 -4 C 93 -2 90 -3 88 -6 Z',
    'M 6 -8 C 10 -12 14 -10 14 -4 C 12 2 8 4 6 -2 Z',
  ].map((d) => agrega('path', { class: FINA, d }, craneo));
  let dientes = '';
  for (let x = 38; x <= 96; x += 5.2) {
    const y = x > 86 ? 3 + (100 - x) * 0.2 : x > 60 ? 6 + (86 - x) * 0.077 : 8 + (60 - x) * 0.077;
    dientes += `M ${p(x - 1.8, y)} L ${p(x + 0.6, y + 4.6)} L ${p(x + 1.6, y)} `;
  }
  agrega('path', { class: FINA, d: dientes }, craneo);
  const quijada = agrega('g', { transform: 'rotate(12 8 18)' }, craneo);
  const mandibula = agrega('path', { class: LINEA, d: 'M 8 18 C 30 16 60 12 96 8 C 98 10 97 13 94 14 C 70 20 40 26 16 30 C 8 30 4 24 8 18 Z' }, quijada);
  const ventana = agrega('path', { class: FINA, d: 'M 20 22 C 26 19 34 19 38 21 C 32 25 25 26 20 22 Z' }, quijada);
  let inferiores = '';
  for (let x = 40; x <= 90; x += 5.6) { const y = 18 - (x - 8) * 0.105; inferiores += `M ${p(x - 1.6, y)} L ${p(x - 0.4, y - 4)} L ${p(x + 1.4, y - 0.3)} `; }
  agrega('path', { class: FINA, d: inferiores }, quijada);
  const puntosCraneo = agrega('g', { class: 'despues' }, craneo);
  puntea(caja, huecos, [-2, -24, 104, 22], 1400, (x, y) => Math.max(0, (y + 2) / 22) ** 1.6 * 0.9, puntosCraneo);
  puntea(mandibula, [ventana], [4, 6, 100, 32], 500, (x, y) => Math.max(0, (y - 12) / 18) ** 1.4 * 0.9, puntosCraneo);

  // Vértebras a lo largo de la columna. n apunta al lado dorsal.
  const vertebra = (columna: SVGPathElement, l: number, d: number, s: number, espina: number, chevron: number, costilla: number) => {
    const largo = columna.getTotalLength();
    const a = columna.getPointAtLength(l), b = columna.getPointAtLength(Math.min(l + 0.6, largo)), c = columna.getPointAtLength(Math.max(l - 0.6, 0));
    let tx = b.x - c.x, ty = b.y - c.y; const k = Math.hypot(tx, ty); tx /= k; ty /= k;
    const nx = ty, ny = -tx, hl = d * 0.4, hs = s / 2;
    const q = (u: number, v: number) => p(a.x + tx * u + nx * v, a.y + ty * u + ny * v);
    agrega('path', { class: FINA, d: `M ${q(-hl, hs)} L ${q(hl, hs)} L ${q(hl, -hs)} L ${q(-hl, -hs)} Z` });
    if (espina > 0.6) agrega('path', { class: FINA, d: `M ${q(-hl * 0.55, hs)} L ${q(-hl * 0.25 + espina * 0.3, hs + espina)} L ${q(hl * 0.3 + espina * 0.3, hs + espina)} L ${q(hl * 0.55, hs)}` });
    if (chevron > 0.6) agrega('path', { class: FINA, d: `M ${q(hl * 0.3, -hs)} L ${q(hl * 0.3 + chevron * 0.45, -hs - chevron)}` });
    if (costilla > 0) agrega('path', { class: FINA, d: `M ${q(0, -hs)} Q ${q(-costilla * 0.28, -hs - costilla * 0.55)} ${q(costilla * 0.12, -hs - costilla)}` });
  };
  type Pieza = { d: number; s: number; espina: number; chevron?: number; costilla?: number };
  const tramo = (columna: SVGPathElement, n: number, f: (i: number, n: number) => Pieza) => {
    const largo = columna.getTotalLength();
    const suma = Array.from({ length: n }, (_, i) => f(i, n).d).reduce((x, y) => x + y, 0);
    const escala = (largo * 0.98) / suma;
    let l = 0;
    for (let i = 0; i < n; i++) {
      const o = f(i, n), d = o.d * escala;
      vertebra(columna, l + d / 2, d, o.s, o.espina, o.chevron ?? 0, o.costilla ?? 0);
      l += d;
    }
  };
  tramo(oculta('M 250 74 C 200 92 196 150 230 188'), 9, (i) => ({ d: 1, s: 7 + i * 0.35, espina: 3 + i * 0.4 }));
  // Cintura escapular y brazo.
  agrega('path', { class: LINEA, d: 'M 226 196 C 236 182 262 166 282 160 C 285 163 284 167 280 169 C 262 176 242 188 234 202 Z' });
  agrega('path', { class: LINEA, d: 'M 220 200 C 226 196 236 200 236 208 C 232 214 222 212 220 200 Z' });
  hueso([230, 208], [214, 236], 5);
  hueso([214, 236], [228, 256], 3.6);
  agrega('path', { class: FINA, d: 'M 228 256 C 234 258 238 262 236 268 M 228 256 C 232 262 232 268 228 272 M 228 256 C 229 260 226 264 222 266' });
  const costillas = [26, 42, 56, 64, 68, 68, 64, 58, 48, 38, 26, 16];
  tramo(oculta('M 230 188 C 262 194 300 194 330 189'), 12, (i) => ({ d: 1, s: 10.5, espina: 16 + Math.sin((i / 11) * Math.PI) * 4, costilla: costillas[i] }));
  tramo(oculta('M 330 189 L 372 188'), 5, () => ({ d: 1, s: 11, espina: 10 }));
  // Pelvis.
  const ilion = agrega('path', { class: LINEA, d: 'M 316 184 C 316 170 332 160 352 160 C 372 160 388 168 390 182 C 380 186 366 188 352 188 C 338 188 326 188 316 184 Z' });
  agrega('path', { class: FINA, d: 'M 346 194 A 6 6 0 1 0 358 194 A 6 6 0 1 0 346 194 Z' });
  const pubis = agrega('path', { class: LINEA, d: 'M 342 198 C 336 220 328 244 322 258 C 314 262 310 268 318 270 C 330 270 340 268 336 262 C 334 246 344 220 352 200 Z' });
  agrega('path', { class: LINEA, d: 'M 360 198 C 368 216 378 232 388 246 C 384 250 380 248 378 246 C 368 232 358 214 354 202 Z' });
  // Pata lejana, luego la cercana, plegadas como se asienta un cadáver.
  hueso([358, 196], [338, 250], 7.5, LEJANA); hueso([338, 250], [386, 284], 6, LEJANA); hueso([386, 284], [352, 300], 4.5, LEJANA);
  const femur = hueso([352, 194], [318, 246], 9);
  hueso([318, 246], [358, 292], 7);
  agrega('path', { class: FINA, d: 'M 324 252 L 360 288' });
  hueso([358, 292], [320, 306], 5);
  for (const [a, b, c] of [[[320, 306], [305, 301], [292, 303]], [[320, 306], [303, 310], [289, 314]], [[320, 306], [307, 316], [297, 322]]] as Punto[][]) {
    hueso(a, b, 3.2, FINA); hueso(b, c, 2.8, FINA);
    agrega('path', { class: FINA, d: `M ${p(c[0], c[1])} q -6 -1 -8 4` });
  }
  puntea(ilion, [], [314, 158, 392, 190], 700, (x, y) => Math.max(0, (y - 166) / 24) ** 1.5 * 0.9, puntos);
  puntea(pubis, [], [308, 196, 354, 272], 500, (x) => Math.max(0, (x - 326) / 26) * 0.7, puntos);
  puntea(femur, [], [306, 186, 362, 256], 600, (x, y) => Math.max(0, (y - 200) / 50) * 0.75, puntos);
  tramo(oculta('M 372 188 C 440 196 520 214 604 184'), 34, (i, n) => ({
    d: 1 - 0.55 * (i / (n - 1)), s: 10 - 7.5 * (i / (n - 1)), espina: i < 16 ? 11 * (1 - i / 16) : 0, chevron: i < 26 ? 12 * (1 - i / 26) : 0,
  }));
}

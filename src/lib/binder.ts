// Binder de Lorcana: convierte la exportación de la colección (una fila por versión normal o foil) en una carta
// por fila con sus dos versiones, la clasifica en secciones y le asigna precios. Sin dependencias, para que lo usen
// la página (al construir), el script de precios y las pruebas.

export type Seccion = 'set' | 'promos' | 'epics' | 'enchanted';
/** Precio en USD de la versión normal y la foil; null si la fuente no la tiene. */
export type ParPrecio = [number | null, number | null];
/** Star City: precio y condición en que lo listan (NM salvo que no tengan esa). */
export type PrecioTienda = [number, string] | null;

export interface Carta {
  seccion: Seccion;
  set: number;
  /** Número tal como viene: «92», «4e», «27/P3». */
  numero: string;
  nombre: string;
  /** Una o dos tintas separadas por espacio: «Emerald Ruby». */
  tinta: string;
  rareza: string;
  normal: number;
  foil: number;
  /** Clave común con las fuentes de precio: «7-92», «P3-27». */
  clave: string;
}

export interface Precios {
  fecha: string;
  tasas: Record<string, number>;
  tasasFecha: string;
  tcg: Record<string, ParPrecio>;
}
export interface StarCity {
  fecha: string;
  precios: Record<string, [PrecioTienda, PrecioTienda]>;
}

export const SETS: Record<number, string> = {
  1: 'The First Chapter', 2: 'Rise of the Floodborn', 3: 'Into the Inklands', 4: "Ursula's Return",
  5: 'Shimmering Skies', 6: 'Azurite Sea', 7: "Archazia's Island", 8: 'Reign of Jafar', 9: 'Fabled',
  10: 'Whispers in the Well', 11: 'Winterspell', 12: 'Wilds Unknown',
};
/** Cartas numeradas de un set, sin epics ni enchanteds (que van del 205 en adelante). */
export const CARTAS_POR_SET = 204;

/** Lector de CSV con comillas («"Wake Up, Alice!"») y finales de línea \r\n. */
export function leerCsv(texto: string): Record<string, string>[] {
  const filas: string[][] = [];
  let fila: string[] = [], campo = '', comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(campo); campo = '';
      if (fila.some((x) => x !== '')) filas.push(fila);
      fila = [];
    } else campo += c;
  }
  fila.push(campo);
  if (fila.some((x) => x !== '')) filas.push(fila);
  const [cabecera, ...resto] = filas;
  return resto.map((f) => Object.fromEntries(cabecera.map((h, i) => [h.trim(), (f[i] ?? '').trim()])));
}

export function seccionDe(rareza: string): Seccion {
  if (rareza === 'Promo') return 'promos';
  if (rareza === 'Epic') return 'epics';
  if (rareza === 'Enchanted') return 'enchanted';
  return 'set';
}

/** Número de colección sin ceros a la izquierda y con su letra, si tiene: «092» → «92», «4E» → «4e». */
export function normalizarNumero(numero: string): string {
  const m = numero.trim().match(/^0*(\d+)([a-z]*)$/i);
  return m ? `${parseInt(m[1], 10)}${m[2].toLowerCase()}` : numero.trim().toLowerCase();
}

/** «27/P3» → «P3-27»; «092» del set 7 → «7-92»; «4e» del set 3 → «3-4e» (no es la carta 4). */
export function claveDePrecio(set: number, numero: string): string {
  const promo = numero.match(/^(\d+)\s*\/\s*(P\d+)$/i);
  if (promo) return `${promo[2].toUpperCase()}-${parseInt(promo[1], 10)}`;
  return `${set}-${normalizarNumero(numero)}`;
}

/** Número para ordenar: «4e» → 4, «27/P3» → 27. */
export const orden = (numero: string) => parseInt(numero, 10) || 0;

/** Junta las filas normal y foil de cada carta y las ordena por set y número. */
export function agrupar(filas: Record<string, string>[]): Carta[] {
  const porCarta = new Map<string, Carta>();
  for (const f of filas) {
    const set = parseInt(f['Set Number'], 10);
    const numero = f['Card Number'];
    const cuenta = parseInt(f['Count'], 10) || 0;
    if (!set || !numero) continue;
    const id = `${set}|${numero}`;
    let c = porCarta.get(id);
    if (!c) {
      c = { seccion: seccionDe(f['Rarity']), set, numero, nombre: f['Name'], tinta: f['Color'], rareza: f['Rarity'],
        normal: 0, foil: 0, clave: claveDePrecio(set, numero) };
      porCarta.set(id, c);
    }
    if (f['Variant'].toLowerCase() === 'foil') c.foil += cuenta; else c.normal += cuenta;
  }
  return [...porCarta.values()].sort((a, b) => a.set - b.set || orden(a.numero) - orden(b.numero) || a.numero.localeCompare(b.numero));
}

/**
 * SKU de Star City → clave y versión. «SGL-LOR-007-182-ENN1» (normal), «…-ENC1» (foil),
 * «SGL-LOR-007b-220-ENK1» (enchanted, foil), «SGL-LOR-PRM-P02_022-ENC1» (promo P2 #22).
 * Solo inglés; las demás cartas (otros idiomas, promos de evento sin serie) se ignoran.
 */
export function leerSku(sku: string): { clave: string; foil: boolean; acabado: string; impresion: number } | null {
  let m = sku.match(/^SGL-LOR-(\d{3})b?-(\d{3})-EN([A-Z])(\d)$/);
  if (m) return { clave: `${parseInt(m[1], 10)}-${parseInt(m[2], 10)}`, foil: m[3] !== 'N', acabado: m[3], impresion: +m[4] };
  m = sku.match(/^SGL-LOR-PRM-P0(\d)_(\d{3})-EN([A-Z])(\d)$/);
  if (m) return { clave: `P${m[1]}-${parseInt(m[2], 10)}`, foil: m[3] !== 'N', acabado: m[3], impresion: +m[4] };
  return null;
}

/**
 * De la captura cruda de Star City (SKU → [nombre, «$0.29», condición, existencias]) elige un precio por versión:
 * primero NM, luego el acabado foil estándar (C) y la primera impresión.
 */
export function preciosStarCity(crudo: Record<string, [string, string, string, string]>): StarCity['precios'] {
  const mejor = new Map<string, [{ p: number; cond: string; peso: number } | null, { p: number; cond: string; peso: number } | null]>();
  for (const [sku, [, precio, cond]] of Object.entries(crudo)) {
    const s = leerSku(sku);
    const p = parseFloat(precio.replace(/[$,]/g, ''));
    if (!s || Number.isNaN(p)) continue;
    const peso = (cond === 'NM' ? 0 : 10) + (s.acabado === 'C' || s.acabado === 'N' ? 0 : 1) + s.impresion;
    const par = mejor.get(s.clave) ?? [null, null];
    const i = s.foil ? 1 : 0;
    if (!par[i] || peso < par[i]!.peso) par[i] = { p, cond, peso };
    mejor.set(s.clave, par);
  }
  const salida: StarCity['precios'] = {};
  for (const [k, [n, f]] of [...mejor].sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))) {
    salida[k] = [n ? [n.p, n.cond] : null, f ? [f.p, f.cond] : null];
  }
  return salida;
}

export interface CartaConPrecio extends Carta {
  tcg: ParPrecio;
  scg: [PrecioTienda, PrecioTienda];
}

export function conPrecios(cartas: Carta[], precios: Precios, starcity: StarCity): CartaConPrecio[] {
  return cartas.map((c) => ({ ...c, tcg: precios.tcg[c.clave] ?? [null, null], scg: starcity.precios[c.clave] ?? [null, null] }));
}

/** Valor en USD de las copias de una carta según la fuente; las versiones sin precio cuentan 0. */
export function valor(c: CartaConPrecio, fuente: 'tcg' | 'scg'): number {
  const [n, f] = fuente === 'tcg' ? c.tcg : [c.scg[0]?.[0] ?? null, c.scg[1]?.[0] ?? null];
  return c.normal * (n ?? 0) + c.foil * (f ?? 0);
}

/** Una carta a la que le falta el precio de alguna versión que sí se tiene. */
export function sinPrecio(c: CartaConPrecio, fuente: 'tcg' | 'scg'): boolean {
  const [n, f] = fuente === 'tcg' ? c.tcg : [c.scg[0]?.[0] ?? null, c.scg[1]?.[0] ?? null];
  return (c.normal > 0 && n == null) || (c.foil > 0 && f == null);
}

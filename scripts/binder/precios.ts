// Actualiza los precios del binder. Se corre a mano o desde una tarea programada; la página solo lee el resultado.
//
//   node scripts/binder/precios.ts                       TCGplayer (vía Lorcast) y tipo de cambio → precios.json
//   node scripts/binder/precios.ts --starcity crudo.json  además convierte una captura de Star City → starcity.json
//
// TCGplayer: precio de mercado que publica la API pública de Lorcast (api.lorcast.com).
// Tipo de cambio: open.er-api.com, base USD. Solo es el valor por defecto; en la página se puede cambiar.
// Star City no tiene API pública: la captura cruda (SKU → [nombre, precio, condición, existencias]) se toma a mano
// de sus páginas de singles con un navegador, y aquí solo se convierte.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { preciosStarCity, normalizarNumero, type Precios, type ParPrecio } from '../../src/lib/binder.ts';

const carpeta = fileURLToPath(new URL('../../src/data/binder/', import.meta.url));
const SETS_LORCAST = [...Array.from({ length: 12 }, (_, i) => String(i + 1)), 'P1', 'P2', 'P3'];
const MONEDAS = ['MXN', 'COP', 'CLP', 'PEN', 'ARS', 'EUR', 'CAD'];
const cabeceras = { 'User-Agent': 'jazzware.dev-binder/1.0' };

async function json<T>(url: string): Promise<T> {
  const r = await fetch(url, { headers: cabeceras });
  if (!r.ok) throw new Error(`${url} respondió ${r.status}`);
  return r.json() as Promise<T>;
}
const dinero = (v: unknown) => { const n = parseFloat(String(v)); return Number.isFinite(n) ? Math.round(n * 100) / 100 : null; };
const hoy = () => new Date().toISOString().slice(0, 10);

const args = process.argv.slice(2);
const crudoStarCity = args[args.indexOf('--starcity') + 1];
if (args.includes('--starcity')) {
  if (!crudoStarCity) throw new Error('Falta la ruta de la captura: --starcity crudo.json');
  const fecha = args.includes('--fecha') ? args[args.indexOf('--fecha') + 1] : hoy();
  const precios = preciosStarCity(JSON.parse(readFileSync(crudoStarCity, 'utf8')));
  writeFileSync(`${carpeta}starcity.json`, JSON.stringify({ fecha, precios }) + '\n');
  console.log(`Star City: ${Object.keys(precios).length} cartas, captura del ${fecha}`);
}

const tcg: Record<string, ParPrecio> = {};
for (const codigo of SETS_LORCAST) {
  type CartaLorcast = { collector_number: string; prices?: { usd?: string | null; usd_foil?: string | null } };
  const cartas = await json<CartaLorcast[]>(`https://api.lorcast.com/v0/sets/${codigo}/cards`);
  for (const c of cartas) {
    if (!/^\d/.test(c.collector_number)) continue;
    tcg[`${codigo}-${normalizarNumero(c.collector_number)}`] = [dinero(c.prices?.usd), dinero(c.prices?.usd_foil)];
  }
  await new Promise((r) => setTimeout(r, 200)); // Lorcast pide no pasar de 10 solicitudes por segundo.
}

const cambio = await json<{ rates: Record<string, number>; time_last_update_utc: string }>('https://open.er-api.com/v6/latest/USD');
const salida: Precios = {
  fecha: hoy(),
  tasas: Object.fromEntries(MONEDAS.map((m) => [m, Math.round(cambio.rates[m] * 10000) / 10000])),
  tasasFecha: new Date(cambio.time_last_update_utc).toISOString().slice(0, 10),
  tcg,
};
writeFileSync(`${carpeta}precios.json`, JSON.stringify(salida) + '\n');
console.log(`TCGplayer: ${Object.keys(tcg).length} cartas al ${salida.fecha}; tipo de cambio del ${salida.tasasFecha}`);

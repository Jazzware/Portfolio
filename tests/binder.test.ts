// Pruebas del binder: lectura del CSV, agrupación normal/foil, secciones y claves de precio.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leerCsv, agrupar, claveDePrecio, leerSku, preciosStarCity, conPrecios, valor, sinPrecio } from '../src/lib/binder.ts';

const csv = [
  'Set Number,Card Number,Variant,Count,Name,Color,Rarity',
  '7,90,normal,4,Hiro Hamada - Future Champion,Emerald,Common',
  '7,90,foil,1,Hiro Hamada - Future Champion,Emerald,Common',
  '7,116,foil,1,"Wake Up, Alice!",Emerald,Common',
  '3,4e,normal,2,Dalmatian Puppy - Tail Wagger,Amber,Common',
  '10,218,foil,1,Kristoff - Mining the Ruins,Sapphire,Epic',
  '7,222,foil,1,Restoring Atlantis,Sapphire,Enchanted',
  '10,27/P3,foil,1,Putting It All Together,Steel,Promo',
  '',
].join('\r\n');

test('lee campos entre comillas y finales \\r\\n', () => {
  const filas = leerCsv(csv);
  assert.equal(filas.length, 7);
  assert.equal(filas[2]['Name'], 'Wake Up, Alice!');
  assert.equal(filas[2]['Rarity'], 'Common');
});

test('junta normal y foil en una carta y ordena por set y número', () => {
  const cartas = agrupar(leerCsv(csv));
  assert.equal(cartas.length, 6);
  const hiro = cartas.find((c) => c.numero === '90')!;
  assert.equal(hiro.normal, 4);
  assert.equal(hiro.foil, 1);
  assert.deepEqual(cartas.map((c) => `${c.set}/${c.numero}`), ['3/4e', '7/90', '7/116', '7/222', '10/27/P3', '10/218']);
});

test('ignora filas en 0 y sets con ceros a la izquierda', () => {
  const cartas = agrupar(leerCsv([
    'Set Number,Card Number,Variant,Count,Name,Color,Rarity',
    '003,211,foil,0,"Morph - Space Goo",Emerald,Enchanted',
    '007,92,normal,2,"Shere Khan - Infamous Tiger",Emerald,Rare',
    '007,92,foil,0,"Shere Khan - Infamous Tiger",Emerald,Rare',
  ].join('\n')));
  assert.equal(cartas.length, 1);
  assert.equal(cartas[0].set, 7);
  assert.equal(cartas[0].clave, '7-92');
  assert.deepEqual([cartas[0].normal, cartas[0].foil], [2, 0]);
});

test('clasifica en las cuatro secciones', () => {
  const s = Object.fromEntries(agrupar(leerCsv(csv)).map((c) => [c.numero, c.seccion]));
  assert.equal(s['90'], 'set');
  assert.equal(s['27/P3'], 'promos');
  assert.equal(s['218'], 'epics');
  assert.equal(s['222'], 'enchanted');
});

test('claves de precio comunes a las fuentes', () => {
  assert.equal(claveDePrecio(7, '092'), '7-92');
  assert.equal(claveDePrecio(3, '4e'), '3-4e');
  assert.equal(claveDePrecio(3, '4'), '3-4');
  assert.equal(claveDePrecio(10, '27/P3'), 'P3-27');
});

test('lee SKU de Star City', () => {
  assert.deepEqual(leerSku('SGL-LOR-007-182-ENN1'), { clave: '7-182', foil: false, acabado: 'N', impresion: 1 });
  assert.equal(leerSku('SGL-LOR-007b-220-ENK1')?.clave, '7-220');
  assert.equal(leerSku('SGL-LOR-PRM-P02_022-ENC1')?.clave, 'P2-22');
  assert.equal(leerSku('SGL-LOR-PRM-C01_010-ENN1'), null);
  assert.equal(leerSku('SGL-LOR-007-182-JAC1'), null);
});

test('Star City: prefiere NM, luego foil estándar', () => {
  const p = preciosStarCity({
    'SGL-LOR-007-182-ENN1': ['Akela', '$0.29', 'NM', '12 in stock'],
    'SGL-LOR-007-182-ENC1': ['Akela', '$0.39', 'PL', '1 in stock'],
    'SGL-LOR-007-182-ENC2': ['Akela', '$0.59', 'NM', 'Out of stock'],
  });
  assert.deepEqual(p['7-182'], [[0.29, 'NM'], [0.59, 'NM']]);
});

test('valor por fuente y cartas sin precio', () => {
  const [hiro] = agrupar(leerCsv(csv)).filter((c) => c.numero === '90');
  const precios = { fecha: '', tasas: {}, tasasFecha: '', tcg: { '7-90': [0.1, null] as [number, null] } };
  const sc = { fecha: '', precios: { '7-90': [[0.29, 'NM'], [0.39, 'NM']] as [[number, string], [number, string]] } };
  const [c] = conPrecios([hiro], precios, sc);
  assert.equal(valor(c, 'tcg'), 0.4);
  assert.equal(sinPrecio(c, 'tcg'), true);
  assert.equal(Math.round(valor(c, 'scg') * 100), 155);
  assert.equal(sinPrecio(c, 'scg'), false);
});

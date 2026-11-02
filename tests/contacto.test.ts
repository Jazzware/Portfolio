// Pruebas de la función del formulario: node --test (Node 22.18+ ejecuta TypeScript directamente).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handle, type Env } from '../functions/api/contacto.ts';

const env: Env = { RESEND_API_KEY: 'clave', CONTACT_TO: 'yo@ejemplo.com' };

function request(fields: Record<string, string>, json = true) {
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) body.set(k, v);
  return new Request('https://portafolio.pages.dev/api/contacto', {
    method: 'POST', body,
    headers: { ...(json ? { accept: 'application/json' } : {}), referer: 'https://portafolio.pages.dev/en/' },
  });
}
const valid = { nombre: 'Ana Reclutadora', correo: 'ana@empresa.com', mensaje: 'Hola, tenemos un puesto de SE III.', lang: 'es' };

function fakeFetch(status = 200) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fn = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    if (url.includes('turnstile')) return new Response(JSON.stringify({ success: (init.body as FormData).get('response') === 'bueno' }));
    return new Response('{}', { status });
  }) as unknown as typeof fetch;
  return { fn, calls };
}

test('envía el correo con reply_to del visitante', async () => {
  const f = fakeFetch();
  const res = await handle(request(valid), env, f.fn);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(f.calls.length, 1);
  const sent = JSON.parse(f.calls[0].init.body as string);
  assert.deepEqual(sent.to, ['yo@ejemplo.com']);
  assert.equal(sent.reply_to, 'ana@empresa.com');
  assert.match(sent.subject, /Ana Reclutadora/);
  assert.match(sent.text, /SE III/);
  assert.equal((f.calls[0].init.headers as Record<string, string>).authorization, 'Bearer clave');
});

test('rechaza campos inválidos y dice cuáles', async () => {
  const f = fakeFetch();
  const res = await handle(request({ nombre: 'A', correo: 'no-es-correo', mensaje: 'corto' }), env, f.fn);
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { ok: false, error: 'invalid', fields: ['nombre', 'correo', 'mensaje'] });
  assert.equal(f.calls.length, 0);
});

test('la trampa finge éxito y no envía nada', async () => {
  const f = fakeFetch();
  const res = await handle(request({ ...valid, sitio_web: 'http://spam' }), env, f.fn);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(f.calls.length, 0);
});

test('sin configuración responde 503', async () => {
  const res = await handle(request(valid), {}, fakeFetch().fn);
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { ok: false, error: 'not-configured' });
});

test('si Resend falla responde 502', async () => {
  const res = await handle(request(valid), env, fakeFetch(500).fn);
  assert.equal(res.status, 502);
});

test('con Turnstile exige un token válido', async () => {
  const withCaptcha = { ...env, TURNSTILE_SECRET_KEY: 'secreto' };
  assert.equal((await handle(request(valid), withCaptcha, fakeFetch().fn)).status, 400);
  const ok = await handle(request({ ...valid, 'cf-turnstile-response': 'bueno' }), withCaptcha, fakeFetch().fn);
  assert.equal(ok.status, 200);
});

test('sin JavaScript redirige de vuelta a la página', async () => {
  const res = await handle(request(valid, false), env, fakeFetch().fn);
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), 'https://portafolio.pages.dev/en/#contacto-enviado');
});

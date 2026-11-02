// Función de Cloudflare Pages: recibe el formulario «Contáctame» y lo manda por correo con Resend.
// Variables de entorno (Cloudflare → proyecto → Settings → Variables and Secrets):
//   RESEND_API_KEY        (secreta) clave de https://resend.com
//   CONTACT_TO            correo donde quieres recibir los mensajes
//   CONTACT_FROM          opcional; sin dominio propio usa 'Portafolio <onboarding@resend.dev>'
//   TURNSTILE_SECRET_KEY  opcional; si existe, exige el captcha de Cloudflare Turnstile
// Responde JSON si el navegador lo pide (el formulario con JavaScript); si no, redirige de vuelta a la página.

export interface Env {
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
  TURNSTILE_SECRET_KEY?: string;
}

type ErrorCode = 'invalid' | 'captcha' | 'not-configured' | 'send-failed';

export interface Message { name: string; email: string; message: string; lang: 'es' | 'en' }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Valida los campos. Devuelve el mensaje limpio o la lista de campos con error. */
export function validate(form: FormData): { ok: true; value: Message } | { ok: false; fields: string[] } {
  const get = (k: string) => String(form.get(k) ?? '').trim();
  const name = get('nombre'), email = get('correo'), message = get('mensaje');
  const lang = get('lang') === 'en' ? 'en' : 'es';
  const fields: string[] = [];
  if (name.length < 2 || name.length > 100) fields.push('nombre');
  if (!EMAIL.test(email) || email.length > 200) fields.push('correo');
  if (message.length < 10 || message.length > 5000) fields.push('mensaje');
  return fields.length ? { ok: false, fields } : { ok: true, value: { name, email, message, lang } };
}

async function verifyTurnstile(secret: string, token: string, ip: string | null, fetcher: typeof fetch) {
  if (!token) return false;
  const body = new FormData();
  body.set('secret', secret);
  body.set('response', token);
  if (ip) body.set('remoteip', ip);
  const res = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

export async function handle(request: Request, env: Env, fetcher: typeof fetch = fetch): Promise<Response> {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const back = (hash: string) => {
    const ref = request.headers.get('referer');
    const url = new URL(ref ?? '/', request.url);
    url.hash = hash;
    return Response.redirect(url.toString(), 303);
  };
  const reply = (status: number, body: { ok: true } | { ok: false; error: ErrorCode; fields?: string[] }) =>
    wantsJson
      ? new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } })
      : back(body.ok ? 'contacto-enviado' : 'contacto-error');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply(400, { ok: false, error: 'invalid' });
  }

  // Campo trampa: invisible para personas; los bots lo llenan. Se finge éxito para no darles pistas.
  if (String(form.get('sitio_web') ?? '') !== '') return reply(200, { ok: true });

  const checked = validate(form);
  if (!checked.ok) return reply(400, { ok: false, error: 'invalid', fields: checked.fields });

  if (!env.RESEND_API_KEY || !env.CONTACT_TO) return reply(503, { ok: false, error: 'not-configured' });

  if (env.TURNSTILE_SECRET_KEY) {
    const token = String(form.get('cf-turnstile-response') ?? '');
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, token, request.headers.get('cf-connecting-ip'), fetcher)
      .catch(() => false);
    if (!ok) return reply(400, { ok: false, error: 'captcha' });
  }

  const { name, email, message, lang } = checked.value;
  const res = await fetcher('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM ?? 'Portafolio <onboarding@resend.dev>',
      to: [env.CONTACT_TO],
      reply_to: email,
      subject: `Portafolio: mensaje de ${name}`,
      text: `${message}\n\n—\n${name} <${email}>\nEnviado desde el portafolio (${lang === 'en' ? 'inglés' : 'español'}).`,
    }),
  }).catch(() => null);

  if (!res || !res.ok) return reply(502, { ok: false, error: 'send-failed' });
  return reply(200, { ok: true });
}

export const onRequestPost = (context: { request: Request; env: Env }) => handle(context.request, context.env);

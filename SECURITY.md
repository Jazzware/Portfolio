# Publicación y protección del portafolio

El código puede ser público. La web y los archivos de `public/` también se publican aunque GitHub sea privado.
Los cambios locales no protegen la versión desplegada hasta publicar un nuevo build.

## 1. Configurar el formulario antes de desplegar

1. En Cloudflare, crea un widget Turnstile de tipo **Managed** para `jazzware.dev` y los dominios que realmente
   uses. No autorices dominios de terceros. Añade `www.jazzware.dev` solo si sirve la página sin redirigir.
2. En el proyecto de Pages, configura las variables de **Production**:

   | Variable | Valor | Protección |
   | --- | --- | --- |
   | `PUBLIC_TURNSTILE_SITE_KEY` | Site key del widget | Pública; debe estar disponible durante el build |
   | `TURNSTILE_SECRET_KEY` | Secret key del mismo widget | Secret del servidor |
   | `RESEND_API_KEY` | API key de Resend con el menor permiso necesario para enviar | Secret del servidor |
   | `CONTACT_TO` | Buzón de destino | Solo servidor; no uses prefijo `PUBLIC_` |
   | `CONTACT_FROM` | Remitente autorizado en Resend, si corresponde | Solo servidor |

3. Si habilitas previews, configura sus variables por separado. No copies secretos de producción a previews
   de código no confiable; sin claves el formulario permanece cerrado.
4. Construye y despliega después de configurar las variables. Comprueba en español e inglés que aparece el
   widget y que un mensaje llega al buzón. Un envío sin token debe fallar y no generar correo.
5. Confirma que el secreto de Turnstile y la clave de Resend no aparecen en el HTML ni en los JavaScript públicos.

El servidor exige verificación de Turnstile con `hostname` igual al dominio que recibe la solicitud y
`action=contact`. El widget envía esa acción. No se omite el captcha cuando falta configuración.
La respuesta a errores de red o validación impide el envío. El remitente y destinatario provienen del servidor.

Documentación: [Turnstile](https://developers.cloudflare.com/turnstile/get-started/),
[validación en servidor](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

## 2. Limitar solicitudes en Cloudflare (pendiente de aplicar en la cuenta)

En la zona de `jazzware.dev`, abre **Security → Security rules → Create rule → Rate limiting rules**.
Configura como punto de partida:

- Nombre: `contact-form`.
- Ruta: URI Path equals `/api/contacto`.
- Agrupación: IP de origen.
- Umbral: **5 solicitudes por 10 segundos**.
- Acción: **Block**, durante **10 segundos** si tu plan ofrece esos valores.

Puedes limitar además a método POST y hostname `jazzware.dev` si tu plan admite esos campos. Si solo permite
filtrar por ruta, usa la ruta y revisa si existen otros subdominios con el mismo endpoint.
Verifica los eventos de la regla y ajusta el umbral según uso real; es un límite de ráfagas, no una cuota diaria.
Consulta [disponibilidad por plan](https://developers.cloudflare.com/waf/rate-limiting-rules/).

Esta regla de la zona no cubre por sí sola el dominio `pages.dev`. Revisa el dominio del proyecto y sus previews:
redirige o restringe los accesos alternativos con las opciones de Pages/Access que correspondan a tu cuenta.
Comprueba que no se puede eludir la protección entrando por otro dominio. El captcha no sustituye este límite.
El código no implementa un contador en memoria: no sería un límite fiable entre instancias de Pages.

## 3. Secretos y temporales

`.env*`, `.dev.vars*`, `.wrangler/`, `*.pem` y `*.key` están ignorados, excepto los ejemplos vacíos.
No pegues secretos en documentación, capturas, mensajes de commit ni variables `PUBLIC_*`.
El archivo `.gitignore` evita altas accidentales; no elimina contenido ya registrado ni impide `git add -f`.
Si GitHub ofrece secret scanning y push protection para este repositorio, actívalos en sus opciones de seguridad.

## 4. Historial antiguo: decidir antes de reescribir

La revisión local encontró temporales `.wrangler/` en el commit `30e41ffa`, con rutas de desarrollo y mapas de
código. No encontró credenciales evidentes en el texto revisado. Las versiones anteriores de la configuración
conservan el correo personal, y los commits antiguos conservan cifras que ya no se muestran.

No se reescribe el historial automáticamente: modifica los identificadores de commits y afecta a clones,
ramas y pull requests. El borrado del contenido actual no retira copias ya descargadas.

Si quieres retirar esos datos también del historial:

1. Coordina una pausa de cambios y prepara una copia de respaldo privada, fuera del repositorio publicado.
2. Trabaja en un clon nuevo dedicado a la limpieza, sin usar este árbol con cambios locales.
3. Usa `git-filter-repo` para retirar `.wrangler/` y sustituir el correo y las cifras en los archivos de texto.
4. Inspecciona todas las ramas y etiquetas que se publicarán. Verifica el texto y los metadatos antes de sustituir
   el historial remoto. Acuerda ese paso por separado; no ejecutes un force push desde este árbol de trabajo.
5. Revisa con GitHub las referencias de PR y cachés que puedan conservar los datos. Los colaboradores deberán
   volver a clonar o seguir las instrucciones de recuperación para no reintroducir el historial anterior.

Si se descubre una credencial real, revócala o rótala primero; la limpieza no la vuelve segura.
Sigue la [guía de GitHub para retirar datos sensibles](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

## Estado de comprobación

Las pruebas locales usan proveedores simulados y no prueban la configuración de Cloudflare/Resend.
La regla de tráfico, los secretos, la publicación y la limpieza histórica requieren comprobación aparte.

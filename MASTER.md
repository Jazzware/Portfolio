# MASTER.md: sistema de diseño del portafolio

Fuente única de verdad del diseño. Todo color, tipo, espacio, borde y movimiento del sitio sale de aquí.
Los valores viven como variables CSS en `src/styles/tokens.css`; este archivo explica cada uno y sus reglas.
Rediseño completo (noviembre de 2026): del diseño anterior (Metro de la CDMX) solo se conservan los textos
(`src/data/`, `src/config.ts`), el formulario de contacto y las dos rutas ES/EN.

---

## 1. Tesis

**Tesis visual.** Fondo negro de horno (#0A0A0C) con tinta color hueso (#EDE7DC). El cobalto (#4673FF) marca todo
lo del ingeniero; el rojo óxido (#E04E32), todo lo del creador. Las vasijas se dibujan con la convención de la
ilustración arqueológica: media vasija en corte y media por fuera, con escala gráfica real. Tipografía IBM Plex Sans
en todo el sitio, elegida porque se diseñó entre la precisión de ingeniería y la mano humana, con fuerte contraste
de tamaños (72 / 40 / 24 / 17 / 14 px, pesos 400 y 600); IBM Plex Mono solo para código C# y medidas. Retícula
estricta de 8 px: generosa entre secciones (128 px), apretada dentro de ellas. Componentes de esquina recta y planos,
delimitados por filetes de 1 px, sin sombras ni radios.

**Tesis de interacción.** Rápido y seco, como un instrumento. La interfaz responde en 120 a 200 ms con una sola
curva de salida, `cubic-bezier(0.2, 0, 0, 1)`. El hover cambia el color y traza un filete o un relleno desde la
izquierda; nada crece ni se levanta. Cada figura traza sus líneas una vez al entrar en vista (900 ms por línea,
`cubic-bezier(0.45, 0, 0.55, 1)`; en una figura de muchas piezas las líneas arrancan en secuencia, repartidas en
600 ms como máximo) mientras el texto de su placa sube 8 px con 40 ms de escalonado. Las teclas numéricas saltan
entre secciones como un selector de niveles. Las recompensas ocultas son los únicos momentos de 400 ms y las
anuncia un aviso que entra en 200 ms y sale en 160 ms. Prohibido: rebote, sobrepaso, parallax, secuestro del
scroll, crecer en hover, inclinación 3D, brillo (glow), desenfoque, vidrio, cursores propios, texto de máquina de
escribir y cualquier cosa que se repita en bucle.

**Patrones permitidos** (cada uno es decisión, no relleno):
- Filetes de 1 px en reglas, marcos de placa y filas de listas.
- Pies de figura «Fig. n.» sobre dibujos o imágenes reales.
- Escalas gráficas que miden algo real (centímetros en una vasija, meses en un puesto).
- Texto mono solo para código C# y medidas (fechas, duraciones, escalas).
- La animación de trazo de las figuras, una vez por vista.
- Un contador de descubrimientos para las recompensas ocultas.
- Pistas de atajos de teclado.
- Líneas guía (leader lines) que rotulan una figura o una captura.
- La barra de duración de cada puesto sobre su pista completa: mide meses contra el puesto más largo.

**Decisiones de dirección validadas** (rondas 1 a 3):
- Historial laboral: **vasija de rollos** en escritorio (un rollo por puesto, el más antiguo en la base, el actual en
  el borde, un rollo punteado arriba para el siguiente puesto). En pantallas angostas: **catálogo** de filas.
- PaleoSharp: **el juego mismo, rotulado**. Captura real de un nivel, montada como espécimen, con líneas guía.
- Portada: **Fig. 1**, jarra torneada en corte y exterior, en rojo óxido.

## 2. Diales

| Dial | Valor | Cláusula de la tesis |
|---|---|---|
| variance | 4 | «retícula estricta de 8 px», «esquina recta y planos» |
| motion | 5 | «rápido y seco» + figuras que trazan sus líneas + recompensas ocultas |
| density | 4 | «generosa entre secciones (128 px), apretada dentro de ellas» |

Del dataset de ui-ux-pro-max se tomó: evitar el negro puro, evitar la decoración excesiva, la lista de
verificación de foco, objetivos táctiles y movimiento reducido. Se descartó: estilo «Modern Dark» (vidrio, glow,
manchas de luz), paleta clara, Amatic SC + Cabin (reflejo de «artesanal»), curva `back.out` con sobrepaso,
cuadrícula de proyectos tipo mosaico, presionar con escala 0.97.

## 3. Color

Contraste calculado sobre los valores, no a ojo. Cuerpo de texto ≥ 4.5:1; texto grande y bordes de UI ≥ 3:1.

| Token | Valor | Uso | Sobre --horno | Sobre --placa |
|---|---|---|---|---|
| `--horno` | #0A0A0C | Fondo de página (negro de horno, nunca #000) | | |
| `--placa` | #111115 | Un escalón de superficie: placas, figuras | | |
| `--filete` | #2A2A31 | Filetes decorativos; nunca lleva información | 1.39 | 1.32 |
| `--filete-fuerte` | #6A6A74 | Bordes de campos y botones deshabilitados | 3.70 | 3.52 |
| `--hueso` | #EDE7DC | Texto principal, marcos de figura | 16.07 | 15.31 |
| `--hueso-2` | #A39D93 | Texto secundario, pies de figura | 7.35 | 7.00 |
| `--cobalto` | #4673FF | Mundo del ingeniero: experiencia, herramientas, enlaces, foco | 4.86 | 4.63 |
| `--oxido` | #E04E32 | Mundo del creador: PaleoSharp, dibujos, recompensas | 5.00 | 4.76 |
| `--sobre-acento` | #0A0A0C | Texto sobre relleno cobalto (4.86) u óxido (5.00) | | |
| `--error` | #FF9A8A | Mensajes de error del formulario (siempre con texto) | 9.65 | 9.19 |
| `--ok` | #8BD3A5 | Confirmación de envío del formulario | 11.26 | 10.73 |

**Regla de los dos mundos.** Cada sección declara `--mundo`: `var(--cobalto)` en portada (rol), experiencia,
herramientas y contacto; `var(--oxido)` en PaleoSharp y en las figuras. Botones, enlaces, foco y filetes activos
usan `var(--mundo)`, nunca un color suelto.

## 4. Tipografía

- `--sans`: `"IBM Plex Sans", "Segoe UI", Roboto, system-ui, sans-serif`
- `--mono`: `"IBM Plex Mono", Consolas, ui-monospace, monospace`
- Carga: autoalojada, `font-display: swap`, solo 400 y 600 (sans) y 400 (mono), subconjuntos latin y latin-ext.

| Token | Tamaño | Peso | Interlineado | Tracking | Uso |
|---|---|---|---|---|---|
| `--t-display` | clamp(48px, 8vw, 72px) | 600 | 1.0 | -0.025em | Nombre en la portada |
| `--t-h2` | clamp(32px, 5vw, 40px) | 600 | 1.1 | -0.01em | Títulos de sección, empresa activa |
| `--t-h3` | 24px | 600 | 1.2 | -0.01em | Subtítulos, rol |
| `--t-cuerpo` | 17px | 400 | 1.55 | 0 | Texto corrido; medida máxima 68ch |
| `--t-chico` | 14px | 400 / 600 | 1.45 | 0 | Pies de figura, etiquetas, datos mono |

Mono solo en: fragmentos de C#, fechas (`2022.02–2026.09`), duraciones (el texto de `content.ts`, p. ej. «4 años y 7 meses»), escalas (`5 cm`).
Nunca en navegación, títulos ni botones.

## 5. Espacio, forma, elevación

- Retícula de 8 px. `--e-1` 8 · `--e-2` 16 · `--e-3` 24 · `--e-4` 32 · `--e-6` 48 · `--e-8` 64 · `--e-12` 96 · `--e-16` 128.
- Entre secciones: `--e-16` (128) en escritorio, `--e-12` (96) en móvil. Dentro de una placa: `--e-4` (32).
- Ancho máximo `--ancho`: 1200 px. Márgenes laterales: 32 px; 24 px por debajo de 640 px.
- Radio: 0 en todo. Sin sombras. Elevación: nivel 0 = `--horno`; nivel 1 = `--placa` + filete de 1 px.
- Objetivos táctiles ≥ 44 × 44 px.
- Capas: encabezado 10, aviso de descubrimiento 20, enlace «saltar al contenido» 30.

## 6. Movimiento

| Token | Valor | Uso |
|---|---|---|
| `--d-rapida` | 120ms | Cambio de color en hover |
| `--d-base` | 200ms | Relleno/filete de hover, entradas (texto sube 8 px) |
| `--d-salida` | 160ms | Toda salida (aviso, cuerpo que se cierra) |
| `--d-coccion` | 400ms | Solo recompensas ocultas |
| `--d-trazo` | 900ms | Cada línea de una figura |
| `--escalonado` | 40ms | Entre elementos hermanos |
| `--reparto-trazo` | 600ms | Tope del escalonado en figuras de muchas piezas |
| `--d-aviso` | 3200ms | Tiempo que el aviso de descubrimiento queda en pantalla |
| `--curva-exacta` | cubic-bezier(0.2, 0, 0, 1) | Toda la interfaz |
| `--curva-trazo` | cubic-bezier(0.45, 0, 0.55, 1) | Trazo de figuras y barras de medida |

- Solo se animan `transform`, `opacity` y `stroke-dashoffset`. Nunca ancho, alto, márgenes ni posición.
- Las entradas ocurren una vez por carga (IntersectionObserver que se desconecta).
- `prefers-reduced-motion: reduce`: las figuras aparecen completas, el texto solo funde en 120 ms, las
  recompensas cambian de estado al instante. Nada se mueve.
- Sin JavaScript: todo el contenido es visible y estático (las clases de animación solo existen con `.js`).

## 7. Componentes base (cinco estados)

| Componente | Reposo | Hover | Foco (`:focus-visible`) | Activo | Deshabilitado |
|---|---|---|---|---|---|
| Botón `.btn` | Borde 1 px y texto en `--mundo`, fondo transparente | Relleno `--mundo` entra desde la izquierda (200 ms), texto `--sobre-acento` | Contorno 2 px `--mundo`, separación 3 px | Relleno al instante, baja 1 px | Borde punteado `--filete-fuerte`, texto `--hueso-2`, cursor no permitido |
| Enlace | Texto `--mundo` | Filete de 1 px se traza desde la izquierda (200 ms) | Contorno 2 px `--mundo` | Filete completo | n/a |
| Campo | Fondo `--horno`, borde 1 px `--filete-fuerte` | Borde `--hueso-2` | Contorno 2 px `--cobalto`, borde `--hueso` | n/a | Borde punteado, texto `--hueso-2` |
| Campo inválido | Borde `--error` + mensaje de texto | igual | igual | n/a | n/a |
| Placa `.placa` | Fondo `--placa`, filete 1 px `--filete` | Filete pasa a `--mundo` (120 ms) | Si es interactiva: contorno 2 px `--mundo` | n/a | n/a |
| Rótulo de rollo (vasija) | Empresa `--hueso`, rol y fechas `--hueso-2` | Empresa y línea guía en `--cobalto` | Marco 2 px `--cobalto` | Seleccionado: rollo en corte se rellena de cobalto | n/a |

Botón principal por sección: uno. Mismo verbo para la misma intención en toda la página.

## 8. Estructura de la página

1. **Encabezado.** Fondo `--horno` opaco con filete inferior (sin vidrio). Nombre, secciones, ES/EN.
   Atajos: `1` PaleoSharp, `2` Experiencia, `3` Herramientas, `4` Contacto, `?` muestra la lista.
2. **Portada.** Nombre (`--t-display`), rol en cobalto, presentación, búsqueda (SE III .NET), acciones.
   A la derecha, **Fig. 1**: jarra torneada en corte, en óxido, con escala de 5 cm.
3. **PaleoSharp** (`--mundo: --oxido`). Texto y acciones a la izquierda; **Fig. 2**: captura real de un nivel con
   líneas guía (EXC-1, raptor, bandera). Debajo: «Cómo está hecho» y la pila tecnológica.
4. **Experiencia** (`--mundo: --cobalto`). «Lo que hago bien» y la **vasija de rollos** con panel de detalle;
   en móvil, el catálogo de filas que se abren.
5. **Herramientas y formación** (cobalto). Filas con filete: grupo a la izquierda, lista a la derecha.
6. **Contacto.** Texto, enlaces y formulario (mismo contrato: `/api/contacto`, campos `nombre`, `correo`,
   `mensaje`, trampa `sitio_web`, Turnstile opcional).
7. **Pie.** Nombre y crédito. Una franja de tierra punteada (recompensa 3).

## 9. Recompensas ocultas (4)

Ninguna es necesaria; ninguna se anuncia antes de encontrarse. Contador «Descubrimiento n de 4».
1. **Cocer la jarra.** Tres clics (o Enter) sobre la Fig. 1: el corte pasa de rayado a óxido sólido (400 ms).
2. **El siguiente rollo.** Activar el rollo punteado de la vasija: se rellena de cobalto y el panel invita a
   escribir («Ese rollo lo pones tú»), con enlace a Contacto.
3. **Excavar.** Cinco clics (o Enter) sobre la franja de tierra del pie: la tierra se despeja y aparece el
   esqueleto de terópodo en postura de muerte, trazándose (el dibujo que te gustó en la ronda 1).
4. **La base.** Presionar la losa de la base de la vasija (no tiene rótulo; con teclado, el botón que sigue a los
   rótulos): se rellena de cobalto y el panel muestra la carrera (Licenciatura en Ingeniería en Sistemas
   Computacionales, Universidad del Valle de México, 2015–2020).

## 10. Accesibilidad

- Foco visible en todo elemento interactivo; nunca `outline: none` sin reemplazo.
- Las figuras decorativas llevan `aria-hidden`; las informativas, `role="img"` y nombre.
- La vasija de rollos es una lista de botones (`aria-pressed`) con el detalle en una región `aria-live`.
- El color nunca es el único indicador (errores con texto, rollo seleccionado también con marco).
- Probar a 375 / 768 / 1024 / 1440 px sin scroll horizontal.

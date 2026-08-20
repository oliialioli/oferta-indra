# Oferta Indra — React + Vite + MUI

Conversión del mockup estático (HTML/CSS/JS vanilla) a una app React con
Vite y Material UI. Estructura y comportamiento son fieles al original;
algunas decisiones de conversión están explicadas más abajo.

## Puesta en marcha

```bash
npm install
npm run dev
```

### Estado de los assets

| Asset | Estado |
|---|---|
| `src/assets/images/indra-logo.svg` | ✅ real (subido) |
| `src/assets/images/top-employer-seal.png` | ✅ real (subido) |
| `src/assets/images/buddy-avatar-small.png` | ✅ real (subido) — usado en el modal de aceptación |
| `src/assets/images/buddy-avatar-poster.png` | ✅ real (misma imagen) — poster de los vídeos y **fallback automático**: si un vídeo falla al cargar (o el usuario prefiere movimiento reducido), `AvatarNarrator` muestra esta imagen estática en su lugar, sin romper el layout |
| `src/theme/fonts/ForFutureSans-*.woff` (5 pesos × normal/cursiva) | ✅ real (subidos como `.otf`, convertidos a `.woff`) |
| `src/assets/media/indra-{idle,talking,presenting,listening,confirmation}.mp4` | ✅ reales (subidos) — los 5 estados del personaje narrador, ver sección siguiente |

Todos los assets viven bajo `src/` (no `public/`) e importados como módulos ES,
para que el `base: '/oferta-indra/'` de Vite (necesario para GitHub Pages,
que sirve el sitio bajo un subpath) se aplique automáticamente a sus rutas
finales sin tener que prefijarlas a mano.

**Nota sobre las fuentes**: los `.otf` originales pesaban ~60KB cada uno;
no tuve acceso a red para compilar el compresor Brotli que necesita el
formato `.woff2`, así que los convertí a `.woff` (compresión zlib, sin
dependencias externas) con `fontTools`. Quedan en ~35KB cada uno — sigue
siendo una reducción notable, y `.woff` tiene soporte universal en
navegadores modernos. Si en algún momento quieres los `.woff2` (un poco
más ligeros aún), es tan sencillo como correr localmente:
```bash
pip install fonttools brotli
fonttools varLib.instancer ...  # o simplemente:
python3 -c "from fontTools.ttLib import TTFont; f=TTFont('ForFutureSans-Regular.otf'); f.flavor='woff2'; f.save('ForFutureSans-Regular.woff2')"
```


## El narrador (INDI)

`AvatarNarrator.jsx` sustituye al antiguo `AvatarPanel` de vídeo único: el
personaje ahora tiene 5 estados (`idle | talking | presenting | listening |
confirmation`, ver `src/data/narratorVideos.js`) que se cruzan entre sí con
un crossfade de ~220ms sobre dos capas `<video>` apiladas — nunca se
desmonta el vídeo activo, así que no hay flashes ni fondos negros.

- **Estado central**: `useNarrator` (`src/hooks/useNarrator.js`) es la única
  máquina de estados. Detecta la sección activa reutilizando el
  `activeIndex` que ya calculaba `useRevealOnScroll` (IntersectionObserver,
  no scroll-% manual), dispara `PRESENTING` una vez al entrar en una
  sección nueva y cae a `IDLE`/`TALKING` cuando termina. La bienvenida
  (sección 0) se queda directamente en `IDLE`, sin presenting.
- **Confirmación**: como la web solo tiene 5 pantallas (no una 6ª de
  "revisión final"), `CONFIRMATION` se dispara al abrir el `AcceptModal`
  existente — es, de hecho, el momento de revisión/aceptación del flujo.
- **Mensaje + audio**: todo centralizado en `src/data/narratorConfig.js`
  (mensaje por sección + `audioSrc`). Ningún audio existe todavía —
  `audioSrc: null` en las 6 entradas — así que los controles de
  reproducir/repetir se muestran deshabilitados y el texto siempre está
  disponible vía "Ver transcripción". En cuanto graben audios, basta con
  rellenar `audioSrc` ahí; nada más cambia.
- **`listening`**: vídeo y regla de no-loop ya están cableados, pero nada
  lo dispara — no había una heurística de inactividad especificada, así
  que de momento cae a `IDLE` como se pidió explícitamente.
- **Responsive**: en desktop el personaje + tarjeta de narración viven en
  la columna fija de siempre. En móvil solo el personaje se queda en la
  barra sticky superior (compacta); la tarjeta de mensaje/controles pasa a
  flujo normal justo debajo y se desplaza con el resto del contenido.
- **Accesibilidad**: respeta `prefers-reduced-motion` (imagen estática, sin
  crossfade), pausa vídeo/audio si la pestaña pierde visibilidad, y todos
  los controles tienen `aria-label` y son operables por teclado.

## Despliegue

Publicado en GitHub Pages: **https://oliialioli.github.io/oferta-indra/**

Cada push a `main` dispara `.github/workflows/deploy.yml`, que compila con
`npm run build` y publica `dist/`. El `base: '/oferta-indra/'` en
`vite.config.js` tiene que coincidir con el nombre del repo si lo renombras.

## Estructura

```
src/
  data/offerData.js       ← todo el copy y contenido estructurado (editar aquí para otra oferta)
  theme/theme.js           ← paleta, tipografía, breakpoint (760px = md)
  theme/fonts.css          ← @font-face + reset global
  hooks/useRevealOnScroll.js  ← IntersectionObserver: revela cada pantalla y calcula el progreso
  hooks/useTypewriter.js      ← efecto máquina de escribir del titular
  components/
    Header.jsx              ← logo + barra de progreso fija
    AvatarNarrator.jsx       ← personaje + narración (ver sección "El narrador" más abajo)
    OfferButton.jsx          ← botón de marca reutilizable (variantes primary/ghost/sticky)
    Screen.jsx                ← wrapper de cada pantalla (eyebrow + titular + cuerpo + acciones)
    TypewriterHeadline.jsx
    StatGrid.jsx              ← ficha de la oferta, con acordeones info (i)
    BenefitsGrid.jsx
    ReasonsList.jsx           ← lista numerada "por qué elegirnos"
    SectorsGrid.jsx
    StickyCta.jsx             ← CTA fijo inferior
    AcceptModal.jsx           ← modal de aceptación (MUI Dialog)
  App.jsx                    ← orquesta las 5 pantallas
```

## Decisiones de conversión (léelo antes de pedir "que quede igual")

**Botones → `OfferButton`, no SVG con texto vectorizado.**
En el HTML original cada botón es un SVG con el texto exportado como paths
de Figma (dos SVG completos por botón, uno para el estado normal y otro
para hover). Eso no es portable ni razonable en React: no es accesible,
no lo puedes traducir, y pesa muchísimo. Lo sustituí por `OfferButton`,
un componente con texto real que reproduce el mismo lenguaje visual
(fondo blanco / esquinas que aparecen al hover) en tres variantes:
`primary`, `ghost` (el toggle de audio) y `sticky` (la barra inferior).

**Iconos de beneficios → SVG de marca reales.**
Los 6 iconos de la sección "Beneficios" son los originales del Figma
(`src/components/icons/BenefitIcons.jsx`), exportados como componentes SVG
inline que heredan el color vía `currentColor`. Se emparejaron por tema con
las 6 categorías actuales (bienestar emocional → balance, financiero →
maletín, desarrollo → pin/roadmap, físico → corazón, impacto → personas,
ventajas → regalo/tarjeta).

**Mock de Gmail → omitido.**
El HTML original envolvía todo el prototipo dentro de una simulación de
la bandeja de Gmail (barra de navegador, sidebar, lista de correos) como
marco de presentación, con un botón que abría el prototipo real en
`#prototipo`. Esa capa es puramente de demo/presentación, no parte del
producto candidato-facing, así que no la he portado — esta app React ES
directamente el prototipo. Si necesitas el envoltorio de Gmail para
presentaciones, dímelo y lo monto como una vista aparte.

**Fuentes y vídeos → referenciados, no re-embebidos.**
Ver sección "Puesta en marcha" arriba. La razón es que re-incrustar
megabytes de base64 en el JS bundle (10 pesos de fuente + 5 vídeos del
narrador) es mala práctica: bloquea el parseo inicial y no cachea igual de
bien que un archivo estático servido aparte.

**Barra inferior → "Revisar y aceptar oferta" fija desde el principio.**
`StickyCta` muestra siempre el mismo CTA fijo abajo, en las 5 pantallas
(como en el original), reutilizando la misma lógica de apertura del modal
de antes — solo se renombró de "Aceptar oferta" a "Revisar y aceptar
oferta" para reflejar que primero se descarga/firma y luego se confirma.

**Estado del flujo.**
`useRevealOnScroll` sustituye a los dos `IntersectionObserver` manuales
del original (uno para el reveal + typewriter de cada pantalla, otro para
saber qué pantalla está "activa" y así calcular el % de la barra de
progreso). El scroll a la siguiente pantalla (antes `data-next` +
`scrollIntoView`) ahora es la función `scrollToNext(index)` que devuelve
el hook.

## Pendiente / a decidir contigo

- Los 4 nombres de imagen en `scripts/extract-assets.mjs` son mi mejor
  suposición del orden en que aparecen en el HTML — verifícalos.
- El botón "Descubre tu oferta" del mock de Gmail (que abría `#prototipo`
  en pestaña nueva) no tiene equivalente aquí al haber quitado el mock.
- No añadí analítica ni persistencia real del "Aceptar oferta" — el modal
  es solo confirmación visual, como en el original.

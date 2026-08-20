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
| `src/assets/images/buddy-avatar-poster.png` | ✅ real (misma imagen) — poster del vídeo y **fallback automático**: si el vídeo falla al cargar, `AvatarPanel` muestra esta imagen estática en su lugar, sin romper el layout |
| `src/theme/fonts/ForFutureSans-*.woff` (5 pesos × normal/cursiva) | ✅ real (subidos como `.otf`, convertidos a `.woff`) |
| `src/assets/media/buddy-avatar.mp4` | ✅ real (subido) — se reproduce automáticamente en mute al cargar; el botón "Activar audio" lo desmutea |

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
    AvatarPanel.jsx          ← columna del avatar (fixed en desktop, sticky arriba en móvil)
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

**Fuentes y vídeo → referenciados, no re-embebidos.**
Ver sección "Puesta en marcha" arriba. La razón es que re-incrustar
~600KB de base64 en el JS bundle (4 pesos de fuente + 1 vídeo) es mala
práctica: bloquea el parseo inicial y no cachea igual de bien que un
archivo estático servido aparte.

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

import { useEffect, useRef } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import OfferButton from './OfferButton';
import { colors } from '../theme/theme';

// Short label per screen, in the same order App.jsx renders them — used
// only to caption the desktop "Siguiente" button with where it's actually
// taking you (e.g. "Siguiente: Beneficios").
const SECTION_LABELS = ['Bienvenida', 'Tu propuesta', 'Beneficios', 'Top Employer', 'Sectores'];

const compactButtonSx = { padding: { xs: '10px 14px', md: '11px 18px' }, fontSize: { xs: 14, md: 15 } };
// The filled/primary button in the mobile bar grows to fill the row;
// the outlined/secondary one stays sized to its own content — reads as
// "this one's the expected action" without either fighting for space.
const compactFillSx = { ...compactButtonSx, flex: 1 };

export default function StickyCta({
  onAccept,
  activeIndex = 0,
  screenCount = 1,
  onNext,
  audioDecided = true,
  onStartAudio,
  onSkipAudio,
}) {
  const isLast = activeIndex >= screenCount - 1;
  const nextLabel = SECTION_LABELS[activeIndex + 1];
  // Before the intro screen's audio choice is made, this bar temporarily
  // IS that choice — "Aceptar oferta" has no business being reachable
  // before anything's been reviewed, and AudioInviteCard.jsx no longer
  // carries its own buttons (two simultaneous decisions on one screen was
  // the actual problem). Once decided, this reverts to plain navigation
  // for the rest of the visit — Pausar/Silenciar/Volver a escuchar live
  // next to Buddy (AvatarNarrator.jsx) and never appear here.
  const choosingAudio = !audioDecided;

  // Initial focus on the choice itself when it first appears — screen
  // reader and keyboard users land somewhere meaningful rather than at the
  // top of the page with no indication a decision is expected. Focuses the
  // BAR ITSELF (tabIndex=-1), not the primary button directly — focusing
  // the button triggers its own :focus-visible chamfer-corner styling even
  // though nothing was actually clicked/tabbed to, making it look
  // "pre-pressed" on a page nobody has touched yet. A plain container has
  // no such style to misfire. Exactly one of these two refs is ever
  // attached to a visible element at a time (desktop/mobile bars are
  // CSS-hidden by breakpoint, not unmounted), and focusing a display:none
  // element is a silent no-op, so trying both is safe — no visibility
  // check needed. preventScroll avoids the jump scroll-into-view would
  // otherwise cause on a page that's already scroll-locked (see App.jsx's
  // useScrollLock).
  const desktopBarRef = useRef(null);
  const mobileBarRef = useRef(null);
  useEffect(() => {
    if (!choosingAudio) return;
    desktopBarRef.current?.focus?.({ preventScroll: true });
    mobileBarRef.current?.focus?.({ preventScroll: true });
    // Only on the initial appearance of the choice, not every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let leftButton = null;
  let rightButton = null;
  if (choosingAudio) {
    leftButton = (
      <OfferButton variant="ghost" onClick={onSkipAudio} aria-label="Continuar sin narración de audio">
        Ver sin audio
      </OfferButton>
    );
    rightButton = (
      <OfferButton
        onClick={onStartAudio}
        icon={<VolumeUpIcon />}
        aria-label="Comenzar el recorrido narrado con Buddy, activando el audio"
      >
        Comenzar con Buddy
      </OfferButton>
    );
  } else if (!isLast) {
    leftButton = (
      <OfferButton variant="ghost" onClick={onAccept} aria-label="Saltar directamente a aceptar la oferta">
        Aceptar oferta
      </OfferButton>
    );
    rightButton = (
      <OfferButton onClick={() => onNext?.(activeIndex)} endIcon={<ArrowForwardIcon />} aria-label={`Siguiente: ${nextLabel}`}>
        Siguiente: {nextLabel}
      </OfferButton>
    );
  } else {
    rightButton = (
      <OfferButton onClick={onAccept} endIcon={<CheckIcon />} aria-label="Descargar y aceptar la oferta de Indra Group">
        Descargar y aceptar oferta
      </OfferButton>
    );
  }

  let mobileLeft = null;
  let mobileRight = null;
  if (choosingAudio) {
    mobileLeft = (
      <OfferButton variant="ghost" onClick={onSkipAudio} aria-label="Continuar sin narración de audio" sx={compactButtonSx}>
        Ver sin audio
      </OfferButton>
    );
    mobileRight = (
      <OfferButton
        onClick={onStartAudio}
        icon={<VolumeUpIcon />}
        aria-label="Comenzar el recorrido narrado con Buddy, activando el audio"
        sx={compactFillSx}
      >
        Comenzar con Buddy
      </OfferButton>
    );
  } else if (isLast) {
    mobileLeft = (
      <Typography sx={{ fontSize: 13, color: colors.grisAcero, whiteSpace: 'nowrap' }}>
        {activeIndex + 1} de {screenCount}
      </Typography>
    );
    mobileRight = (
      <OfferButton
        variant="ghost"
        onClick={onAccept}
        endIcon={<CheckIcon />}
        aria-label="Descargar y aceptar la oferta de Indra Group"
        sx={{ padding: '10px 18px', fontSize: 14 }}
      >
        Descargar oferta
      </OfferButton>
    );
  } else {
    // Same secondary/primary pairing as desktop — "Aceptar oferta" reachable
    // for anyone who wants to skip ahead, "Siguiente" carrying the visual
    // weight since it's the expected next step. The section counter still
    // shows in the header on mobile, so dropping it here isn't a loss.
    mobileLeft = (
      <OfferButton variant="ghost" onClick={onAccept} aria-label="Saltar directamente a aceptar la oferta" sx={compactButtonSx}>
        Aceptar oferta
      </OfferButton>
    );
    mobileRight = (
      <OfferButton onClick={() => onNext?.(activeIndex)} endIcon={<ArrowForwardIcon />} aria-label="Siguiente sección" sx={compactFillSx}>
        Siguiente
      </OfferButton>
    );
  }

  return (
    <>
      {/* Desktop: a "Siguiente" button carries the primary visual weight,
          matching the in-content CTAs, so it reads as a natural continuation
          of scrolling rather than a separate destination — a giant
          always-on "Revisar y aceptar oferta" button here was pulling every
          click before people scrolled or used the section's own buttons.
          The accept action stays reachable via a quiet text link, grouped
          together with "Siguiente" on the right, for anyone who
          deliberately wants to skip ahead. */}
      <Box
        ref={desktopBarRef}
        tabIndex={-1}
        {...(choosingAudio ? { role: 'group', 'aria-label': 'Elige cómo quieres comenzar: con o sin narración de audio' } : {})}
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 80,
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '24px',
          padding: '18px clamp(20px, 2.11vw, 40px)',
          background: 'rgba(0,25,34,0.85)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          outline: 'none',
        }}
      >
        {leftButton}
        {rightButton}
      </Box>

      {/* Mobile: unchanged layout otherwise — compact bar with section
          counter + "Siguiente", becoming the download/accept action once
          the last chapter is reached; the audio choice takes over both
          slots for as long as it hasn't been made. */}
      <Box
        ref={mobileBarRef}
        tabIndex={-1}
        {...(choosingAudio ? { role: 'group', 'aria-label': 'Elige cómo quieres comenzar: con o sin narración de audio' } : {})}
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 80,
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          minHeight: 64,
          boxSizing: 'border-box',
          padding: '12px 20px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          background: 'rgba(0,25,34,0.92)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          outline: 'none',
        }}
      >
        {mobileLeft}
        {mobileRight}
      </Box>
    </>
  );
}

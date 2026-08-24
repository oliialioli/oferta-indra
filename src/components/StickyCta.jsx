import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
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

// Pure tour navigation — only ever mounted once the onboarding screen's
// audio choice is done (see OnboardingScreen.jsx, which has its own
// separate fixed bar for that choice). Never shows anything audio-related;
// Pausar/Silenciar/Volver a escuchar live next to Buddy (AvatarNarrator.jsx).
export default function StickyCta({ onAccept, activeIndex = 0, screenCount = 1, onNext, onPrev }) {
  const isLast = activeIndex >= screenCount - 1;
  const nextLabel = SECTION_LABELS[activeIndex + 1];

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
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 80,
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          padding: '18px clamp(20px, 2.11vw, 40px)',
          background: 'rgba(0,25,34,0.85)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {activeIndex > 0 ? (
          <OfferButton variant="ghost" onClick={() => onPrev?.(activeIndex)} icon={<ArrowBackIcon />} aria-label="Volver a la sección anterior">
            Atrás
          </OfferButton>
        ) : (
          <Box />
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {!isLast && (
            <OfferButton variant="ghost" onClick={onAccept} aria-label="Saltar directamente a aceptar la oferta">
              Aceptar oferta
            </OfferButton>
          )}

          {!isLast ? (
            <OfferButton onClick={() => onNext?.(activeIndex)} endIcon={<ArrowForwardIcon />} aria-label={`Siguiente: ${nextLabel}`}>
              Siguiente: {nextLabel}
            </OfferButton>
          ) : (
            <OfferButton onClick={onAccept} endIcon={<CheckIcon />} aria-label="Descargar y aceptar la oferta de Indra Group">
              Descargar y aceptar oferta
            </OfferButton>
          )}
        </Box>
      </Box>

      {/* Mobile: compact bar — section counter + "Siguiente" (or "Aceptar
          oferta" alongside it once available), becoming the download/accept
          action once the last chapter is reached. */}
      <Box
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
        }}
      >
        {isLast ? (
          <>
            <Typography sx={{ fontSize: 13, color: colors.grisAcero, whiteSpace: 'nowrap' }}>
              {activeIndex + 1} de {screenCount}
            </Typography>
            <OfferButton
              variant="ghost"
              onClick={onAccept}
              endIcon={<CheckIcon />}
              aria-label="Descargar y aceptar la oferta de Indra Group"
              sx={{ padding: '10px 18px', fontSize: 14 }}
            >
              Descargar oferta
            </OfferButton>
          </>
        ) : (
          <>
            {/* Same secondary/primary pairing as desktop — "Aceptar oferta"
                reachable for anyone who wants to skip ahead, "Siguiente"
                carrying the visual weight since it's the expected next
                step. The section counter lives in the header on mobile, so
                dropping it from this bar isn't a loss. */}
            <OfferButton variant="ghost" onClick={onAccept} aria-label="Saltar directamente a aceptar la oferta" sx={compactButtonSx}>
              Aceptar oferta
            </OfferButton>
            <OfferButton onClick={() => onNext?.(activeIndex)} endIcon={<ArrowForwardIcon />} aria-label="Siguiente sección" sx={compactFillSx}>
              Siguiente
            </OfferButton>
          </>
        )}
      </Box>
    </>
  );
}

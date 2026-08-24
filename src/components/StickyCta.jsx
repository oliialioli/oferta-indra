import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import OfferButton from './OfferButton';
import { colors } from '../theme/theme';

// Short label per screen, in the same order App.jsx renders them — used
// only to caption the desktop "Siguiente" button with where it's actually
// taking you (e.g. "Siguiente: Beneficios").
const SECTION_LABELS = ['Bienvenida', 'Tu propuesta', 'Beneficios', 'Top Employer', 'Sectores'];

export default function StickyCta({ onAccept, activeIndex = 0, screenCount = 1, onNext }) {
  const isLast = activeIndex >= screenCount - 1;
  const nextLabel = SECTION_LABELS[activeIndex + 1];

  return (
    <>
      {/* Desktop: a "Siguiente" button carries the primary visual weight,
          matching the in-content CTAs, so it reads as a natural continuation
          of scrolling rather than a separate destination — a giant
          always-on "Revisar y aceptar oferta" button here was pulling every
          click before people scrolled or used the section's own buttons.
          The accept action stays reachable via a quiet text link on the
          left, for anyone who deliberately wants to skip ahead. */}
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
        {!isLast ? (
          <Box
            component="button"
            type="button"
            onClick={onAccept}
            aria-label="Saltar directamente a revisar y aceptar la oferta"
            sx={{
              background: 'none',
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 14,
              color: colors.grisAcero,
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              transition: 'color .2s',
              '&:hover': { color: colors.blanco },
            }}
          >
            Revisar y aceptar oferta
          </Box>
        ) : (
          <span />
        )}

        {!isLast ? (
          <OfferButton onClick={() => onNext?.(activeIndex)} endIcon={<ArrowForwardIcon />} aria-label={`Siguiente: ${nextLabel}`}>
            Siguiente: {nextLabel}
          </OfferButton>
        ) : (
          <OfferButton onClick={onAccept} endIcon={<CheckIcon />} aria-label="Revisar y aceptar oferta de Indra Group">
            Revisar y aceptar oferta
          </OfferButton>
        )}
      </Box>

      {/* Mobile: unchanged — compact bar with section counter + "Siguiente",
          becoming "Revisar oferta" only once the last chapter is reached. */}
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
        <Typography sx={{ fontSize: 13, color: colors.grisAcero, whiteSpace: 'nowrap' }}>
          {activeIndex + 1} de {screenCount}
        </Typography>

        {isLast ? (
          <OfferButton
            variant="ghost"
            onClick={onAccept}
            endIcon={<CheckIcon />}
            aria-label="Revisar y aceptar oferta de Indra Group"
            sx={{ padding: '10px 18px', fontSize: 14 }}
          >
            Revisar oferta
          </OfferButton>
        ) : (
          <OfferButton
            variant="ghost"
            onClick={() => onNext?.(activeIndex)}
            endIcon={<ArrowForwardIcon />}
            aria-label="Siguiente sección"
            sx={{ padding: '10px 18px', fontSize: 14 }}
          >
            Siguiente
          </OfferButton>
        )}
      </Box>
    </>
  );
}

import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import OfferButton from './OfferButton';
import { colors } from '../theme/theme';

export default function StickyCta({ onAccept, activeIndex = 0, screenCount = 1, onNext }) {
  const isLast = activeIndex >= screenCount - 1;

  return (
    <>
      {/* Desktop: unchanged — the full CTA is always visible. */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 80,
          backdropFilter: 'blur(10px)',
          background: 'rgba(255,255,255,0.01)',
          padding: '24px',
        }}
      >
        <OfferButton
          variant="sticky"
          onClick={onAccept}
          endIcon={<CheckIcon />}
          aria-label="Revisar y aceptar oferta de Indra Group"
          sx={{ justifyContent: 'center' }}
        >
          Revisar y aceptar oferta
        </OfferButton>
      </Box>

      {/* Mobile: compact bar — section counter + "Siguiente", becoming
          "Revisar oferta" only once the last chapter is reached. The full
          acceptance CTA itself lives inside that final section/review step. */}
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

import CheckIcon from '@mui/icons-material/Check';
import Box from '@mui/material/Box';
import OfferButton from './OfferButton';

export default function StickyCta({ onAccept }) {
  return (
    <Box
      sx={{
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
  );
}

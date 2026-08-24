import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import OfferButton from './OfferButton';
import { colors } from '../theme/theme';

// The one-time, explicit choice for whether Buddy narrates at all — shown
// only on the intro screen, in place of its body text, and only until the
// visitor picks one of the two options. Deliberately not a modal: it sits
// exactly where the karaoke text will appear once a choice is made, so
// choosing feels like a natural first step in reading this screen rather
// than an interruption blocking it.
export default function AudioInviteCard({ onStart, onSkip }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '58ch' }}>
      <Box>
        <Typography
          sx={{
            fontSize: { xs: 'clamp(17px, 4.5vw, 19px)', md: 'clamp(15px, 2.1vw, 22px)' },
            lineHeight: { xs: 1.5, md: 1.4 },
            color: colors.blanco,
            fontWeight: 500,
            margin: '0 0 4px',
          }}
        >
          Conoce tu propuesta con Buddy
        </Typography>
        <Typography sx={{ fontSize: { xs: 14, md: 15 }, lineHeight: 1.5, color: colors.grisAcero, margin: 0 }}>
          Un recorrido narrado de unos minutos. Podrás desactivar la narración cuando quieras.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <OfferButton
          onClick={onStart}
          icon={<VolumeUpIcon />}
          aria-label="Comenzar el recorrido narrado con Buddy, activando el audio"
        >
          Comenzar con Buddy
        </OfferButton>

        <Box
          component="button"
          type="button"
          onClick={onSkip}
          aria-label="Continuar sin narración de audio"
          sx={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontFamily: 'inherit',
            fontSize: 14,
            color: colors.grisAcero,
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            cursor: 'pointer',
            transition: 'color .15s ease',
            '&:hover': { color: colors.blanco },
          }}
        >
          Ver sin audio
        </Box>
      </Box>
    </Box>
  );
}

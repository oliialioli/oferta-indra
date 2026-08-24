import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import OfferButton from './OfferButton';
import { colors } from '../theme/theme';

const CYAN = '#22D3EE';
const BAR_HEIGHTS = [7, 13, 9, 15];

// Static 4-bar waveform glyph — same visual language as the "Hablando"
// pill's MiniWave (AvatarNarrator.jsx), but still (nothing is playing yet)
// and sized as a standalone icon rather than a tiny status indicator.
function WaveformIcon() {
  return (
    <Box aria-hidden="true" sx={{ display: 'flex', alignItems: 'center', gap: '3px', flex: 'none' }}>
      {BAR_HEIGHTS.map((height, i) => (
        <Box key={i} sx={{ width: 3, height, background: CYAN, borderRadius: '2px' }} />
      ))}
    </Box>
  );
}

// The one-time, explicit choice for whether Buddy narrates at all — shown
// only on the intro screen, in place of its body text, and only until the
// visitor picks one of the two options. Deliberately not a modal: it sits
// exactly where the karaoke text will appear once a choice is made, so
// choosing feels like a natural first step in reading this screen rather
// than an interruption blocking it.
export default function AudioInviteCard({ onStart, onSkip }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: '12px', md: '18px' },
        maxWidth: '58ch',
        padding: { xs: '14px 16px', md: '22px 24px' },
        border: '1px solid rgba(255,255,255,0.16)',
        borderRadius: '10px',
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <WaveformIcon />
          <Typography
            sx={{
              fontSize: { xs: 'clamp(17px, 4.5vw, 19px)', md: 'clamp(15px, 2.1vw, 22px)' },
              lineHeight: 1.3,
              color: colors.blanco,
              fontWeight: 500,
              margin: 0,
            }}
          >
            Conoce tu propuesta con Buddy
          </Typography>
        </Box>
        <Typography sx={{ fontSize: { xs: 14, md: 15 }, lineHeight: 1.5, color: colors.grisAcero, margin: 0 }}>
          Un recorrido narrado de unos minutos. Podrás desactivar la narración cuando quieras.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: '6px', md: '14px' }, flexWrap: 'wrap' }}>
        <OfferButton
          onClick={onStart}
          icon={<VolumeUpIcon />}
          aria-label="Comenzar el recorrido narrado con Buddy, activando el audio"
          sx={{ padding: { xs: '9px 12px', md: '16px 32px' }, fontSize: { xs: 13, md: 18 }, gap: { xs: '6px', md: 10 } }}
        >
          Comenzar con Buddy
        </OfferButton>

        <OfferButton
          variant="ghost"
          onClick={onSkip}
          aria-label="Continuar sin narración de audio"
          sx={{ padding: { xs: '9px 12px', md: '16px 32px' }, fontSize: { xs: 13, md: 18 } }}
        >
          Ver sin audio
        </OfferButton>
      </Box>
    </Box>
  );
}

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
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
// only on the intro screen, in place of its body text, until the visitor
// picks one of the two options. Purely informational: the actual choice
// lives in the sticky bottom bar (see StickyCta.jsx's audioDecided mode),
// not as buttons here — having "Comenzar con Buddy" / "Ver sin audio" both
// in this card AND competing with "Aceptar oferta" / "Siguiente" in the
// bar below was two simultaneous decisions crowding one screen, and the
// accept action was reachable before there was anything to review yet.
export default function AudioInviteCard() {
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

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ArrowDownwardIcon aria-hidden="true" sx={{ fontSize: 15, color: colors.grisAcero }} />
        <Typography sx={{ fontSize: 13, color: colors.grisAcero, margin: 0 }}>
          Elige cómo quieres comenzar, abajo
        </Typography>
      </Box>
    </Box>
  );
}

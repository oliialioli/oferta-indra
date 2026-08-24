import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { colors } from '../theme/theme';
import { useRevealOnce, revealSx } from '../hooks/useRevealOnce';

function SectorCard({ s, delay }) {
  const [ref, revealed] = useRevealOnce();
  return (
    <Box
      ref={ref}
      sx={{
        background: 'rgba(255,255,255,0.1)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        gap: '6px',
        // Fixed only at desktop, where cards share grid rows and this keeps
        // them visually aligned even when content lengths differ slightly —
        // on mobile (single column) it just left dead space under shorter
        // cards, so there each card sizes to its own content instead.
        minHeight: { xs: 'auto', md: 195 },
        ...revealSx(revealed, delay),
      }}
    >
      <Typography sx={{ fontSize: 'clamp(18px, 1.8vw, 26px)', color: colors.blanco, lineHeight: 1.15, margin: 0 }}>
        {s.stat}
      </Typography>
      <Typography sx={{ fontSize: 14, color: colors.grisAcero, margin: 0, lineHeight: 1.4 }}>
        {s.label}
      </Typography>
      <Typography sx={{ fontSize: 14, color: colors.blanco, margin: 0, lineHeight: 1.4 }}>
        {s.desc}
      </Typography>
    </Box>
  );
}

export default function SectorsGrid({ sectors }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '4px',
        width: '100%',
      }}
    >
      {sectors.map((s, i) => (
        <SectorCard key={s.label} s={s} delay={(i % 3) * 80} />
      ))}
    </Box>
  );
}

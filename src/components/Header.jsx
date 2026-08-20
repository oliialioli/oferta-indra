import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { colors, HEADER_HEIGHT_MOBILE } from '../theme/theme';
import indraLogo from '../assets/images/indra-logo.svg';

export default function Header({ roleLabel, sectionLabel, progressPct }) {
  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 90,
        background: 'rgba(0,37,50,0.6)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        minHeight: { xs: HEADER_HEIGHT_MOBILE, md: 'auto' },
        paddingTop: { xs: 'max(16px, env(safe-area-inset-top))', md: '24px' },
        paddingBottom: { xs: '16px', md: '24px' },
        paddingLeft: { xs: '20px', md: 'clamp(20px, 2.11vw, 40px)' },
        paddingRight: { xs: '20px', md: 'clamp(20px, 2.11vw, 40px)' },
      }}
    >
      <Box
        component="img"
        src={indraLogo}
        alt="Indra Group"
        sx={{ height: { xs: 18, md: 28 }, width: 'auto' }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, md: '22px' } }}>
        <Typography
          sx={{ display: { xs: 'none', md: 'block' }, fontSize: 12, color: colors.grisAcero, whiteSpace: 'nowrap' }}
        >
          {roleLabel}
        </Typography>
        <Typography
          sx={{ display: { xs: 'block', md: 'none' }, fontSize: 12, color: colors.grisAcero, whiteSpace: 'nowrap' }}
        >
          {sectionLabel}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <Box
            sx={{
              width: { xs: 50, md: 93 },
              height: 5,
              background: colors.grisAcero,
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${progressPct}%`,
                background: colors.blanco,
                transition: 'width .5s cubic-bezier(.2,.8,.2,1)',
              }}
            />
          </Box>
          <Typography sx={{ fontSize: 12, color: colors.blanco, minWidth: '2em' }}>
            {progressPct}%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

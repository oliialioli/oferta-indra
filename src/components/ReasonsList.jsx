import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { colors } from '../theme/theme';

export default function ReasonsList({ reasons }) {
  return (
    <Box
      component="ol"
      sx={{
        listStyle: 'none',
        counterReset: 'razon',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        width: '100%',
      }}
    >
      {reasons.map((reason) => {
        const isBlock = typeof reason === 'object';
        return (
          <Box
            component="li"
            key={isBlock ? reason.title : reason}
            sx={{
              counterIncrement: 'razon',
              background: 'rgba(255,255,255,0.1)',
              padding: '16px',
              display: 'flex',
              alignItems: isBlock ? 'flex-start' : 'center',
              gap: '6px',
              fontSize: 16,
              color: colors.blanco,
              '&::before': {
                content: 'counter(razon, decimal-leading-zero)',
                color: colors.grisAcero,
                flex: 'none',
              },
            }}
          >
            {isBlock ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Typography sx={{ fontSize: 16, color: colors.blanco, margin: 0, lineHeight: 1.4 }}>
                  {reason.title}
                </Typography>
                <Typography sx={{ fontSize: 14, color: colors.grisAcero, margin: 0, lineHeight: 1.4 }}>
                  {reason.body}
                </Typography>
              </Box>
            ) : (
              reason
            )}
          </Box>
        );
      })}
    </Box>
  );
}

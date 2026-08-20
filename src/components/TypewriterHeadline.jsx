import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTypewriter } from '../hooks/useTypewriter';

export default function TypewriterHeadline({ text, start, badge, badgeAlt }) {
  const { typed, isTyping } = useTypewriter(text, start);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Typography
        component="h2"
        sx={{
          fontSize: 'clamp(28px, 4.6vw, 48px)',
          lineHeight: 1,
          color: '#fff',
          margin: 0,
          fontWeight: 400,
        }}
      >
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">
          {typed}
          {isTyping && (
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                width: '2px',
                height: '0.85em',
                background: '#fff',
                marginLeft: '3px',
                verticalAlign: '-0.1em',
                animation: 'caret-blink 0.8s steps(1) infinite',
                boxShadow: '0 0 6px rgba(255,255,255,0.6)',
                '@keyframes caret-blink': {
                  '0%, 50%': { opacity: 1 },
                  '50.01%, 100%': { opacity: 0 },
                },
              }}
            />
          )}
        </span>
      </Typography>
      {badge && (
        <Box
          component="img"
          src={badge}
          alt={badgeAlt || ''}
          sx={{
            width: 'clamp(70px, 7.3vw, 121px)',
            height: 'clamp(32px, 3.4vw, 56px)',
            borderRadius: '6px',
            objectFit: 'cover',
            flex: 'none',
          }}
        />
      )}
    </Box>
  );
}

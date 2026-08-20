import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTypewriter } from '../hooks/useTypewriter';

const SIZE_VARIANTS = {
  hero: {
    fontSize: { xs: 'clamp(38px, 9vw, 44px)', md: 'clamp(28px, 4.6vw, 48px)' },
    lineHeight: { xs: 1.08, md: 1 },
  },
  section: {
    fontSize: { xs: 'clamp(30px, 7.5vw, 36px)', md: 'clamp(28px, 4.6vw, 48px)' },
    lineHeight: { xs: 1.12, md: 1 },
  },
};

export default function TypewriterHeadline({ text, start, badges, variant = 'section' }) {
  const { typed, isTyping } = useTypewriter(text, start);
  const size = SIZE_VARIANTS[variant] || SIZE_VARIANTS.section;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Typography
        component="h2"
        sx={{
          fontSize: size.fontSize,
          lineHeight: size.lineHeight,
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
      {badges?.map((b) => (
        <Box
          key={b.src}
          component="img"
          src={b.src}
          alt={b.alt || ''}
          sx={{
            height: 'clamp(32px, 3.4vw, 56px)',
            width: 'auto',
            maxWidth: 'clamp(70px, 7.3vw, 121px)',
            borderRadius: '6px',
            objectFit: 'contain',
            flex: 'none',
          }}
        />
      ))}
    </Box>
  );
}

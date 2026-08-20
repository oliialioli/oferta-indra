import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TypewriterHeadline from './TypewriterHeadline';
import { colors } from '../theme/theme';

const taglineSx = {
  fontSize: 'clamp(15px, 2.1vw, 22px)',
  lineHeight: 1.4,
  fontStyle: 'italic',
  color: colors.grisAcero,
  margin: 0,
};

const Screen = forwardRef(function Screen(
  { eyebrow, headline, body, tagline, taglinePosition = 'body', badge, badgeAlt, revealed, children },
  ref
) {
  const paragraphs = Array.isArray(body) ? body : body ? [body] : [];
  const taglineNode = tagline && <Typography sx={taglineSx}>{tagline}</Typography>;
  return (
    <Box
      ref={ref}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'left',
        padding: '110px 0 140px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          marginBottom: 3,
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'none' : 'translateY(16px)',
          transition: 'opacity .5s cubic-bezier(.2,.8,.2,1), transform .5s cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <Typography sx={{ fontSize: 'clamp(13px, 1.65vw, 17px)', color: colors.grisAcero, margin: 0 }}>
          {eyebrow}
        </Typography>

        <TypewriterHeadline text={headline} start={revealed} badge={badge} badgeAlt={badgeAlt} />

        {paragraphs.map((paragraph, i) => (
          <Typography
            key={i}
            sx={{
              fontSize: 'clamp(15px, 2.1vw, 22px)',
              lineHeight: 1.4,
              color: colors.blanco,
              margin: 0,
            }}
          >
            {paragraph}
          </Typography>
        ))}

        {taglinePosition === 'body' && taglineNode}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          alignItems: 'flex-start',
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'none' : 'translateY(16px)',
          transition:
            'opacity .5s cubic-bezier(.2,.8,.2,1) .15s, transform .5s cubic-bezier(.2,.8,.2,1) .15s',
        }}
      >
        {children}
        {taglinePosition === 'after-children' && taglineNode}
      </Box>
    </Box>
  );
});

export default Screen;

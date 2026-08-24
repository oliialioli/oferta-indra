import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TypewriterHeadline from './TypewriterHeadline';
import NarratedText from './NarratedText';
import { colors, HEADER_HEIGHT_MOBILE } from '../theme/theme';

const taglineSx = {
  fontSize: { xs: 'clamp(13px, 3.5vw, 15px)', md: 'clamp(15px, 2.1vw, 22px)' },
  lineHeight: 1.4,
  fontStyle: 'italic',
  color: colors.grisAcero,
  margin: 0,
};

const bodyTextSx = {
  fontSize: { xs: 'clamp(17px, 4.5vw, 19px)', md: 'clamp(15px, 2.1vw, 22px)' },
  lineHeight: { xs: 1.5, md: 1.4 },
  color: colors.blanco,
};

const Screen = forwardRef(function Screen(
  {
    eyebrow,
    greeting,
    headline,
    headlineVariant = 'section',
    body,
    narrated,
    tagline,
    taglinePosition = 'body',
    badges,
    revealed,
    children,
  },
  ref
) {
  const paragraphs = Array.isArray(body) ? body : body ? [body] : [];
  const taglineNode = tagline && <Typography sx={taglineSx}>{tagline}</Typography>;
  return (
    <Box
      ref={ref}
      sx={{
        minHeight: { xs: 'auto', md: '100vh' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: { xs: 'flex-start', md: 'center' },
        textAlign: 'left',
        padding: { xs: '20px 0 28px', md: '110px 0 140px' },
        scrollMarginTop: { xs: HEADER_HEIGHT_MOBILE, md: 0 },
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
        <Typography
          sx={{
            display: { xs: 'none', md: 'block' },
            fontSize: 'clamp(13px, 1.65vw, 17px)',
            color: colors.grisAcero,
            margin: 0,
          }}
        >
          {eyebrow}
        </Typography>

        {greeting && (
          <Typography
            sx={{
              fontSize: { xs: 'clamp(16px, 4vw, 18px)', md: 'clamp(16px, 1.8vw, 20px)' },
              color: colors.grisAcero,
              margin: 0,
            }}
          >
            {greeting}
          </Typography>
        )}

        <TypewriterHeadline text={headline} start={revealed} badges={badges} variant={headlineVariant} />

        {paragraphs.map((paragraph, i) =>
          narrated ? (
            <NarratedText
              key={i}
              text={paragraph}
              audioRef={narrated.audioRef}
              active={narrated.active}
              ended={narrated.ended}
              revealSeq={narrated.revealSeq}
              sx={bodyTextSx}
            />
          ) : (
            <Typography key={i} sx={{ ...bodyTextSx, margin: 0 }}>
              {paragraph}
            </Typography>
          )
        )}

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

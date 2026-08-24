import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TypewriterHeadline from './TypewriterHeadline';
import NarratedText from './NarratedText';
import AudioInviteCard from './AudioInviteCard';
import { colors, HEADER_HEIGHT_MOBILE } from '../theme/theme';

const closingTextSx = {
  fontSize: { xs: 'clamp(13px, 3.5vw, 15px)', md: 'clamp(15px, 2.1vw, 22px)' },
  lineHeight: 1.4,
  fontStyle: 'italic',
  color: colors.grisAcero,
  margin: 0,
};

const secondaryTextSx = {
  fontSize: { xs: 'clamp(14px, 3.6vw, 16px)', md: 'clamp(13px, 1.7vw, 17px)' },
  lineHeight: 1.5,
  color: colors.grisAcero,
  margin: 0,
};

const expiryNoticeSx = {
  fontSize: { xs: 'clamp(12px, 3.2vw, 13px)', md: 'clamp(11px, 1.4vw, 13px)' },
  lineHeight: 1.5,
  color: colors.grisAcero,
  opacity: 0.85,
  margin: 0,
};

// Karaoke text needs more presence than an auxiliary line but stays under
// the title — see the content brief's visual hierarchy: legible, a step
// down from the headline, generous line-height, never competing with the
// cards/data below it.
const bodyTextSx = {
  fontSize: { xs: 'clamp(17px, 4.5vw, 19px)', md: 'clamp(15px, 2.1vw, 22px)' },
  lineHeight: { xs: 1.5, md: 1.4 },
  maxWidth: '58ch',
};

const Screen = forwardRef(function Screen(
  {
    eyebrowLines,
    headline,
    headlineVariant = 'section',
    body,
    narrated,
    wordTimestamps,
    audioInvite,
    secondaryText,
    expiryNotice,
    closingText,
    closingPosition = 'body',
    badges,
    revealed,
    children,
  },
  ref
) {
  const closingNode = closingText && closingText.length > 0 && (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {closingText.map((line, i) => (
        <Typography key={i} sx={closingTextSx}>
          {line}
        </Typography>
      ))}
    </Box>
  );

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
        {eyebrowLines && eyebrowLines.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {eyebrowLines.map((line, i) => (
              <Typography
                key={i}
                sx={{
                  fontSize: 'clamp(13px, 1.65vw, 17px)',
                  color: colors.grisAcero,
                  margin: 0,
                }}
              >
                {line}
              </Typography>
            ))}
          </Box>
        )}

        <TypewriterHeadline text={headline} start={revealed} badges={badges} variant={headlineVariant} />

        {audioInvite?.show ? (
          <AudioInviteCard onStart={audioInvite.onStart} onSkip={audioInvite.onSkip} />
        ) : narrated ? (
          <NarratedText
            text={body}
            audioRef={narrated.audioRef}
            active={narrated.active}
            ended={narrated.ended}
            revealSeq={narrated.revealSeq}
            wordTimestamps={wordTimestamps}
            sx={bodyTextSx}
          />
        ) : (
          <Typography sx={{ ...bodyTextSx, color: colors.blanco, margin: 0 }}>{body}</Typography>
        )}

        {secondaryText && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <InfoOutlinedIcon sx={{ fontSize: 16, color: colors.grisAcero, marginTop: '2px', flex: 'none' }} />
            <Typography sx={secondaryTextSx}>{secondaryText}</Typography>
          </Box>
        )}
        {expiryNotice && <Typography sx={expiryNoticeSx}>{expiryNotice}</Typography>}

        {closingPosition === 'body' && closingNode}
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
        {closingPosition === 'after-children' && closingNode}
      </Box>
    </Box>
  );
});

export default Screen;

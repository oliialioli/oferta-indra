import Box from '@mui/material/Box';
import CornerFrame from './CornerFrame';
import { colors } from '../theme/theme';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useVideoCrossfade, LAYER_REF_KEYS, CROSSFADE_MS } from '../hooks/useVideoCrossfade';
import avatarPoster from '../assets/images/buddy-avatar-poster.png';

const VIDEO_BG = '#002333';

// Compact, silent character for the onboarding screen — plays the
// one-shot greeting once, then settles into the idle loop, muted
// throughout (audio only ever comes from the separate narration <audio>
// element, and never starts before the visitor interacts). No controls,
// no speaking pill: those only make sense once real narration exists,
// i.e. after onboarding is done. Shares the exact same crossfade
// mechanics as the full tour AvatarNarrator via useVideoCrossfade, driven
// by the same shared narrator state — so if the visitor picks "Comenzar
// con Buddy", the character already mid-transitioning to 'talking' here
// carries straight over once AvatarNarrator mounts in its place.
export default function OnboardingBuddy({ avatarName = 'Buddy', narrator }) {
  const { state, handleVideoEnded } = narrator;
  const reducedMotion = usePrefersReducedMotion();
  const { videoRefs, frontLayer, videoFailed, handleEnded, handleError } = useVideoCrossfade({
    state,
    onOneShotEnded: handleVideoEnded,
  });

  return (
    <Box
      sx={{
        position: 'relative',
        // ~180-230px tall on mobile per the onboarding spec — Buddy's
        // idle/greeting pose doesn't need to dominate the first screen.
        width: { xs: 'clamp(137px, 36vw, 175px)', md: 'clamp(140px, 19.4vw, 368px)' },
        aspectRatio: '368 / 484',
        flex: 'none',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', background: VIDEO_BG }}>
        {videoFailed || reducedMotion ? (
          <Box
            component="img"
            src={avatarPoster}
            alt={`${avatarName}, tu guía en esta propuesta`}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          LAYER_REF_KEYS.map((key) => (
            <Box
              key={key}
              component="video"
              ref={videoRefs[key]}
              muted
              playsInline
              preload="auto"
              poster={avatarPoster}
              onEnded={handleEnded}
              onError={handleError}
              aria-hidden="true"
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                opacity: frontLayer === key ? 1 : 0,
                transition: `opacity ${CROSSFADE_MS}ms ease`,
              }}
            />
          ))
        )}

        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(ellipse at center, transparent 72%, ${colors.azulOscuro} 100%)`,
          }}
        />

        <CornerFrame />
      </Box>
    </Box>
  );
}

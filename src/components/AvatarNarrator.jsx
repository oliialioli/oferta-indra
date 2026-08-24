import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RefreshIcon from '@mui/icons-material/Refresh';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import CheckIcon from '@mui/icons-material/Check';
import OfferButton from './OfferButton';
import CornerFrame from './CornerFrame';
import { colors, HEADER_HEIGHT_MOBILE } from '../theme/theme';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useVideoCrossfade, LAYER_REF_KEYS, CROSSFADE_MS } from '../hooks/useVideoCrossfade';
import avatarPoster from '../assets/images/buddy-avatar-poster.png';

const CYAN = '#22D3EE';
// Sampled directly from the character clips' own background — a hair off
// colors.azulOscuro (#002532), close enough to pass unnoticed most of the
// time but not exactly matching, which is what made the frame's edge
// readable as a rectangle against the page.
const VIDEO_BG = '#002333';

function MiniWave({ animate }) {
  return (
    <Box aria-hidden="true" sx={{ display: 'flex', alignItems: 'center', gap: '2px', height: 9 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 2,
            height: '100%',
            background: colors.blanco,
            borderRadius: '1px',
            transformOrigin: 'center',
            transform: animate ? undefined : 'scaleY(0.45)',
            animation: animate ? `pillWave 0.8s ease-in-out ${i * 0.12}s infinite` : 'none',
            '@keyframes pillWave': {
              '0%, 100%': { transform: 'scaleY(0.35)' },
              '50%': { transform: 'scaleY(1)' },
            },
          }}
        />
      ))}
    </Box>
  );
}

// Small pill overlapping the character frame's bottom edge — the only
// affordance for "is it talking right now", replacing any text label like
// "Buddy" or "tu guía". Shown only while there's something to report:
// actively narrating, paused mid-narration, or the brief "just finished"
// beat; hidden the rest of the time (idle, presenting, no audio yet).
function SpeakingPill({ phase, reducedMotion }) {
  if (!phase) return null;
  const label = phase === 'finished' ? 'Audio finalizado' : phase === 'paused' ? 'En pausa' : 'Hablando';
  const animateWave = phase === 'playing' && !reducedMotion;
  const animateDot = phase !== 'finished' && !reducedMotion;

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: { xs: -9, md: -11 },
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: { xs: '3px 9px', md: '5px 12px' },
        borderRadius: '999px',
        background: 'rgba(0,21,29,0.9)',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
        whiteSpace: 'nowrap',
        zIndex: 2,
        maxWidth: '90%',
      }}
    >
      {phase === 'finished' ? (
        <CheckIcon sx={{ fontSize: { xs: 11, md: 13 }, color: CYAN, flex: 'none' }} />
      ) : (
        <Box
          sx={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: CYAN,
            flex: 'none',
            animation: animateDot ? 'pillDot 1.6s ease-in-out infinite' : 'none',
            opacity: animateDot ? undefined : 0.85,
            '@keyframes pillDot': {
              '0%, 100%': { opacity: 0.45 },
              '50%': { opacity: 1 },
            },
          }}
        />
      )}
      {phase !== 'finished' && <MiniWave animate={animateWave} />}
      <Typography
        sx={{ fontSize: { xs: 10, md: 11 }, color: colors.blanco, margin: 0, letterSpacing: '0.02em', lineHeight: 1 }}
      >
        {label}
      </Typography>
    </Box>
  );
}

/**
 * The character + audio controls, reused in two responsive slots (mobile
 * top bar + inline block, desktop fixed left column). Only ever mounted
 * once the onboarding choice is done (see OnboardingBuddy.jsx for the
 * compact, controls-free character shown during onboarding itself) — the
 * `narrator` state machine is owned by App.jsx and passed down as a prop,
 * shared with the active Screen's own body text (see NarratedText.jsx) so
 * nothing double-plays.
 */
export default function AvatarNarrator({ avatarName = 'Buddy', narrator }) {
  const {
    state,
    hasAudio,
    setAudioNode,
    audioEnabled,
    audioDecided,
    audioPhase,
    justFinished,
    muted,
    enableAudio,
    pauseAudio,
    resumeAudio,
    replayAudio,
    toggleMute,
    handleVideoEnded,
  } = narrator;

  const reducedMotion = usePrefersReducedMotion();

  // Mobile only: once the large welcome character scrolls out of view, hand
  // off to a compact sticky bar below the header — never both at once, and
  // never before audio has actually been turned on.
  const bigBlockRef = useRef(null);
  const [compactVisible, setCompactVisible] = useState(false);
  useEffect(() => {
    const el = bigBlockRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setCompactVisible(!entry.isIntersecting),
      { rootMargin: `-${HEADER_HEIGHT_MOBILE}px 0px 0px 0px`, threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { videoRefs, frontLayer, videoFailed, handleEnded, handleError } = useVideoCrossfade({
    state,
    onOneShotEnded: handleVideoEnded,
  });

  const pillPhase = justFinished ? 'finished' : audioPhase === 'playing' ? 'playing' : audioPhase === 'paused' ? 'paused' : null;

  const characterBox = (
    // Outer box has no overflow clip, so the pill below can overlap the
    // bottom edge without being cut off; the inner box does the actual
    // video/corner clipping.
    <Box
      sx={{
        position: 'relative',
        // Deliberately smaller than it "wants" to be on mobile — with a real
        // browser's chrome (address bar + toolbar) eating into the visible
        // viewport on first load, the previous size pushed the intro
        // screen's audio-choice card mostly below the fold. Buddy's idle
        // pose doesn't need to be huge to do its job.
        width: { xs: 'clamp(120px, 32vw, 150px)', md: 'clamp(140px, 19.4vw, 368px)' },
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

        {/* Soft vignette feathering the video's edge into the page's own
            background, so the frame reads as "the character lives here"
            rather than a pasted-in rectangle. */}
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

      <SpeakingPill phase={pillPhase} reducedMotion={reducedMotion} />
    </Box>
  );

  let primary = null;
  if (hasAudio) {
    if (!audioEnabled) {
      // The onboarding screen's own choice is the only way to start —
      // this becomes the ongoing discreet way back in only once that
      // choice has actually been made (always true here, since
      // AvatarNarrator only mounts post-onboarding, but kept as a guard
      // in case that ever changes).
      if (audioDecided) {
        primary = { label: 'Activar audio', icon: <PlayArrowIcon />, onClick: enableAudio };
      }
    } else if (audioPhase === 'playing') {
      primary = { label: 'Pausar audio', icon: <PauseIcon />, onClick: pauseAudio };
    } else if (audioPhase === 'paused') {
      primary = { label: 'Continuar audio', icon: <PlayArrowIcon />, onClick: resumeAudio };
    } else if (audioPhase === 'error') {
      primary = { label: 'Reintentar', icon: <RefreshIcon />, onClick: replayAudio };
    } else if (audioPhase === 'ended') {
      primary = { label: 'Volver a escuchar', icon: <RefreshIcon />, onClick: replayAudio };
    }
  }

  const controls = hasAudio && (
    // justifyContent: 'center' matters once audioEnabled — the primary
    // button switches to width:'auto' and, with the mute IconButton fixed
    // at 44px, the pair no longer fills this full-width row. Without
    // centering, they'd pack to the left inside it while the character
    // above stays centered, drifting the two apart on mobile.
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
      {primary && (
        <OfferButton
          variant="ghost"
          onClick={primary.onClick}
          icon={primary.icon}
          aria-label={primary.label}
          sx={{
            boxSizing: 'border-box',
            height: 44,
            padding: '0 16px',
            fontSize: 14,
            width: audioEnabled ? 'auto' : '100%',
            justifyContent: audioEnabled ? 'flex-start' : 'center',
          }}
        >
          {primary.label}
        </OfferButton>
      )}
      {audioEnabled && (
        <IconButton
          onClick={toggleMute}
          aria-label={muted ? 'Activar volumen' : 'Silenciar volumen'}
          sx={{
            boxSizing: 'border-box',
            color: colors.blanco,
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 0,
            width: 44,
            height: 44,
            flex: 'none',
          }}
        >
          {muted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
        </IconButton>
      )}
    </Box>
  );

  const narratorBlock = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>{controls}</Box>
  );

  const showCompactBar = compactVisible && audioEnabled;
  const compactLabel =
    audioPhase === 'playing'
      ? 'Hablando…'
      : audioPhase === 'paused'
        ? 'Audio pausado'
        : audioPhase === 'ended'
          ? 'Audio finalizado'
          : audioPhase === 'error'
            ? 'Error de audio'
            : '';

  return (
    <>
      {/* One narrator block, ONE set of video/audio elements: on desktop it's
          a fixed left column; on mobile it sits in normal document flow at
          the top of the page (large, centered, non-sticky) and simply
          scrolls away with the rest of the welcome content. */}
      <Box
        ref={bigBlockRef}
        component="aside"
        aria-label={`${avatarName}, asistente virtual de Indra Group`}
        sx={{
          position: { xs: 'static', md: 'fixed' },
          top: { md: 0 },
          left: 0,
          width: { xs: '100%', md: 'clamp(240px, 47vw, 900px)' },
          height: { xs: 'auto', md: '100vh' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: { xs: 'flex-start', md: 'center' },
          gap: { xs: '10px', md: '24px' },
          marginTop: { xs: `${HEADER_HEIGHT_MOBILE + 6}px`, md: 0 },
          padding: { xs: '0 20px 12px', md: 0 },
          background: 'transparent',
          zIndex: 70,
        }}
      >
        {characterBox}

        <Box sx={{ width: { xs: '100%', md: 'clamp(140px, 19.4vw, 368px)' } }}>{narratorBlock}</Box>
      </Box>

      {/* Mobile only: compact sticky bar, shown once the large character has
          scrolled out of view — never before audio has been activated, never
          together with the large character above. */}
      <Box
        aria-hidden={!showCompactBar}
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'sticky',
          top: HEADER_HEIGHT_MOBILE,
          zIndex: 75,
          alignItems: 'center',
          gap: '10px',
          boxSizing: 'border-box',
          height: showCompactBar ? 60 : 0,
          opacity: showCompactBar ? 1 : 0,
          overflow: 'hidden',
          padding: '0 20px',
          pointerEvents: showCompactBar ? 'auto' : 'none',
          background: 'rgba(0,25,34,0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          transition: reducedMotion ? 'none' : 'height .25s ease, opacity .2s ease',
        }}
      >
        {showCompactBar && (
          <>
            <Box
              component="img"
              src={avatarPoster}
              alt=""
              aria-hidden="true"
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                objectFit: 'cover',
                flex: 'none',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
              <MiniWave animate={audioPhase === 'playing' && !reducedMotion} />
              <Typography
                sx={{
                  fontSize: 13,
                  color: colors.blanco,
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {compactLabel}
              </Typography>
            </Box>
            {primary && (
              <IconButton
                onClick={primary.onClick}
                aria-label={primary.label}
                sx={{ color: colors.blanco, border: '1px solid rgba(255,255,255,0.3)', borderRadius: 0, width: 40, height: 40, flex: 'none' }}
              >
                {primary.icon}
              </IconButton>
            )}
          </>
        )}
      </Box>

      <Box component="audio" ref={setAudioNode} preload="none" sx={{ display: 'none' }} />
    </>
  );
}

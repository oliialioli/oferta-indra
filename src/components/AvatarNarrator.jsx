import { useCallback, useEffect, useRef, useState } from 'react';
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
import { colors, HEADER_HEIGHT_MOBILE } from '../theme/theme';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { NARRATOR_VIDEOS, LOOPING_STATES } from '../data/narratorVideos';
import avatarPoster from '../assets/images/buddy-avatar-poster.png';

const CROSSFADE_MS = 220;
const LAYER_REF_KEYS = ['A', 'B'];
const CYAN = '#22D3EE';
// Sampled directly from the character clips' own background — a hair off
// colors.azulOscuro (#002532), close enough to pass unnoticed most of the
// time but not exactly matching, which is what made the frame's edge
// readable as a rectangle against the page.
const VIDEO_BG = '#002333';

// The four open corner brackets framing the character — an Indra brand
// mark (the same chamfered-corner language as OfferButton's hover state),
// drawn once and mirrored into the other three corners.
function CornerFrame() {
  const corner = (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      fill="none"
      sx={{ position: 'absolute', width: 36, height: 36, top: 0, left: 0 }}
    >
      <path
        d="M1 22V6L6 1H22"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Box>
  );

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'block',
        pointerEvents: 'none',
      }}
    >
      {corner}
      <Box sx={{ position: 'absolute', inset: 0, transform: 'scaleX(-1)' }}>{corner}</Box>
      <Box sx={{ position: 'absolute', inset: 0, transform: 'scaleY(-1)' }}>{corner}</Box>
      <Box sx={{ position: 'absolute', inset: 0, transform: 'scale(-1, -1)' }}>{corner}</Box>
    </Box>
  );
}

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
 * top bar + inline block, desktop fixed left column). The narrator's
 * transcript used to live here too — it now narrates the section's own
 * body text on the right (see NarratedText.jsx / Screen.jsx), so the
 * `narrator` state machine is owned by App.jsx and passed down as a prop
 * instead of being created here, letting both this component and the
 * active Screen share the same audio element/state without double-playing.
 */
export default function AvatarNarrator({ avatarName = 'Buddy', narrator }) {
  const {
    state,
    hasAudio,
    setAudioNode,
    audioEnabled,
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

  const videoRefs = { A: useRef(null), B: useRef(null) };
  const frontRef = useRef('A');
  const [frontLayer, setFrontLayer] = useState('A');
  const currentSrcRef = useRef(null);
  const videoFailedRef = useRef(false);
  const [videoFailed, setVideoFailed] = useState(false);

  // Precache all 5 character clips up front so switching state never has to
  // wait on a network fetch mid-crossfade.
  useEffect(() => {
    const links = Object.values(NARRATOR_VIDEOS).map((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'video';
      link.href = src;
      document.head.appendChild(link);
      return link;
    });
    return () => links.forEach((l) => l.remove());
  }, []);

  // Crossfades the back (hidden) layer in with `src`, then makes it the new
  // front. Shared by state changes (applyVideoState) and the manual
  // talking-loop restart below — both are "swap to this clip" at heart.
  const swapLayer = useCallback((src, loop) => {
    if (videoFailedRef.current) return;
    const frontKey = frontRef.current;
    const backKey = frontKey === 'A' ? 'B' : 'A';
    const el = videoRefs[backKey].current;
    if (!el) return;
    el.loop = loop;
    el.muted = true;
    if (el.getAttribute('src') !== src) el.setAttribute('src', src);
    el.currentTime = 0;
    const p = el.play();
    if (p?.catch) p.catch(() => {});

    requestAnimationFrame(() => {
      frontRef.current = backKey;
      setFrontLayer(backKey);
      window.setTimeout(() => {
        // Only pause it if it's still the (now-hidden) back layer — if
        // another state change already flipped it back to front in the
        // meantime (fast scrolling through sections), pausing it here
        // would freeze the video the user is currently looking at.
        if (frontRef.current !== frontKey) {
          videoRefs[frontKey].current?.pause();
        }
      }, CROSSFADE_MS + 60);
    });
    // videoRefs is a stable map of refs across renders; safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyVideoState = useCallback(
    (nextState) => {
      if (videoFailedRef.current) return;
      const src = NARRATOR_VIDEOS[nextState] || NARRATOR_VIDEOS.idle;
      const loop = LOOPING_STATES.has(nextState);
      const frontKey = frontRef.current;

      if (currentSrcRef.current === src) {
        const el = videoRefs[frontKey].current;
        if (el) el.loop = loop;
        return;
      }
      currentSrcRef.current = src;
      swapLayer(src, loop);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [swapLayer]
  );

  useEffect(() => {
    applyVideoState(state);
  }, [state, applyVideoState]);

  // TALKING keeps going for as long as the (longer) audio track plays.
  // indra-talking.mp4 is shorter than most narrations, and the browser's
  // native `loop` restarting the same element leaves a visible jump at the
  // seam, so it's looped manually instead: ~250ms before the front layer's
  // clip ends, start the back layer from 0 and crossfade — the same
  // mechanism used for state changes, just re-triggered with the same clip.
  useEffect(() => {
    if (state !== 'talking') return undefined;
    const el = videoRefs[frontRef.current].current;
    if (!el) return undefined;
    let armed = true;
    const onTimeUpdate = () => {
      if (!armed) return;
      const remaining = el.duration - el.currentTime;
      if (Number.isFinite(remaining) && remaining >= 0 && remaining <= 0.25) {
        armed = false;
        swapLayer(NARRATOR_VIDEOS.talking, false);
      }
    };
    el.addEventListener('timeupdate', onTimeUpdate);
    return () => el.removeEventListener('timeupdate', onTimeUpdate);
    // frontLayer intentionally included: after each manual loop swap it
    // flips, and this effect must re-attach to whichever layer is now
    // front, with a fresh "armed" guard for the next cycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, frontLayer, swapLayer]);

  const handleEnded = useCallback(
    (e) => {
      if (e.target !== videoRefs[frontRef.current].current) return;
      handleVideoEnded();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleVideoEnded]
  );

  const handleError = useCallback(() => {
    videoFailedRef.current = true;
    setVideoFailed(true);
  }, []);

  // Tab hidden -> pause both layers; visible again -> resume the front one.
  useEffect(() => {
    function onVisibility() {
      if (document.hidden) {
        videoRefs.A.current?.pause();
        videoRefs.B.current?.pause();
      } else {
        const p = videoRefs[frontRef.current].current?.play();
        if (p?.catch) p.catch(() => {});
      }
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pillPhase = justFinished ? 'finished' : audioPhase === 'playing' ? 'playing' : audioPhase === 'paused' ? 'paused' : null;

  const characterBox = (
    // Outer box has no overflow clip, so the pill below can overlap the
    // bottom edge without being cut off; the inner box does the actual
    // video/corner clipping.
    <Box
      sx={{
        position: 'relative',
        width: { xs: 'clamp(180px, 50vw, 210px)', md: 'clamp(140px, 19.4vw, 368px)' },
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
      primary = { label: 'Activar audio', icon: <PlayArrowIcon />, onClick: enableAudio };
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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
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
          gap: { xs: '16px', md: '24px' },
          marginTop: { xs: `${HEADER_HEIGHT_MOBILE + 12}px`, md: 0 },
          padding: { xs: '0 20px 20px', md: 0 },
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

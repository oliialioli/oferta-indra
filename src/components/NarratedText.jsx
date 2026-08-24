import { useCallback, useEffect, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

// Editorial, corporate karaoke — three word states, color only, no boxes,
// no underlines, no size/position changes:
// - pending: white at ~50% (not yet said)
// - current: white 100% + a very subtle glow (being said right now)
// - spoken:  white ~95% (already said — kept a hair under pure white so
//   the current word still reads as distinct without being loud)
const PENDING_OPACITY = 0.5;
const SPOKEN_OPACITY = 0.95;
const TRANSITION_MS = 150;

/**
 * Text that highlights word-by-word in sync with the narrator's audio.
 * The whole paragraph is visible from the very first frame — only the
 * per-word color/opacity changes, so nothing shifts, resizes, or reveals
 * itself progressively. Colors are written straight to the DOM on
 * 'timeupdate' (not via React state) so a ~4x/sec event never triggers a
 * full re-render.
 *
 * `wordTimestamps` (optional): real per-word start times in seconds, one
 * entry per word in `text`. When absent (the common case today — no audio
 * has been timestamped yet), falls back to a proportional estimate from
 * audio.currentTime / audio.duration. Nothing else needs to change once
 * real timestamps exist for a section; see narratorConfig.js.
 *
 * When `active` is false (audio not currently playing/paused for this
 * text) or `ended` is true, every word just sits at the fully-said state —
 * this is also the resting state before narration is ever turned on, and
 * what a failed/unavailable audio track falls back to, so the text is
 * always fully readable on its own. `revealSeq` forces the paint-from-zero
 * effect to re-run on replay, even though `active`/`ended` alone wouldn't
 * change value.
 */
export default function NarratedText({ text, audioRef, active, ended, revealSeq, wordTimestamps, sx }) {
  const words = useMemo(() => text.split(' '), [text]);
  const wordRefs = useRef([]);
  const reducedMotion = usePrefersReducedMotion();

  const paint = useCallback(
    (currentIndex) => {
      wordRefs.current.forEach((el, i) => {
        if (!el) return;
        if (i < currentIndex) {
          el.style.opacity = SPOKEN_OPACITY;
          el.style.textShadow = 'none';
        } else if (i === currentIndex) {
          el.style.opacity = 1;
          el.style.textShadow = reducedMotion ? 'none' : '0 0 6px rgba(255,255,255,0.35)';
        } else {
          el.style.opacity = PENDING_OPACITY;
          el.style.textShadow = 'none';
        }
      });
    },
    [reducedMotion]
  );

  useEffect(() => {
    if (!active || ended) {
      paint(words.length);
      return undefined;
    }
    paint(-1);
    const audio = audioRef.current;
    if (!audio) return undefined;
    const onTimeUpdate = () => {
      let currentIndex;
      if (wordTimestamps && wordTimestamps.length === words.length) {
        // Real per-word timing: the current word is the last one whose
        // start time has already passed.
        currentIndex = 0;
        for (let i = 0; i < wordTimestamps.length; i += 1) {
          if (wordTimestamps[i] <= audio.currentTime) currentIndex = i;
          else break;
        }
      } else {
        const d = audio.duration;
        if (!Number.isFinite(d) || d <= 0) return;
        const progress = Math.min(1, Math.max(0, audio.currentTime / d));
        currentIndex = Math.min(words.length - 1, Math.floor(progress * words.length));
      }
      paint(currentIndex);
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    return () => audio.removeEventListener('timeupdate', onTimeUpdate);
  }, [active, ended, words, audioRef, paint, revealSeq, wordTimestamps]);

  return (
    <Typography sx={{ margin: 0, color: '#ffffff', ...sx }}>
      {words.map((word, i) => (
        <Box
          key={i}
          component="span"
          ref={(el) => {
            wordRefs.current[i] = el;
          }}
          sx={{
            opacity: SPOKEN_OPACITY,
            transition: reducedMotion
              ? 'none'
              : `opacity ${TRANSITION_MS}ms ease, text-shadow ${TRANSITION_MS}ms ease`,
          }}
        >
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </Box>
      ))}
    </Typography>
  );
}

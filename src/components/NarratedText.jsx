import { useCallback, useEffect, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { colors } from '../theme/theme';

const PENDING_WORD_COLOR = 'rgba(148, 163, 184, 0.55)';

/**
 * Text that highlights word-by-word in sync with the narrator's audio —
 * spoken words turn white as audio.currentTime advances past their
 * proportional share of audio.duration, pending words stay a muted
 * blue-gray. Colors are written straight to the DOM on 'timeupdate' (not
 * via React state) so a ~4x/sec event never triggers a full re-render.
 *
 * When `active` is false (audio not currently playing/paused for this
 * text) or `ended` is true, the text just shows fully readable — this is
 * also the resting state before narration is ever turned on. `revealSeq`
 * forces the paint-from-zero effect to re-run on replay, even though
 * `active`/`ended` alone wouldn't change value.
 */
export default function NarratedText({ text, audioRef, active, ended, revealSeq, sx }) {
  const words = useMemo(() => text.split(' '), [text]);
  const wordRefs = useRef([]);

  const paint = useCallback((spokenCount) => {
    wordRefs.current.forEach((el, i) => {
      if (el) el.style.color = i < spokenCount ? colors.blanco : PENDING_WORD_COLOR;
    });
  }, []);

  useEffect(() => {
    if (!active || ended) {
      paint(words.length);
      return undefined;
    }
    paint(0);
    const audio = audioRef.current;
    if (!audio) return undefined;
    const onTimeUpdate = () => {
      const d = audio.duration;
      if (!Number.isFinite(d) || d <= 0) return;
      const progress = Math.min(1, Math.max(0, audio.currentTime / d));
      paint(Math.round(progress * words.length));
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    return () => audio.removeEventListener('timeupdate', onTimeUpdate);
  }, [active, ended, words, audioRef, paint, revealSeq]);

  return (
    <Typography sx={{ margin: 0, ...sx }}>
      {words.map((word, i) => (
        <Box
          key={i}
          component="span"
          ref={(el) => {
            wordRefs.current[i] = el;
          }}
          sx={{ color: colors.blanco, transition: 'color .25s ease' }}
        >
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </Box>
      ))}
    </Typography>
  );
}

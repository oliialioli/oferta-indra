import { useEffect, useRef, useState } from 'react';

/**
 * Types `text` out one character at a time once `start` becomes true.
 * Returns the characters typed so far and whether typing is in progress
 * (so the caller can show/hide the blinking caret).
 */
export function useTypewriter(text, start, speedMs = 16) {
  const [typed, setTyped] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!start || startedRef.current || !text) return undefined;
    startedRef.current = true;
    setIsTyping(true);

    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, speedMs);

    return () => {
      clearInterval(timer);
      // Reset the guard on cleanup, not just the interval — otherwise a
      // `start` that's already true on first mount (rather than flipping
      // false->true later, like Screen.jsx's scroll-driven `revealed`)
      // walks straight into React 18 StrictMode's dev-only mount ->
      // cleanup -> remount: the fake cleanup clears the interval, but
      // startedRef staying true blocks the real remount from starting a
      // new one, leaving the caret blinking forever with no text typed.
      startedRef.current = false;
    };
  }, [start, text, speedMs]);

  return { typed, isTyping };
}

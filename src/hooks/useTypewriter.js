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
    if (!start || startedRef.current || !text) return;
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

    return () => clearInterval(timer);
  }, [start, text, speedMs]);

  return { typed, isTyping };
}

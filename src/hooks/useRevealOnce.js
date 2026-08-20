import { useEffect, useRef, useState } from 'react';

// Reveals a single element (fade + slide up) the first time it scrolls into
// view, independent of its parent Screen's reveal state. Used to stagger
// individual cards inside a grid, since the whole-screen reveal only fires
// once and is usually long finished by the time you've scrolled far enough
// to see rows below the fold.
export function useRevealOnce({ threshold = 0.15, rootMargin = '0px 0px -60px 0px' } = {}) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, revealed];
}

export const revealSx = (revealed, delayMs = 0) => ({
  opacity: revealed ? 1 : 0,
  transform: revealed ? 'none' : 'translateY(16px)',
  transition: `opacity .5s cubic-bezier(.2,.8,.2,1) ${delayMs}ms, transform .5s cubic-bezier(.2,.8,.2,1) ${delayMs}ms`,
});
